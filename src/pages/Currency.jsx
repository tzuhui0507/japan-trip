// src/pages/Currency.jsx
import React, { useEffect, useState } from "react";
import {
  Coins,
  RefreshCw,
  CreditCard,
  X,
  Star,
  Settings,
  BadgeDollarSign,
  Calculator,
} from "lucide-react";
import PageHeader from "../components/PageHeader";

const RATE_API_URL = "https://open.er-api.com/v6/latest/JPY";
const VIEWER_CURRENCY_KEY = "viewer_currency_v1";

const DEFAULT_CARDS = [
  {
    id: "card-default",
    name: "自訂支付",
    org: "VISA",
    feePercent: 1.5,
    cashbackPercent: 0,
    note: "",
    isPrimary: true,
  },
];

function createNewCard() {
  return {
    id: `card-${Date.now()}`,
    name: "新信用卡",
    org: "VISA",
    feePercent: 1.5,
    cashbackPercent: 0,
    note: "",
    isPrimary: false,
  };
}

function getOrgLogoSrc(org) {
  switch (org) {
    case "VISA":
      return "/cards/visa.svg";
    case "MasterCard":
      return "/cards/mastercard.svg";
    case "JCB":
      return "/cards/jcb.svg";
    default:
      return null;
  }
}

export default function Currency({ trip, setTrip }) {
  if (!trip) return null;

  // ======================================================
  // STEP 5：viewer-only 判斷
  // ======================================================
  const isViewer = trip?.shareMode === "viewer";
  const [viewerCurrency, setViewerCurrency] = useState(null);

  // ======================================================
  // 初始化（owner / viewer 分流）
  // ======================================================
  useEffect(() => {
    if (isViewer) {
      const raw = localStorage.getItem(VIEWER_CURRENCY_KEY);
      if (raw) {
        setViewerCurrency(JSON.parse(raw));
      } else {
        const init = trip.currency || {
          rate: null,
          rateUpdatedAt: "",
          cards: DEFAULT_CARDS,
          activeCardId: DEFAULT_CARDS[0].id,
          amountStr: "0",
        };
        localStorage.setItem(VIEWER_CURRENCY_KEY, JSON.stringify(init));
        setViewerCurrency(init);
      }
      return;
    }

    // owner 初始化（只做一次）
    if (!trip.currency) {
      setTrip((prev) => ({
        ...prev,
        currency: {
          rate: null,
          rateUpdatedAt: "",
          cards: DEFAULT_CARDS,
          activeCardId: DEFAULT_CARDS[0].id,
          amountStr: "0",
        },
      }));
    }
  }, [isViewer, trip, setTrip]);

  // ======================================================
  // 資料來源統一出口
  // ======================================================
  const currency = isViewer
    ? viewerCurrency || trip.currency
    : trip.currency;

  if (!currency) return null;

  const {
    rate,
    rateUpdatedAt,
    cards = DEFAULT_CARDS,
    activeCardId,
    amountStr,
  } = currency;

  // ======================================================
  // 寫回 helper（核心）
  // ======================================================
  const updateCurrency = (patch) => {
    if (isViewer) {
      setViewerCurrency((prev) => {
        const base = prev || currency;
        const next = { ...base, ...patch };
        localStorage.setItem(VIEWER_CURRENCY_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }

    setTrip((prev) => ({
      ...prev,
      currency: {
        ...prev.currency,
        ...patch,
      },
    }));
  };

  // ======================================================
  // Local UI state
  // ======================================================
  const [loadingRate, setLoadingRate] = useState(false);
  const [rateError, setRateError] = useState("");
  const [calcValue, setCalcValue] = useState(null);
  const [operator, setOperator] = useState(null);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardDraft, setCardDraft] = useState(createNewCard());

  // ======================================================
  // 匯率 API
  // ======================================================
  const fetchRate = async () => {
    setLoadingRate(true);
    setRateError("");

    try {
      const res = await fetch(RATE_API_URL);
      const json = await res.json();
      if (!json?.rates?.TWD) throw new Error();

      updateCurrency({
        rate: json.rates.TWD,
        rateUpdatedAt: json.time_last_update_utc || "",
      });
    } catch {
      setRateError("匯率取得失敗");
    } finally {
      setLoadingRate(false);
    }
  };

  // ======================================================
  // Active card
  // ======================================================
  const activeCard =
    cards.find((c) => c.id === activeCardId) ||
    cards.find((c) => c.isPrimary) ||
    cards[0];

  // ======================================================
  // 計算
  // ======================================================
  const amount = parseFloat(amountStr || "0") || 0;
  const baseResult = rate ? amount * rate : 0;
  const baseResultInt = Math.round(baseResult);

  const feePercent = Number(activeCard?.feePercent || 0);
  const cashbackPercent = Number(activeCard?.cashbackPercent || 0);

  const feeAmount = (baseResult * feePercent) / 100;
  const afterFee = baseResult + feeAmount;
  const cashbackAmount = (afterFee * cashbackPercent) / 100;
  const cardResultInt = Math.round(afterFee - cashbackAmount);

  // ======================================================
  // Card actions
  // ======================================================
  const openNewCardModal = () => {
    setEditingCardId(null);
    setCardDraft(createNewCard());
    setCardModalOpen(true);
  };

  const openEditCardModal = () => {
    if (!activeCard) return;
    setEditingCardId(activeCard.id);
    setCardDraft({ ...activeCard });
    setCardModalOpen(true);
  };

  const closeCardModal = () => setCardModalOpen(false);

  const saveCardFromDraft = () => {
    let updated = [...cards];

    if (cardDraft.isPrimary) {
      updated = updated.map((c) => ({ ...c, isPrimary: false }));
    }

    if (editingCardId) {
      updated = updated.map((c) =>
        c.id === editingCardId ? { ...cardDraft, id: editingCardId } : c
      );
      updateCurrency({ cards: updated, activeCardId: editingCardId });
    } else {
      const newCard = { ...cardDraft, id: `card-${Date.now()}` };
      updated.push(newCard);
      updateCurrency({ cards: updated, activeCardId: newCard.id });
    }

    setCardModalOpen(false);
  };

  const deleteCurrentCard = () => {
    const remain = cards.filter((c) => c.id !== editingCardId);
    const fallback = remain.length ? remain : DEFAULT_CARDS;
    updateCurrency({
      cards: fallback,
      activeCardId: fallback[0].id,
    });
    setCardModalOpen(false);
  };

  const setPrimaryCard = (cardId) => {
    updateCurrency({
      cards: cards.map((c) => ({
        ...c,
        isPrimary: c.id === cardId,
      })),
      activeCardId: cardId,
    });
  };

  // ======================================================
  // Keypad
  // ======================================================
  const keypadButtons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["00", "0", ".", "+"],
    ["C", "DEL", "="],
  ];

  const handleKeypad = (key) => {
    if (key === "C") {
      updateCurrency({ amountStr: "0" });
      setCalcValue(null);
      setOperator(null);
      return;
    }

    if (key === "DEL") {
      updateCurrency({
        amountStr:
          amountStr.slice(0, -1) === "" ? "0" : amountStr.slice(0, -1),
      });
      return;
    }

    if (["+", "-", "×", "÷"].includes(key)) {
      setCalcValue(parseFloat(amountStr));
      setOperator(key);
      updateCurrency({ amountStr: "0" });
      return;
    }

    if (key === "=" && operator && calcValue !== null) {
      const current = parseFloat(amountStr);
      let result = calcValue;

      switch (operator) {
        case "+":
          result = calcValue + current;
          break;
        case "-":
          result = calcValue - current;
          break;
        case "×":
          result = calcValue * current;
          break;
        case "÷":
          result = current === 0 ? 0 : calcValue / current;
          break;
      }

      updateCurrency({ amountStr: String(result) });
      setCalcValue(null);
      setOperator(null);
      return;
    }

    if (key === "." && amountStr.includes(".")) return;

    if (key === "00") {
      updateCurrency({
        amountStr: amountStr === "0" ? "0" : amountStr + "00",
      });
      return;
    }

    if (/^\d$/.test(key)) {
      updateCurrency({
        amountStr: amountStr === "0" ? key : amountStr + key,
      });
    }
  };

//---------------------------------------------------------
// UI
//---------------------------------------------------------
return (
<div className="pt-4 pb-24 px-4 space-y-6">
{/* Header */}
<PageHeader
icon={Coins}
title="匯率換算"
subtitle="CURRENCY CONVERTER"
/>

{/* 匯率資訊 */}
<section className="rounded-3xl border border-[#E5D5C5] bg-[#FFF9F2] px-4 py-3 flex items-center justify-between text-xs">
<div>
<p className="text-[11px] text-[#8C6A4F]">目前匯率</p>
<p className="mt-1 text-sm font-semibold text-[#5A4636]">
1 JPY ≈ {rate ? rate.toFixed(4) : "--"} TWD
</p>

{rateUpdatedAt && (
<p className="mt-1 text-[10px] text-[#C6A087]">
更新時間：{rateUpdatedAt}
</p>
)}

{rateError && (
<p className="mt-1 text-[10px] text-[#B43737]">{rateError}</p>
)}
</div>

<button
onClick={fetchRate}
className="flex flex-col items-center px-3 py-2 rounded-2xl border border-[#E5D5C5] bg-white text-[11px] text-[#8C6A4F]"
>
<RefreshCw
className={`w-4 h-4 mb-1 ${loadingRate ? "animate-spin" : ""}`}
/>
更新匯率
</button>
</section>

{/* ------------------------------
    ② 現金換算卡片（水平排版 + 無箭頭）
------------------------------ */}
<section>
  <div
    className="rounded-[22px] px-5 py-4 border border-[#E5E5E5] shadow-sm"
    style={{ background: "#F5F5F7" }}
  >
    {/* 上排：Icon + 換鈔 ⇆ 大數字（平行對齊） */}
    <div className="flex items-center justify-between mb-1">
      {/* 左側：Icon + 換鈔 */}
      <div className="flex items-center gap-2">
        <BadgeDollarSign className="w-8 h-8 text-[#6e6259]" />
        <p className="text-[24px] font-semibold text-[#333]">現金換算</p>
      </div>

      {/* 右側大數字 */}
      <div className="text-right leading-none">
        <p
          className="text-4xl font-extrabold"
          style={{
            background: "linear-gradient(90deg, #9C744F, #C58B4B)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {baseResultInt}
        </p>
        <p className="text-[12px] text-[#444] mt-1">新台幣 TWD</p>
      </div>
    </div>
  </div>
</section>

{/* 信用卡卡片 */}
<section>
  <div className="bg-[#FBF4EC] rounded-[24px] border border-[#E5D5C5] shadow-sm px-4 py-4">

    {/* 上排：LOGO + 主卡星星 */}
    <div className="flex items-center justify-between mb-3">
      {/* 卡組織 LOGO */}
      <div className="flex items-center gap-2">
        {activeCard && getOrgLogoSrc(activeCard.org) ? (
          <img
            src={getOrgLogoSrc(activeCard.org)}
            alt={activeCard.org}
            className="h-6 w-auto object-contain"
          />
        ) : (
          <span className="text-xs font-semibold text-[#5A4636]">
            {activeCard?.org}
          </span>
        )}
      </div>

      {/* 主卡星星 */}
      <button
        onClick={() => setPrimaryCard(activeCard.id)}
        className="w-8 h-8 rounded-full bg-white/80 border border-[#E5D5C5] flex items-center justify-center"
      >
        <Star
          className={`w-4 h-4 ${
            activeCard?.isPrimary
              ? "fill-[#C58B4B] text-[#C58B4B]"
              : "text-[#C6A087]"
          }`}
        />
      </button>
    </div>

    {/* 主列：左側標題 + 右側（手續費 + 回饋 + 金額） */}
    <div className="flex justify-between items-end">

      {/* 左側 — 信用卡 icon + 標題（靠左下） */}
      <div className="flex items-center gap-2">
        <CreditCard className="w-8 h-8 text-[#917c64]" />
        <p className="text-[24px] font-semibold text-[#5A4636]">
          {activeCard?.name}
        </p>
      </div>

      {/* 右側 — 手續費 + 回饋金 + 金額 */}
      <div className="text-right leading-tight">

        {/* 手續費 */}
        <p className="text-[11px] text-[#a59c93]">
          手續費：+{feeAmount.toFixed(2)} TWD（{feePercent.toFixed(1)}%）
        </p>

        {/* 回饋返還 */}
        <p className="text-[11px] text-[#a59c93] mb-1">
          回饋返還：-{cashbackAmount.toFixed(2)} TWD（
          {cashbackPercent.toFixed(1)}%）
        </p>

        {/* 大金額 */}
        <p
          className="text-4xl font-extrabold"
          style={{
            background: "linear-gradient(90deg, #9C744F, #C58B4B)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {cardResultInt}
        </p>
        <p className="text-[12px] text-[#5A4636]">新台幣 TWD</p>

      </div>
    </div>

  </div>
</section>

{/* Tabs */}
<section>
<div className="flex items-center justify-between gap-2">
<div className="flex-1 overflow-x-auto">
<div className="flex items-center gap-2 min-w-max py-1">
{cards.map((c) => (
<button
key={c.id}
onClick={() => {
  updateCurrency({ activeCardId: c.id });
}}
className={`px-3 py-1.5 rounded-full text-[11px] border ${
c.id === activeCardId
? "bg-[#C58B4B] border-[#C58B4B] text-white"
: "bg-white border-[#E5D5C5] text-[#5A4636]"
}`}
>
{c.name}
{c.isPrimary && " ⭐"}
</button>
))}

<button
onClick={openNewCardModal}
className="px-3 py-1.5 rounded-full text-[11px] bg-white border border-dashed border-[#C6A087] text-[#C6A087]"
>
＋ 新增信用卡
</button>
</div>
</div>

<button
onClick={openEditCardModal}
className="ml-2 flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#E5D5C5] bg-white text-[11px] text-[#5A4636]"
>
<Settings className="w-3.5 h-3.5" />
編輯
</button>
</div>
</section>

{/* 計算機 */}
<section>
<div className="rounded-3xl bg-[#69493A] text-white px-5 py-4 space-y-4">
{/* 上方顯示區 */}
<div className="flex items-center justify-between">
<div>
<p className="text-[12px] text-[#FFEBD8] mb-1">
輸入外幣金額
</p>
<p className="text-3xl font-bold">
{amountStr || "0"}
</p>
<p className="text-[12px] text-[#FFEBD8] mt-1">日圓 JPY</p>
</div>
<Calculator className="w-8 h-8 text-[#FFEBD8]" />
</div>

{/* 按鍵區（5 排，前 4 排 4 欄，第 5 排 "=" col-span-2） */}
<div className="space-y-2">
{keypadButtons.map((row, rowIndex) => (
<div
key={rowIndex}
className="grid grid-cols-4 gap-2"
>
{row.map((key) => (
<button
key={key}
type="button"
onClick={() => handleKeypad(key)}
className={[
"h-12 rounded-2xl text-lg font-semibold flex items-center justify-center",
key === "C" || key === "DEL"
? "bg-[#CBB193] text-[#fff3e6]"
: "bg-[#A98B73] text-white",
key === "=" ? "col-span-2" : "",
].join(" ")}
>
{key === "DEL" ? "⌫" : key}
</button>
))}
</div>
))}
</div>

<p className="text-[12px] text-right text-[#FFEBD8]">
※ 僅供估算，實際金額以銀行或發卡機構為準。
</p>
</div>
</section>

{/* Modal */}
{cardModalOpen && (
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
<div className="w-full max-w-md mx-4 bg-[#FFF9F2] rounded-3xl border border-[#E5D5C5] overflow-hidden">
{/* Header */}
<div className="px-4 py-3 flex items-center justify-between border-b border-[#E5D5C5]">
<h2 className="text-sm font-semibold text-[#5A4636] tracking-[0.1em]">
{editingCardId ? "編輯信用卡／支付方式" : "新增信用卡／支付方式"}
</h2>

<button
onClick={closeCardModal}
className="w-8 h-8 rounded-full border border-[#E5D5C5] bg-white flex items-center justify-center"
>
<X className="w-4 h-4 text-[#8C6A4F]" />
</button>
</div>

{/* Body */}
<div className="px-4 py-4 space-y-3 text-sm">
{/* 名稱 */}
<div>
<label className="text-xs text-[#8C6A4F]">名稱</label>
<input
value={cardDraft.name}
onChange={(e) =>
setCardDraft((p) => ({ ...p, name: e.target.value }))
}
className="w-full border rounded-md px-3 py-2 text-sm bg-white border-[#E5D5C5]"
/>
</div>

{/* 組織 */}
<div>
<label className="text-xs text-[#8C6A4F]">組織</label>
<select
value={cardDraft.org}
onChange={(e) =>
setCardDraft((p) => ({ ...p, org: e.target.value }))
}
className="w-full border rounded-md px-3 py-2 text-sm bg-white border-[#E5D5C5]"
>
<option value="VISA">VISA</option>
<option value="MasterCard">MasterCard</option>
<option value="JCB">JCB</option>
</select>
</div>

{/* 手續費與回饋 */}
<div className="grid grid-cols-2 gap-3">
<div>
<label className="text-xs text-[#8C6A4F]">
手續費 %
</label>
<input
type="number"
value={cardDraft.feePercent}
onChange={(e) =>
setCardDraft((p) => ({
...p,
feePercent: e.target.value,
}))
}
className="w-full border rounded-md px-3 py-2 text-sm bg-white border-[#E5D5C5]"
/>
</div>

<div>
<label className="text-xs text-[#8C6A4F]">
回饋 %
</label>
<input
type="number"
value={cardDraft.cashbackPercent}
onChange={(e) =>
setCardDraft((p) => ({
...p,
cashbackPercent: e.target.value,
}))
}
className="w-full border rounded-md px-3 py-2 text-sm bg-white border-[#E5D5C5]"
/>
</div>
</div>

{/* 主卡 */}
<div className="flex items-center gap-2 mt-1">
<input
type="checkbox"
checked={cardDraft.isPrimary}
onChange={(e) =>
setCardDraft((p) => ({
...p,
isPrimary: e.target.checked,
}))
}
/>
<label className="text-xs text-[#5A4636]">
設為主卡
</label>
</div>

{/* 備註 */}
<div>
<label className="text-xs text-[#8C6A4F]">備註</label>
<textarea
rows={2}
value={cardDraft.note}
onChange={(e) =>
setCardDraft((p) => ({ ...p, note: e.target.value }))
}
className="w-full border rounded-md px-3 py-2 text-sm bg-white border-[#E5D5C5]"
/>
</div>
</div>

{/* Footer */}
<div className="px-4 py-3 border-t border-[#E5D5C5] bg-[#FFF3E3] flex justify-between">
{editingCardId && cards.length > 1 && (
<button
onClick={deleteCurrentCard}
className="px-3 py-1.5 rounded-full text-xs text-[#B43737] border border-[#F1C8C8] bg-white"
>
刪除這張卡
</button>
)}

<div className="ml-auto flex gap-2">
<button
onClick={closeCardModal}
className="px-3 py-1.5 rounded-full text-xs text-[#8C6A4F] border border-[#E5D5C5] bg-white"
>
取消
</button>

<button
type="button"
onClick={saveCardFromDraft}
className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#C6A087]"
>
儲存
</button>
</div>
</div>
</div>
</div>
)}
</div>
);
}