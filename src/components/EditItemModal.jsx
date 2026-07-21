// src/components/EditItemModal.jsx
import React, { useMemo, useState } from "react";
import { X, Check, UtensilsCrossed, Landmark, Train, BedDouble, Ticket, Clock, Phone, Link, Layers, MapPin, StickyNote, Pin, Bookmark, CalendarOff, Trash2, CalendarDays } from "lucide-react";
import { THEMES } from "../App";

const TYPE_OPTIONS = {
  ATTRACTION: { key: "ATTRACTION", label: "景點", icon: Landmark, pillBg: "#E7EEF9", pillText: "#4A607F" },
  RESTAURANT: { key: "RESTAURANT", label: "餐廳", icon: UtensilsCrossed, pillBg: "#FBE7DF", pillText: "#8C4A2F" },
  TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train, pillBg: "#E4F1E3", pillText: "#4E6B48" },
  HOTEL: { key: "HOTEL", label: "住宿", icon: BedDouble, pillBg: "#F3E3F0", pillText: "#7A4D6E" },
};

export default function EditItemModal({ item, trip, tickets = [], onSave, onClose, themeId }) {
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;
  const ticketList = tickets?.length ? tickets : trip?.tickets || [];

  // 獲取總天數清單，用於下拉選單
  const totalDays = trip?.days || [];
  // 找出目前這張卡片原本是第幾天 (預設為當前啟動的天數，若無則為 0)
  const currentDayIndex = trip?.activeDayIndex ?? 0;

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

  const [activeTab, setActiveTab] = useState("A"); // 當前選中的方案 Tab: "A" | "B" | "C"

  const [baseForm, setBaseForm] = useState({ 
    time: item.time || "", 
    type: item.type || "ATTRACTION",
    targetDayIndex: currentDayIndex // 用來記錄使用者選擇搬移到哪一天
  });
  
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

  const [formA, setFormA] = useState({ title: initialData.title.a, subtitle: initialData.subtitle.a, address: initialData.address.a, openingHours: initialData.openingHours.a, offDay: initialData.offDay.a, phone: initialData.phone.a, notes: initialData.notes.a, link: initialData.link.a });
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

  // 取得與更新當前選中 Tab 的表單資料
  const currentForm = activeTab === "A" ? formA : activeTab === "B" ? formB : formC;
  const setCurrentForm = (updater) => {
    if (activeTab === "A") setFormA(updater);
    else if (activeTab === "B") setFormB(updater);
    else setFormC(updater);
  };

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
    }, baseForm.targetDayIndex); 
  };

  const renderField = (label, key, Icon, isTextArea = false) => (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase px-1 tracking-widest opacity-70" style={{ color: currentTheme.text }}>
        {Icon && <Icon className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />} {label}
      </label>
      <div 
        className="w-full border rounded-2xl bg-white shadow-sm overflow-hidden transition-all focus-within:ring-2"
        style={{ borderColor: `${currentTheme.main}30`, "--tw-ring-color": `${currentTheme.main}20` }}
      >
        {isTextArea ? (
          <textarea
            value={currentForm[key] || ""}
            onChange={(e) => setCurrentForm(prev => ({ ...prev, [key]: e.target.value }))}
            className="w-full px-4 py-3.5 text-[14px] outline-none bg-transparent resize-y min-h-[180px] leading-relaxed"
            placeholder={`輸入 ${label}...`}
            style={{ color: currentTheme.text }}
          />
        ) : (
          <input 
            value={currentForm[key] || ""} 
            onChange={(e) => setCurrentForm(prev => ({ ...prev, [key]: e.target.value }))} 
            className="w-full px-4 py-3 text-[14px] outline-none bg-transparent" 
            placeholder={`輸入 ${label}...`}
            style={{ color: currentTheme.text }}
          />
        )}
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
        <div className="px-4 sm:px-8 py-6 space-y-8 overflow-y-auto scrollbar-none pb-24 flex-1">
          {/* 時間與天數選擇 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 時間區塊 */}
            <div className="w-full">
              <label className="flex items-center gap-1.5 text-[11px] font-bold mb-3 uppercase tracking-widest px-1 opacity-70" style={{ color: currentTheme.text }}>
                <Clock className="w-3.5 h-3.5" style={{ color: currentTheme.main }} /> 抵達時間
              </label>
              <div className="flex items-center gap-2 w-full">
                <div 
                  className="flex-1 flex items-center justify-center border rounded-2xl bg-white shadow-sm transition-all focus-within:ring-2 h-14"
                  style={{ borderColor: `${currentTheme.main}20`, "--tw-ring-color": `${currentTheme.main}10` }}
                >
                  <input 
                    type="time" 
                    value={baseForm.time} 
                    onChange={(e) => setBaseForm(prev => ({ ...prev, time: e.target.value }))} 
                    className="w-full h-full text-center text-base font-bold outline-none bg-transparent px-3"
                    style={{ color: currentTheme.text }}
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setBaseForm(prev => ({ ...prev, time: "" }))} 
                  className="w-14 h-14 flex items-center justify-center rounded-2xl border bg-white text-red-400 shadow-sm active:scale-90 transition-all hover:bg-red-50 shrink-0"
                  style={{ borderColor: '#FEE2E2' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 行程天數調整區塊 */}
            <div className="w-full">
              <label className="flex items-center gap-1.5 text-[11px] font-bold mb-3 uppercase tracking-widest px-1 opacity-70" style={{ color: currentTheme.text }}>
                <CalendarDays className="w-3.5 h-3.5" style={{ color: currentTheme.main }} /> 行程天數
              </label>
              <div 
                className="w-full flex items-center justify-center border rounded-2xl bg-white shadow-sm transition-all focus-within:ring-2 h-14 px-4"
                style={{ borderColor: `${currentTheme.main}20`, "--tw-ring-color": `${currentTheme.main}10` }}
              >
                <select
                  value={baseForm.targetDayIndex}
                  onChange={(e) => setBaseForm(prev => ({ ...prev, targetDayIndex: parseInt(e.target.value) }))}
                  className="w-full h-full text-left text-sm font-bold outline-none bg-transparent cursor-pointer"
                  style={{ color: currentTheme.text }}
                >
                  {totalDays.map((_, idx) => (
                    <option key={idx} value={idx}>
                      第 {idx + 1} 天 {idx === currentDayIndex ? "(今天)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 類別區塊 */}
          <div className="w-full">
            <label className="flex items-center gap-1.5 text-[11px] font-bold mb-3 uppercase tracking-widest px-1 opacity-70" style={{ color: currentTheme.text }}>
              <Layers className="w-3.5 h-3.5" style={{ color: currentTheme.main }} /> 類別
            </label>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
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
                    className={`flex-1 min-w-[70px] h-14 rounded-2xl flex flex-col items-center justify-center border transition-all gap-1 shadow-sm active:scale-95 ${!active && 'opacity-40'}`}
                  >
                    <t.icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
                    <span className="text-[9px] font-bold tracking-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full h-px" style={{ backgroundColor: `${currentTheme.main}10` }} />

          {/* 方案 Tab 切換按鈕 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-1 opacity-70" style={{ color: currentTheme.text }}>
                <Pin className="w-3.5 h-3.5" style={{ color: currentTheme.main }} /> 方案內容編輯
              </label>
              <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
                {[
                  { key: "A", label: "方案 1" },
                  { key: "B", label: "方案 2" },
                  { key: "C", label: "方案 3" },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                        isActive ? "bg-white shadow-sm scale-105" : "opacity-50 hover:opacity-100"
                      }`}
                      style={{
                        color: isActive ? currentTheme.main : currentTheme.text,
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 動態顯示當前選中 Tab 的詳細欄位 */}
            <div className="space-y-5 animate-in fade-in duration-200">
              {renderField("地點名稱", "title", Pin)}
              {renderField("副標題", "subtitle", Bookmark)}
              {renderField("詳細地址", "address", MapPin)}
              {renderField("營業時間", "openingHours", Clock)}
              {renderField("公休日", "offDay", CalendarOff)}
              {renderField("聯絡電話", "phone", Phone)}
              {renderField("外部連結", "link", Link)}
              
              {/* 票券方案綁定 */}
              <div className="border rounded-[2rem] p-5 space-y-4 shadow-sm" style={{ borderColor: `${currentTheme.main}20`, backgroundColor: `${currentTheme.main}05` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: currentTheme.main }}>
                    <Ticket className="w-4 h-4" /> 票券綁定 ({activeTab === "A" ? "方案 1" : activeTab === "B" ? "方案 2" : "方案 3"})
                  </div>
                </div>

                {/* 已選票券標籤 */}
                <div className="flex flex-wrap gap-2 min-h-[36px] items-center bg-white p-3 rounded-2xl border" style={{ borderColor: `${currentTheme.main}15` }}>
                  {branchTickets[activeTab].length > 0 ? (
                    branchTickets[activeTab].map(id => (
                      <span key={`${activeTab}-${id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] bg-white border shadow-sm font-bold" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }}>
                        {ticketList.find(x => x.id === id)?.title}
                        <button onClick={() => setBranchTickets(p => ({ ...p, [activeTab]: p[activeTab].filter(x => x !== id) }))} className="ml-1 text-red-400 font-bold hover:text-red-600">×</button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] opacity-40 italic">尚未綁定票券...</span>
                  )}
                </div>

                {/* 加入票券清單 */}
                {ticketList.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {ticketList.map((t) => {
                      const isAdded = branchTickets[activeTab].includes(t.id);
                      return (
                        <button 
                          key={t.id} 
                          type="button" 
                          onClick={() => {
                            if (isAdded) {
                              setBranchTickets(p => ({ ...p, [activeTab]: p[activeTab].filter(x => x !== t.id) }));
                            } else {
                              setBranchTickets(p => ({ ...p, [activeTab]: [...p[activeTab], t.id] }));
                            }
                          }} 
                          className="px-3 py-1.5 rounded-xl text-[11px] border transition-all active:scale-95 shadow-sm font-semibold"
                          style={{ 
                            backgroundColor: isAdded ? currentTheme.main : 'white',
                            borderColor: `${currentTheme.main}30`,
                            color: isAdded ? 'white' : currentTheme.main
                          }}
                        >
                          {isAdded ? "✓ " : "＋ "}{t.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 補充備註（已調大輸入框高度） */}
              {renderField("補充備註", "notes", StickyNote, true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}