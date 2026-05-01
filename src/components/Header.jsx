// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { 
  Link, Upload, Download, Check, X, Calendar, 
  Palette, Coins, MoreHorizontal, Share2, FileDown, FileUp 
} from "lucide-react";
import { THEMES } from "../App";

const STORAGE_KEY = "trip_local_v1";
const VIEWER_LUGGAGE_KEY = "viewer_luggage_v1";

const CURRENCIES = [
  { code: "JPY", symbol: "¥", name: "日圓" },
  { code: "TWD", symbol: "$", name: "台幣" },
  { code: "KRW", symbol: "₩", name: "韓元" },
  { code: "USD", symbol: "$", name: "美金" },
  { code: "EUR", symbol: "€", name: "歐元" },
  { code: "THB", symbol: "฿", name: "泰銖" },
  { code: "HKD", symbol: "$", name: "港幣" },
  { code: "SGD", symbol: "$", name: "星幣" },
  { code: "VND", symbol: "₫", name: "越南盾" },
  { code: "GBP", symbol: "£", name: "英鎊" },
  { code: "CNY", symbol: "¥", name: "人民幣" },
];

export default function Header({ trip, setTrip, currentTab, themeId, setThemeId }) {
  if (!trip) return null;

  const startDateObj = new Date(trip.startDate);
  const isViewer = trip.shareMode === "viewer";
  const isPlan = currentTab === "PLAN";
  
  // 選單狀態管理
  const [showMenu, setShowMenu] = useState(false);
  const [showThemeSub, setShowThemeSub] = useState(false);
  const [showCurrencySub, setShowCurrencySub] = useState(false);

  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(trip.title);
  const [isEditingSlogan, setIsEditingSlogan] = useState(false);
  const [tempSlogan, setTempSlogan] = useState(trip.slogan || "JAPAN TRIP");
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    setTempTitle(trip.title);
    setTempSlogan(trip.slogan || "JAPAN TRIP");
  }, [trip.title, trip.slogan]);

  const handleSaveTitle = () => {
    if (!tempTitle.trim()) { alert("標題不能為空"); return; }
    setTrip(prev => ({ ...prev, title: tempTitle }));
    setIsEditingTitle(false);
  };

  const handleSaveSlogan = () => {
    setTrip(prev => ({ ...prev, slogan: tempSlogan.trim() || "JAPAN TRIP" }));
    setIsEditingSlogan(false);
  };

  const handleUpdateCurrency = (code) => {
    setTrip(prev => ({ ...prev, currency: code }));
    setShowMenu(false);
    setShowCurrencySub(false);
  };

  const handleUpdateRange = (newStart, newEnd) => {
    const start = new Date(newStart);
    const end = new Date(newEnd);
    if (end < start) { alert("結束日期不能早於開始日期"); return; }
    const diffTime = Math.abs(end - start);
    const targetDayCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    setTrip(prev => {
      const next = structuredClone(prev);
      const currentDayCount = next.days.length;
      if (targetDayCount < currentDayCount) {
        const confirmDelete = window.confirm(`縮短日期區間將會刪除最後 ${currentDayCount - targetDayCount} 天的行程，確定嗎？`);
        if (!confirmDelete) return prev;
      }
      next.startDate = newStart;
      next.endDate = newEnd;
      const newDays = [];
      const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      for (let i = 0; i < targetDayCount; i++) {
        const d = new Date(next.startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        if (next.days[i]) {
          newDays.push({ ...next.days[i], date: dateStr, weekday: weekdays[d.getDay()], dayNumber: d.getDate() });
        } else {
          newDays.push({ id: `day-${Date.now()}-${i}`, date: dateStr, weekday: weekdays[d.getDay()], dayNumber: d.getDate(), items: [], heroTitle: `第 ${i + 1} 天`, heroImage: "", heroLocation: "", weatherLocation: "未設定地點" });
        }
      }
      next.days = newDays;
      return next;
    });
    setShowRangeModal(false);
  };

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "viewer");
    try {
      await navigator.clipboard.writeText(url.toString());
      alert("🔗 Viewer 連結已複製");
      setShowMenu(false);
    } catch { alert("❌ 複製失敗"); }
  };

  const handleExport = () => {
    try {
      const data = JSON.stringify(trip, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${trip.title || "trip"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setShowMenu(false);
    } catch { alert("❌ 匯出失敗"); }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/json") return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result);
        setTrip(prevTrip => {
          const mergedTrip = {
            ...prevTrip,
            title: importedData.title || prevTrip.title,
            slogan: importedData.slogan || prevTrip.slogan,
            currency: importedData.currency || prevTrip.currency,
            startDate: importedData.startDate || prevTrip.startDate,
            endDate: importedData.endDate || prevTrip.endDate,
            days: importedData.days || prevTrip.days,
            tickets: importedData.tickets || prevTrip.tickets,
            info: importedData.info || prevTrip.info,
            luggage: { ...prevTrip.luggage, bags: importedData.luggage?.bags || prevTrip.luggage?.bags },
            shareMode: prevTrip.shareMode
          };
          if (isViewer) {
            localStorage.setItem(VIEWER_LUGGAGE_KEY, JSON.stringify(mergedTrip.luggage));
            window.location.reload(); 
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedTrip));
          return mergedTrip;
        });
        setShowImport(false);
        setShowMenu(false);
      } catch { alert("❌ 檔案格式錯誤"); }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${isPlan ? "" : "border-b"}`}
        style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.border }}
      >
        <div className="relative py-6 text-center">
          
          {/* --- 右上角純 ICON 選單系統 --- */}
          <div className="absolute top-4 right-5">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 flex items-center justify-center active:scale-90 transition-all z-[110] relative"
            >
              <MoreHorizontal className="w-5 h-5" style={{ color: currentTheme.main }} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => { setShowMenu(false); setShowThemeSub(false); setShowCurrencySub(false); }} />
                <div className="absolute top-10 right-0 bg-white border rounded-[1.8rem] shadow-xl p-2.5 flex flex-col gap-1 z-[110] min-w-[180px] animate-in fade-in zoom-in-95 duration-200" style={{ borderColor: currentTheme.border }}>
                  
                  {!isViewer && (
                    <>
                      <button onClick={handleShare} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-all whitespace-nowrap">
                        <Share2 className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />
                        <span className="text-[11px] font-black" style={{ color: currentTheme.text }}>複製觀看連結</span>
                      </button>
                      <button onClick={handleExport} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-all whitespace-nowrap">
                        <FileUp className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />
                        <span className="text-[11px] font-black" style={{ color: currentTheme.text }}>匯出行程檔案</span>
                      </button>
                    </>
                  )}

                  <button onClick={() => setShowImport(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-all whitespace-nowrap">
                    <FileDown className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />
                    <span className="text-[11px] font-black" style={{ color: currentTheme.text }}>匯入行程檔案</span>
                  </button>

                  <div className="h-px bg-black/5 mx-2 my-1.5" />

                  {/* 子選單：主題 */}
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowThemeSub(!showThemeSub); setShowCurrencySub(false); }}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-all whitespace-nowrap"
                    >
                      <div className="flex items-center gap-3">
                        <Palette className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />
                        <span className="text-[11px] font-black" style={{ color: currentTheme.text }}>更換主題配色</span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full shadow-inner shrink-0" style={{ backgroundColor: currentTheme.main }} />
                    </button>
                    
                    {showThemeSub && (
                      <div className="absolute top-0 right-full mr-2 bg-white border rounded-[1.5rem] shadow-xl p-2 flex flex-col gap-1 min-w-[140px] animate-in slide-in-from-right-2 duration-200" style={{ borderColor: currentTheme.border }}>
                        {Object.values(THEMES).map((t) => (
                          <button key={t.id} onClick={() => { setThemeId(t.id); setShowMenu(false); setShowThemeSub(false); }} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${themeId === t.id ? "bg-black/5" : "hover:bg-black/5"}`}>
                            <div className="w-3 h-3 rounded-full shadow-inner shrink-0" style={{ backgroundColor: t.main }} />
                            <span className="text-[10px] font-black" style={{ color: t.text }}>{t.name}</span>
                            {themeId === t.id && <Check className="w-3 h-3 ml-auto text-green-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 子選單：貨幣 */}
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowCurrencySub(!showCurrencySub); setShowThemeSub(false); }}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-all whitespace-nowrap"
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />
                        <span className="text-[11px] font-black" style={{ color: currentTheme.text }}>更換國家幣別</span>
                      </div>
                      <span className="text-[9px] font-black opacity-40 shrink-0 tracking-tighter">{trip.currency}</span>
                    </button>

                    {showCurrencySub && (
                      <div className="absolute top-0 right-full mr-2 bg-white border rounded-[1.5rem] shadow-xl p-2 flex flex-col gap-1 min-w-[140px] animate-in slide-in-from-right-2 duration-200" style={{ borderColor: currentTheme.border }}>
                        {CURRENCIES.map((c) => (
                          <button key={c.code} onClick={() => handleUpdateCurrency(c.code)} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${trip.currency === c.code ? "bg-black/5" : "hover:bg-black/5"}`}>
                            <span className="text-[10px] font-black w-4 text-center shrink-0" style={{ color: currentTheme.main }}>{c.symbol}</span>
                            <span className="text-[10px] font-bold" style={{ color: currentTheme.text }}>{c.name}</span>
                            {trip.currency === c.code && <Check className="w-3 h-3 ml-auto text-green-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Slogan */}
          <div className="flex justify-center mb-1">
            {isEditingSlogan && !isViewer ? (
              <input 
                autoFocus 
                className="text-[12px] tracking-[3px] bg-transparent outline-none border-b uppercase font-bold text-center" 
                style={{ color: currentTheme.accent, borderBottomColor: currentTheme.accent }}
                value={tempSlogan} 
                onChange={(e) => setTempSlogan(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSlogan()} 
                onBlur={handleSaveSlogan}
              />
            ) : (
              <div 
                className={`text-[12px] tracking-[3px] opacity-80 uppercase font-bold ${!isViewer ? 'cursor-pointer hover:opacity-100 transition-opacity' : ''}`} 
                style={{ color: currentTheme.accent }}
                onClick={() => !isViewer && setIsEditingSlogan(true)}
              >
                {trip.slogan || "JAPAN TRIP"}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="flex justify-center items-center gap-2 px-10">
            {isEditingTitle && !isViewer ? (
              <div className="flex items-center gap-1">
                <input autoFocus className="text-2xl font-bold bg-transparent outline-none border-b min-w-[120px] text-center" style={{ color: currentTheme.text, borderBottomColor: currentTheme.main }} value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()} />
                <button onClick={handleSaveTitle} className="p-1"><Check className="w-4 h-4 text-green-600" /></button>
                <button onClick={() => setIsEditingTitle(false)} className="p-1"><X className="w-4 h-4 text-red-400" /></button>
              </div>
            ) : (
              <h1 className={`text-2xl font-bold ${!isViewer ? 'cursor-pointer' : ''}`} style={{ color: currentTheme.text }} onClick={() => !isViewer && setIsEditingTitle(true)}>
                {trip.title || "日本自由行"}
              </h1>
            )}

            <button 
              onClick={() => !isViewer && setShowRangeModal(true)} 
              className="px-3 py-[2px] text-[12px] border rounded-full bg-white font-bold tracking-wider hover:opacity-80 active:scale-95 transition-all shadow-sm"
              style={{ color: currentTheme.text, borderColor: currentTheme.border }}
            >
              {startDateObj.getFullYear()}
            </button>
          </div>
        </div>
      </header>

      {/* Modals (Range & Import) */}
      {showRangeModal && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-[320px] mx-4 rounded-3xl border p-6 shadow-2xl text-center animate-in zoom-in-95" style={{ backgroundColor: "white", borderColor: currentTheme.border }}>
            <h2 className="text-sm font-bold mb-4 flex items-center justify-center gap-2 uppercase tracking-widest" style={{ color: currentTheme.text }}>
              <Calendar className="w-4 h-4" /> 行程天數設定
            </h2>
            <div className="space-y-4 text-left">
              <div>
                <label className="text-[10px] block mb-1 font-black opacity-60" style={{ color: currentTheme.main }}>開始日期</label>
                <input type="date" id="range-start" className="w-full border rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-1" style={{ borderColor: currentTheme.border, color: currentTheme.text }} defaultValue={trip.startDate?.split('T')[0]} />
              </div>
              <div>
                <label className="text-[10px] block mb-1 font-black opacity-60" style={{ color: currentTheme.main }}>結束日期</label>
                <input type="date" id="range-end" className="w-full border rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-1" style={{ borderColor: currentTheme.border, color: currentTheme.text }} defaultValue={trip.endDate?.split('T')[0]} />
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setShowRangeModal(false)} className="px-6 py-2 text-xs rounded-full border font-bold" style={{ borderColor: currentTheme.border, color: currentTheme.main }}>取消</button>
              <button onClick={() => { const s = document.getElementById('range-start').value; const e = document.getElementById('range-end').value; if (s && e) handleUpdateRange(s, e); }} className="px-6 py-2 text-xs rounded-full text-white font-bold shadow-md" style={{ backgroundColor: currentTheme.main }}>確定</button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-lg mx-4 rounded-3xl border p-6 text-center" style={{ backgroundColor: "white", borderColor: currentTheme.border }}>
            <h2 className="text-sm font-bold mb-2" style={{ color: currentTheme.text }}>匯入行程與資訊資料</h2>
            <p className="text-[11px] mb-4 opacity-60" style={{ color: currentTheme.text }}>匯入將會覆蓋目前的行程、票券與貨幣設定。</p>
            <input type="file" accept="application/json" onChange={handleImportFile} className="w-full border rounded-xl p-3 text-sm bg-white mb-5" style={{ borderColor: currentTheme.border }} />
            <button onClick={() => setShowImport(false)} className="px-6 py-2 text-xs rounded-full border font-bold" style={{ borderColor: currentTheme.border, color: currentTheme.text }}>取消</button>
          </div>
        </div>
      )}
    </>
  );
}