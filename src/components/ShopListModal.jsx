// src/components/ShopListModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Store,
  Clock,
  MapPin,
  ExternalLink,
  Star,
  Heart,
  Flower2,
  BellRing,
  Sparkles,
  Map,
  MapPinned,
} from "lucide-react";
import { THEMES } from "../App";

export default function ShopListModal({
  shops = [],
  initialIndex = 0,
  onClose,
  themeId,
  country = "KR",
}) {
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;
  const [selectedShopIndex, setSelectedShopIndex] = useState(initialIndex);

  useEffect(() => {
    setSelectedShopIndex(initialIndex);
  }, [initialIndex]);

  if (!shops || shops.length === 0) return null;

  const currentShop = shops[selectedShopIndex] || shops[0];

  // 開啟地圖導航
  const handleOpenMap = (shop) => {
    const queryName = shop.subtitle?.trim() || shop.name;
    const encoded = encodeURIComponent(queryName);

    if (country === "KR") {
      window.open(`https://map.naver.com/v5/search/${encoded}`, "_blank");
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encoded}`,
        "_blank"
      );
    }
  };

  // 階級解析器（支援 \ 與 Enter 換行，緊湊行距版）
  const renderFormattedLines = (rawText) => {
    if (!rawText) return null;

    const lines = rawText.split(/\\|\n/);
    let currentLevel = "star";

    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      let type = "";
      let content = "";

      if (trimmed.startsWith("!")) {
        type = "alert";
        content = trimmed.substring(1).trim();
        currentLevel = "alert";
      } else if (trimmed.startsWith(">>")) {
        type = "continue";
        content = trimmed.substring(2).trim();
      } else if (trimmed.startsWith(">")) {
        type = "heart";
        content = trimmed.substring(1).trim();
        currentLevel = "heart";
      } else if (trimmed.startsWith("-")) {
        type = "flower";
        content = trimmed.substring(1).trim();
        currentLevel = "flower";
      } else if (trimmed.startsWith("=")) {
        type = "star";
        content = trimmed.substring(1).trim();
        currentLevel = "star";
      } else {
        type = "continue";
        content = trimmed;
      }

      const activeType = type === "continue" ? currentLevel : type;
      const showIcon = type !== "continue";

      let paddingClass = "";
      if (activeType === "heart") paddingClass = "pl-3";
      if (activeType === "flower") paddingClass = "pl-6";

      const marginTopClass = lIdx === 0 ? "mt-0" : showIcon ? "mt-2" : "mt-[1px]";

      let iconComponent = null;
      if (showIcon) {
        if (activeType === "alert")
          iconComponent = (
            <BellRing className="w-3.5 h-3.5 text-[#FA5F73] mt-0.5 animate-pulse" />
          );
        else if (activeType === "heart")
          iconComponent = (
            <Heart className="w-2.5 h-2.5 fill-[#E8B4B4] text-[#E8B4B4] mt-1" />
          );
        else if (activeType === "flower")
          iconComponent = (
            <Flower2 className="w-2.5 h-2.5 text-[#FDBA74] mt-1" />
          );
        else
          iconComponent = (
            <Star className="w-3.5 h-3.5 fill-[#FAF287] text-[#FAF287] mt-0.5" />
          );
      }

      let textClass = "text-[12px] font-bold";
      if (activeType === "alert") textClass = "text-[12px] font-bold text-[#FA5F73]";
      else if (activeType === "heart") textClass = "text-[11px] font-semibold";
      else if (activeType === "flower") textClass = "text-[11px] opacity-90";

      return (
        <div
          key={lIdx}
          className={`flex items-start ${paddingClass} ${marginTopClass}`}
        >
          <div className="w-5 flex-shrink-0 flex justify-center">
            {iconComponent}
          </div>
          <p
            className={`flex-1 leading-relaxed ${textClass}`}
            style={{
              color: activeType !== "alert" ? currentTheme.text : undefined,
            }}
          >
            {content}
          </p>
        </div>
      );
    });
  };

  return (
    <div
      className="fixed inset-0 z-[350] flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[92%] max-w-[360px] bg-[#FAF8F5] rounded-3xl border-2 shadow-xl overflow-hidden relative flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-200"
        style={{ borderColor: `${currentTheme.main}40` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 手帳頁眉 Bar */}
        <div
          className="px-5 py-3 border-b border-dashed relative flex items-center justify-center bg-white shrink-0"
          style={{ borderColor: `${currentTheme.main}30` }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Store
              className="w-4 h-4 shrink-0"
              style={{ color: currentTheme.main }}
            />
            <span
              className="text-xs font-black tracking-widest uppercase"
              style={{ color: currentTheme.text }}
            >
              STORE INFORMATION
            </span>
          </div>

          <button
            onClick={onClose}
            className="absolute right-4 p-1 rounded-full hover:bg-slate-100 transition-colors opacity-60 active:scale-90"
            style={{ color: currentTheme.text }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 主要內容區塊 */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-none">
          {/* 1. 店家名稱與副標題 (移至照片上方，無背景色) */}
          <div className="pl-3 border-l-4 rounded-l-sm" style={{ borderColor: currentTheme.main }}>
            <h3
              className="text-base font-black leading-snug"
              style={{ color: currentTheme.text }}
            >
              {currentShop.name || "未命名店家"}
            </h3>
            {currentShop.subtitle && (
              <p
                className="text-xs font-bold opacity-60 mt-0.5"
                style={{ color: currentTheme.accent }}
              >
                {currentShop.subtitle}
              </p>
            )}
          </div>

          {/* 2. 店家封面圖片 */}
          {currentShop.image?.trim() ? (
            <div
              className="w-full h-36 rounded-2xl overflow-hidden border bg-white p-1 shadow-sm shrink-0"
              style={{ borderColor: `${currentTheme.main}20` }}
            >
              <img
                src={currentShop.image}
                alt={currentShop.name}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/600x400?text=Food+Photo";
                }}
              />
            </div>
          ) : (
            <div
              className="w-full h-20 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-1 bg-white/60"
              style={{ borderColor: `${currentTheme.main}30` }}
            >
              <Store
                className="w-5 h-5 opacity-30"
                style={{ color: currentTheme.main }}
              />
              <span
                className="text-[10px] font-bold opacity-40"
                style={{ color: currentTheme.text }}
              >
                尚未設定店家圖片
              </span>
            </div>
          )}

          {/* 3. 營業時間 (統一標題 Icon 樣式 + 文字置中) */}
          {currentShop.hours && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-0.5">
                <Clock
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: currentTheme.main }}
                />
                <h4
                  className="text-[11px] font-black tracking-widest uppercase opacity-60"
                  style={{ color: currentTheme.text }}
                >
                  營業時間
                </h4>
              </div>

              <div
                className="p-3 rounded-2xl bg-white border border-dashed shadow-sm text-center"
                style={{ borderColor: `${currentTheme.main}30` }}
              >
                <p
                  className="text-xs font-bold leading-relaxed"
                  style={{ color: currentTheme.text }}
                >
                  {currentShop.hours}
                </p>
              </div>
            </div>
          )}

          {/* 4. 特色與推薦點餐 */}
          {currentShop.desc && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-0.5">
                <Sparkles
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: currentTheme.main }}
                />
                <h4
                  className="text-[11px] font-black tracking-widest uppercase opacity-60"
                  style={{ color: currentTheme.text }}
                >
                  介紹與推薦
                </h4>
              </div>

              <div
                className="p-3.5 rounded-2xl bg-white border border-dashed shadow-sm"
                style={{ borderColor: `${currentTheme.main}30` }}
              >
                {renderFormattedLines(currentShop.desc)}
              </div>
            </div>
          )}
        </div>

        {/* 底部導航按鈕 */}
        <div
          className="p-4 border-t border-dashed bg-white shrink-0"
          style={{ borderColor: `${currentTheme.main}30` }}
        >
          <button
            onClick={() => handleOpenMap(currentShop)}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            style={{ backgroundColor: currentTheme.main }}
          >
            <MapPinned className="w-3.5 h-3.5" />
            <span>開啟地圖導航</span>
          </button>
        </div>
      </div>
    </div>
  );
}