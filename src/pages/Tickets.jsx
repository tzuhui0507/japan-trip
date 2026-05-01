// src/pages/Tickets.jsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ChevronRight,
  Landmark,
  Train,
  UtensilsCrossed,
  BedDouble,
  Ticket as TicketIcon,
} from "lucide-react";

import TicketEditModal from "../components/TicketEditModal";
import TicketDetail from "../components/TicketDetail";
import PageHeader from "../components/PageHeader";
import { THEMES } from "../App"; // 引入全域主題配置

// ===============================
// 類型樣式（左色條 / icon / 顏色）
// ===============================
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

export default function Tickets({ trip, setTrip, themeId }) {
  if (!trip) return null;
  const isReadOnly = trip?.shareMode === "viewer";
  
  // 獲取當前主題配置
  const currentTheme = THEMES[themeId] || THEMES.milkTea;

  // ===============================
  // state
  // ===============================
  const [tickets, setTickets] = useState(trip.tickets || []);
  const [editingTicket, setEditingTicket] = useState(null);
  const [detailTicket, setDetailTicket] = useState(null);

  // 與 trip 同步（localStorage 來源）
  useEffect(() => {
    setTickets(trip.tickets || []);
  }, [trip.tickets]);

  // ===============================
  // helpers
  // ===============================
  const updateTickets = (updater) => {
    setTickets((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setTrip((p) => ({ ...p, tickets: next }));
      return next;
    });
  };

  const openNewTicket = () => {
    if (isReadOnly) return;
    setEditingTicket({
      id: `ticket-${Date.now()}`,
      type: "ATTRACTION",
      title: "",
      subtitle: "",
      date: "",
      time: "",
      location: "",
      code: "",
      link: "",
      image: "",
      notes: "",
    });
  };

  const openEditTicket = (ticket) => {
    if (isReadOnly) return;
    setEditingTicket({
      ...ticket,
      id: ticket.id || `ticket-${Date.now()}`,
    });
  };

  const saveTicket = (data) => {
    if (isReadOnly) return;
    updateTickets((prev) => {
      const exists = prev.some((t) => t.id === data.id);
      return exists
        ? prev.map((t) => (t.id === data.id ? data : t))
        : [...prev, data];
    });
    setEditingTicket(null);
  };

  const deleteTicket = (id) => {
    if (isReadOnly) return;
    if (!window.confirm("確定刪除這張票券？")) return;
    updateTickets((prev) => prev.filter((t) => t.id !== id));
  };

  // ===============================
  // render single card
  // ===============================
  const renderTicketCard = (ticket) => {
    const meta = TYPE_META[ticket.type] || TYPE_META.ATTRACTION;
    const Icon = meta.icon;

    return (
      <div
        key={ticket.id}
        className="relative rounded-[26px] border shadow-sm mb-3 overflow-hidden transition-all duration-500"
        style={{ 
          backgroundColor: "#fdfdfd", // ✅ 固定奶白色底，跳脫頁面背景
          borderColor: currentTheme.border 
        }}
      >
        {/* 左色條 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: meta.bg }}
        />

        <div className="pl-4 pr-3 py-3 flex items-center gap-3">
          {/* icon */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner"
            style={{ backgroundColor: meta.bg }}
          >
            <Icon className="w-5 h-5" style={{ color: meta.color }} />
          </div>

          {/* 文字 */}
          <button
            type="button"
            onClick={() => setDetailTicket(ticket)}
            className="flex-1 text-left"
          >
            <h3 className="text-sm font-bold" style={{ color: currentTheme.text }}>
              {ticket.title || "未命名票券"}
            </h3>

            {ticket.subtitle && (
              <p className="text-xs mt-0.5 font-medium opacity-80" style={{ color: currentTheme.accent }}>
                {ticket.subtitle}
              </p>
            )}

            {(ticket.date || ticket.time) && (
              <p className="text-[11px] mt-0.5 opacity-70" style={{ color: currentTheme.main }}>
                {[ticket.date, ticket.time].filter(Boolean).join(" / ")}
              </p>
            )}
          </button>

          {/* 操作 */}
          {!isReadOnly && (
            <div className="flex flex-col items-end gap-2 ml-2">
              <button
                type="button"
                onClick={() => openEditTicket(ticket)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-sm"
                style={{ backgroundColor: currentTheme.light }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: currentTheme.accent }} />
              </button>

              <button
                type="button"
                onClick={() => deleteTicket(ticket.id)}
                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center transition-transform active:scale-90 shadow-sm"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===============================
  // render
  // ===============================
  return (
    <div className="pt-2 pb-24">
      <PageHeader
        icon={TicketIcon}
        title="票券／預約管理"
        subtitle="TICKETS & RESERVATIONS"
        themeId={themeId} // 傳遞主題給標題組件
      />

      {/* 新增按鈕 */}
      <div className="px-4 mb-4">
        {!isReadOnly && (
          <button
            type="button"
            onClick={openNewTicket}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-black shadow-md transition-all active:scale-95"
            style={{ backgroundColor: currentTheme.main }}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            新增
          </button>
        )}
      </div>

      {/* 列表 */}
      <div className="px-4">
        {tickets.length === 0 ? (
          <div className="py-12 flex flex-col items-center opacity-40">
            <TicketIcon className="w-12 h-12 mb-2" style={{ color: currentTheme.accent }} />
            <p className="text-xs font-bold" style={{ color: currentTheme.accent }}>
              尚無票券，點選「新增」開始建立。
            </p>
          </div>
        ) : (
          <div>{tickets.map(renderTicketCard)}</div>
        )}
      </div>

      {/* Modals */}
      {editingTicket && !isReadOnly && (
        <TicketEditModal
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSave={saveTicket}
          themeId={themeId}
        />
      )}

      {detailTicket && (
        <TicketDetail
          ticket={detailTicket}
          onClose={() => setDetailTicket(null)}
          themeId={themeId}
        />
      )}
    </div>
  );
}