// src/components/EditPackingItemModal.jsx
import React, { useState } from "react";
import { X, Check, StickyNote } from "lucide-react";

export default function EditPackingItemModal({ item, onClose, onSave }) {
const [form, setForm] = useState({
id: item.id,
categoryId: item.categoryId,
title: item.title || "",
notes: item.notes || "",
});

const update = (patch) => setForm((f) => ({ ...f, ...patch }));

const handleSave = () => {
onSave({
...form,
title: form.title.trim(),
notes: form.notes.trim(),
});
};

return (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="w-full max-w-xl mx-4 bg-[#FFF9F2] rounded-3xl border border-[#E5D5C5] shadow-xl overflow-hidden">

{/* Header */}
<div className="px-6 pt-5 pb-3 flex items-start justify-between">
<div>
<p className="text-xs tracking-[0.25em] text-[#C6A087] mb-1">編輯項目</p>
<h2 className="text-xl font-bold text-[#5A4636]">
{form.title || "新的項目"}
</h2>
</div>

<div className="flex items-center gap-2">
<button
onClick={onClose}
className="w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white hover:bg-[#F5EEE6]"
>
<X className="w-4 h-4 text-[#8C6A4F]" />
</button>
<button
onClick={handleSave}
className="w-9 h-9 rounded-full bg-[#C6A087] flex items-center justify-center shadow-sm"
>
<Check className="w-4 h-4 text-white" />
</button>
</div>
</div>

{/* Body */}
<div className="px-6 pb-6 pt-1 space-y-6 max-h-[70vh] overflow-y-auto">

{/* 標題 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">標題</label>
<input
type="text"
value={form.title}
onChange={(e) => update({ title: e.target.value })}
className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-sm bg-white"
placeholder="例如：護照、耳機、充電線"
/>
</div>

{/* 備註 */}
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">備註</label>

<div className="flex gap-2 bg-white border border-[#E5D5C5] rounded-xl px-3 py-2">
<StickyNote className="w-4 h-4 text-[#C6A087] mt-[3px]" />
<textarea
rows={2}
value={form.notes}
onChange={(e) => update({ notes: e.target.value })}
className="w-full text-sm resize-none outline-none"
placeholder="例如：充電線是 USB-C"
/>
</div>
</div>

</div>
</div>
</div>
);
}