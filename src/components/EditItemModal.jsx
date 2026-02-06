// src/components/EditItemModal.jsx
import React, { useMemo, useState } from "react";
import { X, Check, UtensilsCrossed, Landmark, Train, BedDouble, Ticket, Clock, Phone, Link, Layers, MapPin, StickyNote, Pin, Bookmark, CalendarOff, Trash2 } from "lucide-react";

const TYPE_OPTIONS = {
  ATTRACTION: { key: "ATTRACTION", label: "景點", icon: Landmark, pillBg: "#E7EEF9", pillText: "#4A607F" },
  RESTAURANT: { key: "RESTAURANT", label: "餐廳", icon: UtensilsCrossed, pillBg: "#FBE7DF", pillText: "#8C4A2F" },
  TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train, pillBg: "#E4F1E3", pillText: "#4E6B48" },
  HOTEL: { key: "HOTEL", label: "住宿", icon: BedDouble, pillBg: "#F3E3F0", pillText: "#7A4D6E" },
};

export default function EditItemModal({ item, trip, tickets = [], onSave, onClose }) {
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
    // 檢查是否有填寫任何 B 或 C 方案的內容
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
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6A4F] uppercase px-1 tracking-widest">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </label>
      <div className="flex flex-col gap-3">
        {/* 方案 1 */}
        <div className="relative">
          <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#C6A087] font-bold z-10">方案 1</span>
          <div className="w-full border border-[#E5D5C5] rounded-xl bg-white shadow-sm overflow-hidden">
            <input value={formA[key]} onChange={(e) => setFormA(prev => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-2.5 text-[14px] outline-none" placeholder={`輸入方案 1 ${label}...`} />
          </div>
        </div>
        {/* 方案 2 與 3 並列 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#8C6A4F] font-bold z-10">方案 2</span>
            <div className="w-full border border-[#E5D5C5] border-dashed rounded-xl bg-[#F7F1EB]/30 overflow-hidden">
              <input value={formB[key]} onChange={(e) => setFormB(prev => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-2.5 text-[14px] outline-none bg-transparent" placeholder="輸入方案 2..." />
            </div>
          </div>
          <div className="relative">
            <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#4A607F] font-bold z-10">方案 3</span>
            <div className="w-full border border-[#D1D9E6] border-dashed rounded-xl bg-[#F0F2F9]/30 overflow-hidden">
              <input value={formC[key]} onChange={(e) => setFormC(prev => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-2.5 text-[14px] outline-none bg-transparent" placeholder="輸入方案 3..." />
            </div>
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
            <p className="text-[10px] tracking-[0.2em] text-[#C6A087] uppercase font-bold mb-0.5">行程編輯 (三方案版)</p>
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
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center justify-center border border-[#E5D5C5] rounded-xl bg-white shadow-sm focus-within:ring-1 focus-within:ring-[#C6A087] h-14">
                  <input type="time" value={baseForm.time} onChange={(e) => setBaseForm(prev => ({ ...prev, time: e.target.value }))} className="w-full h-full text-center text-[16px] outline-none bg-transparent" />
                </div>
                <button onClick={() => setBaseForm(prev => ({ ...prev, time: "" }))} className="w-14 h-14 flex items-center justify-center rounded-xl border border-[#E5D5C5] bg-white text-[#E35B5B] shadow-sm active:scale-90 transition-all"><Trash2 className="w-5 h-5" /></button>
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
                    <button key={t.key} type="button" onClick={() => setBaseForm(prev => ({ ...prev, type: t.key }))} style={{ backgroundColor: active ? t.pillBg : 'white', color: active ? t.pillText : '#5A4636', borderColor: active ? t.pillText : '#E5D5C5' }} className="flex-1 min-w-[70px] sm:min-w-[80px] h-14 rounded-2xl flex flex-col items-center justify-center border transition-all gap-1 shadow-sm active:scale-95">
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
          {renderField("公休日", "offDay", CalendarOff)}
          {renderField("聯絡電話", "phone", Phone)}
          {renderField("外部連結", "link", Link)}
          
          {/* 票券方案綁定 (升級為三方案) */}
          <div className="bg-[#FDF9F5] border border-[#E5D5C5]/50 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6A4F] uppercase tracking-widest"><Ticket className="w-4 h-4" /> 票券方案綁定</div>
            <div className="flex flex-col gap-4">
              {/* 方案 A, B, C 的票券列表 */}
              {['A', 'B', 'C'].map((b) => (
                <div key={b} className={`p-2 rounded-xl border border-dashed ${b === 'A' ? 'bg-white border-[#E5D5C5]' : b === 'B' ? 'bg-[#F7F1EB]/50 border-[#E5D5C5]' : 'bg-[#F0F2F9]/50 border-[#D1D9E6]'}`}>
                  <span className="text-[9px] font-bold text-[#8C6A4F] px-2 py-0.5 rounded-full bg-white border border-[#E5D5C5] mb-2 inline-block">方案 {b === 'A' ? '1' : b === 'B' ? '2' : '3'}</span>
                  <div className="flex flex-wrap gap-2 min-h-[24px]">
                    {branchTickets[b].map(id => (
                      <span key={`${b}-${id}`} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-white border border-[#E5D5C5] text-[#5A4636]">
                        {ticketList.find(x => x.id === id)?.title}
                        <button onClick={() => setBranchTickets(p => ({ ...p, [b]: p[b].filter(x => x !== id) }))} className="ml-1 text-red-400 font-bold hover:text-red-600 transition-colors">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* 加入按鈕選單 */}
            <div className="pt-3 border-t border-[#E5D5C5]/30 flex flex-wrap gap-2">
              {ticketList.map((t) => (
                <div key={t.id} className="relative">
                  <button type="button" onClick={() => setTicketMenu(ticketMenu === t.id ? null : t.id)} className={`px-3 py-1.5 rounded-xl text-[11px] border transition-all ${ticketMenu === t.id ? "bg-[#C6A087] text-white border-[#C6A087]" : "border-dashed border-[#C6A087] text-[#8C6A4F] bg-white hover:bg-[#F7F1EB]"}`}>＋ {t.title}</button>
                  {ticketMenu === t.id && (
                    <div className="absolute bottom-full left-0 mb-2 z-[110] bg-white border border-[#E5D5C5] rounded-xl shadow-2xl p-1 flex flex-col min-w-[120px]">
                      {['A', 'B', 'C'].map((b, idx) => (
                        <button key={b} onClick={() => { setBranchTickets(p => ({ ...p, [b]: Array.from(new Set([...p[b], t.id])) })); setTicketMenu(null); }} className={`px-3 py-2 text-[12px] text-left hover:bg-[#F7F1EB] rounded-lg ${idx < 2 ? 'border-b border-[#F0E3D5]/30' : ''}`}>加入方案 {idx + 1}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 補充備註 (升級為三方案) */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6A4F] uppercase px-1 tracking-widest"><StickyNote className="w-3.5 h-3.5" /> 補充備註</label>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#C6A087] font-bold z-10">方案 1</span>
                <div className="w-full border border-[#E5D5C5] rounded-xl bg-white shadow-sm"><textarea value={formA.notes} onChange={(e) => setFormA(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-3 py-3 text-[14px] outline-none bg-transparent resize-none min-h-[80px]" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#8C6A4F] font-bold z-10">方案 2</span>
                  <div className="w-full border border-[#E5D5C5] border-dashed rounded-xl bg-[#F7F1EB]/30 shadow-sm"><textarea value={formB.notes} onChange={(e) => setFormB(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-3 py-3 text-[14px] outline-none bg-transparent resize-none min-h-[80px]" placeholder="輸入備案 2..." /></div>
                </div>
                <div className="relative">
                  <span className="absolute -top-2 left-2 px-1.5 bg-[#FFF9F2] text-[9px] text-[#4A607F] font-bold z-10">方案 3</span>
                  <div className="w-full border border-[#D1D9E6] border-dashed rounded-xl bg-[#F0F2F9]/30 shadow-sm"><textarea value={formC.notes} onChange={(e) => setFormC(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-3 py-3 text-[14px] outline-none bg-transparent resize-none min-h-[80px]" placeholder="輸入備案 3..." /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}