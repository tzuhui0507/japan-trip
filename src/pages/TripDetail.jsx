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

import TicketDetail from "../components/TicketDetail";

const STORAGE_KEY = "trip_local_v1";

const DEFAULT_TRIP = {
  id: "trip-local",
  title: "日本自由行",
  startDate: "2026-03-11",
  endDate: "2026-03-16",
  activeDayIndex: 0,

  days: [],
  expenses: [],
  packing: [],
  tickets: [],
  phrasebook: [],

  // ⭐ 新增這一段
  info: {
    flights: [
      {
        id: "flight-out",
        direction: "去程",
        flightNo: "UA838",
        from: "KHH",
        to: "NRT",
        time: "11:30 - 15:55",
        baggage: "行李：23KG",
      },
      {
        id: "flight-back",
        direction: "回程",
        flightNo: "UA837",
        from: "NRT",
        to: "KHH",
        time: "17:50 - 21:20",
        baggage: "行李：23KG",
      },
    ],

    hotels: [
      {
        id: "hotel-1",
        name: "OMO3 東京赤坂 by 星野集團",
        dateRange: "3月11日 - 3月14日",
        addressLine1: "〒107-0052 東京都港区赤坂4丁目3-2",
        addressLine2:
          "4 Chome-3-2 Akasaka, Minato City, Tokyo 107-0052 日本",
        phone: "+81-50-3134-8895",
      },
      {
        id: "hotel-2",
        name: "BEB5 輕井澤 by 星野集團",
        dateRange: "3月14日 - 3月16日",
        addressLine1:
          "〒389-0111 日本 長野縣 北佐久郡 輕井澤町 長倉3364-15",
        addressLine2:
          "3364-15 Nagakura, Karuizawa, Kitasaku District, Nagano 389-0111 日本",
        phone: "+81-50-3134-8098",
      },
    ],

    visitJapan: {
      title: "Visit Japan Web",
      subtitle: "入境審查 & 海關申報（請截圖 QR Code）",
      url: "https://vjw-lp.digital.go.jp/",
    },

    emergency110: {
      label: "警察 (POLICE)",
      number: "110",
    },
    emergency119: {
      label: "救護／火警",
      number: "119",
    },

    jnto: {
      title: "訪日外國人 醫療＆急難熱線",
      subtitle: "JAPAN VISITOR HOTLINE (JNTO)",
      phone: "050-3816-2787",
      note: "※ 24小時對應（英／中／韓）。",
    },

    taipei: {
      badge: "外交部",
      title: "台北駐日經濟文化代表處",
      officePhone: "03-3280-7811",
      officeNote: "（上班時間）",
      emergencyPhone: "080-1009-7179",
      emergencyNote: "（急難救助）",
    },
  },

  currency: {
    rate: null,
    rateUpdatedAt: "",
    cards: [],
    activeCardId: null,
    amountStr: "0",
  },
};

export default function TripDetail() {
const params = new URLSearchParams(window.location.search);
const modeFromUrl = params.get("mode");

const shareMode = modeFromUrl === "viewer" ? "viewer" : "owner";

const [trip, setTrip] = useState(null);
const [tab, setTab] = useState("PLAN");

// ============================================================
// 初次載入：只做一次
// ============================================================
useEffect(() => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
   const parsed = JSON.parse(raw);
   setTrip({ ...parsed, shareMode });
  } else {
   const init = { ...DEFAULT_TRIP, shareMode };
   localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
   setTrip(init);
  }
}, []);

// ============================================================
// 任一地方改 trip → 永久存 localStorage
// ============================================================
useEffect(() => {
if (trip) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
}
}, [trip]);

if (!trip) return null;

const TABS = [
{ key: "PLAN", short: "Plan", icon: Route },
{ key: "EXPENSES", short: "Cost", icon: Wallet },
{ key: "LIST", short: "List", icon: Luggage },
{ key: "TICKETS", short: "Ticket", icon: Ticket },
{ key: "PHRASEBOOK", short: "JP", icon: Languages },
{ key: "CURRENCY", short: "Rate", icon: Coins },
{ key: "INFO", short: "Info", icon: Info },
];

const renderTabContent = () => {
switch (tab) {
  case "PLAN":
    return <Plan trip={trip} setTrip={setTrip} />;
  case "EXPENSES":
    return <Expenses trip={trip} setTrip={setTrip} />;
  case "LIST":
    return <ListTab trip={trip} setTrip={setTrip} />;
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
    <div className="pb-20">
      <ShareModeBanner mode={trip.shareMode} />
      <Header trip={trip} setTrip={setTrip} />

      <div className="h-32" />

      <div className="px-4">{renderTabContent()}</div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E5D5C5]">
        <div className="grid grid-cols-7 h-14">
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
                    active
                      ? "text-[#8C6A4F]"
                      : "text-[#8C6A4F]/40"
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 ${
                    active
                      ? "text-[#5A4636]"
                      : "text-[#8C6A4F]/60"
                  }`}
                >
                  {t.short}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ===== Ticket Detail（全畫面）===== */}
      {trip.viewTicket && (
        <TicketDetail
          ticket={trip.viewTicket}
          onClose={() =>
            setTrip((p) => ({
              ...p,
              viewTicket: null,
            }))
          }
        />
      )}
    </div>
  </ShareModeProvider>
);
}