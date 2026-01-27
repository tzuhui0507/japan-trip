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
  Link,
  Split,
} from "lucide-react";

const TYPE_OPTIONS = {
  RESTAURANT: { key: "RESTAURANT", label: "餐廳", icon: UtensilsCrossed },
  ATTRACTION: { key: "ATTRACTION", label: "景點", icon: Landmark },
  TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train },
  HOTEL: { key: "HOTEL", label: "住宿", icon: BedDouble },
};

export default function EditItemModal({ item, trip, tickets = [], onSave, onClose }) {
  const ticketList = tickets?.length ? tickets : trip?.tickets || [];

  // 初始化支線票券數據
  const initialBranchTickets = useMemo(() => {
    let ids = item.ticketIds || [];
    if (typeof ids === "string" && ids.includes("---")) {
      const parts = ids.split("---");
      return {
        A: parts[0]?.split(",").filter(Boolean) || [],
        B: parts[1]?.split(",").filter(Boolean) || [],
      };
    }
    // 如果原本是單一陣列或字串，預設歸類為兩者皆是 (A & B)
    const normalized = Array.isArray(ids) ? ids : (typeof ids === "string" ? ids.split(",") : []);
    return { A: [...normalized], B: [...normalized] };
  }, [item.ticketIds]);

  const [form, setForm] = useState({
    time: item.time || "09:00",
    type: item.type || "ATTRACTION",
    title: item.title || "",
    subtitle: item.subtitle || "",
    address: item.address || "",
    openingHours: item.openingHours || "",
    phone: item.phone || "",
    notes: item.notes || "",
    link: item.link || "",
  });

  const [branchTickets, setBranchTickets] = useState(initialBranchTickets);
  const [ticketMenu, setTicketMenu] = useState(null); // 用於顯示選擇 A/B 的小選單

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = () => {
    // 組合 A/B 票券為字串格式 ID1,ID2 --- ID3,ID4
    const ticketIdsString = `${branchTickets.A.join(",")}---${branchTickets.B.join(",")}`;
    
    onSave({
      ...item,
      ...form,
      ticketIds: ticketIdsString,
      tickets: undefined,
      ticket: undefined,
    });
  };

  const addTicketToBranch = (ticketId, branch) => {
    setBranchTickets(prev => {
      const next = { ...prev };
      if (branch === "BOTH") {
        next.A = Array.from(new Set([...next.A, ticketId]));
        next.B = Array.from(new Set([...next.B, ticketId]));
      } else {
        next[branch] = Array.from(new Set([...next[branch], ticketId]));
      }
      return next;
    });
    setTicketMenu(null);
  };

  const removeTicketFromBranch = (ticketId, branch) => {
    setBranchTickets(prev => ({
      ...prev,
      [branch]: prev[branch].filter(id => id !== ticketId)
    }));
  };

  const renderTicketBadge = (id, branch) => {
    const t = ticketList.find(x => x.id === id);
    if (!t) return null;
    return (
      <span key={`${branch}-${id}`} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-[#F7F1EB] border border-[#E5D5C5] text-[#5A4636]">
        <Ticket className="w-3 h-3 text-[#C6A087]" />
        {t.title}
        <button type="button" onClick={() => removeTicketFromBranch(id, branch)} className="ml-1 text-[#C65353] font-bold px-0.5">×</button>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12">
      <div className="w-full max-w-lg bg-[#FFF9F2] rounded-[2rem] border border-[#E5D5C5] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#E5D5C5]/50 bg-white/50">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.2em] text-[#C6A087] uppercase font-bold mb-0.5">編輯行程 (支援支線)</p>
            <h2 className="text-base font-bold text-[#5A4636] truncate">{form.title || "新的行程"}</h2>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={onClose} className="w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white"><X className="w-4 h-4 text-[#8C6A4F]" /></button>
            <button onClick={handleSave} className="w-8 h-8 rounded-full bg-[#C6A087] flex items-center justify-center shadow-md"><Check className="w-4 h-4 text-white" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-none pb-10">
          
          {/* 時間 */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">時間</label>
            <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#C6A087]">
              <input type="time" value={form.time} onChange={(e) => update({ time: e.target.value })} className="w-full px-3 py-1.5 text-[13px] bg-transparent outline-none border-none" />
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
                  <button key={t.key} type="button" onClick={() => update({ type: t.key })} className={`px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1 border transition-colors ${active ? "bg-[#6A8A55] border-[#6A8A55] text-white shadow-sm" : "bg-white border-[#E5D5C5] text-[#5A4636]"}`}>
                    <Icon className="w-3 h-3" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 標題與地址 (支線) */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">標題</label>
              <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden">
                <input value={form.title} onChange={(e) => update({ title: e.target.value })} className="w-full px-3 py-1.5 text-[13px] outline-none border-none" placeholder="方案A --- 方案B" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">詳細地址</label>
              <div className="w-full border border-[#E5D5C5] rounded-xl bg-white overflow-hidden">
                <input type="text" value={form.address} onChange={(e) => update({ address: e.target.value })} className="w-full px-3 py-1.5 text-[13px] outline-none border-none" placeholder="地址A --- 地址B" />
              </div>
            </div>
          </div>

          {/* 支線票券分組 UI */}
          <div className="bg-[#FDF9F5] border border-[#E5D5C5]/50 rounded-2xl p-3 space-y-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#8C6A4F] uppercase tracking-widest">
              <Split className="w-3 h-3" /> 票券方案設定
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-[#C6A087] mt-1.5 w-6">A:</span>
                <div className="flex flex-wrap gap-1.5 flex-1 min-h-[24px]">
                  {branchTickets.A.length === 0 && <span className="text-[10px] text-[#8C6A4F]/40 mt-1.5">無</span>}
                  {branchTickets.A.map(id => renderTicketBadge(id, "A"))}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-[#C6A087] mt-1.5 w-6">B:</span>
                <div className="flex flex-wrap gap-1.5 flex-1 min-h-[24px]">
                  {branchTickets.B.length === 0 && <span className="text-[10px] text-[#8C6A4F]/40 mt-1.5">無</span>}
                  {branchTickets.B.map(id => renderTicketBadge(id, "B"))}
                </div>
              </div>
            </div>

            {/* 候選票券列表 */}
            <div className="pt-2 border-t border-[#E5D5C5]/30">
              <p className="text-[9px] text-[#8C6A4F]/60 mb-2">點擊票券選擇加入的方案：</p>
              <div className="flex flex-wrap gap-1.5">
                {ticketList.map((t) => (
                  <div key={t.id} className="relative">
                    <button type="button" onClick={() => setTicketMenu(ticketMenu === t.id ? null : t.id)} className={`px-2 py-1 rounded-lg text-[10px] border transition-all ${ticketMenu === t.id ? "bg-[#C6A087] text-white border-[#C6A087]" : "border-dashed border-[#C6A087] text-[#8C6A4F] bg-white"}`}>
                      ＋ {t.title}
                    </button>
                    {ticketMenu === t.id && (
                      <div className="absolute top-full left-0 mt-1 z-[110] bg-white border border-[#E5D5C5] rounded-xl shadow-xl p-1 flex flex-col gap-1 min-w-[80px]">
                        <button onClick={() => addTicketToBranch(t.id, "A")} className="px-2 py-1.5 text-[10px] text-left hover:bg-[#F7F1EB] rounded-lg">加入方案 A</button>
                        <button onClick={() => addTicketToBranch(t.id, "B")} className="px-2 py-1.5 text-[10px] text-left hover:bg-[#F7F1EB] rounded-lg">加入方案 B</button>
                        <button onClick={() => addTicketToBranch(t.id, "BOTH")} className="px-2 py-1.5 text-[10px] text-left hover:bg-[#F7F1EB] rounded-lg border-t border-[#F0E3D5]">兩者皆加入</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 營業時間、電話、連結、備註 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-[#E5D5C5] rounded-xl p-2 bg-white">
              <label className="block text-[9px] font-bold text-[#8C6A4F]/60 mb-0.5">營業時間</label>
              <input value={form.openingHours} onChange={(e) => update({ openingHours: e.target.value })} className="w-full text-[12px] outline-none" placeholder="A --- B" />
            </div>
            <div className="border border-[#E5D5C5] rounded-xl p-2 bg-white">
              <label className="block text-[9px] font-bold text-[#8C6A4F]/60 mb-0.5">電話</label>
              <input value={form.phone} onChange={(e) => update({ phone: e.target.value })} className="w-full text-[12px] outline-none" placeholder="A --- B" />
            </div>
          </div>

          <div className="border border-[#E5D5C5] rounded-xl p-2 bg-white">
            <label className="block text-[9px] font-bold text-[#8C6A4F]/60 mb-0.5">外部連結</label>
            <input value={form.link} onChange={(e) => update({ link: e.target.value })} className="w-full text-[12px] outline-none" placeholder="[標題](網址) A --- B" />
          </div>

          <div className="border border-[#E5D5C5] rounded-xl p-2 bg-white">
            <label className="block text-[9px] font-bold text-[#8C6A4F]/60 mb-0.5">備註</label>
            <textarea rows={2} value={form.notes} onChange={(e) => update({ notes: e.target.value })} className="w-full text-[12px] outline-none resize-none" placeholder="備註 A --- 備註 B" />
          </div>
        </div>
      </div>
    </div>
  );
}