// src/components/EditItemModal.jsx
import React, { useMemo, useState } from "react";
import {
  X,
  Check,
  UtensilsCrossed,
  Landmark,
  Train,
  BedDouble,
  Ticket,
  Clock,
  Phone,
  Link, // 🆕 引入連結圖示
} from "lucide-react";

const TYPE_OPTIONS = {
  RESTAURANT: { key: "RESTAURANT", label: "餐廳", icon: UtensilsCrossed },
  ATTRACTION: { key: "ATTRACTION", label: "景點", icon: Landmark },
  TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train },
  HOTEL: { key: "HOTEL", label: "住宿", icon: BedDouble },
};

export default function EditItemModal({ item, trip, tickets = [], onSave, onClose }) {
  const ticketList = tickets?.length ? tickets : trip?.tickets || [];

  const initialTicketIds = useMemo(() => {
    if (Array.isArray(item.ticketIds)) return item.ticketIds.filter(Boolean);
    if (Array.isArray(item.tickets)) {
      return item.tickets
        .map((t) => (typeof t === "string" ? t : t?.id))
        .filter(Boolean);
    }
    if (item.ticket && typeof item.ticket === "string") return [item.ticket];
    if (item.ticket && typeof item.ticket === "object" && item.ticket?.id) return [item.ticket.id];
    return [];
  }, [item]);

  const [form, setForm] = useState({
    time: item.time || "09:00",
    type: item.type || "ATTRACTION",
    title: item.title || "",
    subtitle: item.subtitle || "",
    address: item.address || "",
    openingHours: item.openingHours || "",
    phone: item.phone || "",
    notes: item.notes || "",
    link: item.link || "", // 🆕 初始化連結欄位
    ticketIds: initialTicketIds,
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const selectedTickets = useMemo(() => {
    const map = new Map(ticketList.map((t) => [t.id, t]));
    return (form.ticketIds || [])
      .map((id) => map.get(id))
      .filter(Boolean);
  }, [form.ticketIds, ticketList]);

  const handleSave = () => {
    onSave({
      ...item,
      ...form,
      ticketIds: (form.ticketIds || []).filter((x) => typeof x === "string" && x.trim() !== ""),
      tickets: undefined,
      ticket: undefined,
    });
  };

  const removeTicket = (id) => {
    setForm((f) => ({
      ...f,
      ticketIds: (f.ticketIds || []).filter((x) => x !== id),
    }));
  };

  const addTicket = (id) => {
    setForm((f) => ({
      ...f,
      ticketIds: Array.from(new Set([...(f.ticketIds || []), id])),
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12">
      <div className="w-full max-w-lg bg-[#FFF9F2] rounded-[2rem] border border-[#E5D5C5] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#E5D5C5]/50 bg-white/50">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.2em] text-[#C6A087] uppercase font-bold mb-0.5">編輯行程</p>
            <h2 className="text-base font-bold text-[#5A4636] truncate">{form.title || "新的行程"}</h2>
          </div>

          <div className="flex items-center gap-2 ml-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white active:scale-90 transition-transform"
            >
              <X className="w-4 h-4 text-[#8C6A4F]" />
            </button>
            <button
              onClick={handleSave}
              className="w-8 h-8 rounded-full bg-[#C6A087] flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <Check className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto overflow-x-hidden scrollbar-none">
          
          {/* 時間 */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">時間</label>
            <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#C6A087]">
              <input
                type="time"
                value={form.time}
                onChange={(e) => update({ time: e.target.value })}
                className="w-full px-3 py-1.5 text-[13px] bg-transparent outline-none border-none"
              />
            </div>
          </div>

          {/* 類型 */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">類型</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(TYPE_OPTIONS).map((t) => {
                const Icon = t.icon;
                const active = form.type === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => update({ type: t.key })}
                    className={`px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1 border transition-colors ${
                      active
                        ? "bg-[#6A8A55] border-[#6A8A55] text-white shadow-sm"
                        : "bg-white border-[#E5D5C5] text-[#5A4636]"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 標題 */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">標題</label>
            <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#C6A087]">
              <input
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                className="w-full px-3 py-1.5 text-[13px] bg-transparent outline-none border-none"
                placeholder="輸入地點名稱"
              />
            </div>
          </div>

          {/* 副標題 */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">副標題</label>
            <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#C6A087]">
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => update({ subtitle: e.target.value })}
                className="w-full px-3 py-1.5 text-[13px] bg-transparent outline-none border-none"
                placeholder="選填細節說明"
              />
            </div>
          </div>

          {/* 票券 */}
          <div className="bg-[#FDF9F5] border border-[#E5D5C5]/50 rounded-2xl p-3">
            <label className="block text-[10px] font-bold text-[#8C6A4F] mb-2 uppercase tracking-widest">已綁定票券</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(!form.ticketIds || form.ticketIds.length === 0) && (
                <span className="text-[11px] text-[#8C6A4F]/50">尚未綁定</span>
              )}
              {selectedTickets.map((t) => (
                <span key={t.id} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-[#F7F1EB] border border-[#E5D5C5] text-[#5A4636]">
                  <Ticket className="w-3 h-3 text-[#C6A087]" />
                  {t.title}
                  <button type="button" onClick={() => removeTicket(t.id)} className="ml-1 text-[#C65353] font-bold px-0.5">×</button>
                </span>
              ))}
            </div>
            {ticketList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E5D5C5]/30">
                {ticketList.map((t) => {
                  if ((form.ticketIds || []).includes(t.id)) return null;
                  return (
                    <button key={t.id} type="button" onClick={() => addTicket(t.id)} className="px-2 py-1 rounded-lg text-[10px] border border-dashed border-[#C6A087] text-[#8C6A4F] bg-white">
                      ＋ {t.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 營業時間與電話 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">營業時間</label>
              <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#C6A087] flex items-center">
                <Clock className="w-3.5 h-3.5 text-[#C6A087] ml-3 shrink-0" />
                <input
                  type="text"
                  value={form.openingHours}
                  onChange={(e) => update({ openingHours: e.target.value })}
                  className="w-full px-2 py-1.5 text-[13px] bg-transparent outline-none border-none"
                  placeholder="09:00 - 18:00"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">電話</label>
              <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#C6A087] flex items-center">
                <Phone className="w-3.5 h-3.5 text-[#C6A087] ml-3 shrink-0" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  className="w-full px-2 py-1.5 text-[13px] bg-transparent outline-none border-none"
                  placeholder="聯絡電話"
                />
              </div>
            </div>
          </div>

          {/* 連結 - 🆕 新增外部連結欄位 */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">外部連結</label>
            <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#C6A087] flex items-center">
              <Link className="w-3.5 h-3.5 text-[#C6A087] ml-3 shrink-0" />
              <input
                type="text"
                value={form.link}
                onChange={(e) => update({ link: e.target.value })}
                className="w-full px-2 py-1.5 text-[13px] bg-transparent outline-none border-none"
                placeholder="[標題](網址) 或 直接貼網址"
              />
            </div>
          </div>

          {/* 地址 */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">地址</label>
            <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#C6A087]">
              <input
                type="text"
                value={form.address}
                onChange={(e) => update({ address: e.target.value })}
                className="w-full px-3 py-1.5 text-[13px] bg-transparent outline-none border-none"
                placeholder="輸入詳細地址"
              />
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">備註</label>
            <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#C6A087]">
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => update({ notes: e.target.value })}
                className="w-full px-3 py-1.5 text-[13px] bg-transparent resize-none outline-none border-none"
                placeholder="備註資訊..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}