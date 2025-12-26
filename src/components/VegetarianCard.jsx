// src/components/VegetarianCard.jsx
import React, { useState } from "react";
import { X, Leaf, Carrot, Beef, Ban, Sprout } from "lucide-react";

/* 四種素食定義 */
const OPTIONS = [
  {
    key: "vegan",
    label: "全素",
    icon: Leaf,
    color: "#6A8A55",
    ja: [
      "私はヴィーガンです。",
      "肉・魚・卵・乳製品・だしは使わないでください。",
    ],
    zh: [
      "我是全素。",
      "不吃肉、魚、蛋、奶，",
      "也不能用任何動物高湯。",
    ],
  },
  {
    key: "vegetarian",
    label: "蛋奶素",
    icon: Carrot,
    color: "#C58B4B",
    ja: [
      "私はベジタリアンです。",
      "肉と魚は食べられません。",
      "卵や乳製品は大丈夫です。",
    ],
    zh: [
      "我是蛋奶素。",
      "不吃肉和魚。",
      "蛋和奶可以。",
    ],
  },
  {
    key: "no-meat",
    label: "不吃肉可吃魚",
    icon: Beef,
    ban: true,
    color: "#B85C5C",
    ja: [
      "肉は食べられません。",
      "魚料理は大丈夫です。",
    ],
    zh: [
      "不吃肉。",
      "魚類可以。",
    ],
  },
  {
    key: "no-five",
    label: "五辛素",
    icon: Sprout, // ✅ 原本 Garlic → 改為 Sprout
    ban: true,
    color: "#7A6A8A",
    ja: [
      "五葷は食べられません。",
      "にんにく・ねぎ・玉ねぎは使わないでください。",
    ],
    zh: [
      "不吃五辛（蔥、蒜、韭、洋蔥等）。",
      "請不要使用蒜、蔥、洋蔥。",
    ],
  },
];

export default function VegetarianCard({ onClose }) {
  const [active, setActive] = useState("vegan");
  const current = OPTIONS.find((o) => o.key === active);

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl p-6 shadow-xl">

        {/* 關閉 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center"
        >
          <X className="w-4 h-4 text-[#8C6A4F]" />
        </button>

        {/* 標題 */}
        <h2 className="text-lg font-bold text-[#5A4636] mb-4 text-center">
          素食說明卡（請出示給店員）
        </h2>

        {/* icon 切換區 */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const activeBtn = opt.key === active;

            return (
              <button
                key={opt.key}
                onClick={() => setActive(opt.key)}
                className={`relative flex flex-col items-center gap-1 py-2 rounded-2xl border transition
                  ${
                    activeBtn
                      ? "bg-[#F7F1EB] border-[#C6A087]"
                      : "bg-white border-[#E5D5C5]"
                  }`}
              >
                <div className="relative w-8 h-8 flex items-center justify-center">
                    {/* 原本 icon */}
                    <Icon
                        className="w-6 h-6"
                        style={{ color: opt.color }}
                    />

                    {/* 🚫 整個蓋住 */}
                    {opt.ban && (
                        <Ban
                            className="
                                absolute
                                -inset 1
                                w-[120%] h-[120%]
                                text-[#C65353]
                                opacity-100
                            "
                        />
                        )}
                    </div>
                <span className="text-[10px] text-[#5A4636] font-medium">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 日文（大字，給店員看） */}
        <div className="space-y-2 text-lg text-[#33241A] font-serif">
          {current.ja.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* 中文補充 */}
        <div className="mt-4 text-sm text-[#8C6A4F] leading-relaxed">
          {current.zh.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* 提示 */}
        <div className="mt-5 text-xs text-center text-[#A8937C]">
          ※ 點選上方圖示切換不同素食需求
        </div>
      </div>
    </div>
  );
}
