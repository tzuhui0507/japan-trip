// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, Upload, Download, Plus, Check, X, Calendar } from "lucide-react";

const STORAGE_KEY = "trip_local_v1";

export default function Header({ trip, setTrip, currentTab }) {
  if (!trip) return null;

  // ===== 基礎變數 =====
  const startDateObj = new Date(trip.startDate);
  const isViewer = trip.shareMode === "viewer";
  const isPlan = currentTab === "PLAN";

  // ===== 1. 標題編輯邏輯 =====
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(trip.title);
  const [showRangeModal, setShowRangeModal] = useState(false);

  useEffect(() => {
    setTempTitle(trip.title);
  }, [trip.title]);

  const handleSaveTitle = () => {
    if (!tempTitle.trim()) {
      alert("標題不能為空");
      return;
    }
    setTrip(prev => ({ ...prev, title: tempTitle }));
    setIsEditingTitle(false);
  };

  // ===== 2. 核心功能：設定旅遊區間（連動更新天數） =====
  const handleUpdateRange = (newStart, newEnd) => {
    const start = new Date(newStart);
    const end = new Date(newEnd);
    
    if (end < start) {
      alert("結束日期不能早於開始日期");
      return;
    }

    // 計算總天數 (包含起始與結束當天)
    const diffTime = Math.abs(end - start);
    const targetDayCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    setTrip(prev => {
      const next = structuredClone(prev);
      const currentDayCount = next.days.length;

      // 如果天數變少，詢問使用者確認
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

        // 如果舊資料已經有這一天，保留舊內容並更新日期資訊
        if (next.days[i]) {
          newDays.push({
            ...next.days[i],
            date: dateStr,
            weekday: weekdays[d.getDay()],
            dayNumber: d.getDate()
          });
        } else {
          // 否則新增空白天數
          newDays.push({
            id: `day-${Date.now()}-${i}`,
            date: dateStr,
            weekday: weekdays[d.getDay()],
            dayNumber: d.getDate(),
            items: [],
            heroTitle: `第 ${i + 1} 天`,
            heroImage: "",
            heroLocation: "",
            weatherLocation: "未設定地點"
          });
        }
      }

      next.days = newDays;
      return next;
    });
    setShowRangeModal(false);
  };

  // ===== 3. 原本的 匯入/匯出/分享 邏輯 =====
  const [showImport, setShowImport] = useState(false);

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "viewer");
    try {
      await navigator.clipboard.writeText(url.toString());
      alert("🔗 Viewer 連結已複製");
    } catch { alert("❌ 複製失敗"); }
  };

  const handleExport = () => {
    try {
      const data = JSON.stringify(trip, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${trip.title || "japan-trip"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("❌ 匯出失敗"); }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/json") return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const nextTrip = { ...parsed, shareMode: trip.shareMode };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrip));
        setTrip(nextTrip);
        setShowImport(false);
        alert("📥 行程匯入成功");
      } catch { alert("❌ 檔案格式錯誤"); }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 bg-[#F8F5F1] ${isPlan ? "" : "border-b border-[#E8E1DA]"}`}>
        <div className="relative py-6 text-center">

          {/* 右上角操作區 */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {!isViewer && (
              <button onClick={handleShare} className="w-8 h-8 rounded-full border border-[#D8CFC4] bg-white flex items-center justify-center hover:bg-[#F7F1EB]">
                <Link className="w-3.5 h-3.5 text-[#8C6A4F]" />
              </button>
            )}
            {!isViewer && (
              <button onClick={handleExport} className="w-8 h-8 rounded-full border border-[#D8CFC4] bg-white flex items-center justify-center hover:bg-[#F7F1EB]">
                <Upload className="w-3.5 h-3.5 text-[#8C6A4F]" />
              </button>
            )}
            <button onClick={() => setShowImport(true)} className="w-8 h-8 rounded-full border border-dashed border-[#D8CFC4] bg-white flex items-center justify-center hover:bg-[#F7F1EB]">
              <Download className="w-3.5 h-3.5 text-[#8C6A4F]" />
            </button>
          </div>

          <div className="text-[12px] tracking-[3px] text-[#A8937C] mb-1 opacity-80 uppercase">
            JAPAN TRIP
          </div>

          <div className="flex justify-center items-center gap-2 px-10">
            {isEditingTitle && !isViewer ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  className="text-2xl font-bold text-[#5A3F2E] bg-transparent outline-none border-b border-[#C6A087] min-w-[120px] text-center"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                />
                <button onClick={handleSaveTitle} className="p-1"><Check className="w-4 h-4 text-green-600" /></button>
                <button onClick={() => setIsEditingTitle(false)} className="p-1"><X className="w-4 h-4 text-red-400" /></button>
              </div>
            ) : (
              <h1 
                className={`text-2xl font-bold text-[#5A3F2E] ${!isViewer ? 'cursor-pointer' : ''}`}
                onClick={() => !isViewer && setIsEditingTitle(true)}
              >
                {trip.title || "日本自由行"}
              </h1>
            )}

            {/* 點擊 Pills 開啟區間設定 */}
            <button 
              onClick={() => !isViewer && setShowRangeModal(true)}
              className="px-3 py-[2px] text-[12px] border border-[#D8CFC4] rounded-full bg-white text-[#5A3F2E] tracking-wider hover:bg-[#F7F1EB] transition-colors shrink-0"
              title={!isViewer ? "點擊更換日期與天數" : ""}
            >
              {startDateObj.getFullYear()}
            </button>
          </div>
        </div>
      </header>

      {/* 🆕 區間設定 Modal：解決天數調整需求 */}
      {showRangeModal && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-sm mx-4 bg-[#FFF9F2] rounded-2xl border border-[#E5D5C5] p-6 shadow-xl text-center">
            <h2 className="text-sm font-bold text-[#5A4636] mb-4 flex items-center justify-center gap-2 uppercase tracking-widest">
              <Calendar className="w-4 h-4" /> 行程旅遊天數設定
            </h2>
            
            <div className="space-y-4 text-left">
              <div>
                <label className="text-[10px] text-[#A8937C] block mb-1 font-bold">開始日期</label>
                <input 
                  type="date" 
                  id="range-start"
                  className="w-full border border-[#D8CFC4] rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-1 focus:ring-[#C6A087]" 
                  defaultValue={trip.startDate ? trip.startDate.split('T')[0] : ""} 
                />
              </div>
              <div>
                <label className="text-[10px] text-[#A8937C] block mb-1 font-bold">結束日期</label>
                <input 
                  type="date" 
                  id="range-end" 
                  className="w-full border border-[#D8CFC4] rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-1 focus:ring-[#C6A087]" 
                  defaultValue={trip.endDate ? trip.endDate.split('T')[0] : (trip.days.length > 0 ? trip.days[trip.days.length-1].date : "")} 
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button 
                onClick={() => setShowRangeModal(false)}
                className="px-6 py-2 text-xs rounded-full border border-[#D8CFC4] text-[#8C6A4F] hover:bg-white"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  const s = document.getElementById('range-start').value;
                  const e = document.getElementById('range-end').value;
                  if (s && e) handleUpdateRange(s, e);
                }}
                className="px-6 py-2 text-xs rounded-full bg-[#C6A087] text-white hover:opacity-90 transition-opacity shadow-sm"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 匯入 Modal */}
      {showImport && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-lg mx-4 bg-[#FFF9F2] rounded-2xl border border-[#E5D5C5] p-5 text-center">
            <h2 className="text-sm font-bold text-[#5A4636] mb-4">匯入行程（JSON）</h2>
            <input type="file" accept="application/json" onChange={handleImportFile} className="w-full border border-[#E5D5C5] rounded-xl p-3 text-sm bg-white mb-5" />
            <button onClick={() => setShowImport(false)} className="px-6 py-2 text-xs rounded-full border border-[#E5D5C5] text-[#5A4636]">取消</button>
          </div>
        </div>
      )}
    </>
  );
}