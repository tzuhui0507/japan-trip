// src/components/TicketDetail.jsx
import React from "react";
import {
  X,
  CalendarDays,
  Clock,
  MapPin,
  Link2,
  StickyNote,
  Landmark,
  Train,
  UtensilsCrossed,
  BedDouble,
} from "lucide-react";
import { THEMES } from "../App";

// 與 TicketsTab 共用的類別設定
const TYPE_META = {
  ATTRACTION: {
    label: "景點",
    color: "#4A607F",
    bg: "#E7EEF9",
    icon: Landmark,
  },
  TRANSPORT: {
    label: "交通",
    color: "#4E6B48",
    bg: "#E4F1E3",
    icon: Train,
  },
  FOOD: {
    label: "餐廳",
    color: "#8C4A2F",
    bg: "#FBE7DF",
    icon: UtensilsCrossed,
  },
  HOTEL: {
    label: "住宿",
    color: "#7A4D6E",
    bg: "#F3E3F0",
    icon: BedDouble,
  },
};

export default function TicketDetail({ ticket, onClose, themeId }) {
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;
  if (!ticket) return null;

  const meta = TYPE_META[ticket.type] || TYPE_META.ATTRACTION;

  const openLink = () => {
    if (!ticket.link) return;
    window.open(ticket.link, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ borderColor: `${currentTheme.main}20` }}
      >

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b" style={{ borderColor: `${currentTheme.main}10` }}>
          <div className="min-w-0 pr-2">
            <p 
              className="text-[10px] tracking-[0.3em] mb-1 font-serif font-bold uppercase opacity-60"
              style={{ color: currentTheme.main }}
            >
              TICKET DETAIL
            </p>
            <h2 className="text-lg font-serif font-bold truncate" style={{ color: currentTheme.text }}>
              {ticket.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border bg-white flex items-center justify-center shadow-sm transition-all active:scale-90"
            style={{ borderColor: `${currentTheme.main}30` }}
          >
            <X className="w-5 h-5" style={{ color: currentTheme.main }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5 text-sm overflow-y-auto max-h-[75vh] scrollbar-hide">

          {/* 類別膠囊 & 編號 */}
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm"
              style={{
                backgroundColor: meta.bg,
                color: meta.color,
              }}
            >
              {meta.icon && (
                <meta.icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
              )}
              {meta.label}
            </span>

            {ticket.code && (
              <span className="text-[11px] font-bold opacity-40 uppercase tracking-wider" style={{ color: currentTheme.text }}>
                編號: {ticket.code}
              </span>
            )}
          </div>

          {/* 副標題 */}
          {ticket.subtitle && (
            <p className="text-xs font-medium leading-relaxed opacity-60 px-1" style={{ color: currentTheme.text }}>
              {ticket.subtitle}
            </p>
          )}

          {/* 日期時間 */}
          {(ticket.date || ticket.time) && (
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50/50 p-4 rounded-2xl border border-gray-100" style={{ color: currentTheme.text }}>
              {ticket.date && (
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 opacity-40" style={{ color: currentTheme.main }} />
                  <span className="font-bold">{ticket.date}</span>
                </div>
              )}
              {ticket.time && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 opacity-40" style={{ color: currentTheme.main }} />
                  <span className="font-bold">{ticket.time}</span>
                </div>
              )}
            </div>
          )}

          {/* 地點 */}
          {ticket.location && (
            <div className="flex items-start gap-2.5 text-xs px-1" style={{ color: currentTheme.text }}>
              <MapPin className="w-4 h-4 mt-0.5 opacity-40 shrink-0" style={{ color: currentTheme.main }} />
              <p className="font-medium leading-relaxed">{ticket.location}</p>
            </div>
          )}

          {/* 連結 */}
          {ticket.link && (
            <button
              type="button"
              onClick={openLink}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border bg-white text-xs transition-all active:scale-95 shadow-sm hover:shadow-md"
              style={{ borderColor: `${currentTheme.main}30`, color: currentTheme.main }}
            >
              <span className="flex items-center gap-2.5 font-bold">
                <Link2 className="w-4 h-4" />
                <span>開啟官方連結 / 訂位頁面</span>
              </span>
            </button>
          )}

          {/* 圖片 - 修正 object-contain 確保完整顯示 */}
          {ticket.image && (
            <div 
              className="mt-2 border rounded-3xl p-1.5 flex justify-center shadow-inner"
              style={{ borderColor: `${currentTheme.main}10`, backgroundColor: `${currentTheme.main}05` }}
            >
              <img
                src={ticket.image}
                alt="Ticket"
                className="max-h-80 w-full object-contain rounded-2xl"
              />
            </div>
          )}

          {/* 備註 */}
          {ticket.notes && (
            <div 
              className="mt-1 rounded-2xl px-4 py-3 flex gap-3 text-xs leading-relaxed"
              style={{ backgroundColor: `${currentTheme.main}10`, color: currentTheme.main }}
            >
              <StickyNote className="w-4 h-4 mt-0.5 shrink-0 opacity-60" />
              <p className="font-medium">{ticket.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}