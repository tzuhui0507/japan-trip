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
  JapaneseYen,
} from "lucide-react";

// 🟫 奶茶色系（基底）
const COLORS = {
  tea: "#C6A087",
  milk: "#F7F1EB",
  mocha: "#8C6A4F",
  accent: "#E5D5C5",
};

const MODE_COLORS = {
  walk: "#666666",
  taxi: "#EFBF2F",
  bus: "#8B5E3C",
  plane: "#1C82D4",
  train: COLORS.mocha,
  shinkansen: COLORS.mocha,
};

const JAPAN_LINE_COLORS = {
  山手線: "#80C342", 中央線: "#FF8800", 京浜東北線: "#00A0E9", 総武線: "#FFD700",
  東西線: "#009BBF", 半蔵門線: "#8F76D6", 千代田線: "#009B7D", 銀座線: "#FF9500",
  丸ノ内線: "#E6002C", 小田急: "#1C82D4", 京王: "#BB0066", SKYLINER: "#0047AB",
  "成田エクスプレス": "#E32636", "N'EX": "#E32636", 東武東上線: "#004A99", 日比谷線: "#B5B5AC",
};

const SHINKANSEN_COLORS = {
  東海道: "#0068B7", 山陽: "#0068B7", 東北: "#00A95C", 北海道: "#00A95C", 九州: "#E6006E", 北陸: "#1B3FAB",
};

const ShinkansenIcon = ({ className = "w-3.5 h-3.5", stroke = "#8C6A4F" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 40 L20 20 Q32 10 44 20 L52 40 Z" />
    <ellipse cx="24" cy="46" rx="4" ry="4" />
    <ellipse cx="40" cy="46" rx="4" ry="4" />
    <path d="M20 28 Q32 18 44 28" />
  </svg>
);
 
function TransitCard({ id, defaultData, onUpdate, isViewer = false }) {
  const [legs, setLegs] = useState(() => {
    if (defaultData?.legs) return defaultData.legs;
    return [{ id: "1", mode: "train", duration: "10" }];
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const hasInitRef = useRef(false);
  const summaryRef = useRef(null);
  const [summaryHeight, setSummaryHeight] = useState(40);

  useEffect(() => {
    if (hasInitRef.current) return;
    if (!defaultData?.legs) return;
    setLegs(defaultData.legs);
    hasInitRef.current = true;
  }, [defaultData]);

  useEffect(() => {
    if (summaryRef.current) {
      setSummaryHeight(summaryRef.current.clientHeight);
    }
  }, [legs]);

  const commitUpdate = () => {
    if (isViewer) return;
    onUpdate && onUpdate(id, { legs });
  };

  const detectColor = (leg) => {
    if (leg.mode === "shinkansen") {
      const key = Object.keys(SHINKANSEN_COLORS).find((k) => leg.lineName?.includes(k)) || "東海道";
      return SHINKANSEN_COLORS[key];
    }
    if (leg.lineName) {
      const key = Object.keys(JAPAN_LINE_COLORS).find((k) => leg.lineName?.includes(k)) || "";
      if (key) return JAPAN_LINE_COLORS[key];
    }
    return MODE_COLORS[leg.mode] || COLORS.mocha;
  };

  const getIcon = (mode, color) => {
    const iconClass = "w-3.5 h-3.5";
    switch (mode) {
      case "walk": return <Footprints className={iconClass} stroke={color} />;
      case "taxi": return <Car className={iconClass} stroke={color} />;
      case "bus": return <Bus className={iconClass} stroke={color} />;
      case "plane": return <Plane className={iconClass} stroke={color} />;
      case "shinkansen": return <ShinkansenIcon stroke={color} className={iconClass} />;
      default: return <Train className={iconClass} stroke={color} />;
    }
  };

  const updateLeg = (legId, key, value) => {
    if (isViewer) return;
    setLegs((prev) => prev.map((l) => (l.id === legId ? { ...l, [key]: value } : l)));
  };

  const addLeg = () => {
    if (isViewer) return;
    setLegs((prev) => [...prev, { id: Date.now().toString(), mode: "train", duration: "5" }]);
  };

  const removeLeg = (legId) => {
    if (isViewer) return;
    setLegs((prev) => prev.filter((l) => l.id !== legId));
  };
  
  const toggleMode = (legId) => {
    if (isViewer) return;
    const MODES = ["train", "shinkansen", "walk", "taxi", "bus", "plane"];
    setLegs((prev) => prev.map((l) => l.id === legId ? { ...l, mode: MODES[(MODES.indexOf(l.mode) + 1) % MODES.length] } : l));
  };

  const totalMin = legs.reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
  const totalPrice = legs.reduce((sum, l) => sum + (parseInt(l.price || "0") || 0), 0);

  const renderSummary = () => (
    <div ref={summaryRef} className="flex flex-col text-[9px] font-bold leading-[1.4]">
      {legs.map((leg) => {
        const color = detectColor(leg);
        return (
          <div key={leg.id} className="mb-1.5 last:mb-0">
            {/* 名稱列：限制寬度，長度過長時截斷 */}
            <div className="flex items-center gap-1 w-full overflow-hidden" style={{ color }}>
              {getIcon(leg.mode, color)}
              <span className="truncate flex-1 max-w-[150px]">
                {leg.lineName || "未命名路線"}
              </span>
              <span className="opacity-60 font-medium">· {leg.duration}m</span>
              {leg.price && <span className="opacity-60 font-medium">· ¥{leg.price}</span>}
            </div>

            {/* 起訖站列：更小的字體與更緊湊的佈局 */}
            <div className="flex items-center gap-1 pl-4.5 opacity-80" style={{ color, paddingLeft: '17px' }}>
              <span className="truncate max-w-[80px]">{leg.fromStation || "—"}</span>
              <ArrowRight className="w-2 h-2 opacity-50" />
              <span className="truncate max-w-[80px]">{leg.toStation || "—"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative flex flex-col my-2 pl-3">
      {/* 外框＋摘要列 */}
      <div
        onClick={() => {
          if (!isViewer && isExpanded) commitUpdate();
          setIsExpanded((v) => !v);
        }}
        className="flex bg-white/80 border border-[#E5D5C5] rounded-md px-2.5 py-2 shadow-sm cursor-pointer w-full items-center"
      >
        <div className="flex-1 min-w-0">{renderSummary()}</div>

        <div
          style={{
            height: Math.max(20, summaryHeight - 10),
            borderLeft: "1px dashed #D7C9BD",
            margin: "0 10px",
          }}
        />

        <div className="flex flex-col items-end text-[10px] font-bold text-[#8C6A4F] whitespace-nowrap leading-tight shrink-0">
          <span>{totalMin}分</span>
          {totalPrice > 0 && <span className="text-[9px] opacity-70">¥{totalPrice}</span>}
        </div>
      </div>

      {/* 展開版編輯區 */}
      {isExpanded && !isViewer && (
        <div className="mt-2 ml-1 bg-white border border-[#E5D5C5] rounded-xl p-3 shadow-lg w-full max-w-[320px] z-10">
          <h4 className="text-[10px] font-bold text-[#8C6A4F]/70 tracking-widest mb-3 uppercase">
            Edit Transit
          </h4>

          <div className="space-y-3">
            {legs.map((leg) => {
              const color = detectColor(leg);
              return (
                <div key={leg.id} className="rounded-lg border border-[#E5D5C5]/50 bg-[#F7F1EB]/50 p-2.5 shadow-sm">
                  {/* Row 1：類型 + 時間 */}
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => toggleMode(leg.id)} className="w-7 h-7 rounded bg-white border border-[#E5D5C5] flex items-center justify-center shadow-xs">
                      {getIcon(leg.mode, color)}
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={leg.duration}
                        onChange={(e) => updateLeg(leg.id, "duration", e.target.value)}
                        className="w-full bg-white border border-[#E5D5C5] rounded px-2 py-1 text-[10px] font-bold text-[#5A4636] outline-none"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#8C6A4F] opacity-60">min</span>
                    </div>

                    {legs.length > 1 && (
                      <button onClick={() => removeLeg(leg.id)} className="p-1 text-[#8C6A4F]/40 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Row 2：路線名稱 */}
                  <div className="mb-2">
                    <input
                      type="text"
                      value={leg.lineName || ""}
                      onChange={(e) => updateLeg(leg.id, "lineName", e.target.value)}
                      className="w-full bg-white border border-[#E5D5C5] rounded px-2 py-1 text-[10px] outline-none"
                      placeholder="路線名稱 (如: SKYLINER)"
                    />
                  </div>

                  {/* Row 3：起訖站 */}
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={leg.fromStation || ""}
                      onChange={(e) => updateLeg(leg.id, "fromStation", e.target.value)}
                      className="flex-1 bg-white border border-[#E5D5C5] rounded px-2 py-1 text-[10px] outline-none"
                      placeholder="起點"
                    />
                    <ArrowRight className="w-3 h-3 text-[#8C6A4F]/30" />
                    <input
                      type="text"
                      value={leg.toStation || ""}
                      onChange={(e) => updateLeg(leg.id, "toStation", e.target.value)}
                      className="flex-1 bg-white border border-[#E5D5C5] rounded px-2 py-1 text-[10px] outline-none"
                      placeholder="終點"
                    />
                  </div>

                  {/* Row 4：價格 */}
                  <div className="relative">
                    <input
                      type="number"
                      value={leg.price || ""}
                      onChange={(e) => updateLeg(leg.id, "price", e.target.value)}
                      className="w-full bg-white border border-[#E5D5C5] rounded px-2 py-1 text-[10px] outline-none pl-5"
                      placeholder="價格"
                    />
                    <JapaneseYen className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-[#8C6A4F]/50" />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addLeg}
            className="w-full mt-3 py-1.5 border border-dashed border-[#C6A087]/50 rounded text-[9px] text-[#C6A087] font-bold flex items-center justify-center gap-1 hover:bg-[#F7F1EB]"
          >
            <Plus className="w-2.5 h-2.5" /> ADD LEG
          </button>
        </div>
      )}
    </div>
  );
}

export default TransitCard;