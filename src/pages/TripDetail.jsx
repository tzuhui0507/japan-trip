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
  Download,
  Folder,
  FileText,
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

  // ✅ ADD HERE：第一次打開提示（只給 viewer）
  const [showViewerHint, setShowViewerHint] = useState(false); 

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

  // ✅ ADD HERE：Viewer 第一次打開提示（只出現一次）
  useEffect(() => {
    if (!trip) return;                // 等 trip 載入後再判斷
    if (trip.shareMode !== "viewer") return;

    const key = "trip_viewer_hint_seen";
    const seen = localStorage.getItem(key);

    if (!seen) {
      setShowViewerHint(true);
      localStorage.setItem(key, "1");
    }
  }, [trip]);

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
      <Header trip={trip} setTrip={setTrip} currentTab={tab} />

      {/* ✅ PLACE HERE：Viewer 第一次提示（只出現一次） */}
      {showViewerHint && trip.shareMode === "viewer" && (
        <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-sm mx-4 bg-[#FFF9F2] rounded-2xl border border-[#E5D5C5] p-5">
            
            {/* 標題 */}
            <h3 className="text-sm font-bold text-[#5A4636] mb-2 tracking-[0.15em] text-center">
              ようこそ *⸜♡⸝*
            </h3>

            <p className="text-xs text-[#8C6A4F] text-center mb-4">
              這是為這趟旅程準備的小小旅行手冊 *⸜( ˶´ ˘ `˶ )⸝*
            </p>

            {/* Viewer 說明 */}
            <div className="bg-white rounded-xl border border-[#E5D5C5] px-4 py-3 text-xs text-[#8C6A4F] space-y-2 leading-relaxed">
              <p>
                目前為 <span className="font-semibold text-[#5A4636]">觀看模式 ( ˘͈ ᵕ ˘͈ )</span>
              </p>
              <p>
                有些內容無法編輯，但可以自由瀏覽所有行程資訊 (´･ᴗ･`)
              </p>
            </div>

            {/* 教學區塊 */}
            <div className="mt-4 space-y-2 text-xs text-[#5A4636]">
              <p className="font-semibold text-[#8C6A4F] text-center">
                可以看看以下內容 ✿
              </p>

              <ul className="space-y-1.5 leading-relaxed">
                <li className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-[#8C6A4F]" />
                  <span>PLAN｜每日行程與天氣安排</span>
                </li>

                <li className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#8C6A4F]" />
                  <span>COST｜旅費記帳與分帳（這裡可以自由編輯 ⸝⸝꙳）</span>
                </li>

                <li className="flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-[#8C6A4F]" />
                  <span>PACK｜行李清單（這裡可以自由編輯 ⸝⸝꙳）</span>
                </li>

                <li className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#8C6A4F]" />
                  <span>LIST｜購物清單（這裡可以自由編輯 ⸝⸝꙳）</span>
                </li>

                <li className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#8C6A4F]" />
                  <span>TICKET｜票券資訊與 QR Code</span>
                </li>

                <li className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#8C6A4F]" />
                  <span>JP｜常用日文會話（可點擊發音）</span>
                </li>

                <li className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#8C6A4F]" />
                  <span>RATE｜匯率換算（這裡可以自由編輯 ⸝⸝꙳）</span>
                </li>

                <li className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#8C6A4F]" />
                  <span>INFO｜航班、住宿、VJW與緊急聯絡資訊</span>
                </li>
              </ul>

              {/* 分隔 */}
              <div className="pt-2 border-t border-[#E5D5C5]" />

              {/* 匯入教學（給觀看者） */}
              <div className="mt-4 space-y-2 text-xs text-[#5A4636]">
                <p className="font-semibold text-[#8C6A4F] text-center">
                  旅行APP使用指南 ✿
                </p>

                <ul className="space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Folder className="w-4 h-4 mt-0.5 text-[#8C6A4F]" />
                    <span>
                      請先下載行程檔案（.json）
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <Download className="w-4 h-4 mt-0.5 text-[#8C6A4F]" />
                    <span>
                      回到這個頁面後，點右上角的「匯入」
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-[#8C6A4F]" />
                    <span>
                      選擇檔案後，就可以開始使用囉 ♡
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 按鈕 */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setShowViewerHint(false)}
                className="px-6 py-2 text-xs rounded-full bg-[#C6A087] text-white tracking-widest"
              >
                OKです ✿
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-20">
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

        <div className="pt-[96px] px-4">
          {renderTabContent()}
        </div>
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