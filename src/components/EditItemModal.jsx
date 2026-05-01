// src/components/EditItemModal.jsx
import React, { useMemo, useState } from "react";
import { X, Check, UtensilsCrossed, Landmark, Train, BedDouble, Ticket, Clock, Phone, Link, Layers, MapPin, StickyNote, Pin, Bookmark, CalendarOff, Trash2 } from "lucide-react";
import { THEMES } from "../App";

const TYPE_OPTIONS = {
  ATTRACTION: { key: "ATTRACTION", label: "景點", icon: Landmark, pillBg: "#E7EEF9", pillText: "#4A607F" },
  RESTAURANT: { key: "RESTAURANT", label: "餐廳", icon: UtensilsCrossed, pillBg: "#FBE7DF", pillText: "#8C4A2F" },
  TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train, pillBg: "#E4F1E3", pillText: "#4E6B48" },
  HOTEL: { key: "HOTEL", label: "住宿", icon: BedDouble, pillBg: "#F3E3F0", pillText: "#7A4D6E" },
};

export default function EditItemModal({ item, trip, tickets = [], onSave, onClose, themeId }) {
  const currentTheme = THEMES[themeId] || THEMES.milkTea;
  const ticketList = tickets?.length ? tickets : trip?.tickets || [];

  // 解析三段支線邏輯 (A---B---C)
  const parseBranch = (val) => {
    if (typeof val !== "string") return { a: val || "", b: "", c: "" };
    const parts = val.split("---");
    return { 
      a: parts[0] || "", 
      b: parts[1] || "", 
      c: parts[2] || "" 
    };
  };

  const [baseForm, setBaseForm] = useState({ time: item.time || "", type: item.type || "ATTRACTION" });
  
  const initialData = useMemo(() => ({
    title: parseBranch(item.title),
    subtitle: parseBranch(item.subtitle),
    address: parseBranch(item.address),
    openingHours: parseBranch(item.openingHours),
    offDay: parseBranch(item.offDay),
    phone: parseBranch(item.phone),
    notes: parseBranch(item.notes),
    link: parseBranch(item.link),
  }), [item]);

  const [formA, setFormA] = useState({ ...initialData.title, title: initialData.title.a, subtitle: initialData.subtitle.a, address: initialData.address.a, openingHours: initialData.openingHours.a, offDay: initialData.offDay.a, phone: initialData.phone.a, notes: initialData.notes.a, link: initialData.link.a });
  const [formB, setFormB] = useState({ title: initialData.title.b, subtitle: initialData.subtitle.b, address: initialData.address.b, openingHours: initialData.openingHours.b, offDay: initialData.offDay.b, phone: initialData.phone.b, notes: initialData.notes.b, link: initialData.link.b });
  const [formC, setFormC] = useState({ title: initialData.title.c, subtitle: initialData.subtitle.c, address: initialData.address.c, openingHours: initialData.openingHours.c, offDay: initialData.offDay.c, phone: initialData.phone.c, notes: initialData.notes.c, link: initialData.link.c });

  const [branchTickets, setBranchTickets] = useState(useMemo(() => {
    let ids = item.ticketIds || [];
    if (typeof ids === "string" && ids.includes("---")) {
      const parts = ids.split("---");
      return { 
        A: parts[0]?.split(",").filter(Boolean) || [], 
        B: parts[1]?.split(",").filter(Boolean) || [],
        C: parts[2]?.split(",").filter(Boolean) || []
      };
    }
    const normalized = Array.isArray(ids) ? ids : (typeof ids === "string" ? ids.split(",") : []);
    return { A: [...normalized], B: [], C: [] };
  }, [item.ticketIds]));

  const [ticketMenu, setTicketMenu] = useState(null);

  const handleSave = () => {
    const hasAnyB = Object.values(formB).some(val => val && val.trim() !== "") || branchTickets.B.length > 0;
    const hasAnyC = Object.values(formC).some(val => val && val.trim() !== "") || branchTickets.C.length > 0;
    
    const combine = (key) => {
      const vA = (formA[key] || "").trim();
      const vB = (formB[key] || "").trim();
      const vC = (formC[key] || "").trim();
      if (hasAnyC) return `${vA}---${vB}---${vC}`;
      if (hasAnyB) return `${vA}---${vB}`;
      return vA;
    };
    
    onSave({ 
      ...item, 
      time: baseForm.time || "", 
      type: baseForm.type, 
      title: combine("title"), 
      subtitle: combine("subtitle"), 
      address: combine("address"), 
      openingHours: combine("openingHours"), 
      offDay: combine("offDay"),
      phone: combine("phone"), 
      notes: combine("notes"), 
      link: combine("link"), 
      ticketIds: hasAnyC 
        ? `${branchTickets.A.join(",")}---${branchTickets.B.join(",")}---${branchTickets.C.join(",")}`
        : hasAnyB 
          ? `${branchTickets.A.join(",")}---${branchTickets.B.join(",")}`
          : branchTickets.A.join(",")
    });
  };

  const renderField = (label, key, Icon) => (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase px-1 tracking-widest opacity-70" style={{ color: currentTheme.text }}>
        {Icon && <Icon className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />} {label}
      </label>
      <div className="flex flex-col gap-4">
        {/* 方案 1 */}
        <div className="relative">
          <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold z-10" style={{ color: currentTheme.main }}>方案 1</span>
          <div 
            className="w-full border rounded-xl bg-white shadow-sm overflow-hidden transition-all focus-within:ring-2"
            style={{ borderColor: `${currentTheme.main}30`, "--tw-ring-color": `${currentTheme.main}20` }}
          >
            <input 
              value={formA[key]} 
              onChange={(e) => setFormA(prev => ({ ...prev, [key]: e.target.value }))} 
              className="w-full px-4 py-3 text-[14px] outline-none" 
              placeholder={`輸入方案 1 ${label}...`}
              style={{ color: currentTheme.text }}
            />
          </div>
        </div>
        {/* 方案 2 與 3 並列 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold z-10 opacity-60" style={{ color: currentTheme.text }}>方案 2</span>
            <div 
              className="w-full border border-dashed rounded-xl bg-gray-50/50 overflow-hidden transition-all focus-within:ring-2"
              style={{ borderColor: `${currentTheme.main}40`, "--tw-ring-color": `${currentTheme.main}10` }}
            >
              <input 
                value={formB[key]} 
                onChange={(e) => setFormB(prev => ({ ...prev, [key]: e.target.value }))} 
                className="w-full px-4 py-3 text-[14px] outline-none bg-transparent" 
                placeholder="輸入方案 2..." 
                style={{ color: currentTheme.text }}
              />
            </div>
          </div>
          <div className="relative">
            <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold z-10 opacity-60" style={{ color: "#4A607F" }}>方案 3</span>
            <div 
              className="w-full border border-dashed rounded-xl bg-gray-50/50 overflow-hidden transition-all focus-within:ring-2"
              style={{ borderColor: "#D1D9E6", "--tw-ring-color": "#D1D9E640" }}
            >
              <input 
                value={formC[key]} 
                onChange={(e) => setFormC(prev => ({ ...prev, [key]: e.target.value }))} 
                className="w-full px-4 py-3 text-[14px] outline-none bg-transparent" 
                placeholder="輸入方案 3..." 
                style={{ color: currentTheme.text }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-2 sm:p-4">
      <div 
        className="w-[98%] sm:max-w-2xl bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ borderColor: `${currentTheme.main}20` }}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-5 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20" style={{ borderColor: `${currentTheme.main}10` }}>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-0.5" style={{ color: currentTheme.main }}>行程編輯</p>
            <h2 className="text-lg font-bold truncate" style={{ color: currentTheme.text }}>{formA.title || "新的行程"}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full border flex items-center justify-center bg-white shadow-sm active:scale-90 transition-all"
              style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.main }}
            >
              <X className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSave} 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white active:scale-90 transition-all"
              style={{ backgroundColor: currentTheme.main }}
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-8 py-8 space-y-10 overflow-y-auto scrollbar-none pb-24 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* 時間區塊 */}
            <div className="w-full">
              <label className="flex items-center gap-1.5 text-[11px] font-bold mb-3 uppercase tracking-widest px-1 opacity-70" style={{ color: currentTheme.text }}>
                <Clock className="w-3.5 h-3.5" style={{ color: currentTheme.main }} /> 抵達時間
              </label>
              <div className="flex items-center gap-2">
                <div 
                  className="flex-1 flex items-center justify-center border rounded-2xl bg-white shadow-sm transition-all focus-within:ring-2 h-14"
                  style={{ borderColor: `${currentTheme.main}20`, "--tw-ring-color": `${currentTheme.main}10` }}
                >
                  <input 
                    type="time" 
                    value={baseForm.time} 
                    onChange={(e) => setBaseForm(prev => ({ ...prev, time: e.target.value }))} 
                    className="w-full h-full text-center text-lg font-medium outline-none bg-transparent"
                    style={{ color: currentTheme.text }}
                  />
                </div>
                <button 
                  onClick={() => setBaseForm(prev => ({ ...prev, time: "" }))} 
                  className="w-14 h-14 flex items-center justify-center rounded-2xl border bg-white text-red-400 shadow-sm active:scale-90 transition-all hover:bg-red-50"
                  style={{ borderColor: '#FEE2E2' }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 類別區塊 */}
            <div className="w-full">
              <label className="flex items-center gap-1.5 text-[11px] font-bold mb-3 uppercase tracking-widest px-1 opacity-70" style={{ color: currentTheme.text }}>
                <Layers className="w-3.5 h-3.5" style={{ color: currentTheme.main }} /> 類別
              </label>
              <div className="flex gap-2">
                {Object.values(TYPE_OPTIONS).map((t) => {
                  const active = baseForm.type === t.key;
                  return (
                    <button 
                      key={t.key} 
                      type="button" 
                      onClick={() => setBaseForm(prev => ({ ...prev, type: t.key }))} 
                      style={{ 
                        backgroundColor: active ? t.pillBg : 'white', 
                        color: active ? t.pillText : currentTheme.text, 
                        borderColor: active ? t.pillText : `${currentTheme.main}20` 
                      }} 
                      className={`flex-1 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all gap-1 shadow-sm active:scale-95 ${!active && 'opacity-40'}`}
                    >
                      <t.icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
                      <span className="text-[9px] font-bold tracking-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full h-px" style={{ backgroundColor: `${currentTheme.main}10` }} />

          {renderField("地點名稱", "title", Pin)}
          {renderField("副標題", "subtitle", Bookmark)}
          {renderField("詳細地址", "address", MapPin)}
          {renderField("營業時間", "openingHours", Clock)}
          {renderField("公休日", "offDay", CalendarOff)}
          {renderField("聯絡電話", "phone", Phone)}
          {renderField("外部連結", "link", Link)}
          
          {/* 票券方案綁定 */}
          <div className="border rounded-[2rem] p-6 space-y-6 shadow-sm" style={{ borderColor: `${currentTheme.main}20`, backgroundColor: `${currentTheme.main}05` }}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: currentTheme.main }}>
              <Ticket className="w-4 h-4" /> 票券方案綁定
            </div>
            <div className="flex flex-col gap-4">
              {['A', 'B', 'C'].map((b, idx) => (
                <div key={b} className="p-4 rounded-2xl border border-dashed bg-white/80 backdrop-blur-sm" style={{ borderColor: b === 'C' ? '#D1D9E6' : `${currentTheme.main}30` }}>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border mb-3 inline-block" style={{ color: b === 'C' ? '#4A607F' : currentTheme.main, borderColor: b === 'C' ? '#D1D9E6' : `${currentTheme.main}20`, backgroundColor: 'white' }}>方案 {idx + 1}</span>
                  <div className="flex flex-wrap gap-2 min-h-[30px]">
                    {branchTickets[b].map(id => (
                      <span key={`${b}-${id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] bg-white border shadow-sm" style={{ borderColor: `${currentTheme.main}10`, color: currentTheme.text }}>
                        {ticketList.find(x => x.id === id)?.title}
                        <button onClick={() => setBranchTickets(p => ({ ...p, [b]: p[b].filter(x => x !== id) }))} className="ml-1 text-red-400 font-bold hover:text-red-600">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* 加入票券選單 */}
            <div className="pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: `${currentTheme.main}10` }}>
              {ticketList.map((t) => (
                <div key={t.id} className="relative">
                  <button 
                    type="button" 
                    onClick={() => setTicketMenu(ticketMenu === t.id ? null : t.id)} 
                    className={`px-4 py-2 rounded-xl text-[11px] border transition-all active:scale-95 shadow-sm
                      ${ticketMenu === t.id ? "text-white" : "bg-white"}
                    `}
                    style={{ 
                      backgroundColor: ticketMenu === t.id ? currentTheme.main : 'white',
                      borderColor: `${currentTheme.main}30`,
                      color: ticketMenu === t.id ? 'white' : currentTheme.main
                    }}
                  >
                    ＋ {t.title}
                  </button>
                  {ticketMenu === t.id && (
                    <div className="absolute bottom-full left-0 mb-3 z-[110] bg-white border rounded-2xl shadow-2xl p-1.5 flex flex-col min-w-[140px] animate-in fade-in slide-in-from-bottom-2" style={{ borderColor: `${currentTheme.main}20` }}>
                      {['A', 'B', 'C'].map((b, idx) => (
                        <button key={b} onClick={() => { setBranchTickets(p => ({ ...p, [b]: Array.from(new Set([...p[b], t.id])) })); setTicketMenu(null); }} className="px-4 py-2.5 text-[12px] text-left hover:bg-gray-50 rounded-xl font-medium" style={{ color: currentTheme.text }}>加入方案 {idx + 1}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 補充備註 */}
          <div className="space-y-4">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase px-1 tracking-widest opacity-70" style={{ color: currentTheme.text }}>
              <StickyNote className="w-3.5 h-3.5" style={{ color: currentTheme.main }} /> 補充備註
            </label>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold z-10" style={{ color: currentTheme.main }}>方案 1</span>
                <div className="w-full border rounded-2xl bg-white shadow-sm focus-within:ring-2 transition-all" style={{ borderColor: `${currentTheme.main}20`, "--tw-ring-color": `${currentTheme.main}10` }}>
                  <textarea value={formA.notes} onChange={(e) => setFormA(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-4 py-4 text-[14px] outline-none bg-transparent resize-none min-h-[100px]" style={{ color: currentTheme.text }} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold z-10 opacity-60" style={{ color: currentTheme.text }}>方案 2</span>
                  <div className="w-full border border-dashed rounded-2xl bg-gray-50/50 shadow-sm focus-within:ring-2 transition-all" style={{ borderColor: `${currentTheme.main}40`, "--tw-ring-color": `${currentTheme.main}10` }}>
                    <textarea value={formB.notes} onChange={(e) => setFormB(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-4 py-4 text-[14px] outline-none bg-transparent resize-none min-h-[100px]" placeholder="備案 2..." style={{ color: currentTheme.text }} />
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold z-10 opacity-60" style={{ color: "#4A607F" }}>方案 3</span>
                  <div className="w-full border border-dashed rounded-2xl bg-gray-50/50 shadow-sm focus-within:ring-2 transition-all" style={{ borderColor: "#D1D9E6", "--tw-ring-color": "#D1D9E620" }}>
                    <textarea value={formC.notes} onChange={(e) => setFormC(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-4 py-4 text-[14px] outline-none bg-transparent resize-none min-h-[100px]" placeholder="備案 3..." style={{ color: currentTheme.text }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}