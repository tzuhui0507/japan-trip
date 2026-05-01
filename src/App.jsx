// src/App.jsx
import React, { useState, useEffect } from "react";
import TripDetail from "./pages/TripDetail";

// 1. 定義全域主題配置
export const THEMES = {
  sakuraPink: {
    id: "sakuraPink",
    name: "櫻花粉色",
    main: "#D49BA7",
    bg: "#FBF5F6",
    card: "#FFF9FA",
    border: "#EED6DA",
    text: "#6B444C",
    accent: "#966B74",
    light: "#F5E9EB"
  },
  skyBlue: {
    id: "skyBlue",
    name: "天空之藍",
    main: "#7FB3D5",
    bg: "#F0F6F9",
    card: "#F8FBFF",
    border: "#D1E1EC",
    text: "#2E4A62",
    accent: "#547A96",
    light: "#E5EEF5"
  },
  lavenderPurple: {
    id: "lavenderPurple",
    name: "薰衣草紫",
    main: "#B197B4",
    bg: "#F8F2F9",
    card: "#FDFBFF",
    border: "#E6D9E7",
    text: "#523F54",
    accent: "#765C79",
    light: "#EFE6F1"
  },
  sunsetOrange: {
    id: "sunsetOrange",
    name: "夕陽橘調",
    main: "#D97757",
    bg: "#FDF6F2",
    card: "#FFFCFA",
    border: "#EBC9B9",
    text: "#5C3D2E",
    accent: "#A65D46",
    light: "#F5E8E0"
  },
  // --- 新增黃色系 ---
  lemonFizz: {
    id: "lemonFizz",
    name: "檸檬氣泡",
    main: "#EBC24D",      // 明亮鮮豔的黃色
    bg: "#FDFBF2",        // 極淺黃背景
    card: "#FFFEFA",
    border: "#F2E6C2",
    text: "#5C4D21",      // 深橄欖棕
    accent: "#A68B37",
    light: "#F7F0D7"
  },
  icyMint: {
    id: "icyMint",
    name: "冰晶薄荷",
    main: "#7ABCB4",
    bg: "#F2F9F8",
    card: "#FBFEFE",
    border: "#CDE2E0",
    text: "#2D4B47",
    accent: "#4D7A74",
    light: "#E4F1F0"
  },
  // --- 其他擴充色系 ---
  forestGreen: {
    id: "forestGreen",
    name: "玄米抹茶",
    main: "#748E63",
    bg: "#F4F6F2",
    card: "#FAFCF9",
    border: "#D6DED0",
    text: "#3A4731",
    accent: "#526346",
    light: "#E9EEE5"
  },
  deepSea: {
    id: "deepSea",
    name: "沈穩灰藍",
    main: "#6B8191",
    bg: "#F2F4F5",
    card: "#F9FAFB",
    border: "#D1D9DF",
    text: "#333E47",
    accent: "#4D5C69",
    light: "#E7EBEF"
  },
  mochaClassic: {
    id: "mochaClassic",
    name: "摩卡咖啡",
    main: "#8D7765",
    bg: "#F5F3F1",
    card: "#F9F8F7",
    border: "#DED3CA",
    text: "#463B32",
    accent: "#645548",
    light: "#ECE8E4"
  },
  berryWine: {
    id: "berryWine",
    name: "漿果酒紅",
    main: "#A66D6D",
    bg: "#F7F2F2",
    card: "#FBF9F9",
    border: "#E5D1D1",
    text: "#543535",
    accent: "#7A4F4F",
    light: "#F0E4E4"
  },
  // --- 新增灰黑色系 ---
  stoneGray: {
    id: "stoneGray",
    name: "迷霧灰影",
    main: "#787878",      // 中性灰色
    bg: "#F7F7F7",
    card: "#FDFDFD",
    border: "#E0E0E0",
    text: "#454545",
    accent: "#888888",
    light: "#EEEEEE"
  },
};

export default function App() {
  // 2. 初始化主題：優先從本地讀取，沒有則預設奶茶色
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem("user_preferred_theme") || "milkTea";
  });

  const currentTheme = THEMES[themeId] || THEMES.milkTea;

  // 3. 當主題改變時，保存到 localStorage
  useEffect(() => {
    localStorage.setItem("user_preferred_theme", themeId);
  }, [themeId]);

  return (
    // 4. 將背景色動態綁定到 currentTheme.bg
    <div 
      className="min-h-screen transition-colors duration-500" 
      style={{ backgroundColor: currentTheme.bg }}
    >
      {/* 5. 將 themeId 與 setThemeId 傳下去給 TripDetail，進而傳給 Header */}
      <TripDetail themeId={themeId} setThemeId={setThemeId} />
    </div>
  );
}