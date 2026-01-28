// src/components/EditHeroModal.jsx
import React, { useState } from "react";
import { X, Check, MapPin, Image as ImageIcon, Type, Loader2 } from "lucide-react";

export default function EditHeroModal({ dayData, onSave, onClose }) {
  const [form, setForm] = useState({
    heroTitle: dayData.heroTitle || "",
    heroLocation: dayData.heroLocation || "",
    heroImage: dayData.heroImage || "",
  });

  const [loading, setLoading] = useState(false);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = async () => {
    const locationName = form.heroLocation.trim();
    
    // 初始化座標為原本的值
    let finalCoords = {
      latitude: dayData.latitude,
      longitude: dayData.longitude
    };

    // 如果地點有變且不為空，則去查詢新座標
    if (locationName && locationName !== dayData.heroLocation) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
          {
            headers: {
              'User-Agent': 'MyTravelApp/1.0' // 加上這個能避免被 API 拒絕
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

    // 統一執行儲存
    onSave({
      ...dayData,
      ...finalCoords, // 這裡會使用原本的或新查詢到的座標
      heroTitle: form.heroTitle.trim(),
      heroLocation: locationName,
      heroImage: form.heroImage.trim(),
      weatherLocation: locationName || dayData.weatherLocation
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-3">
      {/* 寬度優化：使用 w-full 並微調最大寬度，確保內容飽滿 */}
      <div className="w-full max-w-lg bg-[#FFF9F2] rounded-[2.5rem] border border-[#E5D5C5] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[10px] tracking-[0.25em] text-[#C6A087] mb-1 uppercase font-bold">編輯模式</p>
            <h2 className="text-xl font-bold text-[#5A4636] truncate">
              {form.heroTitle || "未命名標題"}
            </h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onClose} className="w-9 h-9 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white hover:bg-[#F7F1EB] transition-all active:scale-90 shadow-sm">
              <X className="w-4 h-4 text-[#8C6A4F]" />
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-10 h-10 rounded-full bg-[#C6A087] flex items-center justify-center shadow-md disabled:opacity-50 hover:bg-[#B59178] transition-all active:scale-90"
            >
              {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Check className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-8 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-[#A8937C] mb-1.5 uppercase tracking-widest px-1">標題</label>
            <div className="flex items-center gap-3 border border-[#E5D5C5] rounded-2xl px-4 py-3 bg-white focus-within:ring-1 focus-within:ring-[#C6A087] shadow-sm">
              <Type className="w-4 h-4 text-[#C6A087] shrink-0" />
              <input type="text" value={form.heroTitle} onChange={(e) => update({ heroTitle: e.target.value })} placeholder="例如：成田國際機場" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#A8937C] mb-1.5 uppercase tracking-widest px-1">地點 (地名自動抓取天氣)</label>
            <div className="flex items-center gap-3 border border-[#E5D5C5] rounded-2xl px-4 py-3 bg-white focus-within:ring-1 focus-within:ring-[#C6A087] shadow-sm">
              <MapPin className="w-4 h-4 text-[#C6A087] shrink-0" />
              <input type="text" value={form.heroLocation} onChange={(e) => update({ heroLocation: e.target.value })} placeholder="例如：輕井澤" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#A8937C] mb-1.5 uppercase tracking-widest px-1">封面圖片網址</label>
            {/* 關鍵：加入 min-w-0 解決網址溢出 */}
            <div className="flex items-center gap-3 border border-[#E5D5C5] rounded-2xl px-4 py-3 bg-white focus-within:ring-1 focus-within:ring-[#C6A087] shadow-sm min-w-0">
              <ImageIcon className="w-4 h-4 text-[#C6A087] shrink-0" />
              <input 
                type="url" 
                value={form.heroImage} 
                onChange={(e) => update({ heroImage: e.target.value })} 
                placeholder="貼上圖片網址" 
                className="flex-1 text-sm outline-none bg-transparent min-w-0 overflow-hidden" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}