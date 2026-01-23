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

const TYPE_OPTIONS = [
  { value: "ATTRACTION", label: "景點" },
  { value: "TRANSPORT", label: "交通" },
  { value: "HOTEL", label: "住宿" },
  { value: "FOOD", label: "餐廳" },
];

export default function TicketEditModal({ ticket, onClose, onSave }) {
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
      <div className="w-full max-w-lg bg-[#FFF9F2] rounded-[2.5rem] border border-[#E5D5C5] shadow-2xl overflow-hidden flex flex-col mb-10">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-[#E5D5C5]/50 bg-white/50">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#C6A087] mb-0.5 uppercase font-bold">
              Edit Ticket
            </p>
            <h2 className="text-base font-bold text-[#5A4636] truncate max-w-[200px]">
              {form.title || "編輯票券"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[#E5D5C5] bg-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <X className="w-4 h-4 text-[#8C6A4F]" />
            </button>
            <button
              onClick={handleSave}
              className="w-8 h-8 rounded-full bg-[#C6A087] flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <Check className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body - 增加了 max-height 確保可滑動不被切掉 */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-none">
          {/* 類型＋標題 */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-wider">類型</label>
              <div className="flex items-center gap-1.5 border border-[#E5D5C5] rounded-xl bg-white px-2 py-2">
                <TicketIcon className="w-3.5 h-3.5 text-[#C6A087] shrink-0" />
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  className="flex-1 text-[13px] text-[#5A4636] bg-transparent outline-none appearance-none"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-span-8">
              <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-wider">標題</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full border border-[#E5D5C5] rounded-xl bg-white px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[#C6A087]"
              />
            </div>
          </div>

          {/* 副標題 */}
          <div>
            <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-wider">副標題</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="例如：現場付款(只能刷卡)"
              className="w-full border border-[#E5D5C5] rounded-xl bg-white px-3 py-2 text-[13px] outline-none"
            />
          </div>

          {/* 日期時間 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-wider">日期</label>
              <div className="flex items-center gap-2 border border-[#E5D5C5] rounded-xl bg-white px-3 py-2 focus-within:ring-1 focus-within:ring-[#C6A087]">
                <CalendarDays className="w-4 h-4 text-[#C6A087] shrink-0" />
                <input
                  type="date"
                  value={form.date || ""}
                  onChange={(e) => update("date", e.target.value)}
                  className="flex-1 text-[13px] outline-none bg-transparent min-w-0"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-wider">時間</label>
              <div className="flex items-center gap-2 border border-[#E5D5C5] rounded-xl bg-white px-3 py-2 focus-within:ring-1 focus-within:ring-[#C6A087]">
                <Clock className="w-4 h-4 text-[#C6A087] shrink-0" />
                <input
                  type="time"
                  value={form.time || ""}
                  onChange={(e) => update("time", e.target.value)}
                  className="flex-1 text-[13px] outline-none bg-transparent min-w-0"
                />
              </div>
            </div>
          </div>

          {/* 地點 */}
          <div>
            <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-wider">地點</label>
            <div className="flex items-start gap-2 border border-[#E5D5C5] rounded-xl bg-white px-3 py-2">
              <MapPin className="w-4 h-4 text-[#C6A087] mt-0.5 shrink-0" />
              <textarea
                rows={2}
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="flex-1 text-[13px] outline-none resize-none bg-transparent"
              />
            </div>
          </div>

          {/* 編號＋連結 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-wider">編號</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                className="w-full border border-[#E5D5C5] rounded-xl bg-white px-2 py-2 text-[13px] outline-none truncate"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-wider">連結</label>
              <div className="flex items-center gap-1.5 border border-[#E5D5C5] rounded-xl bg-white px-2 py-2">
                <Link2 className="w-3.5 h-3.5 text-[#C6A087] shrink-0" />
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => update("link", e.target.value)}
                  className="flex-1 text-[13px] outline-none bg-transparent truncate min-w-0"
                />
              </div>
            </div>
          </div>

          {/* 圖片上傳 */}
          <div>
            <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-wider">QR Code / 截圖</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#E5D5C5] rounded-2xl bg-white/50 px-3 py-3 cursor-pointer hover:bg-white transition-colors">
                <ImageIcon className="w-4 h-4 text-[#C6A087]" />
                <span className="text-[12px] text-[#8C6A4F] font-medium">選擇圖片</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {form.image && (
                <div className="mt-1 border border-[#E5D5C5] rounded-2xl bg-white p-2 flex justify-center shadow-inner">
                  <img src={form.image} alt="Ticket" className="max-h-36 object-contain rounded-lg" />
                </div>
              )}
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-[11px] font-bold text-[#8C6A4F] mb-1 flex items-center gap-1 uppercase tracking-wider">
              <StickyNote className="w-3.5 h-3.5 text-[#C6A087]" /> 備註
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="w-full border border-[#E5D5C5] rounded-xl bg-white px-3 py-2 text-[13px] outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}