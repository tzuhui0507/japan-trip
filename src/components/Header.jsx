// src/components/Header.jsx
import React from "react";
import { Share2 } from "lucide-react";

export default function Header({ trip }) {
  if (!trip) return null;

  const year = new Date(trip.startDate).getFullYear(); // ⭐ 自動抓年份

  // ===============================
  // 一鍵複製 Viewer 分享連結
  // ===============================
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?mode=viewer`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("✅ 已複製分享連結（查看模式）\n可以直接貼給朋友！");
    } catch (err) {
      alert("❌ 複製失敗，請手動複製網址");
    }
  };

  return (
    <header className="py-6 text-center bg-[#F8F5F1] border-b border-[#E8E1DA] fixed top-0 left-0 w-full z-50">
      {/* 右上角分享（只有 Owner 看得到） */}
      {trip.shareMode === "owner" && (
        <div className="absolute top-4 right-4">
          <button
            onClick={handleShare}
            className="
              flex items-center gap-1
              px-3 py-1.5
              rounded-full
              bg-[#C6A087]
              text-white
              text-xs
              shadow-sm
              hover:opacity-90
            "
          >
            <Share2 className="w-4 h-4" />
            分享
          </button>
        </div>
      )}

      {/* 標題 */}
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
