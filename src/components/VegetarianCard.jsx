// src/components/VegetarianCard.jsx
import React from "react";
import { X, Leaf, Sprout } from "lucide-react";

/**
 * type:
 * - vegan
 * - vegetarian
 * - noMeat
 * - noFive
 */
export default function VegetarianCard({ type = "vegetarian", onClose }) {
  const CONTENT = {
    vegan: {
      icon: Leaf,
      color: "#6A8A55",
      title: "ヴィーガンです",
      ja: [
        "私はヴィーガンです。",
        "肉・魚・卵・乳製品は食べられません。",
        "動物性のだしも使わないでください。",
      ],
      zh: [
        "我是全素（Vegan）。",
        "不吃肉、魚、蛋、奶。",
        "請不要使用任何動物性高湯。",
      ],
    },

    vegetarian: {
      icon: Sprout,
      color: "#8FB28F",
      title: "ベジタリアンです",
      ja: [
        "私はベジタリアンです。",
        "肉と魚は食べられません。",
        "卵と乳製品は大丈夫です。",
      ],
      zh: [
        "我是蛋奶素。",
        "不吃肉與魚。",
        "蛋和乳製品可以。",
      ],
    },

    noMeat: {
      icon: Leaf,
      color: "#C6A087",
      title: "肉は食べられません",
      ja: [
        "肉は食べられません。",
        "魚は大丈夫です。",
      ],
      zh: [
        "我不吃肉。",
        "魚類可以。",
      ],
    },

    noFive: {
      icon: Sprout,
      color: "#A8937C",
      title: "五葷抜きでお願いします",
      ja: [
        "五葷は食べられません。",
        "にんにく・ねぎ・にら等は避けてください。",
      ],
      zh: [
        "我不吃五辛。",
        "請避免蒜、蔥、韭菜等。",
      ],
    },
  };

  const data = CONTENT[type] || CONTENT.vegetarian;
  const Icon = data.icon;

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
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-6 h-6" style={{ color: data.color }} />
          <h2 className="text-lg font-bold text-[#5A4636]">
            {data.title}
          </h2>
        </div>

        {/* 日文（給店員看） */}
        <div className="space-y-2 text-lg text-[#33241A] font-serif">
          {data.ja.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* 中文補充 */}
        <div className="mt-4 text-sm text-[#8C6A4F] leading-relaxed">
          {data.zh.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* 提示 */}
        <div className="mt-5 text-xs text-center text-[#A8937C]">
          ※ 可直接出示給店員查看
        </div>
      </div>
    </div>
  );
}
