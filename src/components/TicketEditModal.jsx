// src/components/TicketEditModal.jsx
import React, { useState } from "react";
import {
  X,
  Check,
  CalendarDays,
  Clock,
  MapPin,
  Link2,
  Image as ImageIcon,
  StickyNote,
  Ticket as TicketIcon,
} from "lucide-react";
import { THEMES } from "../App";

const TYPE_OPTIONS = [
  { value: "ATTRACTION", label: "景點" },
  { value: "TRANSPORT", label: "交通" },
  { value: "HOTEL", label: "住宿" },
  { value: "FOOD", label: "餐廳" },
];

export default function TicketEditModal({ ticket, onClose, onSave, themeId }) {
  const currentTheme = THEMES[themeId] || THEMES.milkTea;
  const [form, setForm] = useState({
    ...ticket,
  });

  const update = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("請選擇圖片檔案");
      return;
    }

    const reader = new FileReader();
    const img = new Image();
    reader.onload = () => { img.src = reader.result; };
    img.onload = () => {
      const MAX_SIZE = 600;
      let { width, height } = img;
      if (width > height && width > MAX_SIZE) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      update("image", compressedBase64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.title?.trim()) {
      alert("請輸入票券標題");
      return;
    }
    onSave({
      ...form,
      id: form.id || `ticket-${Date.now()}`,
      title: form.title.trim(),
      subtitle: form.subtitle?.trim() || "",
      location: form.location?.trim() || "",
      code: form.code?.trim() || "",
      link: form.link?.trim() || "",
      image: form.image || "",
      notes: form.notes?.trim() || "",
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-10 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden flex flex-col mb-10"
        style={{ borderColor: `${currentTheme.main}20` }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b bg-white/50" style={{ borderColor: `${currentTheme.main}10` }}>
          <div>
            <p 
              className="text-[10px] tracking-[0.3em] mb-0.5 uppercase font-bold opacity-60"
              style={{ color: currentTheme.main }}
            >
              Edit Ticket
            </p>
            <h2 className="text-base font-bold truncate max-w-[200px]" style={{ color: currentTheme.text }}>
              {form.title || "編輯票券"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border bg-white flex items-center justify-center active:scale-90 transition-all"
              style={{ borderColor: `${currentTheme.main}30`, color: currentTheme.main }}
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all"
              style={{ backgroundColor: currentTheme.main }}
            >
              <Check className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* 類型＋標題 */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>類型</label>
              <div 
                className="flex items-center gap-1.5 border rounded-xl bg-white px-3 py-2 transition-all focus-within:ring-2 shadow-sm"
                style={{ borderColor: `${currentTheme.main}20`, "--tw-ring-color": `${currentTheme.main}10` }}
              >
                <TicketIcon className="w-3.5 h-3.5 shrink-0" style={{ color: currentTheme.main }} />
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  className="flex-1 text-[13px] bg-transparent outline-none appearance-none font-medium"
                  style={{ color: currentTheme.text }}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-span-8">
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>標題</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full border rounded-xl bg-white px-4 py-2 text-[13px] outline-none transition-all focus:ring-2 shadow-sm font-medium"
                style={{ 
                  borderColor: `${currentTheme.main}20`, 
                  color: currentTheme.text,
                  "--tw-ring-color": `${currentTheme.main}10`
                }}
              />
            </div>
          </div>

          {/* 副標題 */}
          <div>
            <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>副標題</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="例如：現場付款(只能刷卡)"
              className="w-full border rounded-xl bg-white px-4 py-2 text-[13px] outline-none transition-all focus:ring-2 shadow-sm font-medium"
              style={{ 
                borderColor: `${currentTheme.main}20`, 
                color: currentTheme.text,
                "--tw-ring-color": `${currentTheme.main}10`
              }}
            />
          </div>

          {/* 日期時間 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>日期</label>
              <div 
                className="flex items-center gap-3 border rounded-xl bg-white px-4 py-2 transition-all focus-within:ring-2 shadow-sm"
                style={{ borderColor: `${currentTheme.main}20`, "--tw-ring-color": `${currentTheme.main}10` }}
              >
                <CalendarDays className="w-4 h-4 shrink-0" style={{ color: currentTheme.main }} />
                <input
                  type="date"
                  value={form.date || ""}
                  onChange={(e) => update("date", e.target.value)}
                  className="flex-1 text-[13px] outline-none bg-transparent min-w-0 font-medium"
                  style={{ color: currentTheme.text }}
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>時間</label>
              <div 
                className="flex items-center gap-3 border rounded-xl bg-white px-4 py-2 transition-all focus-within:ring-2 shadow-sm"
                style={{ borderColor: `${currentTheme.main}20`, "--tw-ring-color": `${currentTheme.main}10` }}
              >
                <Clock className="w-4 h-4 shrink-0" style={{ color: currentTheme.main }} />
                <input
                  type="time"
                  value={form.time || ""}
                  onChange={(e) => update("time", e.target.value)}
                  className="flex-1 text-[13px] outline-none bg-transparent min-w-0 font-medium"
                  style={{ color: currentTheme.text }}
                />
              </div>
            </div>
          </div>

          {/* 地點 */}
          <div>
            <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>地點</label>
            <div 
              className="flex items-start gap-3 border rounded-xl bg-white px-4 py-2 transition-all focus-within:ring-2 shadow-sm"
              style={{ borderColor: `${currentTheme.main}20`, "--tw-ring-color": `${currentTheme.main}10` }}
            >
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: currentTheme.main }} />
              <textarea
                rows={2}
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="flex-1 text-[13px] outline-none resize-none bg-transparent font-medium leading-relaxed"
                style={{ color: currentTheme.text }}
              />
            </div>
          </div>

          {/* 編號＋連結 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>編號</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                className="w-full border rounded-xl bg-white px-4 py-2 text-[13px] outline-none transition-all focus:ring-2 shadow-sm font-medium"
                style={{ 
                  borderColor: `${currentTheme.main}20`, 
                  color: currentTheme.text,
                  "--tw-ring-color": `${currentTheme.main}10`
                }}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>連結</label>
              <div 
                className="flex items-center gap-2 border rounded-xl bg-white px-3 py-2 transition-all focus-within:ring-2 shadow-sm"
                style={{ borderColor: `${currentTheme.main}20`, "--tw-ring-color": `${currentTheme.main}10` }}
              >
                <Link2 className="w-4 h-4 shrink-0" style={{ color: currentTheme.main }} />
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => update("link", e.target.value)}
                  className="flex-1 text-[13px] outline-none bg-transparent truncate min-w-0 font-medium"
                  style={{ color: currentTheme.text }}
                />
              </div>
            </div>
          </div>

          {/* 圖片上傳 */}
          <div>
            <label className="block text-[11px] font-bold mb-2 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>QR Code / 截圖</label>
            <div className="flex flex-col gap-3">
              <label 
                className="flex items-center justify-center gap-3 border-2 border-dashed rounded-2xl px-4 py-4 cursor-pointer transition-all hover:bg-gray-50 shadow-sm"
                style={{ borderColor: `${currentTheme.main}20`, backgroundColor: `${currentTheme.main}05` }}
              >
                <ImageIcon className="w-5 h-5" style={{ color: currentTheme.main }} />
                <span className="text-[13px] font-bold" style={{ color: currentTheme.main }}>選擇圖片</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {form.image && (
                <div 
                  className="mt-1 border rounded-2xl p-2 flex justify-center shadow-inner"
                  style={{ borderColor: `${currentTheme.main}10`, backgroundColor: `${currentTheme.main}05` }}
                >
                  <img src={form.image} alt="Ticket" className="max-h-40 object-contain rounded-lg" />
                </div>
              )}
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-[11px] font-bold mb-1.5 flex items-center gap-1.5 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>
              <StickyNote className="w-3.5 h-3.5" style={{ color: currentTheme.main }} /> 備註
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="w-full border rounded-xl bg-white px-4 py-3 text-[13px] outline-none transition-all focus:ring-2 shadow-sm font-medium resize-none leading-relaxed"
              style={{ 
                borderColor: `${currentTheme.main}20`, 
                color: currentTheme.text,
                "--tw-ring-color": `${currentTheme.main}10`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}