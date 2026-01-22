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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-xl mx-4 bg-[#FFF9F2] rounded-3xl border border-[#E5D5C5] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-start justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-[#C6A087] mb-1 uppercase">編輯模式</p>
            <h2 className="text-xl font-bold text-[#5A4636]">
              {form.heroTitle || "未命名標題"}
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white hover:bg-[#F7F1EB] transition-colors">
              <X className="w-4 h-4 text-[#8C6A4F]" />
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-9 h-9 rounded-full bg-[#C6A087] flex items-center justify-center shadow-sm disabled:opacity-50 hover:bg-[#B59178] transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Check className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-1 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-[#A8937C] mb-1 uppercase tracking-wider">標題</label>
            <div className="flex items-center gap-3 border border-[#E5D5C5] rounded-xl px-3 py-2.5 bg-white focus-within:ring-1 focus-within:ring-[#C6A087]">
              <Type className="w-4 h-4 text-[#C6A087]" />
              <input type="text" value={form.heroTitle} onChange={(e) => update({ heroTitle: e.target.value })} placeholder="例如：成田國際機場" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#A8937C] mb-1 uppercase tracking-wider">地點 (輸入地名自動抓取天氣)</label>
            <div className="flex items-center gap-3 border border-[#E5D5C5] rounded-xl px-3 py-2.5 bg-white focus-within:ring-1 focus-within:ring-[#C6A087]">
              <MapPin className="w-4 h-4 text-[#C6A087]" />
              <input type="text" value={form.heroLocation} onChange={(e) => update({ heroLocation: e.target.value })} placeholder="例如：輕井澤" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#A8937C] mb-1 uppercase tracking-wider">封面圖片網址</label>
            <div className="flex items-center gap-3 border border-[#E5D5C5] rounded-xl px-3 py-2.5 bg-white focus-within:ring-1 focus-within:ring-[#C6A087]">
              <ImageIcon className="w-4 h-4 text-[#C6A087]" />
              <input type="url" value={form.heroImage} onChange={(e) => update({ heroImage: e.target.value })} placeholder="貼上圖片網址" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}