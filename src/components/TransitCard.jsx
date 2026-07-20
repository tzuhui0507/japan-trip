// src/components/TransitCard.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Train,
  Footprints,
  Car,
  Bus,
  Plane,
  Plus,
  X,
  ArrowRight,
  TrainFront,
  Signpost,
  CarFront,
} from "lucide-react";
import { THEMES } from "../App";

const MODE_COLORS = {
  walk: "#666666",
  taxi: "#EFBF2F",
  drive: "#E67E22", // 代表自駕/租車
  bus: "#8B5E3C",
  plane: "#1C82D4",
};

// 貨幣符號映射表
const CURRENCY_MAP = {
  JPY: "¥",
  TWD: "$",
  USD: "$",
  KRW: "₩",
  THB: "฿",
  EUR: "€",
  HKD: "$",
  SGD: "$",
  VND: "₫",
  GBP: "£",
  CNY: "¥",
};

const JAPAN_LINE_COLORS = {
  山手線: "#80C342", 中央線: "#FF8800", 京浜東北線: "#00A0E9", 総武線: "#FFD700",
  東西線: "#009BBF", 半蔵門線: "#8F76D6", 千代田線: "#009B7D", 銀座線: "#FF9500",
  丸ノ内線: "#E6002C", 小田急: "#1C82D4", 京王: "#BB0066", SKYLINER: "#0047AB",
  "成田エクスプレス": "#E32636", "N'EX": "#E32636", 東武東上線: "#004A99", 日比谷線: "#B5B5AC",
  南北線: "#00AF44", 札幌東西線: "#FF7300", 東豐線: "#007DC5", 札幌市电: "#1B5E20",
  JR北海道: "#00AA3C", 函館本線: "#ED1C24", 千歲線: "#0072BC", 石勝線: "#7AC143",
  室蘭本線: "#F58220", "エアポート": "#0072BC",
};

const SHINKANSEN_COLORS = {
  東海道: "#0068B7", 山陽: "#0068B7", 東北: "#00A95C", Hokkaido: "#00A95C", 九州: "#E6006E", 北陸: "#1B3FAB",
};

function TransitCard({ id, defaultData, onUpdate, isViewer = false, branchIndex = 0, themeId, trip }) {
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;
  
  // 接入全局貨幣符號
  const currencySymbol = CURRENCY_MAP[trip?.currency] || "¥";

  const [legs, setLegs] = useState(() => {
    if (defaultData?.legs) return defaultData.legs;
    return [{ id: "1", mode: "train", duration: "" }];
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const hasInitRef = useRef(false);

  useEffect(() => {
    if (hasInitRef.current) return;
    if (!defaultData?.legs) return;
    setLegs(defaultData.legs);
    hasInitRef.current = true;
  }, [defaultData]);

  const commitUpdate = () => {
    if (isViewer) return;
    onUpdate && onUpdate(id, { legs });
  };

  const parseBranchText = (text) => {
    if (!text) return "";
    const parts = text.split("---").map(p => p.trim());
    return (parts[branchIndex] !== undefined && parts[branchIndex] !== "") 
      ? parts[branchIndex] 
      : parts[0];
  };

  // 價格格式化處理，包含千分位
  const formatLegPrice = (p) => {
    const val = parseBranchText(p);
    if (!val || isNaN(val)) return val;
    return Number(val).toLocaleString();
  };

  const hasContentInCurrentBranch = () => {
    return legs.some(leg => {
      return (
        parseBranchText(leg.lineName) || 
        parseBranchText(leg.direction) || 
        parseBranchText(leg.fromStation) || 
        parseBranchText(leg.toStation) || 
        parseBranchText(leg.duration) || 
        parseBranchText(leg.price)
      );
    });
  };

  const hasAnyContent = hasContentInCurrentBranch();

  if (!hasAnyContent && !isExpanded) {
    if (isViewer) return null;
    return (
      <div className="group flex justify-center my-1 ml-4">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed transition-all text-[10px] font-bold"
          style={{ borderColor: `${currentTheme.main}40`, color: `${currentTheme.main}60` }}
        >
          <Plus className="w-3 h-3" /> 設定交通
        </button>
      </div>
    );
  }

  const detectColor = (leg) => {
    const lineName = parseBranchText(leg.lineName);
    if (leg.mode === "shinkansen") {
      const key = Object.keys(SHINKANSEN_COLORS).find((k) => lineName?.includes(k)) || "東海道";
      return SHINKANSEN_COLORS[key];
    }
    if (lineName) {
      const key = Object.keys(JAPAN_LINE_COLORS).find((k) => lineName?.includes(k)) || "";
      if (key) return JAPAN_LINE_COLORS[key];
    }
    return MODE_COLORS[leg.mode] || currentTheme.main;
  };

  const getIcon = (mode, color) => {
    switch (mode) {
      case "walk": return <Footprints className="w-4 h-4" stroke={color} />;
      case "taxi": return <Car className="w-4 h-4" stroke={color} />;
      case "drive": return <CarFront className="w-4 h-4" stroke={color} />;
      case "bus": return <Bus className="w-4 h-4" stroke={color} />;
      case "plane": return <Plane className="w-4 h-4" stroke={color} />;
      case "shinkansen": return <TrainFront stroke={color} className="w-4 h-4" />;
      default: return <Train className="w-4 h-4" stroke={color} />;
    }
  };

  const updateLeg = (legId, key, value) => {
    if (isViewer) return;
    setLegs((prev) => prev.map((l) => (l.id === legId ? { ...l, [key]: value } : l)));
  };

  const addLeg = () => {
    if (isViewer) return;
    setLegs((prev) => [...prev, { id: Date.now().toString(), mode: "train", duration: "" }]);
  };

  const removeLeg = (legId) => {
    if (isViewer) return;
    setLegs((prev) => prev.filter((l) => l.id !== legId));
  };
  
  const toggleMode = (legId) => {
    if (isViewer) return;
    const MODES = ["train", "shinkansen", "walk", "taxi", "drive", "bus", "plane"];
    setLegs((prev) => prev.map((l) => (l.id === legId ? { ...l, mode: MODES[(MODES.indexOf(l.mode) + 1) % MODES.length] } : l)));
  };

  const calculateTotal = () => {
    let totalTime = 0;
    let totalPrice = 0;
    legs.forEach(leg => {
      const d = parseBranchText(leg.duration);
      const p = parseBranchText(leg.price);
      totalTime += parseInt(d) || 0;
      totalPrice += parseInt(p) || 0;
    });
    return { totalTime, totalPrice };
  };

  const { totalTime, totalPrice } = calculateTotal();

  const renderSummary = () => (
    <div className="flex flex-col text-[10px] font-bold leading-snug justify-center transition-all duration-300 w-full">
      {legs.map((leg) => {
        const color = detectColor(leg);
        const lineName = parseBranchText(leg.lineName);
        const direction = parseBranchText(leg.direction);
        const from = parseBranchText(leg.fromStation);
        const to = parseBranchText(leg.toStation);
        const duration = parseBranchText(leg.duration);
        const priceDisplay = formatLegPrice(leg.price);

        if (!lineName && !direction && !from && !to && !duration && !priceDisplay) return null;

        return (
          <div key={leg.id} className="mb-2.5 last:mb-0 w-full">
            {/* 一體化流線型設計「路線名稱 ｜ 🧭 方向文字」 */}
            <div className="flex items-center gap-1 w-full mb-1 flex-wrap text-[10px]" style={{ color }}>
              <div className="flex items-center gap-1 min-w-0">
                <div className="shrink-0 mt-0.5">{getIcon(leg.mode, color)}</div>
                <span className="font-black break-words min-w-0">{lineName || "未命名路線"}</span>
              </div>
              
              {/* 當有輸入方向時，流暢並排呈現 */}
              {direction && (
                <div className="flex items-center gap-1 shrink-0 font-black">
                  <span className="opacity-40 font-normal">｜</span>
                  <Signpost className="w-3 h-3 shrink-0" stroke={color} />
                  <span className="break-words">{direction}</span>
                </div>
              )}
            </div>
            
            {/* 起訖純文字區塊 (依字數自動調整寬度，不再硬撐中間空隙) */}
            <div className="flex flex-row items-center gap-1.5 pl-5 w-full overflow-hidden">
              
              {/* 1. 起點純文字 (依字數自然自適應) */}
              <div 
                className="shrink-0 max-w-[38%] truncate text-[10px] font-bold text-left"
                style={{ color }}
                title={from}
              >
                {from || "—"}
              </div>

              {/* 2. 中間方向箭頭 (緊貼起點) */}
              <div className="flex items-center justify-center text-[8px] opacity-50 shrink-0" style={{ color }}>
                ➔
              </div>

              {/* 3. 終點純文字 (緊貼箭頭) */}
              <div 
                className="shrink-0 max-w-[38%] truncate text-[10px] font-bold text-left"
                style={{ color }}
                title={to}
              >
                {to || "—"}
              </div>

              {/* 4. 最右側貼邊細節小配件 */}
              {(duration || priceDisplay) && (
                <div className="ml-auto flex flex-col items-end justify-center pl-1 text-[9px] font-bold opacity-80 shrink-0 leading-tight" style={{ color }}>
                  {duration && (
                    <span className="whitespace-nowrap">✦ {duration}m</span>
                  )}
                  {priceDisplay && (
                    <span className="whitespace-nowrap">{currencySymbol}{priceDisplay}</span>
                  )}
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );

  const getCardBg = () => {
    if (branchIndex === 1) return `${currentTheme.main}08`; 
    if (branchIndex === 2) return '#F0F2F9'; 
    return 'white'; 
  };

  const getCardBorder = () => {
    if (branchIndex === 1) return `${currentTheme.main}40`; 
    if (branchIndex === 2) return '#D1D9E6'; 
    return `${currentTheme.main}20`; 
  };

  return (
    <div className="relative flex flex-col my-3 pl-3 animate-in fade-in duration-500 max-w-full">
      <div
        onClick={() => {
          if (!isViewer && isExpanded) commitUpdate();
          setIsExpanded((v) => !v);
        }}
        className="flex items-center border rounded-2xl px-3 py-2.5 cursor-pointer w-full min-h-[54px] transition-all hover:brightness-[0.98] active:scale-[0.99] shadow-sm overflow-hidden"
        style={{ backgroundColor: getCardBg(), borderColor: getCardBorder() }}
      >
        <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
          {renderSummary()}
        </div>

        <div className="self-stretch border-l border-dashed mx-2 my-1 opacity-30 shrink-0" style={{ borderColor: currentTheme.text }} />

        <div className="flex flex-col items-center justify-center min-w-[54px] text-[11px] font-black whitespace-nowrap shrink-0" style={{ color: currentTheme.text }}>
          {totalTime > 0 ? <span>{totalTime}分</span> : <span className="text-[9px] opacity-40">未定</span>}
          {totalPrice > 0 && (
            <>
              <div className="w-6 border-t my-1 opacity-20" style={{ borderColor: currentTheme.text }} />
              <span>{currencySymbol}{totalPrice.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>

      {isExpanded && !isViewer && (
        <div 
          className="mt-2 bg-white border rounded-[1.5rem] p-4 shadow-xl w-full z-10 animate-in slide-in-from-top-2 duration-300 overflow-hidden"
          style={{ borderColor: `${currentTheme.main}30` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black tracking-widest uppercase opacity-60" style={{ color: currentTheme.text }}>
              編輯交通方式
            </h4>
            <button onClick={() => { commitUpdate(); setIsExpanded(false); }} style={{ color: currentTheme.main }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="rounded-xl p-3 mb-5" style={{ backgroundColor: `${currentTheme.main}08` }}>
             <p className="text-[10px] font-black flex items-center gap-1" style={{ color: currentTheme.main }}>
               💡 支援多方案：方案1 --- 方案2 --- 方案3
             </p>
          </div>

          <div className="space-y-4">
            {legs.map((leg) => {
              const color = detectColor(leg);
              return (
                <div 
                  key={leg.id} 
                  className="rounded-[1.2rem] border p-3 shadow-sm overflow-hidden"
                  style={{ borderColor: `${currentTheme.main}20`, backgroundColor: `${currentTheme.main}05` }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      onClick={() => toggleMode(leg.id)} 
                      className="w-9 h-9 rounded-xl bg-white border flex items-center justify-center shadow-sm transition-all active:scale-95 shrink-0"
                      style={{ borderColor: `${currentTheme.main}20` }}
                    >
                      {getIcon(leg.mode, color)}
                    </button>

                    <div className="relative flex-1 max-w-[100px]">
                      <input
                        type="text"
                        value={leg.duration}
                        onChange={(e) => updateLeg(leg.id, "duration", e.target.value)}
                        className="w-full bg-white border rounded-xl px-2 py-2 text-[13px] text-center font-bold outline-none focus:ring-2"
                        style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text, "--tw-ring-color": `${currentTheme.main}20` }}
                        placeholder="10 --- 20"
                      />
                      <span className="absolute -right-5 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-40">分</span>
                    </div>

                    {legs.length > 1 && (
                      <button onClick={() => removeLeg(leg.id)} className="ml-auto opacity-30 hover:opacity-100 hover:text-red-500 transition-all p-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* 路線名稱與搭乘方向並排編輯框 */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">路線名稱</label>
                        <input
                          type="text"
                          value={leg.lineName || ""}
                          onChange={(e) => updateLeg(leg.id, "lineName", e.target.value)}
                          className="w-full bg-white border rounded-xl px-3 py-2 text-[13px] font-bold outline-none focus:ring-2"
                          style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text, "--tw-ring-color": `${currentTheme.main}10` }}
                          placeholder="例：JR山手線 --- 租車自駕"
                        />
                      </div>
                      <div className="sm:w-[40%]">
                        <label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">搭乘方向</label>
                        <input
                          type="text"
                          value={leg.direction || ""}
                          onChange={(e) => updateLeg(leg.id, "direction", e.target.value)}
                          className="w-full bg-white border rounded-xl px-3 py-2 text-[13px] font-bold outline-none focus:ring-2"
                          style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text, "--tw-ring-color": `${currentTheme.main}10` }}
                          placeholder="例：往淺草方向"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">起訖站點</label>
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <input
                          type="text"
                          value={leg.fromStation || ""}
                          onChange={(e) => updateLeg(leg.id, "fromStation", e.target.value)}
                          className="flex-1 min-w-[80px] bg-white border rounded-xl px-3 py-2 text-[13px] font-bold outline-none"
                          style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }}
                          placeholder="起點"
                        />
                        <ArrowRight className="w-4 h-4 opacity-30 shrink-0" />
                        <input
                          type="text"
                          value={leg.toStation || ""}
                          onChange={(e) => updateLeg(leg.id, "toStation", e.target.value)}
                          className="flex-1 min-w-[80px] bg-white border rounded-xl px-3 py-2 text-[13px] font-bold outline-none"
                          style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }}
                          placeholder="終點"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">預估價格</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-black opacity-30" style={{ color: currentTheme.text }}>
                          {currencySymbol}
                        </span>
                        <input
                          type="text"
                          value={leg.price || ""}
                          onChange={(e) => updateLeg(leg.id, "price", e.target.value)}
                          className="w-full bg-white border rounded-xl pl-9 pr-3 py-2 text-[13px] font-bold outline-none focus:ring-2"
                          style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text, "--tw-ring-color": `${currentTheme.main}10` }}
                          placeholder="210 --- 1500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addLeg}
            className="w-full mt-5 py-3 border-2 border-dashed rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ borderColor: `${currentTheme.main}40`, color: currentTheme.main }}
          >
            <Plus className="w-4 h-4" /> 新增轉乘段落
          </button>
        </div>
      )}
    </div>
  );
}

export default TransitCard;