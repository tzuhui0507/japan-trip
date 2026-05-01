// src/components/EditHeroModal.jsx
import React, { useState } from "react";
import { X, Check, MapPin, Image as ImageIcon, Type, Loader2, StickyNote } from "lucide-react";
import { THEMES } from "../App";

export default function EditHeroModal({ dayData, onSave, onClose, themeId }) {
  const currentTheme = THEMES[themeId] || THEMES.milkTea;
  
  const [form, setForm] = useState({
    heroTitle: dayData.heroTitle || "",
    heroLocation: dayData.heroLocation || "",
    heroImage: dayData.heroImage || "",
    dayNotes: dayData.dayNotes || "",
  });

  const [loading, setLoading] = useState(false);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = async () => {
    const locationName = form.heroLocation.trim();
    
    let finalCoords = {
      latitude: dayData.latitude,
      longitude: dayData.longitude
    };

    if (locationName && locationName !== dayData.heroLocation) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
          {
            headers: {
              'User-Agent': 'MyTravelApp/1.0'
            }
          }
        );
        const data = await response.json();

        if (data && data.length > 0) {
          finalCoords = {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon)
          };
          console.log("查詢成功，獲取座標:", finalCoords);
        }
      } catch (error) {
        console.error("座標查詢失敗:", error);
      } finally {
        setLoading(false);
      }
    }

    onSave({
      ...dayData,
      ...finalCoords,
      heroTitle: form.heroTitle.trim(),
      heroLocation: locationName,
      heroImage: form.heroImage.trim(),
      dayNotes: form.dayNotes.trim(),
      weatherLocation: locationName || dayData.weatherLocation
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-3">
      <div 
        className="w-full max-w-lg bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden flex flex-col"
        style={{ borderColor: `${currentTheme.main}20` }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <p 
              className="text-[10px] tracking-[0.25em] mb-1 uppercase font-bold"
              style={{ color: currentTheme.main }}
            >
              編輯模式
            </p>
            <h2 className="text-xl font-bold truncate" style={{ color: currentTheme.text }}>
              {form.heroTitle || "未命名標題"}
            </h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-full border flex items-center justify-center bg-white hover:bg-gray-50 transition-all active:scale-90 shadow-sm"
              style={{ borderColor: `${currentTheme.main}30` }}
            >
              <X className="w-4 h-4" style={{ color: currentTheme.main }} />
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md disabled:opacity-50 transition-all active:scale-90"
              style={{ backgroundColor: currentTheme.main }}
            >
              {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Check className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-8 space-y-5">
          {/* 標題 */}
          <div>
            <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest px-1 opacity-50" style={{ color: currentTheme.text }}>標題</label>
            <div 
              className="flex items-center gap-3 border rounded-2xl px-4 py-3 bg-white transition-all focus-within:ring-2 shadow-sm"
              style={{ 
                borderColor: `${currentTheme.main}20`,
                "--tw-ring-color": `${currentTheme.main}40`
              }}
            >
              <Type className="w-4 h-4 shrink-0" style={{ color: currentTheme.main }} />
              <input 
                type="text" 
                value={form.heroTitle} 
                onChange={(e) => update({ heroTitle: e.target.value })} 
                placeholder="例如：成田國際機場" 
                className="flex-1 text-sm outline-none bg-transparent"
                style={{ color: currentTheme.text }}
              />
            </div>
          </div>

          {/* 地點 */}
          <div>
            <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest px-1 opacity-50" style={{ color: currentTheme.text }}>地點 (地名自動抓取天氣)</label>
            <div 
              className="flex items-center gap-3 border rounded-2xl px-4 py-3 bg-white transition-all focus-within:ring-2 shadow-sm"
              style={{ 
                borderColor: `${currentTheme.main}20`,
                "--tw-ring-color": `${currentTheme.main}40`
              }}
            >
              <MapPin className="w-4 h-4 shrink-0" style={{ color: currentTheme.main }} />
              <input 
                type="text" 
                value={form.heroLocation} 
                onChange={(e) => update({ heroLocation: e.target.value })} 
                placeholder="例如：輕井澤" 
                className="flex-1 text-sm outline-none bg-transparent"
                style={{ color: currentTheme.text }}
              />
            </div>
          </div>

          {/* 封面圖片 */}
          <div>
            <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest px-1 opacity-50" style={{ color: currentTheme.text }}>封面圖片網址</label>
            <div 
              className="flex items-center gap-3 border rounded-2xl px-4 py-3 bg-white transition-all focus-within:ring-2 shadow-sm min-w-0"
              style={{ 
                borderColor: `${currentTheme.main}20`,
                "--tw-ring-color": `${currentTheme.main}40`
              }}
            >
              <ImageIcon className="w-4 h-4 shrink-0" style={{ color: currentTheme.main }} />
              <input 
                type="url" 
                value={form.heroImage} 
                onChange={(e) => update({ heroImage: e.target.value })} 
                placeholder="貼上圖片網址" 
                className="flex-1 text-sm outline-none bg-transparent min-w-0 overflow-hidden" 
                style={{ color: currentTheme.text }}
              />
            </div>
          </div>

          {/* 今日提醒 */}
          <div>
            <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest px-1 opacity-50" style={{ color: currentTheme.text }}>今日行程提醒 (有文字才顯示)</label>
            <div 
              className="flex items-start gap-3 border rounded-2xl px-4 py-3 bg-white transition-all focus-within:ring-2 shadow-sm"
              style={{ 
                borderColor: `${currentTheme.main}20`,
                "--tw-ring-color": `${currentTheme.main}40`
              }}
            >
              <StickyNote className="w-4 h-4 shrink-0 mt-0.5" style={{ color: currentTheme.main }} />
              <textarea 
                rows={3}
                value={form.dayNotes} 
                onChange={(e) => update({ dayNotes: e.target.value })} 
                placeholder="輸入今天的特別叮嚀內容..." 
                className="flex-1 text-sm outline-none bg-transparent resize-none leading-relaxed"
                style={{ color: currentTheme.text }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}