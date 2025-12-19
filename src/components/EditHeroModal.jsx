// src/components/EditHeroModal.jsx
import React, { useState } from "react";
import { X, Check, MapPin, Image as ImageIcon, Type } from "lucide-react";

export default function EditHeroModal({ dayData, onSave, onClose }) {
  const [form, setForm] = useState({
    heroTitle: dayData.heroTitle || "",
    heroLocation: dayData.heroLocation || "",
    heroImage: dayData.heroImage || "",
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = () => {
    onSave({
      ...dayData,
      heroTitle: form.heroTitle.trim(),
      heroLocation: form.heroLocation.trim(),
      heroImage: form.heroImage.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-xl mx-4 bg-[#FFF9F2] rounded-3xl border border-[#E5D5C5] shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-start justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-[#C6A087] mb-1">編輯封面</p>
            <h2 className="text-xl font-bold text-[#5A4636]">
              {form.heroTitle || "未命名標題"}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white"
            >
              <X className="w-4 h-4 text-[#8C6A4F]" />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-9 h-9 rounded-full bg-[#C6A087] flex items-center justify-center shadow-sm"
            >
              <Check className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-1 space-y-5">

          {/* 標題 */}
          <div>
            <label className="block text-xs text-[#8C6A4F] mb-1">標題</label>
            <div className="flex items-center gap-3 border border-[#E5D5C5] rounded-xl px-3 py-2 bg-white">
              <Type className="w-4 h-4 text-[#C6A087]" />
              <input
                type="text"
                value={form.heroTitle}
                onChange={(e) => update({ heroTitle: e.target.value })}
                placeholder="例如：OMO3 東京赤坂"
                className="flex-1 text-sm outline-none"
              />
            </div>
          </div>

          {/* 地點 */}
          <div>
            <label className="block text-xs text-[#8C6A4F] mb-1">地點</label>
            <div className="flex items-center gap-3 border border-[#E5D5C5] rounded-xl px-3 py-2 bg-white">
              <MapPin className="w-4 h-4 text-[#C6A087]" />
              <input
                type="text"
                value={form.heroLocation}
                onChange={(e) => update({ heroLocation: e.target.value })}
                placeholder="例如：東京都港區"
                className="flex-1 text-sm outline-none"
              />
            </div>
          </div>

          {/* 圖片網址 */}
          <div>
            <label className="block text-xs text-[#8C6A4F] mb-1">圖片網址</label>
            <div className="flex items-center gap-3 border border-[#E5D5C5] rounded-xl px-3 py-2 bg-white">
              <ImageIcon className="w-4 h-4 text-[#C6A087]" />
              <input
                type="url"
                value={form.heroImage}
                onChange={(e) => update({ heroImage: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 text-sm outline-none"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}