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

// 🚶‍♀️🚕🚌✈ 交通模式顏色（非鐵道用）
const MODE_COLORS = {
  walk: "#666666",   // 深灰
  taxi: "#EFBF2F",   // 黃計程車感
  bus: "#8B5E3C",    // 咖啡色
  plane: "#1C82D4",  // 藍色
  train: COLORS.mocha,
  shinkansen: COLORS.mocha,
};

// 🚃 日本鐵路色碼（JR / 地鐵 / 私鐵）
const JAPAN_LINE_COLORS = {
  山手線: "#80C342",
  中央線: "#FF8800",
  京浜東北線: "#00A0E9",
  総武線: "#FFD700",
  東西線: "#009BBF",
  半蔵門線: "#8F76D6",
  千代田線: "#009B7D",
  銀座線: "#FF9500",
  丸ノ内線: "#E6002C",
  小田急: "#1C82D4",
  京王: "#BB0066",
  SKYLINER: "#0047AB",
  "成田エクスプレス": "#E32636",
  "N'EX": "#E32636",
  東武東上線: "#004A99",
  日比谷線: "#B5B5AC",
};

// 🚄 新幹線色碼
const SHINKANSEN_COLORS = {
  東海道: "#0068B7",
  山陽: "#0068B7",
  東北: "#00A95C",
  北海道: "#00A95C",
  九州: "#E6006E",
  北陸: "#1B3FAB",
};

// 🚄 新幹線 icon（空心線條）
const ShinkansenIcon = ({ className = "w-4 h-4", stroke = "#8C6A4F" }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    stroke={stroke}
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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

  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasInitRef = useRef(false);

  useEffect(() => {
    if (hasInitRef.current) return;
    if (!defaultData?.legs) return;

    setLegs(defaultData.legs);
    hasInitRef.current = true;
  }, [defaultData]);


  // 摘要列高度（讓垂直虛線自動撐高）
  const summaryRef = useRef(null);
  const [summaryHeight, setSummaryHeight] = useState(40);

  useEffect(() => {
    if (summaryRef.current) {
      setSummaryHeight(summaryRef.current.clientHeight);
    }
  }, [legs]);

  const commitUpdate = () => {
    if (isViewer) return;
    onUpdate && onUpdate(id, { legs });
  };

  // 顏色判斷
  const detectColor = (leg) => {
    // 1) 新幹線優先看路線名
    if (leg.mode === "shinkansen") {
      const key =
        Object.keys(SHINKANSEN_COLORS).find((k) =>
          leg.lineName?.includes(k)
        ) || "東海道";
      return SHINKANSEN_COLORS[key];
    }

    // 2) 一般鐵道看路線名
    if (leg.lineName) {
      const key =
        Object.keys(JAPAN_LINE_COLORS).find((k) =>
          leg.lineName?.includes(k)
        ) || "";
      if (key) return JAPAN_LINE_COLORS[key];
    }

    // 3) 交通模式顏色
    if (MODE_COLORS[leg.mode]) {
      return MODE_COLORS[leg.mode];
    }

    // 4) 預設奶茶咖啡色
    return COLORS.mocha;
  };

  const getIcon = (mode, color) => {
    switch (mode) {
      case "walk":
        return <Footprints className="w-4 h-4" stroke={color} />;
      case "taxi":
        return <Car className="w-4 h-4" stroke={color} />;
      case "bus":
        return <Bus className="w-4 h-4" stroke={color} />;
      case "plane":
        return <Plane className="w-4 h-4" stroke={color} />;
      case "shinkansen":
        return <ShinkansenIcon stroke={color} className="w-4 h-4" />;
      default:
        return <Train className="w-4 h-4" stroke={color} />;
    }
  };

  const updateLeg = (legId, key, value) => {
    if (isViewer) return;
    setIsEditing(true);
    setLegs((prev) =>
      prev.map((l) => (l.id === legId ? { ...l, [key]: value } : l))
    );
  };

  const addLeg = () => {
    if (isViewer) return;
    setIsEditing(true);
    setLegs((prev) => [
      ...prev,
      { id: Date.now().toString(), mode: "train", duration: "5" },
    ]);
  };

  const removeLeg = (legId) => {
    if (isViewer) return;
    setIsEditing(true);
    setLegs((prev) => prev.filter((l) => l.id !== legId));
  };
  
  const toggleMode = (legId) => {
    if (isViewer) return;
    setIsEditing(true);
    const MODES = ["train", "shinkansen", "walk", "taxi", "bus", "plane"];
    setLegs((prev) =>
      prev.map((l) =>
        l.id === legId
          ? { ...l, mode: MODES[(MODES.indexOf(l.mode) + 1) % MODES.length] }
          : l
      )
    );
  };

  // 合計時間 / 價格
  const totalMin = legs.reduce(
    (sum, l) => sum + (parseInt(l.duration) || 0),
    0
  );
  const totalPrice = legs.reduce(
    (sum, l) => sum + (parseInt(l.price || "0") || 0),
    0
  );

  // 摘要列（左側：每段；右側：總和）
  const renderSummary = () => (
    <div
      ref={summaryRef}
      className="flex flex-col text-[10px] font-bold leading-snug"
    >
      {legs.map((leg) => {
        const color = detectColor(leg);

        return (
          <div key={leg.id} className="mb-2 last:mb-0">
            {/* 第一行：icon + 路線名稱 */}
            <div className="flex items-center gap-1" style={{ color }}>
              {getIcon(leg.mode, color)}
              <span className="font-semibold">
                {leg.lineName || "未命名路線"}
              </span>
            </div>

            {/* 第二行：縮排、起訖站＋時間＋金額（全用同色） */}
            <div className="flex items-center gap-1 pl-5" style={{ color }}>
              <span>
                {(leg.fromStation || "—") + " → " + (leg.toStation || "—")}
              </span>
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
      {/* 外框＋摘要列 */}
      <div
        onClick={() => {
          if (!isViewer && isExpanded) commitUpdate(); // 👈 收起時才存
          setIsExpanded((v) => !v);
        }}
        className="flex bg-white border border-[#E5D5C5] rounded-lg px-3 py-2 shadow-sm cursor-pointer w-full"
      >
        {/* 左側：每段行程 */}
        <div className="flex-1">{renderSummary()}</div>

        {/* 垂直虛線（高度跟摘要列一樣高） */}
        <div
          style={{
            height: summaryHeight,
            borderLeft: "1px dashed #D7C9BD",
            margin: "0 12px",
          }}
        />

        {/* 右側：總時間＋總金額（同一行置中） */}
        <div className="flex items-center justify-center text-[11px] font-bold text-[#8C6A4F] whitespace-nowrap">
          <span>{totalMin}分</span>
          {totalPrice > 0 && (
            <>
              <span className="mx-1">｜</span>
              <span>¥{totalPrice}</span>
            </>
          )}
        </div>
      </div>

      {/* 展開版編輯區 */}
      {isExpanded && !isViewer && (
        <div className="mt-3 ml-1 bg-white border border-[#E5D5C5] rounded-2xl p-4 shadow-lg w-full max-w-[350px]">
          <h4 className="text-[11px] font-bold text-[#8C6A4F]/70 tracking-widest mb-3">
            編輯交通方式
          </h4>

          <div className="space-y-4">
            {legs.map((leg) => {
              const color = detectColor(leg);
              return (
                <div
                  key={leg.id}
                  className="rounded-xl border border-[#E5D5C5] bg-[#F7F1EB] p-3 shadow-sm"
                >
                  {/* Row 1：類型 + 時間 */}
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => toggleMode(leg.id)}
                      className="w-9 h-9 rounded-lg bg-white border border-[#E5D5C5] flex items-center justify-center"
                    >
                      {getIcon(leg.mode, color)}
                    </button>

                    <div className="relative">
                      <input
                        type="number"
                        value={leg.duration}
                        onChange={(e) =>
                          updateLeg(leg.id, "duration", e.target.value)
                        }
                        className="w-20 bg-white border border-[#E5D5C5] rounded-md px-3 py-1.5 text-xs text-center font-bold text-[#5A4636] outline-none"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#8C6A4F]">
                        分
                      </span>
                    </div>

                    {legs.length > 1 && (
                      <button
                        onClick={() => removeLeg(leg.id)}
                        className="ml-auto text-[#8C6A4F]/60 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Row 2：路線名稱 */}
                  <div className="mb-2">
                    <label className="text-[10px] font-bold text-[#8C6A4F]/60 mb-1 block">
                      路線名稱
                    </label>
                    <input
                      type="text"
                      value={leg.lineName || ""}
                      onChange={(e) =>
                        updateLeg(leg.id, "lineName", e.target.value)
                      }
                      className="w-full bg-white border border-[#E5D5C5] rounded-md px-3 py-1.5 text-[11px] outline-none"
                      placeholder="如：山手線、銀座線、のぞみ32號、UA838"
                    />
                  </div>

                  {/* Row 3：起訖站 */}
                  <div className="mb-2">
                    <label className="text-[10px] font-bold text-[#8C6A4F]/60 mb-1 block">
                      起訖站
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={leg.fromStation || ""}
                        onChange={(e) =>
                          updateLeg(leg.id, "fromStation", e.target.value)
                        }
                        className="w-[100px] bg-white border border-[#E5D5C5] rounded-md px-3 py-1.5 text-[11px] outline-none"
                        placeholder="出發"
                      />

                      <ArrowRight className="w-4 h-4 text-[#8C6A4F]/60" />

                      <input
                        type="text"
                        value={leg.toStation || ""}
                        onChange={(e) =>
                          updateLeg(leg.id, "toStation", e.target.value)
                        }
                        className="w-[100px] bg-white border border-[#E5D5C5] rounded-md px-3 py-1.5 text-[11px] outline-none"
                        placeholder="抵達"
                      />
                    </div>
                  </div>

                  {/* Row 4：價格 */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8C6A4F]/60 mb-1 block">
                      預估價格（¥）
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={leg.price || ""}
                        onChange={(e) =>
                          updateLeg(leg.id, "price", e.target.value)
                        }
                        className="w-32 bg-white border border-[#E5D5C5] rounded-md px-3 py-1.5 text-[11px] outline-none"
                        placeholder="例如：13480"
                      />
                      <JapaneseYen className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C6A4F]/70" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 新增段落 */}
          <button
            onClick={addLeg}
            className="w-full mt-4 py-2 border border-dashed border-[#C6A087] rounded-lg text-[11px] text-[#C6A087] font-bold flex items-center justify-center gap-1 hover:bg-[#F7F1EB]"
          >
            <Plus className="w-3 h-3" />
            新增段落
          </button>
        </div>
      )}
    </div>
  );
}

export default TransitCard;
