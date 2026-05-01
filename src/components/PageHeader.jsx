// src/components/PageHeader.jsx
import React from "react";
import { THEMES } from "../App";

export default function PageHeader({ icon: Icon, title, subtitle, themeId }) {
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;

  return (
    <div className="px-4 mt-4 mb-6">
      {/* 第一行：Icon + 中文標題 */}
      <div className="flex items-center gap-2 mb-1">
        {/* Icon 透明背景版 */}
        <div className="flex items-center justify-center">
          <Icon className="w-6 h-6" style={{ color: currentTheme.main }} />
        </div>

        <h1 
          className="text-xl font-serif font-bold" 
          style={{ color: currentTheme.text }}
        >
          {title}
        </h1>
      </div>

      {/* 第二行英文 */}
      <p 
        className="text-[13px] tracking-[0.3em] font-serif uppercase font-medium opacity-70" 
        style={{ color: currentTheme.main }}
      >
        {subtitle}
      </p>
    </div>
  );
}