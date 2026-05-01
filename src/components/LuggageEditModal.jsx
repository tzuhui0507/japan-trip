// src/components/LuggageEditModal.jsx
import React, { useState } from "react";
import { X, StickyNote, ChevronDown } from "lucide-react";
import { THEMES } from "../App";

export default function LuggageEditModal({ bag, onClose, onSave, themeId }) {
  const currentTheme = THEMES[themeId] || THEMES.milkTea;
  
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
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white w-full rounded-t-[2.5rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-0.5">
            <p className="text-[10px] tracking-[0.2em] uppercase font-bold opacity-50" style={{ color: currentTheme.text }}>行李清單</p>
            <h2 className="text-xl font-bold" style={{ color: currentTheme.text }}>編輯行李資訊</h2>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full border transition-all active:scale-90 shadow-sm"
            style={{ borderColor: `${currentTheme.main}20`, backgroundColor: `${currentTheme.main}08` }}
          >
            <X className="w-5 h-5" style={{ color: currentTheme.main }} />
          </button>
        </div>

        {/* Input group */}
        <div className="space-y-6">

          {/* 行李類型 - 美化後的選單 */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest px-1 opacity-60 mb-2 block" style={{ color: currentTheme.text }}>類型</label>
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full appearance-none px-5 py-4 rounded-2xl border bg-white text-base font-medium outline-none transition-all focus:ring-2"
                style={{ 
                  borderColor: `${currentTheme.main}20`, 
                  color: currentTheme.text,
                  "--tw-ring-color": `${currentTheme.main}30`
                }}
              >
                <option value="托運">托運行李</option>
                <option value="隨身">隨身行李</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 標題 */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest px-1 opacity-60 mb-2 block" style={{ color: currentTheme.text }}>標題</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="例如：23kg * 1"
              className="w-full px-5 py-4 rounded-2xl border outline-none transition-all focus:ring-2 font-medium"
              style={{ 
                borderColor: `${currentTheme.main}20`, 
                backgroundColor: `${currentTheme.main}05`,
                color: currentTheme.text,
                "--tw-ring-color": `${currentTheme.main}30`
              }}
            />
          </div>

          {/* 副標題 */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest px-1 opacity-60 mb-2 block" style={{ color: currentTheme.text }}>副標題</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="例如：請再次確認航空公司限制"
              className="w-full px-5 py-4 rounded-2xl border outline-none transition-all focus:ring-2 font-medium"
              style={{ 
                borderColor: `${currentTheme.main}20`, 
                backgroundColor: `${currentTheme.main}05`,
                color: currentTheme.text,
                "--tw-ring-color": `${currentTheme.main}30`
              }}
            />
          </div>

          {/* 備註 */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest px-1 opacity-60 mb-2 flex items-center gap-2" style={{ color: currentTheme.text }}>
              <StickyNote className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />
              備註
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="例如：行動電源一定要放在隨身包！"
              className="w-full px-5 py-4 h-28 rounded-2xl border outline-none transition-all focus:ring-2 font-medium resize-none leading-relaxed"
              style={{ 
                borderColor: `${currentTheme.main}20`, 
                backgroundColor: `${currentTheme.main}05`,
                color: currentTheme.text,
                "--tw-ring-color": `${currentTheme.main}30`
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95 border"
            style={{ 
              backgroundColor: `${currentTheme.main}08`, 
              color: currentTheme.main,
              borderColor: `${currentTheme.main}15`
            }}
          >
            取消
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 py-4 rounded-2xl text-white font-bold shadow-lg shadow-black/10 transition-all active:scale-95"
            style={{ backgroundColor: currentTheme.main }}
          >
            儲存變更
          </button>
        </div>
      </div>
    </div>
  );
}