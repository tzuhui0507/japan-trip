// src/pages/TripDetail.jsx
import React, { useEffect, useState } from "react";
import {
  Route,
  Wallet,
  Luggage,
  Info,
  Languages,
  Ticket,
  Coins,
  ShoppingBag,
} from "lucide-react";

import Header from "../components/Header";
import { ShareModeProvider } from "../context/ShareModeContext";

import Plan from "./Plan";
import Expenses from "./Expenses";
import ListTab from "./ListTab";
import InfoTab from "./Info";
import Tickets from "./Tickets";
import Phrasebook from "./Phrasebook";
import Currency from "./Currency";
import Shopping from "./Shopping";
import TicketDetail from "../components/TicketDetail";

const STORAGE_KEY = "trip_local_v1";

/* viewer 最小結構（保底用） */
function createViewerTrip() {
  return {
    shareMode: "viewer",
    days: [],
    activeDayIndex: 0,
    tickets: [],
    luggage: null,
    shopping: null,
    currency: null,
    viewTicket: null,
  };
}

export default function TripDetail() {
  const params = new URLSearchParams(window.location.search);
  const modeFromUrl = params.get("mode");
  const dataFromUrl = params.get("data"); // ⭐ JSON 來源
  const shareMode = modeFromUrl === "viewer" ? "viewer" : "owner";
  const isViewer = shareMode === "viewer";

  const [trip, setTrip] = useState(null);
  const [tab, setTab] = useState("PLAN");

  /* viewer 專用 day index（只影響畫面） */
  const [viewerDayIndex, setViewerDayIndex] = useState(0);

  /* ================================
     初次載入
  ================================= */
  useEffect(() => {
    // 🔵 viewer：優先吃 URL JSON
    if (isViewer && dataFromUrl) {
      try {
        const decoded = decodeURIComponent(dataFromUrl);
        const parsed = JSON.parse(decoded);
        setTrip({ ...parsed, shareMode: "viewer" });
        return;
      } catch (e) {
        console.error("❌ JSON import 失敗", e);
        setTrip(createViewerTrip());
        return;
      }
    }

    // 🟢 owner：讀 localStorage
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setTrip({ ...parsed, shareMode });
      return;
    }

    // 🟡 viewer 保底
    if (isViewer) {
      setTrip(createViewerTrip());
    }
  }, [shareMode, isViewer, dataFromUrl]);

  /* ================================
     自動存 localStorage（owner only）
  ================================= */
  useEffect(() => {
    if (!trip) return;
    if (trip.shareMode === "viewer") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
  }, [trip]);

  if (!trip) return null;

  /* 統一 day index */
  const currentDayIndex = isViewer
    ? viewerDayIndex
    : trip.activeDayIndex ?? 0;

  /* Tabs */
  const TABS = [
    { key: "PLAN", short: "PLAN", icon: Route },
    { key: "EXPENSES", short: "COST", icon: Wallet },
    { key: "LIST", short: "PACK", icon: Luggage },
    { key: "SHOPPING", short: "LIST", icon: ShoppingBag },
    { key: "TICKETS", short: "TICKET", icon: Ticket },
    { key: "PHRASEBOOK", short: "JP", icon: Languages },
    { key: "CURRENCY", short: "RATE", icon: Coins },
    { key: "INFO", short: "INFO", icon: Info },
  ];

  const renderTabContent = () => {
    switch (tab) {
      case "PLAN":
        return (
          <Plan 
            key={currentDayIndex}
            trip={trip}
            setTrip={setTrip}
            dayIndex={currentDayIndex} 
          />
        );
      case "EXPENSES":
        return <Expenses trip={trip} setTrip={setTrip} />;
      case "LIST":
        return <ListTab trip={trip} setTrip={setTrip} />;
      case "SHOPPING":
        return <Shopping trip={trip} setTrip={setTrip} />;
      case "TICKETS":
        return <Tickets trip={trip} setTrip={setTrip} />;
      case "PHRASEBOOK":
        return <Phrasebook trip={trip} setTrip={setTrip} />;
      case "CURRENCY":
        return <Currency trip={trip} setTrip={setTrip} />;
      case "INFO":
        return <InfoTab trip={trip} setTrip={setTrip} />;
      default:
        return null;
    }
  };

  return (
    <ShareModeProvider mode={trip.shareMode}>
      <Header trip={trip} setTrip={setTrip} />

      <div className="pt-[96px] pb-20">
        {/* DayTab */}
        {tab === "PLAN" && (
          <div className="sticky top-[96px] z-40 bg-[#F8F5F1] border-b border-[#E8E1DA]">
            <div className="flex justify-between px-6 py-3">
              {(trip.days || []).map((day, index) => {
                const active = index === currentDayIndex;
                return (
                  <button
                    key={day.id}
                    onClick={() => {
                      if (isViewer) {
                        setViewerDayIndex(index);
                      } else {
                        setTrip((p) => ({
                          ...p,
                          activeDayIndex: index,
                        }));
                      }
                    }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <span
                      className={`text-[11px] tracking-[0.3em] ${
                        active ? "text-[#5A4636]" : "text-[#D1C2B3]"
                      }`}
                    >
                      {day.weekday}
                    </span>
                    <span
                      className={`mt-1 text-xl ${
                        active ? "text-[#5A4636]" : "text-[#D1C2B3]"
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    <span
                      className={`mt-1 w-1.5 h-1.5 rounded-full bg-[#C22929] ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-4">{renderTabContent()}</div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E5D5C5]">
        <div className="grid grid-cols-8 h-14">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex flex-col items-center justify-center"
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-[#8C6A4F]" : "text-[#8C6A4F]/40"
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 ${
                    active ? "text-[#5A4636]" : "text-[#8C6A4F]/60"
                  }`}
                >
                  {t.short}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {trip.viewTicket && (
        <TicketDetail
          ticket={trip.viewTicket}
          onClose={() =>
            setTrip((p) => ({ ...p, viewTicket: null }))
          }
        />
      )}
    </ShareModeProvider>
  );
}