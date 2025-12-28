// src/components/Header.jsx
import React, { useState } from "react";
import { Link, Upload, Download } from "lucide-react";

const STORAGE_KEY = "trip_local_v1";

export default function Header({ trip, setTrip, currentTab }) {
  if (!trip) return null;

  const year = new Date(trip.startDate).getFullYear();
  const isViewer = trip.shareMode === "viewer";
  const isPlan = currentTab === "PLAN";

  // ===== 匯入 Modal =====
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  // ===== 分享 Viewer 連結（Owner only）=====
  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "viewer");

    try {
      await navigator.clipboard.writeText(url.toString());
      alert("🔗 Viewer 連結已複製");
    } catch {
      alert("❌ 複製失敗");
    }
  };

  // ===== 匯出（Owner only）=====
  const handleExport = async () => {
    try {
      const data = JSON.stringify(trip, null, 2);
      await navigator.clipboard.writeText(data);
      alert("📤 行程 JSON 已複製");
    } catch {
      alert("❌ 匯出失敗");
    }
  };

  // ===== 匯入（Owner / Viewer 都可）=====
  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      const nextTrip = { ...parsed, shareMode: trip.shareMode };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrip));
      setTrip(nextTrip);

      setShowImport(false);
      setImportText("");
      alert("📥 行程匯入成功");
    } catch {
      alert("❌ JSON 格式錯誤");
    }
  };

  return (
    <>
      {/* ===== Header ===== */}
      <header
        className={`fixed top-0 left-0 w-full z-50 bg-[#F8F5F1] ${
          isPlan ? "" : "border-b border-[#E8E1DA]"
        }`}
      >
        <div className="relative py-6 text-center">

          {/* ===== 右上角 icon 操作 ===== */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            
            {/* 🔗 分享 Viewer（Owner only） */}
            {!isViewer && (
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full border border-[#D8CFC4] bg-white flex items-center justify-center hover:bg-[#F7F1EB]"
                title="分享 Viewer"
              >
                <Link className="w-3.5 h-3.5 text-[#8C6A4F]" />
              </button>
            )}

            {/* 📤 匯出（Owner only） */}
            {!isViewer && (
              <button
                onClick={handleExport}
                className="w-8 h-8 rounded-full border border-[#D8CFC4] bg-white flex items-center justify-center hover:bg-[#F7F1EB]"
                title="匯出行程"
              >
                <Upload className="w-3.5 h-3.5 text-[#8C6A4F]" />
              </button>
            )}

            {/* 📥 匯入（Owner / Viewer 都可） */}
            <button
              onClick={() => setShowImport(true)}
              className="w-8 h-8 rounded-full border border-dashed border-[#D8CFC4] bg-white flex items-center justify-center hover:bg-[#F7F1EB]"
              title="匯入行程"
            >
              <Download className="w-3.5 h-3.5 text-[#8C6A4F]" />
            </button>
          </div>

          {/* ===== 中央標題 ===== */}
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
          </p>
        </div>
      </header>

      {/* ===== 匯入 Modal ===== */}
      {showImport && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-lg mx-4 bg-[#FFF9F2] rounded-2xl border border-[#E5D5C5] p-4">
            <h2 className="text-sm font-bold text-[#5A4636] mb-2">
              匯入行程（JSON）
            </h2>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full h-40 border border-[#E5D5C5] rounded-xl p-3 text-xs bg-white"
              placeholder="請貼上行程 JSON"
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowImport(false)}
                className="px-3 py-1.5 text-xs rounded-full border border-[#E5D5C5]"
              >
                取消
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-1.5 text-xs rounded-full bg-[#C6A087] text-white"
              >
                匯入
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
