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

// 與 TicketsTab 共用的類別設定（加入 icon + 背景）
const TYPE_META = {
  ATTRACTION: {
    label: "景點",
    color: "#4A607F",
    bg: "#E7EEF9",
    icon: Landmark, // 你可依需求加入 icon
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
    color: "#9b2e87ff",
    bg: "#F3E3F0",
    icon: BedDouble,
  },
};

export default function TicketDetail({ ticket, onClose }) {
  if (!ticket) return null;

  const meta = TYPE_META[ticket.type] || TYPE_META.ATTRACTION;

  const openLink = () => {
    if (!ticket.link) return;
    window.open(ticket.link, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-[#FFF9F2] rounded-3xl border border-[#E5D5C5] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#E5D5C5]">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#C6A087] mb-1 font-serif">
              TICKET DETAIL
            </p>
            <h2 className="text-base font-serif font-bold text-[#5A4636]">
              {ticket.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E5D5C5] bg-white flex items-center justify-center"
          >
            <X className="w-4 h-4 text-[#8C6A4F]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 text-sm">

          {/* 類別膠囊 & 編號 */}
          <div className="flex items-center justify-between">
            <span
             className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold"
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
              <span className="text-[11px] text-[#8C6A4F]">
                編號：{ticket.code}
              </span>
            )}
          </div>

          {/* 副標題 */}
          {ticket.subtitle && (
            <p className="text-xs text-[#8C6A4F]">{ticket.subtitle}</p>
          )}

          {/* 日期時間 */}
          {(ticket.date || ticket.time) && (
            <div className="grid grid-cols-2 gap-3 text-xs text-[#5A4636]">
              {ticket.date && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#C6A087]" />
                  <span>{ticket.date}</span>
                </div>
              )}
              {ticket.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C6A087]" />
                  <span>{ticket.time}</span>
                </div>
              )}
            </div>
          )}

          {/* 地點 */}
          {ticket.location && (
            <div className="flex items-start gap-2 text-xs text-[#5A4636]">
              <MapPin className="w-4 h-4 text-[#C6A087] mt-[2px]" />
              <p>{ticket.location}</p>
            </div>
          )}

          {/* 連結 */}
          {ticket.link && (
            <button
              type="button"
              onClick={openLink}
              className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-xl border border-[#E5D5C5] bg-white text-xs text-[#8C6A4F] hover:bg-[#FFF3E5]"
            >
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#C6A087]" />
                <span>開啟官方連結 / 訂位頁面</span>
              </span>
            </button>
          )}

          {/* 圖片 */}
          {ticket.image && (
            <div className="mt-2 border border-[#E5D5C5] rounded-2xl bg-white p-3 flex justify-center">
              <img
                src={ticket.image}
                alt="Ticket"
                className="max-h-72 object-contain rounded-xl"
              />
            </div>
          )}

          {/* 備註 */}
          {ticket.notes && (
            <div className="mt-1 rounded-2xl bg-[#F7F1EB] px-3 py-2 flex gap-2 text-xs text-[#8C6A4F]">
              <StickyNote className="w-4 h-4 mt-[2px]" />
              <p>{ticket.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
