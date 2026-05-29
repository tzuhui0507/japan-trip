// src/pages/TripDetail.jsx
import React, { useEffect, useState } from "react";
import {
  Route,
  Wallet,
  Luggage,     // 🎒 歸位：行李箱重回 PACK 行李清單的懷抱！
  Compass,     // 🧭 新增：用優雅的指南針代表 POCKET 旅人工具箱，非常有探險百寶袋的感覺
  Info,
  Ticket,
  Coins,
  ShoppingBag,
  Download,
  Folder,
  Ellipsis,
  FileDown,
  Smartphone,
} from "lucide-react";

import Header from "../components/Header";
import { ShareModeProvider } from "../context/ShareModeContext";
import { THEMES } from "../App"; 

import Plan from "./Plan";
import Expenses from "./Expenses";
import ListTab from "./ListTab";
import InfoTab from "./Info";
import Tickets from "./Tickets";
import Currency from "./Currency";
import Shopping from "./Shopping";
import Toolbox from "./Toolbox"; 
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
    toolbox: null, 
  };
}

export default function TripDetail({ themeId, setThemeId }) {
  const params = new URLSearchParams(window.location.search);
  const modeFromUrl = params.get("mode");
  const dataFromUrl = params.get("data"); 
  const shareMode = modeFromUrl === "viewer" ? "viewer" : "owner";
  const isViewer = shareMode === "viewer";

  const [trip, setTrip] = useState(null);
  const [tab, setTab] = useState("PLAN");

  /* 獲取目前主題配色 */
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;

  /* viewer 專用 day index */
  const [viewerDayIndex, setViewerDayIndex] = useState(0);

  const [showViewerHint, setShowViewerHint] = useState(false); 

  /* ================================
      初次載入
  ================================= */
  useEffect(() => {
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

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setTrip({ ...parsed, shareMode });
      return;
    }

    if (isViewer) {
      setTrip(createViewerTrip());
    }

    if (!isViewer) {
      setTrip({
        shareMode: "owner",
        title: "我的旅行手冊",
        startDate: new Date().toISOString(),
        activeDayIndex: 0,
        days: [],
        tickets: [],
        luggage: null,
        shopping: null,
        currency: null,
        viewTicket: null,
        toolbox: null, 
      });
    }
  }, [shareMode, isViewer, dataFromUrl]);

  useEffect(() => {
    if (!trip) return;
    if (trip.shareMode !== "viewer") return;

    const key = "trip_viewer_hint_seen";
    const seen = localStorage.getItem(key);

    if (!seen) {
      setShowViewerHint(true);
      localStorage.setItem(key, "1");
    }
  }, [trip]);

  useEffect(() => {
    if (!trip) return;
    if (trip.shareMode === "viewer") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
  }, [trip]);

  if (!trip) return null;

  const currentDayIndex = isViewer
    ? viewerDayIndex
    : trip.activeDayIndex ?? 0;

  /* Tabs - 已完美歸位與換新裝 */
  const TABS = [
    { key: "PLAN", short: "PLAN", icon: Route },
    { key: "EXPENSES", short: "COST", icon: Wallet },
    { key: "LIST", short: "PACK", icon: Luggage },     // 🎒 行李箱回到這裡囉！
    { key: "SHOPPING", short: "LIST", icon: ShoppingBag },
    { key: "TICKETS", short: "TICKET", icon: Ticket },
    { key: "CURRENCY", short: "RATE", icon: Coins },
    { key: "TOOLBOX", short: "TOOLS", icon: Smartphone }, // 🧭 百寶袋分頁改用精緻的指南針
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
            themeId={themeId}
          />
        );
      case "EXPENSES":
        return <Expenses trip={trip} setTrip={setTrip} themeId={themeId} />;
      case "LIST":
        return <ListTab trip={trip} setTrip={setTrip} themeId={themeId} />;
      case "SHOPPING":
        return <Shopping trip={trip} setTrip={setTrip} themeId={themeId} />;
      case "TICKETS":
        return <Tickets trip={trip} setTrip={setTrip} themeId={themeId} />;
      case "CURRENCY":
        return <Currency trip={trip} setTrip={setTrip} themeId={themeId} />;
      case "TOOLBOX": 
        return <Toolbox trip={trip} setTrip={setTrip} themeId={themeId} />;
      case "INFO":
        return <InfoTab trip={trip} setTrip={setTrip} themeId={themeId} />;
      default:
        return null;
    }
  };

  return (
    <ShareModeProvider mode={trip.shareMode}>
      <Header 
        trip={trip} 
        setTrip={setTrip} 
        currentTab={tab} 
        themeId={themeId} 
        setThemeId={setThemeId} 
      />

      {showViewerHint && trip.shareMode === "viewer" && (
        <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div 
            className="w-full max-w-sm mx-4 rounded-2xl border p-5 shadow-2xl animate-in zoom-in-95 duration-300"
            style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}
          >
            <h3 className="text-sm font-bold mb-2 tracking-[0.15em] text-center" style={{ color: currentTheme.text }}>
              Hiiii~ 泥好 *⸜( ˶´ ˘ `˶ )⸝*
            </h3>

            <p className="text-xs text-center mb-4 opacity-80" style={{ color: currentTheme.accent }}>
              這是為這趟旅程準備的小小旅行手冊 *⸜♡⸝*
            </p>

            <div 
              className="rounded-xl border px-4 py-3 text-xs space-y-2 leading-relaxed"
              style={{ backgroundColor: 'white', borderColor: currentTheme.border, color: currentTheme.accent }}
            >
              <p>
                目前為 <span className="font-semibold" style={{ color: currentTheme.text }}>觀看模式 ( ˘͈ ᵕ ˘͈ )</span>
              </p>
              <p>
                有些內容無法編輯，但可以自由瀏覽行程資訊 (´･ᴗ･`)
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs" style={{ color: currentTheme.text }}>
              <p className="font-semibold text-center opacity-70">
                ✿ 可以看看以下內容 ✿
              </p>

              <ul className="space-y-1.5 leading-relaxed">
                {[
                  { icon: Route, label: "PLAN｜每日行程與天氣安排" },
                  { icon: Wallet, label: "COST｜旅費記帳與分帳（這裡可以自由編輯 ⸝⸝꙳）" },
                  { icon: Luggage, label: "PACK｜行李清單（這裡可以自由編輯 ⸝⸝꙳）" }, // 🎒 提示同步更換圖示
                  { icon: ShoppingBag, label: "LIST｜購物清單（這裡可以自由編輯 ⸝⸝꙳）" },
                  { icon: Ticket, label: "TICKET｜票券資訊與 QR Code" },
                  { icon: Coins, label: "RATE｜即時匯率隨手換算（這裡可以自由編輯 ⸝⸝꙳）" },
                  { icon: Smartphone, label: "POCKET｜必備APP、網卡與待辦（這裡可以自由編輯 ⸝⸝꙳）" }, // 🧭 提示同步更換圖示
                  { icon: Info, label: "INFO｜航班、住宿與緊急聯絡等資訊" },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" style={{ color: currentTheme.main }} />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t" style={{ borderColor: currentTheme.border }} />

              <div className="mt-4 space-y-2 text-xs">
                <p className="font-semibold text-center opacity-70">
                  ✿ 使用指南 ✿
                </p>
                <ul className="space-y-1.5 leading-relaxed opacity-80">
                  <li className="flex items-start gap-2">
                    <Folder className="w-4 h-4 mt-0.5" style={{ color: currentTheme.main }} />
                    <span>請先下載行程檔案（.json）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileDown className="w-4 h-4 mt-0.5" style={{ color: currentTheme.main }} />
                    <span>回到頁面後，點擊右上角「選單」後即可匯入行程。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ellipsis className="w-4 h-4 mt-0.5" style={{ color: currentTheme.main }} />
                    <span>另外，「選單」還可以更換主題配色跟幣別哦！</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setShowViewerHint(false)}
                className="px-6 py-2 text-xs rounded-full text-white tracking-widest shadow-md active:scale-95 transition-all"
                style={{ backgroundColor: currentTheme.main }}
              >
                (〃・ิ‿・ิ)ゞ ᵒᵒᵒᵒᵒᵒᵒᵒᵏ .ᐟ.ᐟ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-20">
        {tab === "PLAN" && (
          <div 
            className="sticky top-[96px] z-40 border-b transition-colors duration-500"
            style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.border }}
          >
            <div className="overflow-x-auto scrollbar-none px-6">
              <div className="flex gap-6 py-3 min-w-full justify-center w-max">
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
                      className="flex-none flex flex-col items-center min-w-[40px] shrink-0"
                    >
                      <span
                        className={`text-[11px] tracking-[0.2em] font-medium transition-colors`}
                        style={{ color: active ? currentTheme.text : `${currentTheme.main}60` }}
                      >
                        {day.weekday}
                      </span>
                      <span
                        className={`mt-1 text-xl font-semibold transition-colors`}
                        style={{ color: active ? currentTheme.text : `${currentTheme.main}60` }}
                      >
                        {day.dayNumber}
                      </span>
                      <span
                        className={`mt-1 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          active ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        }`}
                        style={{ backgroundColor: "#C22929" }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="pt-[96px] px-4">
          {renderTabContent()}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav 
        className="fixed bottom-0 left-0 w-full bg-white border-t z-[100] pb-[env(safe-area-inset-bottom)]"
        style={{ borderColor: currentTheme.border }}
      >
        <div className="grid grid-cols-8 h-14 items-center">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex flex-col items-center justify-center transition-opacity active:opacity-60"
              >
                <Icon
                  className={`w-[18px] h-[18px] transition-colors duration-300`}
                  style={{ color: active ? currentTheme.main : `${currentTheme.main}40` }}
                />
                <span
                  className={`text-[9px] mt-1 font-medium tracking-tight transition-colors duration-300`}
                  style={{ color: active ? currentTheme.text : `${currentTheme.accent}60` }}
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