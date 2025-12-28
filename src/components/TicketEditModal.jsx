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

// 圖片選擇：轉成 dataURL 存在 form.image
const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("請選擇圖片檔案");
    return;
  }

  const reader = new FileReader();
  const img = new Image();

  reader.onload = () => {
    img.src = reader.result;
  };

  img.onload = () => {
    const MAX_SIZE = 600; // 票券 / QR Code 完全夠用
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

    // 轉成 JPEG，體積小很多
    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

    update("image", compressedBase64);
  };

  reader.readAsDataURL(file);
};

const handleSave = () => {
if (!form.title?.trim()) {
alert("請輸入票券標題（例如：東京鐵塔展望台門票）");
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
<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
<div className="w-full max-w-lg mx-4 bg-[#FFF9F2] rounded-3xl border border-[#E5D5C5] shadow-2xl overflow-hidden">
{/* Header */}
<div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#E5D5C5]">
<div>
<p className="text-[10px] tracking-[0.3em] text-[#C6A087] mb-1 font-serif">
EDIT TICKET
</p>
<h2 className="text-base font-serif font-bold text-[#5A4636]">
{form.title || "編輯票券 / 預約"}
</h2>
</div>
<div className="flex items-center gap-2">
<button
type="button"
onClick={onClose}
className="w-8 h-8 rounded-full border border-[#E5D5C5] bg-white flex items-center justify-center"
>
<X className="w-4 h-4 text-[#8C6A4F]" />
</button>
<button
type="button"
onClick={handleSave}
className="w-9 h-9 rounded-full bg-[#C6A087] flex items-center justify-center shadow-md"
>
<Check className="w-4 h-4 text-white" />
</button>
</div>
</div>

{/* Body */}
<div className="px-5 py-4 space-y-4 text-sm">
{/* 類型＋標題 */}
<div className="grid grid-cols-3 gap-3">
<div>
<label className="block text-[11px] text-[#8C6A4F] mb-1">
類型
</label>
<div className="flex items-center gap-2 border border-[#E5D5C5] rounded-xl bg-white px-2 py-1.5">
<TicketIcon className="w-4 h-4 text-[#C6A087]" />
<select
value={form.type}
onChange={(e) => update("type", e.target.value)}
className="flex-1 text-xs text-[#5A4636] bg-transparent outline-none"
>
{TYPE_OPTIONS.map((opt) => (
<option key={opt.value} value={opt.value}>
{opt.label}
</option>
))}
</select>
</div>
</div>

<div className="col-span-2">
<label className="block text-[11px] text-[#8C6A4F] mb-1">
標題
</label>
<input
type="text"
value={form.title}
onChange={(e) => update("title", e.target.value)}
placeholder="例如：東京鐵塔展望台門票"
className="w-full border border-[#E5D5C5] rounded-xl bg-white px-3 py-2 text-sm outline-none"
/>
</div>
</div>

{/* 副標題 */}
<div>
<label className="block text-[11px] text-[#8C6A4F] mb-1">
副標題（選填）
</label>
<input
type="text"
value={form.subtitle}
onChange={(e) => update("subtitle", e.target.value)}
placeholder="例如：網路預約 QR Code"
className="w-full border border-[#E5D5C5] rounded-xl bg-white px-3 py-2 text-sm outline-none"
/>
</div>

{/* 日期時間 */}
<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-[11px] text-[#8C6A4F] mb-1">
日期
</label>
<div className="flex items-center gap-2 border border-[#E5D5C5] rounded-xl bg-white px-3 py-2">
<CalendarDays className="w-4 h-4 text-[#C6A087]" />
<input
type="date"
value={form.date || ""}
onChange={(e) => update("date", e.target.value)}
className="flex-1 text-xs outline-none bg-transparent"
/>
</div>
</div>
<div>
<label className="block text-[11px] text-[#8C6A4F] mb-1">
時間
</label>
<div className="flex items-center gap-2 border border-[#E5D5C5] rounded-xl bg-white px-3 py-2">
<Clock className="w-4 h-4 text-[#C6A087]" />
<input
type="time"
value={form.time || ""}
onChange={(e) => update("time", e.target.value)}
className="flex-1 text-xs outline-none bg-transparent"
/>
</div>
</div>
</div>

{/* 地點 */}
<div>
<label className="block text-[11px] text-[#8C6A4F] mb-1">
地點（選填）
</label>
<div className="flex items-start gap-2 border border-[#E5D5C5] rounded-xl bg-white px-3 py-2">
<MapPin className="w-4 h-4 text-[#C6A087] mt-[2px]" />
<textarea
value={form.location}
onChange={(e) => update("location", e.target.value)}
placeholder="例如：東京都港区芝公園4-2-8"
className="flex-1 text-sm outline-none resize-none bg-transparent min-h-[40px]"
/>
</div>
</div>

{/* 編號＋連結 */}
<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-[11px] text-[#8C6A4F] mb-1">
編號（選填）
</label>
<input
type="text"
value={form.code}
onChange={(e) => update("code", e.target.value)}
placeholder="訂位編號 / Reservation Code"
className="w-full border border-[#E5D5C5] rounded-xl bg-white px-3 py-2 text-sm outline-none"
/>
</div>
<div>
<label className="block text-[11px] text-[#8C6A4F] mb-1">
連結（選填）
</label>
<div className="flex items-center gap-2 border border-[#E5D5C5] rounded-xl bg-white px-3 py-2">
<Link2 className="w-4 h-4 text-[#C6A087]" />
<input
type="url"
value={form.link}
onChange={(e) => update("link", e.target.value)}
placeholder="官方網站 / 訂位頁面"
className="flex-1 text-xs outline-none bg-transparent"
/>
</div>
</div>
</div>

{/* 圖片上傳 */}
<div>
<label className="block text-[11px] text-[#8C6A4F] mb-1">
圖片（選填，QR Code / 票券截圖）
</label>
<div className="flex flex-col gap-2">
<label className="flex items-center gap-2 border border-dashed border-[#E5D5C5] rounded-xl bg-white px-3 py-2 cursor-pointer hover:bg-[#FFF3E5]">
<ImageIcon className="w-4 h-4 text-[#C6A087]" />
<span className="text-xs text-[#8C6A4F]">
點擊選擇圖片檔案（JPG / PNG）
</span>
<input
type="file"
accept="image/*"
className="hidden"
onChange={handleImageChange}
/>
</label>
{form.image && (
<div className="mt-1 border border-[#E5D5C5] rounded-xl bg-white p-2 flex justify-center">
<img
src={form.image}
alt="Ticket"
className="max-h-40 object-contain rounded-lg"
/>
</div>
)}
</div>
</div>

{/* 備註 */}
<div>
<label className="block text-[11px] text-[#8C6A4F] mb-1 flex items-center gap-1">
<StickyNote className="w-4 h-4 text-[#C6A087]" />
備註（選填）
</label>
<textarea
value={form.notes}
onChange={(e) => update("notes", e.target.value)}
placeholder="例如：需要出示護照、需提前 10 分鐘報到等。"
className="w-full border border-[#E5D5C5] rounded-xl bg-white px-3 py-2 text-sm outline-none resize-none min-h-[72px]"
/>
</div>
</div>
</div>
</div>
);
}