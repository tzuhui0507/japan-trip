// src/components/EditItemModal.jsx
import React, { useMemo, useState } from "react";
import { X, Check, UtensilsCrossed, Landmark, Train, BedDouble, Ticket, Clock, Phone, Link, Layers, MapPin, StickyNote, Pin, Bookmark } from "lucide-react";

const TYPE_OPTIONS = {
  ATTRACTION: { key: "ATTRACTION", label: "景點", icon: Landmark, pillBg: "#E7EEF9", pillText: "#4A607F" },
  RESTAURANT: { key: "RESTAURANT", label: "餐廳", icon: UtensilsCrossed, pillBg: "#FBE7DF", pillText: "#8C4A2F" },
  TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train, pillBg: "#E4F1E3", pillText: "#4E6B48" },
  HOTEL: { key: "HOTEL", label: "住宿", icon: BedDouble, pillBg: "#F3E3F0", pillText: "#7A4D6E" },
};

export default function EditItemModal({ item, trip, tickets = [], onSave, onClose }) {
  const ticketList = tickets?.length ? tickets : trip?.tickets || [];

  const parseBranch = (val) => {
    if (typeof val !== "string") return { a: val || "", b: "" };
    if (!val.includes("---")) return { a: val, b: "" };
    const parts = val.split("---");
    return { a: parts[0] || "", b: parts[1] || "" };
  };

  const [baseForm, setBaseForm] = useState({ time: item.time || "09:00", type: item.type || "ATTRACTION" });
  
  const initialData = useMemo(() => ({
    title: parseBranch(item.title),
    subtitle: parseBranch(item.subtitle),
    address: parseBranch(item.address),
    openingHours: parseBranch(item.openingHours),
    phone: parseBranch(item.phone),
    notes: parseBranch(item.notes),
    link: parseBranch(item.link),
  }), [item]);

  const [formA, setFormA] = useState({ 
    title: initialData.title.a, 
    subtitle: initialData.subtitle.a, 
    address: initialData.address.a, 
    openingHours: initialData.openingHours.a, 
    phone: initialData.phone.a, 
    notes: initialData.notes.a, 
    link: initialData.link.a 
  });
  
  const [formB, setFormB] = useState({ 
    title: initialData.title.b, 
    subtitle: initialData.subtitle.b, 
    address: initialData.address.b, 
    openingHours: initialData.openingHours.b, 
    phone: initialData.phone.b, 
    notes: initialData.notes.b, 
    link: initialData.link.b 
  });

  const [branchTickets, setBranchTickets] = useState(useMemo(() => {
    let ids = item.ticketIds || [];
    if (typeof ids === "string" && ids.includes("---")) {
      const parts = ids.split("---");
      return { A: parts[0]?.split(",").filter(Boolean) || [], B: parts[1]?.split(",").filter(Boolean) || [] };
    }
    const normalized = Array.isArray(ids) ? ids : (typeof ids === "string" ? ids.split(",") : []);
    return { A: [...normalized], B: [] };
  }, [item.ticketIds]));

  const [ticketMenu, setTicketMenu] = useState(null);

  const handleSave = () => {
    const hasAnyB = Object.values(formB).some(val => val && val.trim() !== "") || branchTickets.B.length > 0;
    const combine = (key) => hasAnyB ? `${formA[key]}---${formB[key]}` : formA[key];
    
    onSave({ 
      ...item, 
      time: baseForm.time, 
      type: baseForm.type, 
      title: combine("title"), 
      subtitle: combine("subtitle"), 
      address: combine("address"), 
      openingHours: combine("openingHours"), 
      phone: combine("phone"), 
      notes: combine("notes"), 
      link: combine("link"), 
      ticketIds: hasAnyB ? `${branchTickets.A.join(",")}---${branchTickets.B.join(",")}` : branchTickets.A.join(",") 
    });
  };

  const renderField = (label, key, Icon) => (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6A4F] uppercase px-1 tracking-widest">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#C6A087] font-bold z-10">方案 1</span>
          <div className="w-full border border-[#E5D5C5] rounded-xl bg-white shadow-sm overflow-hidden">
            <input value={formA[key]} onChange={(e) => setFormA(prev => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-2.5 text-[14px] outline-none" />
          </div>
        </div>
        <div className="relative">
          <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#8C6A4F] font-bold z-10">方案 2</span>
          <div className="w-full border border-[#E5D5C5] border-dashed rounded-xl bg-[#F7F1EB]/30 overflow-hidden">
            <input value={formB[key]} onChange={(e) => setFormB(prev => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-2.5 text-[14px] outline-none bg-transparent" placeholder="輸入開啟備案..." />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-2 sm:p-4">
      <div className="w-[98%] sm:max-w-2xl bg-[#FFF9F2] rounded-[2rem] border border-[#E5D5C5] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#E5D5C5]/50 bg-white/70 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[10px] tracking-[0.2em] text-[#C6A087] uppercase font-bold mb-0.5">行程編輯</p>
            <h2 className="text-base font-bold text-[#5A4636] truncate">{formA.title || "新的行程"}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white shadow-sm text-[#8C6A4F] active:scale-90 transition-all"><X className="w-5 h-5" /></button>
            <button onClick={handleSave} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C6A087] flex items-center justify-center shadow-md text-white active:scale-90 transition-all"><Check className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 sm:px-6 py-6 space-y-8 overflow-y-auto scrollbar-none pb-20 flex-1">
          <div className="flex flex-col gap-8">
            {/* 時間區塊 */}
            <div className="w-full">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6A4F] mb-2 uppercase tracking-widest px-1">
                <Clock className="w-3.5 h-3.5" /> 抵達時間
              </label>
              <div className="flex items-center justify-center border border-[#E5D5C5] rounded-xl bg-white shadow-sm focus-within:ring-1 focus-within:ring-[#C6A087] transition-all overflow-hidden h-14">
                <input 
                  type="time" 
                  value={baseForm.time} 
                  onChange={(e) => setBaseForm(prev => ({ ...prev, time: e.target.value }))} 
                  className="w-full h-full text-center text-[16px] outline-none bg-transparent appearance-none" 
                />
              </div>
            </div>

            {/* 類別區塊 */}
            <div className="w-full">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6A4F] mb-3 uppercase tracking-widest px-1">
                <Layers className="w-3.5 h-3.5" /> 類別選擇
              </label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
                {Object.values(TYPE_OPTIONS).map((t) => {
                  const active = baseForm.type === t.key;
                  return (
                    <button 
                      key={t.key} 
                      type="button" 
                      onClick={() => setBaseForm(prev => ({ ...prev, type: t.key }))} 
                      style={{ 
                        backgroundColor: active ? t.pillBg : 'white', 
                        color: active ? t.pillText : '#5A4636', 
                        borderColor: active ? t.pillText : '#E5D5C5' 
                      }} 
                      className="flex-1 min-w-[70px] sm:min-w-[80px] h-14 rounded-2xl flex flex-col items-center justify-center border transition-all gap-1 shadow-sm active:scale-95"
                    >
                      <t.icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
                      <span className="text-[10px] font-bold tracking-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-[#E5D5C5]/30" />

          {renderField("地點名稱", "title", Pin)}
          {renderField("副標題", "subtitle", Bookmark)}
          {renderField("詳細地址", "address", MapPin)}
          {renderField("營業時間", "openingHours", Clock)}
          {renderField("聯絡電話", "phone", Phone)}
          {renderField("外部連結", "link", Link)}
          
          <div className="bg-[#FDF9F5] border border-[#E5D5C5]/50 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6A4F] uppercase tracking-widest"><Ticket className="w-4 h-4" /> 票券方案綁定</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-[#E5D5C5]/30 pb-3 sm:pb-0 sm:pr-3">
                <span className="text-[9px] font-bold text-[#C6A087] bg-white px-2 py-0.5 rounded-full border border-[#E5D5C5]">方案 1</span>
                <div className="flex flex-wrap gap-2 min-h-[30px]">
                  {branchTickets.A.map(id => (
                    <span key={`A-${id}`} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-white border border-[#E5D5C5] text-[#5A4636]">
                      {ticketList.find(x => x.id === id)?.title}
                      <button onClick={() => setBranchTickets(p => ({ ...p, A: p.A.filter(x => x !== id) }))} className="ml-1 text-red-400 font-bold hover:text-red-600 transition-colors">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 sm:pl-1">
                <span className="text-[9px] font-bold text-[#8C6A4F] bg-white px-2 py-0.5 rounded-full border border-[#E5D5C5]">方案 2</span>
                <div className="flex flex-wrap gap-2 min-h-[30px]">
                  {branchTickets.B.map(id => (
                    <span key={`B-${id}`} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-white border border-[#E5D5C5] text-[#5A4636]">
                      {ticketList.find(x => x.id === id)?.title}
                      <button onClick={() => setBranchTickets(p => ({ ...p, B: p.B.filter(x => x !== id) }))} className="ml-1 text-red-400 font-bold hover:text-red-600 transition-colors">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-[#E5D5C5]/30 flex flex-wrap gap-2">
              {ticketList.map((t) => (
                <div key={t.id} className="relative">
                  <button type="button" onClick={() => setTicketMenu(ticketMenu === t.id ? null : t.id)} className={`px-3 py-1.5 rounded-xl text-[11px] border transition-all ${ticketMenu === t.id ? "bg-[#C6A087] text-white border-[#C6A087]" : "border-dashed border-[#C6A087] text-[#8C6A4F] bg-white hover:bg-[#F7F1EB]"}`}>＋ {t.title}</button>
                  {ticketMenu === t.id && (
                    <div className="absolute bottom-full left-0 mb-2 z-[110] bg-white border border-[#E5D5C5] rounded-xl shadow-2xl p-1 flex flex-col min-w-[110px]">
                      <button onClick={() => { setBranchTickets(p => ({ ...p, A: Array.from(new Set([...p.A, t.id])) })); setTicketMenu(null); }} className="px-3 py-2 text-[12px] text-left hover:bg-[#F7F1EB] rounded-lg border-b border-[#F0E3D5]/30">加入方案 1</button>
                      <button onClick={() => { setBranchTickets(p => ({ ...p, B: Array.from(new Set([...p.B, t.id])) })); setTicketMenu(null); }} className="px-3 py-2 text-[12px] text-left hover:bg-[#F7F1EB] rounded-lg">加入方案 2</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6A4F] uppercase px-1 tracking-widest">
              <StickyNote className="w-3.5 h-3.5" /> 補充備註
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#C6A087] font-bold z-10">方案 1</span>
                <div className="w-full border border-[#E5D5C5] rounded-xl bg-white shadow-sm">
                  <textarea value={formA.notes} onChange={(e) => setFormA(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-3 py-3 text-[14px] outline-none bg-transparent resize-none min-h-[80px]" />
                </div>
              </div>
              <div className="relative">
                <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#8C6A4F] font-bold z-10">方案 2</span>
                <div className="w-full border border-[#E5D5C5] border-dashed rounded-xl bg-[#F7F1EB]/30 shadow-sm">
                  <textarea value={formB.notes} onChange={(e) => setFormB(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-3 py-3 text-[14px] outline-none bg-transparent resize-none min-h-[80px]" placeholder="輸入開啟備案..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}