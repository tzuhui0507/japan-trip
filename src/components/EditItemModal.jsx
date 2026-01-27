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
  Layers,
  MapPin,    // 🆕 補上遺漏的引入
  StickyNote // 🆕 補上遺漏的引入
} from "lucide-react";

const TYPE_OPTIONS = {
  RESTAURANT: { key: "RESTAURANT", label: "餐廳", icon: UtensilsCrossed },
  ATTRACTION: { key: "ATTRACTION", label: "景點", icon: Landmark },
  TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train },
  HOTEL: { key: "HOTEL", label: "住宿", icon: BedDouble },
};

export default function EditItemModal({ item, trip, tickets = [], onSave, onClose }) {
  const ticketList = tickets?.length ? tickets : trip?.tickets || [];

  // 解析雙方案資料
  const parseBranch = (val) => {
    if (typeof val !== "string") return { a: val || "", b: "" };
    const parts = val.split("---");
    return { a: parts[0] || "", b: parts[1] || "" };
  };

  // 1. 初始化基礎表單 (不變的部分)
  const [baseForm, setBaseForm] = useState({
    time: item.time || "09:00",
    type: item.type || "ATTRACTION",
  });

  // 2. 初始化方案 A 與方案 B 的獨立格子
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
    link: initialData.link.a,
  });

  const [formB, setFormB] = useState({
    title: initialData.title.b,
    subtitle: initialData.subtitle.b,
    address: initialData.address.b,
    openingHours: initialData.openingHours.b,
    phone: initialData.phone.b,
    notes: initialData.notes.b,
    link: initialData.link.b,
  });

  // 3. 初始化票券
  const initialBranchTickets = useMemo(() => {
    let ids = item.ticketIds || [];
    if (typeof ids === "string" && ids.includes("---")) {
      const parts = ids.split("---");
      return {
        A: parts[0]?.split(",").filter(Boolean) || [],
        B: parts[1]?.split(",").filter(Boolean) || [],
      };
    }
    const normalized = Array.isArray(ids) ? ids : (typeof ids === "string" ? ids.split(",") : []);
    return { A: [...normalized], B: [] }; // 預設方案 1
  }, [item.ticketIds]);

  const [branchTickets, setBranchTickets] = useState(initialBranchTickets);
  const [ticketMenu, setTicketMenu] = useState(null);

  const handleSave = () => {
    // 檢查方案 B 是否有任何內容填寫 (決定是否產生支線)
    const hasAnyB = Object.values(formB).some(val => val.trim() !== "") || branchTickets.B.length > 0;

    const combine = (key) => {
      return hasAnyB ? `${formA[key]}---${formB[key]}` : formA[key];
    };

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
      ticketIds: hasAnyB ? `${branchTickets.A.join(",")}---${branchTickets.B.join(",")}` : branchTickets.A.join(","),
    });
  };

  const renderField = (label, key, Icon) => (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#8C6A4F] uppercase tracking-widest px-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* 方案 1 格子 */}
        <div className="relative group">
          <span className="absolute -top-2 left-2 px-1 bg-[#FFF9F2] text-[8px] text-[#C6A087] font-bold z-10 opacity-60 group-focus-within:opacity-100">方案 1</span>
          <div className="w-full border border-[#E5D5C5] rounded-xl bg-white focus-within:ring-1 focus-within:ring-[#C6A087]">
            {key === 'notes' ? (
              <textarea value={formA[key]} onChange={(e) => setFormA(prev => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-2 text-[12px] bg-transparent outline-none border-none resize-none" rows={2} />
            ) : (
              <input value={formA[key]} onChange={(e) => setFormA(prev => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-1.5 text-[12px] bg-transparent outline-none border-none" />
            )}
          </div>
        </div>
        {/* 方案 2 格子 */}
        <div className="relative group">
          <span className="absolute -top-2 left-2 px-1 bg-[#FFF9F2] text-[8px] text-[#8C6A4F] font-bold z-10 opacity-60 group-focus-within:opacity-100">方案 2</span>
          <div className="w-full border border-[#E5D5C5] border-dashed rounded-xl bg-[#F7F1EB]/50 focus-within:bg-white focus-within:border-solid focus-within:ring-1 focus-within:ring-[#8C6A4F]">
            {key === 'notes' ? (
              <textarea value={formB[key]} onChange={(e) => setFormB(prev => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-2 text-[12px] bg-transparent outline-none border-none resize-none" rows={2} placeholder="輸入即開啟支線" />
            ) : (
              <input value={formB[key]} onChange={(e) => setFormB(prev => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-1.5 text-[12px] bg-transparent outline-none border-none" placeholder="輸入即開啟支線" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-10">
      <div className="w-full max-w-2xl bg-[#FFF9F2] rounded-[2.5rem] border border-[#E5D5C5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5D5C5]/50 bg-white/50">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.2em] text-[#C6A087] uppercase font-bold mb-0.5">行程細節編輯</p>
            <h2 className="text-base font-bold text-[#5A4636] truncate">{formA.title || "未命名項目"}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-9 h-9 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white active:scale-90 transition-all"><X className="w-5 h-5 text-[#8C6A4F]" /></button>
            <button onClick={handleSave} className="w-9 h-9 rounded-full bg-[#C6A087] flex items-center justify-center shadow-md active:scale-90 transition-all"><Check className="w-5 h-5 text-white" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto scrollbar-none pb-12">
          
          {/* 第一列：時間與類型 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest px-1">抵達時間</label>
              <input type="time" value={baseForm.time} onChange={(e) => setBaseForm(prev => ({ ...prev, time: e.target.value }))} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none bg-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest px-1">項目類別</label>
              <div className="flex gap-1.5">
                {Object.values(TYPE_OPTIONS).map((t) => (
                  <button key={t.key} type="button" onClick={() => setBaseForm(prev => ({ ...prev, type: t.key }))} className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${baseForm.type === t.key ? "bg-[#6A8A55] border-[#6A8A55] text-white shadow-inner" : "bg-white border-[#E5D5C5] text-[#5A4636]"}`}>
                    <t.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-[#E5D5C5]/30" />

          {/* 雙方案欄位 */}
          {renderField("地點名稱", "title", Landmark)}
          {renderField("細節說明", "subtitle", Layers)}
          {renderField("詳細地址", "address", MapPin)}
          {renderField("營業時間", "openingHours", Clock)}
          {renderField("聯絡電話", "phone", Phone)}
          {renderField("外部連結", "link", Link)}

          {/* 支線票券 */}
          <div className="bg-[#FDF9F5] border border-[#E5D5C5]/50 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8C6A4F] uppercase tracking-widest">
                <Ticket className="w-3.5 h-3.5" /> 票券綁定 (雙方案)
              </div>
              <p className="text-[9px] text-[#C6A087] italic">點擊下方按鈕新增</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 border-r border-[#E5D5C5]/30 pr-2">
                <span className="text-[9px] font-bold text-[#C6A087] bg-white px-1.5 rounded-full border border-[#E5D5C5]">方案 1</span>
                <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                  {branchTickets.A.map(id => (
                    <span key={`A-${id}`} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-white border border-[#E5D5C5] text-[#5A4636]">
                      {ticketList.find(x => x.id === id)?.title}
                      <button onClick={() => setBranchTickets(p => ({ ...p, A: p.A.filter(x => x !== id) }))} className="ml-1 text-red-400">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5 pl-2">
                <span className="text-[9px] font-bold text-[#8C6A4F] bg-white px-1.5 rounded-full border border-[#E5D5C5]">方案 2</span>
                <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                  {branchTickets.B.map(id => (
                    <span key={`B-${id}`} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-white border border-[#E5D5C5] text-[#5A4636]">
                      {ticketList.find(x => x.id === id)?.title}
                      <button onClick={() => setBranchTickets(p => ({ ...p, B: p.B.filter(x => x !== id) }))} className="ml-1 text-red-400">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5D5C5]/30 flex flex-wrap gap-1.5">
              {ticketList.map((t) => (
                <div key={t.id} className="relative">
                  <button type="button" onClick={() => setTicketMenu(ticketMenu === t.id ? null : t.id)} className={`px-2 py-1 rounded-lg text-[10px] border transition-all ${ticketMenu === t.id ? "bg-[#C6A087] text-white border-[#C6A087]" : "border-dashed border-[#C6A087] text-[#8C6A4F] bg-white hover:bg-[#F7F1EB]"}`}>
                    ＋ {t.title}
                  </button>
                  {ticketMenu === t.id && (
                    <div className="absolute bottom-full left-0 mb-1 z-[110] bg-white border border-[#E5D5C5] rounded-xl shadow-xl p-1 flex flex-col min-w-[90px]">
                      <button onClick={() => { setBranchTickets(p => ({ ...p, A: Array.from(new Set([...p.A, t.id])) })); setTicketMenu(null); }} className="px-2 py-1.5 text-[10px] text-left hover:bg-[#F7F1EB] rounded-lg">加入方案 1</button>
                      <button onClick={() => { setBranchTickets(p => ({ ...p, B: Array.from(new Set([...p.B, t.id])) })); setTicketMenu(null); }} className="px-2 py-1.5 text-[10px] text-left hover:bg-[#F7F1EB] rounded-lg">加入方案 2</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {renderField("補充備註", "notes", StickyNote)}

        </div>
      </div>
    </div>
  );
}