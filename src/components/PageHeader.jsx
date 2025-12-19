// src/components/PageHeader.jsx
import React from "react";

export default function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="px-4 mt-4 mb-6">
      {/* 第一行：Icon + 中文標題 */}
      <div className="flex items-center gap-2 mb-1">
        {/* 圓形背景（無外圈版） */}
        <div className="w-7 h-7 rounded-full bg-[#F7F1EB] flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#8C6A4F]" />
        </div>

        <h1 className="text-xl font-serif font-bold text-[#5A4636]">
          {title}
        </h1>
      </div>

      {/* 第二行英文 */}
      <p className="text-[13px] tracking-[0.3em] text-[#C6A087] font-serif uppercase">
        {subtitle}
      </p>
    </div>
  );
}
