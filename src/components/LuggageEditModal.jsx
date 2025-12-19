// src/components/LuggageEditModal.jsx
import React, { useState } from "react";
import { X, StickyNote } from "lucide-react";

export default function LuggageEditModal({ bag, onClose, onSave }) {
const [form, setForm] = useState({
...bag,
});

const update = (key, val) => {
setForm((prev) => ({ ...prev, [key]: val }));
};

const handleSubmit = () => {
onSave(form);
};

return (
<div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm">
<div className="bg-white w-full rounded-t-3xl p-6 pb-10 shadow-xl">
{/* Header */}
<div className="flex items-center justify-between mb-4">
<h2 className="text-lg font-bold text-[#5A4636]">編輯行李資訊</h2>
<button
onClick={onClose}
className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F1E9E2]"
>
<X className="w-5 h-5 text-[#8C6A4F]" />
</button>
</div>

{/* Input group */}
<div className="space-y-5">

{/* 行李類型 */}
<div>
<label className="text-sm text-[#8C6A4F]">類型</label>
<select
value={form.type}
onChange={(e) => update("type", e.target.value)}
className="w-full mt-1 px-4 py-3 rounded-xl border border-[#E5D5C5] bg-[#FFFAF5] text-[#5A4636]"
>
<option value="托運">托運</option>
<option value="隨身">隨身</option>
</select>
</div>

{/* 標題 */}
<div>
<label className="text-sm text-[#8C6A4F]">標題</label>
<input
type="text"
value={form.title}
onChange={(e) => update("title", e.target.value)}
placeholder="例如：23kg * 1"
className="w-full mt-1 px-4 py-3 rounded-xl border border-[#E5D5C5] bg-[#FFFAF5] text-[#5A4636]"
/>
</div>

{/* 副標題 */}
<div>
<label className="text-sm text-[#8C6A4F]">副標題</label>
<input
type="text"
value={form.subtitle}
onChange={(e) => update("subtitle", e.target.value)}
placeholder="例如：請再次確認航空公司限制"
className="w-full mt-1 px-4 py-3 rounded-xl border border-[#E5D5C5] bg-[#FFFAF5] text-[#5A4636]"
/>
</div>

{/* 備註 */}
<div>
<label className="text-sm text-[#8C6A4F] flex items-center gap-2">
<StickyNote className="w-4 h-4 text-[#C58B4B]" />
備註
</label>
<textarea
value={form.notes}
onChange={(e) => update("notes", e.target.value)}
placeholder="例如：行動電源一定要放在隨身包！"
className="w-full mt-1 px-4 py-3 h-24 rounded-xl border border-[#E5D5C5] bg-[#FFFAF5] text-[#5A4636] resize-none"
/>
</div>
</div>

{/* Buttons */}
<div className="mt-8 flex gap-3">
<button
onClick={onClose}
className="flex-1 py-3 rounded-xl bg-[#EFE7DF] text-[#8C6A4F] font-semibold"
>
取消
</button>

<button
onClick={handleSubmit}
className="flex-1 py-3 rounded-xl bg-[#C58B4B] text-white font-semibold shadow-md"
>
儲存
</button>
</div>
</div>
</div>
);
}