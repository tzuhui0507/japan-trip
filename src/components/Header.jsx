// src/components/Header.jsx
import React from "react";

export default function Header({ trip }) {
  if (!trip) return null;

  const year = new Date(trip.startDate).getFullYear(); // ⭐ 自動抓年份

  return (
    <header className="py-6 text-center bg-[#F8F5F1] border-b border-[#E8E1DA] fixed top-0 left-0 w-full z-50">
      <div className="text-[12px] tracking-[3px] text-[#A8937C] mb-1">
        JAPAN TRIP
      </div>

      <div className="flex justify-center items-center gap-2">
        <h1 className="text-2xl font-bold text-[#5A3F2E]">
          {trip.title || "日本自由行"}
        </h1>

        <span className="px-3 py-[2px] text-[12px] border border-[#D8CFC4] rounded-full bg-white text-[#5A3F2E]">
          {year}
        </span>
      </div>

      <p className="text-[12px] text-[#A8937C] mt-1">
        よい旅をしてください
      </p>
    </header>
  );
}
