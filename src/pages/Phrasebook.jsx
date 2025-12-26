// src/pages/Phrasebook.jsx
import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import VegetarianCard from "../components/VegetarianCard";
import {
  Volume2,
  Languages,
  Smile,
  UtensilsCrossed,
  ShoppingBag,
  Bus,
  AlertCircle,
  Leaf,
  Sprout,
} from "lucide-react";

const PHRASES = {
  basic: [
    { ja: "こんにちは", romaji: "Konnichiwa", zh: "你好" },
    { ja: "ありがとうございます", romaji: "Arigatō gozaimasu", zh: "謝謝您" },
    { ja: "すみません", romaji: "Sumimasen", zh: "不好意思／對不起／勞駕" },
    { ja: "お願いします", romaji: "Onegai shimasu", zh: "拜託你／麻煩你了" },
    { ja: "大丈夫です", romaji: "Daijōbu desu", zh: "沒問題／不用了，謝謝" },
    { ja: "はい", romaji: "Hai", zh: "是 / 好的" },
    { ja: "いいえ", romaji: "Iie", zh: "不是 / 不要" },
  ],

  transport: [
    { ja: "◯◯駅はどこですか？", romaji: "◯◯-eki wa doko desu ka?", zh: "◯◯車站在哪裡？" },
    { ja: "この電車は◯◯へ行きますか？", romaji: "Kono densha wa ◯◯ e ikimasu ka?", zh: "這班電車有到◯◯嗎？" },
    { ja: "切符はどこで買えますか？", romaji: "Kippu wa doko de kaemasu ka?", zh: "車票在哪裡可以買？" },
    { ja: "一日券はありますか？", romaji: "Ichinichi-ken wa arimasu ka?", zh: "有一日券嗎？" },
    { ja: "次の電車は何時ですか？", romaji: "Tsugi no densha wa nan-ji desu ka?", zh: "下一班電車是幾點？" },
    { ja: "ここで降ります", romaji: "Koko de orimasu", zh: "我要在這裡下車" },
  ],

  food: [
    { ja: "ひとりです", romaji: "Hitori desu", zh: "一位" },
    { ja: "二人です", romaji: "Futari desu", zh: "兩位" },
    { ja: "おすすめはありますか？", romaji: "Osusume wa arimasu ka?", zh: "有推薦的嗎？" },
    { ja: "辛くしないでください", romaji: "Karakushinaide kudasai", zh: "請不要做太辣" },
    { ja: "お会計をお願いします", romaji: "O-kaikei o onegai shimasu", zh: "請結帳" },
    { ja: "私はベジタリアンです", romaji: "Watashi wa bejitarian desu", zh: "我是素食主義者" },
    { ja: "肉と魚は食べられません", romaji: "Niku to sakana wa taberaremasen", zh: "我不吃肉和魚" },
    { ja: "これは肉が入っていますか？", romaji: "Kore wa niku ga haitte imasu ka?", zh: "這個有肉嗎？" },
    { ja: "アレルギーがあります", romaji: "Arerugī ga arimasu", zh: "我有過敏" },
  ],

  shopping: [
    { ja: "税金は含まれていますか？", romaji: "Zeikin wa fukumarete imasu ka?", zh: "有含稅嗎？" },
    { ja: "免税できますか？", romaji: "Menzei dekimasu ka?", zh: "可以免稅嗎？" },
    { ja: "試着してもいいですか？", romaji: "Shichaku shite mo ii desu ka?", zh: "可以試穿嗎？" },
    { ja: "他の色はありますか？", romaji: "Hoka no iro wa arimasu ka?", zh: "有其他顏色嗎？" },
    { ja: "これください", romaji: "Kore kudasai", zh: "我要這個" },
    { ja: "少し高いです", romaji: "Sukoshi takai desu", zh: "有點貴" },
  ],

  emergency: [
    { ja: "道に迷いました", romaji: "Michi ni mayoi mashita", zh: "我迷路了" },
    { ja: "助けてください", romaji: "Tasukete kudasai", zh: "請幫幫我" },
    { ja: "具合が悪いです", romaji: "Guai ga warui desu", zh: "我身體不舒服" },
    { ja: "日本語があまり分かりません", romaji: "Nihongo ga amari wakarimasen", zh: "我不太懂日文" },
    { ja: "病院に行きたいです", romaji: "Byōin ni ikitai desu", zh: "我想去醫院" },
    { ja: "警察を呼んでください", romaji: "Keisatsu o yonde kudasai", zh: "請幫我叫警察" },
  ],
};

const CATEGORIES = [
  { key: "basic", label: "基本用語", icon: Smile },
  { key: "transport", label: "交通", icon: Bus },
  { key: "food", label: "餐廳", icon: UtensilsCrossed },
  { key: "shopping", label: "購物", icon: ShoppingBag },
  { key: "emergency", label: "緊急", icon: AlertCircle },
];

export default function Phrasebook() {
  const [active, setActive] = useState("basic");
  const [showVegCard, setShowVegCard] = useState(false);
  const [vegType, setVegType] = useState(null);

  const speak = (text) => {
    if (!window.speechSynthesis) {
      alert("此裝置不支援語音播放");
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="pt-4 pb-24 space-y-6">
      <PageHeader
        icon={Languages}
        title="日語基礎會話"
        subtitle="JAPANESE PHRASEBOOK"
      />

      {/* 類別切換 */}
      <section className="bg-[#FFF9F2] border border-[#E5D5C5] rounded-3xl px-4 py-3">
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const activeCat = active === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActive(cat.key)}
                className={`flex items-center justify-center gap-1 px-2 py-2 rounded-2xl border ${
                  activeCat
                    ? "bg-[#8C6A4F] border-[#8C6A4F] text-white"
                    : "bg-white border-[#E5D5C5] text-[#5A4636]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Food 專用：素食卡按鈕 */}
      {active === "food" && (
        <div className="space-y-3">

            <div className="grid grid-cols-2 gap-2">
            <button
                onClick={() => setVegType("vegan")}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#6A8A55] text-white text-sm font-semibold"
            >
                <Leaf className="w-4 h-4" />
                全素 Vegan
            </button>

            <button
                onClick={() => setVegType("vegetarian")}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#8FB28F] text-white text-sm font-semibold"
            >
                <Sprout className="w-4 h-4" />
                蛋奶素
            </button>

            <button
                onClick={() => setVegType("noMeat")}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#C6A087] text-white text-sm font-semibold"
            >
                <Leaf className="w-4 h-4" />
                不吃肉（可魚）
            </button>

            <button
                onClick={() => setVegType("noFive")}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#A8937C] text-white text-sm font-semibold"
            >
                <Sprout className="w-4 h-4" />
                五辛素
            </button>
            </div>

            {/* 素食卡片 */}
            {vegType && (
            <VegetarianCard
                type={vegType}
                onClose={() => setVegType(null)}
            />
            )}
        </div>
        )}

      {/* 句子列表 */}
      <section className="space-y-3">
        {PHRASES[active].map((p, idx) => (
          <div
            key={`${active}-${idx}`}
            className="bg-white rounded-3xl border border-[#E5D5C5] px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-serif font-semibold text-[#33241A]">
                {p.ja}
              </span>
              <button
                onClick={() => speak(p.ja)}
                className="w-8 h-8 rounded-full border border-[#E5D5C5] bg-[#F7F1EB] flex items-center justify-center"
              >
                <Volume2 className="w-4 h-4 text-[#8C6A4F]" />
              </button>
            </div>

            <p className="text-[11px] text-[#A8937C] italic">{p.romaji}</p>
            <p className="mt-1 text-sm text-[#5A4636]">{p.zh}</p>
          </div>
        ))}
      </section>

      {/* 素食卡 Modal */}
      {showVegCard && (
        <VegetarianCard onClose={() => setShowVegCard(false)} />
      )}
    </div>
  );
}
