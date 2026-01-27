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
  TrainFront,
} from "lucide-react";

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
  // 東京區域
  山手線: "#80C342", 中央線: "#FF8800", 京浜東北線: "#00A0E9", 総武線: "#FFD700",
  東西線: "#009BBF", 半蔵門線: "#8F76D6", 千代田線: "#009B7D", 銀座線: "#FF9500",
  丸ノ内線: "#E6002C", 小田急: "#1C82D4", 京王: "#BB0066", SKYLINER: "#0047AB",
  "成田エクスプレス": "#E32636", "N'EX": "#E32636", 東武東上線: "#004A99", 日比谷線: "#B5B5AC",

  // 🆕 北海道區域 - 札幌地下鐵
  南北線: "#00AF44", // 綠色
  // 東西線: "#FF7300", // 橘色 (與東京東西線重複時會優先比對)
  札幌東西線: "#FF7300",
  東豐線: "#007DC5", // 藍色
  札幌市電: "#1B5E20", // 深綠色

  // 🆕 北海道區域 - JR 路線
  JR北海道: "#00AA3C", // JR北海道標誌綠
  函館本線: "#ED1C24", // 常用紅色代表
  千歲線: "#0072BC", // 常用藍色代表
  石勝線: "#7AC143", // 淺綠
  室蘭本線: "#F58220", // 橘
  "エアポート": "#0072BC", // 快速 Airport
};

const SHINKANSEN_COLORS = {
  東海道: "#0068B7", 山陽: "#0068B7", 東北: "#00A95C", 北海道: "#00A95C", 九州: "#E6006E", 北陸: "#1B3FAB",
};


function TransitCard({ id, defaultData, onUpdate, isViewer = false }) {
  const [legs, setLegs] = useState(() => {
    if (defaultData?.legs) return defaultData.legs;
    return [{ id: "1", mode: "train", duration: "10" }];
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

  const detectColor = (leg) => {
    if (leg.mode === "shinkansen") {
      const key = Object.keys(SHINKANSEN_COLORS).find((k) => leg.lineName?.includes(k)) || "東海道";
      return SHINKANSEN_COLORS[key];
    }
    if (leg.lineName) {
      // 優先比對北海道專屬前綴，防止重複名稱（如東西線）
      const key = Object.keys(JAPAN_LINE_COLORS).find((k) => leg.lineName?.includes(k)) || "";
      if (key) return JAPAN_LINE_COLORS[key];
    }
    return MODE_COLORS[leg.mode] || COLORS.mocha;
  };

  const getIcon = (mode, color) => {
    switch (mode) {
      case "walk": return <Footprints className="w-4 h-4" stroke={color} />;
      case "taxi": return <Car className="w-4 h-4" stroke={color} />;
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
    <div className="flex flex-col text-[10px] font-bold leading-snug justify-center">
      {legs.map((leg) => {
        const color = detectColor(leg);
        return (
          <div key={leg.id} className="mb-2 last:mb-0">
            <div className="flex items-center gap-1" style={{ color }}>
              {getIcon(leg.mode, color)}
              <span className="font-semibold truncate max-w-[180px]">{leg.lineName || "未命名路線"}</span>
            </div>
            <div className="flex items-center gap-1 pl-5" style={{ color }}>
              <span className="truncate max-w-[120px]">{(leg.fromStation || "—") + " → " + (leg.toStation || "—")}</span>
              <span>✦</span>
              <span>{leg.duration}m</span>
              {leg.price && (
                <>
                  <span>｜</span>
                  <span>¥{leg.price}</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative flex flex-col my-3 pl-3">
      <div
        onClick={() => {
          if (!isViewer && isExpanded) commitUpdate();
          setIsExpanded((v) => !v);
        }}
        className="flex items-center bg-white border border-[#E5D5C5] rounded-lg px-3 py-2 shadow-sm cursor-pointer w-full min-h-[54px]"
      >
        <div className="flex-1 flex flex-col justify-center">
          {renderSummary()}
        </div>

        <div className="self-stretch border-l border-dashed border-[#D7C9BD] mx-3 my-1" />

        <div className="flex flex-col items-center justify-center min-w-[54px] text-[11px] font-bold text-[#8C6A4F] whitespace-nowrap">
          <span>{totalMin}分</span>
          {totalMin > 0 && totalPrice > 0 && <div className="w-6 border-t border-[#D7C9BD] my-1" />}
          {totalPrice > 0 && <span>¥{totalPrice}</span>}
        </div>
      </div>

      {isExpanded && !isViewer && (
        <div className="mt-2 bg-white border border-[#E5D5C5] rounded-xl p-4 shadow-lg w-full z-10">
          <h4 className="text-[10px] font-bold text-[#8C6A4F]/70 tracking-widest mb-3 uppercase">
            編輯交通方式
          </h4>

          <div className="space-y-4">
            {legs.map((leg) => {
              const color = detectColor(leg);
              return (
                <div key={leg.id} className="rounded-xl border border-[#E5D5C5] bg-[#F7F1EB] p-3 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => toggleMode(leg.id)} className="w-9 h-9 rounded-lg bg-white border border-[#E5D5C5] flex items-center justify-center">
                      {getIcon(leg.mode, color)}
                    </button>

                    <div className="relative">
                      <input
                        type="number"
                        value={leg.duration}
                        onChange={(e) => updateLeg(leg.id, "duration", e.target.value)}
                        className="w-20 bg-white border border-[#E5D5C5] rounded-md px-3 py-1.5 text-[13px] text-center text-[#5A4636] outline-none"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#8C6A4F]">分</span>
                    </div>

                    {legs.length > 1 && (
                      <button onClick={() => removeLeg(leg.id)} className="ml-auto text-[#8C6A4F]/60 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mb-2">
                    <label className="text-[10px] font-bold text-[#8C6A4F]/60 mb-1 block uppercase tracking-tight">路線名稱</label>
                    <input
                      type="text"
                      value={leg.lineName || ""}
                      onChange={(e) => updateLeg(leg.id, "lineName", e.target.value)}
                      className="w-full bg-white border border-[#E5D5C5] rounded-md px-3 py-1.5 text-[13px] text-[#5A4636] outline-none"
                      placeholder="如：南北線、東豐線、エアポート"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="text-[10px] font-bold text-[#8C6A4F]/60 mb-1 block uppercase tracking-tight">起訖站</label>
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={leg.fromStation || ""}
                        onChange={(e) => updateLeg(leg.id, "fromStation", e.target.value)}
                        className="flex-1 bg-white border border-[#E5D5C5] rounded-md px-3 py-1.5 text-[13px] text-[#5A4636] outline-none min-w-0"
                        placeholder="出發站"
                      />
                      <ArrowRight className="w-4 h-4 text-[#8C6A4F]/60 shrink-0" />
                      <input
                        type="text"
                        value={leg.toStation || ""}
                        onChange={(e) => updateLeg(leg.id, "toStation", e.target.value)}
                        className="flex-1 bg-white border border-[#E5D5C5] rounded-md px-3 py-1.5 text-[13px] text-[#5A4636] outline-none min-w-0"
                        placeholder="抵達站"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#8C6A4F]/60 mb-1 block uppercase tracking-tight">預估價格</label>
                    <div className="relative flex items-center">
                      <JapaneseYen className="absolute left-2 w-3.5 h-3.5 text-[#8C6A4F]/70" />
                      <input
                        type="number"
                        value={leg.price || ""}
                        onChange={(e) => updateLeg(leg.id, "price", e.target.value)}
                        className="w-32 bg-white border border-[#E5D5C5] rounded-md pl-7 pr-3 py-1.5 text-[13px] text-[#5A4636] outline-none"
                        placeholder="價格"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addLeg}
            className="w-full mt-4 py-2 border border-dashed border-[#C6A087] rounded-lg text-[11px] text-[#C6A087] font-bold flex items-center justify-center gap-1 hover:bg-[#F7F1EB]"
          >
            <Plus className="w-3 h-3" /> 新增段落
          </button>
        </div>
      )}
    </div>
  );
}

export default TransitCard;