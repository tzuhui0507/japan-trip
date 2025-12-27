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
  ShoppingBag, // ⭐ 新增
} from "lucide-react";

import Header from "../components/Header";
import ShareModeBanner from "../components/ShareModeBanner";
import { ShareModeProvider } from "../context/ShareModeContext";

import Plan from "./Plan";
import Expenses from "./Expenses";
import ListTab from "./ListTab";
import InfoTab from "./Info";
import Tickets from "./Tickets";
import Phrasebook from "./Phrasebook";
import Currency from "./Currency";
import Shopping from "./Shopping"; // ⭐ 新增（之後建立）
import TicketDetail from "../components/TicketDetail";

const STORAGE_KEY = "trip_local_v1";

export default function TripDetail() {
  const params = new URLSearchParams(window.location.search);
  const modeFromUrl = params.get("mode");
  const shareMode = modeFromUrl === "viewer" ? "viewer" : "owner";

  const [trip, setTrip] = useState(null);
  const [tab, setTab] = useState("PLAN");

  /* ================================
     初次載入
  ================================= */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setTrip({ ...parsed, shareMode });
    }
  }, []);

  /* ================================
     自動存 localStorage
  ================================= */
  useEffect(() => {
    if (trip) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    }
  }, [trip]);

  if (!trip) return null;

  /* ================================
     Tabs 定義（⭐ 新增 SHOPPING）
  ================================= */
  const TABS = [
    { key: "PLAN", short: "PLAN", icon: Route },
    { key: "EXPENSES", short: "COST", icon: Wallet },
    { key: "LIST", short: "PACK", icon: Luggage },
    { key: "SHOPPING", short: "LIST", icon: ShoppingBag }, // ⭐ 新增
    { key: "TICKETS", short: "TICKET", icon: Ticket },
    { key: "PHRASEBOOK", short: "JP", icon: Languages },
    { key: "CURRENCY", short: "RATE", icon: Coins },
    { key: "INFO", short: "INFO", icon: Info },
  ];

  /* ================================
     分頁內容切換
  ================================= */
  const renderTabContent = () => {
    switch (tab) {
      case "PLAN":
        return <Plan trip={trip} setTrip={setTrip} />;
      case "EXPENSES":
        return <Expenses trip={trip} setTrip={setTrip} />;
      case "LIST":
        return <ListTab trip={trip} setTrip={setTrip} />;
      case "SHOPPING": // ⭐ 新增
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
      {/* ===== Header（固定）===== */}
      <Header trip={trip} setTrip={setTrip} />
      <ShareModeBanner mode={trip.shareMode} />

      {/* ===== 主內容區 ===== */}
      <div className="pt-[96px] pb-20">
        {/* ===== DayTab（只在 PLAN）===== */}
        {tab === "PLAN" && (
          <div className="sticky top-[96px] z-40 bg-[#F8F5F1] border-b border-[#E8E1DA]">
            <div className="flex justify-between px-6 py-3">
              {(trip.days || []).map((day, index) => {
                const active = index === trip.activeDayIndex;
                return (
                  <button
                    key={day.id}
                    onClick={() => {
                      if (trip.shareMode === "viewer") return;
                      setTrip((p) => ({
                        ...p,
                        activeDayIndex: index,
                      }));
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

        {/* ===== 分頁內容 ===== */}
        <div className="px-4">{renderTabContent()}</div>
      </div>

      {/* ===== Bottom Nav ===== */}
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

      {/* ===== Ticket Detail ===== */}
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
