// src/components/EditItemModal.jsx
import React, { useState } from "react";
import {
X,
Check,
UtensilsCrossed,
Landmark,
Train,
BedDouble,
Ticket,
} from "lucide-react";

const TYPE_OPTIONS = {
RESTAURANT: { key: "RESTAURANT", label: "餐廳", icon: UtensilsCrossed },
ATTRACTION: { key: "ATTRACTION", label: "景點", icon: Landmark },
TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train },
HOTEL: { key: "HOTEL", label: "住宿", icon: BedDouble },
};

export default function EditItemModal({
item,
trip,
tickets = [],
onSave,
onClose,
}) {
const [form, setForm] = useState({
time: item.time || "09:00",
type: item.type || "ATTRACTION",
title: item.title || "",
subtitle: item.subtitle || "",
address: item.address || "",
openingHours: item.openingHours || "",
phone: item.phone || "",
notes: item.notes || "",
tickets: Array.isArray(item.tickets) ? item.tickets : [],
});

const update = (patch) => setForm((f) => ({ ...f, ...patch }));

const handleSave = () => {
onSave({
...item,
...form,
});
};

return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
<div className="w-full max-w-2xl mx-4 bg-[#FFF9F2] rounded-3xl border border-[#E5D5C5] shadow-xl overflow-hidden">
{/* Header */}
<div className="px-6 pt-5 pb-3 flex items-start justify-between">
<div>
<p className="text-xs tracking-[0.25em] text-[#C6A087] mb-1">
編輯行程
</p>
<h2 className="text-xl font-bold text-[#5A4636]">
{form.title || "新的行程"}
</h2>
</div>

<div className="flex items-center gap-2">
<button
onClick={onClose}
className="w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white"
>
<X className="w-4 h-4 text-[#8C6A4F]" />
</button>
<button
onClick={handleSave}
className="w-9 h-9 rounded-full bg-[#C6A087] flex items-center justify-center"
>
<Check className="w-4 h-4 text-white" />
</button>
</div>
</div>

<div className="px-6 pb-6 pt-1 space-y-5 max-h-[75vh] overflow-y-auto">
{/* 時間 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">時間</label>
<input
type="time"
value={form.time}
onChange={(e) => update({ time: e.target.value })}
className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-sm bg-white"
/>
</div>

{/* 類型 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">類型</label>
<div className="flex flex-wrap gap-2">
{Object.values(TYPE_OPTIONS).map((t) => {
const Icon = t.icon;
const active = form.type === t.key;
return (
<button
key={t.key}
type="button"
onClick={() => update({ type: t.key })}
className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1 border ${
active
? "bg-[#6A8A55] border-[#6A8A55] text-white"
: "bg-white border-[#E5D5C5] text-[#5A4636]"
}`}
>
<Icon className="w-3 h-3" />
{t.label}
</button>
);
})}
</div>
</div>

{/* 標題 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">標題</label>
<input
value={form.title}
onChange={(e) => update({ title: e.target.value })}
className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-sm bg-white"
/>
</div>

{/* 副標題 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">副標題</label>
<input
type="text"
value={form.subtitle}
onChange={(e) => update({ subtitle: e.target.value })}
className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-sm bg-white"
/>
</div>

{/* ==================== 票券綁定 ==================== */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-2">
已綁定票券
</label>

{/* 已選票券 */}
<div className="flex flex-wrap gap-2 mb-2">
{(!form.tickets || form.tickets.length === 0) && (
<span className="text-xs text-[#8C6A4F]/60">
尚未綁定票券
</span>
)}

{form.tickets.map((t) => (
<span
key={t.id}
className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[#F7F1EB] border border-[#E5D5C5]"
>
<Ticket className="w-3 h-3" />
{t.title}
<button
type="button"
onClick={() =>
setForm((f) => ({
...f,
tickets: f.tickets.filter((x) => x.id !== t.id),
}))
}
className="ml-1 text-[#C65353]"
>
×
</button>
</span>
))}
</div>

{/* 可選票券 */}
{trip?.tickets?.length > 0 && (
<div className="flex flex-wrap gap-2">
{trip.tickets.map((t) => {
const selected = form.tickets.some((x) => x.id === t.id);
if (selected) return null;

return (
<button
key={t.id}
type="button"
onClick={() =>
setForm((f) => ({
...f,
tickets: [...f.tickets, t],
}))
}
className="px-3 py-1 rounded-full text-xs border border-dashed border-[#C6A087] text-[#8C6A4F]"
>
＋ {t.title || "未命名票券"}
</button>
);
})}
</div>
)}
</div>

{/* 地址 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">地址</label>
<input
type="text"
value={form.address}
onChange={(e) => update({ address: e.target.value })}
className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-sm bg-white"
/>
</div>

{/* 營業時間 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">營業時間</label>
<input
type="text"
value={form.openingHours}
onChange={(e) => update({ openingHours: e.target.value })}
className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-sm bg-white"
/>
</div>

{/* 電話 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">電話</label>
<input
type="text"
value={form.phone}
onChange={(e) => update({ phone: e.target.value })}
className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-sm bg-white"
/>
</div>

{/* 備註 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">備註</label>
<textarea
rows={3}
value={form.notes}
onChange={(e) => update({ notes: e.target.value })}
className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-sm bg-white resize-none"
/>
</div>
</div>
</div>
</div>
);
}