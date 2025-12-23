// src/components/Header.jsx
import React, { useState } from "react";

const STORAGE_KEY = "trip_local_v1";

export default function Header({ trip, setTrip }) {
  if (!trip) return null;

  const year = new Date(trip.startDate).getFullYear();
  const isViewer = trip.shareMode === "viewer";

  // ===== 匯入 Modal 狀態 =====
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  // ===== 匯出（純 JSON）=====
  const handleExport = async () => {
    try {
      const data = JSON.stringify(trip, null, 2);
      await navigator.clipboard.writeText(data);
      alert("✅ 行程已複製，請貼給朋友");
    } catch {
      alert("❌ 複製失敗，請手動複製");
    }
  };

  // ===== ⭐ 分享 Viewer（連結 + JSON）=====
  const handleShareViewer = async () => {
    try {
      const viewerUrl = `${window.location.origin}${window.location.pathname}?mode=viewer`;
      const data = JSON.stringify(trip, null, 2);

      const text = `📍 日本行程分享（查看模式）

🔗 行程連結（先開）：
${viewerUrl}

📦 行程資料（複製全部 → 在頁面點「匯入行程」貼上）：
${data}
`;

      await navigator.clipboard.writeText(text);
      alert("✅ Viewer 連結＋行程資料已複製，直接貼給朋友即可！");
    } catch {
      alert("❌ 複製失敗，請手動複製");
    }
  };

  // ===== 匯入 =====
  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid format");
      }

      // ⭐ 保留目前的 shareMode（避免被覆蓋）
      const nextTrip = {
        ...parsed,
        shareMode: trip.shareMode,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrip));
      setTrip(nextTrip);

      setShowImport(false);
      setImportText("");
      alert("✅ 行程匯入成功！");
    } catch {
      alert("❌ JSON 格式錯誤，請確認內容");
    }
  };

  return (
    <>
      {/* ===== Header ===== */}
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

        {/* ===== 操作按鈕 ===== */}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {/* ⭐ 分享 Viewer（只有 Owner） */}
          {!isViewer && (
            <button
              onClick={handleShareViewer}
              className="px-3 py-1.5 text-xs rounded-full bg-[#8C6A4F] text-white hover:opacity-90"
            >
              🔗 分享給朋友（Viewer）
            </button>
          )}

          {/* 匯出（只有 Owner） */}
          {!isViewer && (
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs rounded-full border border-[#C6A087] text-[#5A4636] bg-white hover:bg-[#F7F1EB]"
            >
              📤 匯出行程
            </button>
          )}

          {/* 匯入（Owner / Viewer 都可） */}
          <button
            onClick={() => setShowImport(true)}
            className="px-3 py-1.5 text-xs rounded-full border border-dashed border-[#C6A087] text-[#8C6A4F] bg-white hover:bg-[#F7F1EB]"
          >
            📥 匯入行程
          </button>
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
              placeholder="請貼上行程 JSON"
              className="w-full h-40 border border-[#E5D5C5] rounded-xl p-3 text-xs bg-white"
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
                確認匯入
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
