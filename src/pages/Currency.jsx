// src/pages/Currency.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Coins,
  RefreshCw,
  CreditCard,
  X,
  Star,
  Settings,
  BadgeDollarSign,
  ArrowRightLeft,
  PlusCircle,
  Info
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { THEMES } from "../App";

const VIEWER_CURRENCY_KEY = "viewer_currency_v1";

const CURRENCIES = {
  JPY: { code: "JPY", symbol: "¥" },
  KRW: { code: "KRW", symbol: "₩" },
  EUR: { code: "EUR", symbol: "€" },
  USD: { code: "USD", symbol: "$" },
  HKD: { code: "HKD", symbol: "HK$" },
  THB: { code: "THB", symbol: "฿" },
  TWD: { code: "TWD", symbol: "NT$" },
  SGD: { code: "SGD", symbol: "$" },
  VND: { code: "VND", symbol: "₫" },
  GBP: { code: "GBP", symbol: "£" },
  CNY: { code: "CNY", symbol: "¥" },
};

const DEFAULT_CARDS = [
  {
    id: "card-default",
    name: "預設支付",
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

export default function Currency({ trip, setTrip, themeId }) {
  const isViewer = trip?.shareMode === "viewer";
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;

  const baseCurrency = typeof trip.currency === 'string' ? trip.currency : "JPY";
  const currencyInfo = CURRENCIES[baseCurrency] || CURRENCIES.JPY;

  const [viewerCurrencyData, setViewerCurrencyData] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [rateError, setRateError] = useState("");
  const [calcValue, setCalcValue] = useState(null);
  const [operator, setOperator] = useState(null);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardDraft, setCardDraft] = useState(createNewCard());

  useEffect(() => {
    if (!trip) return;
    if (isViewer) {
      const raw = localStorage.getItem(VIEWER_LUGGAGE_KEY); // 注意：應與 TripDetail 邏輯一致，若原為 VIEWER_CURRENCY_KEY 請保留
      const storageKey = VIEWER_CURRENCY_KEY;
      const rawCurrency = localStorage.getItem(storageKey);
      if (rawCurrency) { setViewerCurrencyData(JSON.parse(rawCurrency)); }
    }
  }, [trip, isViewer]);

  const currencyData = isViewer ? viewerCurrencyData : (trip?.currencyData || {});
  const { 
    rate = 0, 
    cards = DEFAULT_CARDS, 
    activeCardId = null, 
    amountStr = "0" 
  } = currencyData || {};

  // --- 新增：動態匯率精度處理 (方法 1) ---
  const formatRate = (r) => {
    if (!r) return "--";
    // 針對面額極小的幣別（如 VND），擴充到 5 位小數
    return r < 0.1 ? r.toFixed(5) : r.toFixed(2);
  };

  // --- 新增：金額格式化處理 (方法 4) ---
  const formatAmountDisplay = (str) => {
    if (str === "0") return "0";
    const num = parseFloat(str);
    if (isNaN(num)) return str;
    // 分割小數點，只對整數部分做千分位
    const parts = str.split(".");
    parts[0] = parseInt(parts[0]).toLocaleString();
    return parts.join(".");
  };

  const updateCurrencyData = (patch) => {
    if (isViewer) {
      setViewerCurrencyData((prev) => {
        const base = prev || {};
        const next = { ...base, ...patch };
        localStorage.setItem(VIEWER_CURRENCY_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setTrip((prev) => ({
        ...prev,
        currencyData: { ...(prev.currencyData || {}), ...patch },
      }));
    }
  };

  const fetchRate = async (code = baseCurrency) => {
    setLoadingRate(true);
    setRateError("");
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${code}`);
      const json = await res.json();
      if (!json?.rates?.TWD) throw new Error();
      updateCurrencyData({
        rate: json.rates.TWD,
        rateUpdatedAt: json.time_last_update_utc || "",
      });
    } catch {
      setRateError("匯率取得失敗");
    } finally {
      setLoadingRate(false);
    }
  };

  useEffect(() => {
    fetchRate(baseCurrency);
  }, [baseCurrency]);

  const activeCard = cards.find((c) => c.id === activeCardId) || cards.find((c) => c.isPrimary) || cards[0];
  const amount = parseFloat(amountStr || "0") || 0;
  
  // 計算結果統一加上千分位顯示
  const baseResultInt = Math.round(rate ? amount * rate : 0);
  const feeAmount = (baseResultInt * (activeCard?.feePercent || 0)) / 100;
  const cardResultInt = Math.round(baseResultInt + feeAmount - (baseResultInt + feeAmount) * (activeCard?.cashbackPercent || 0) / 100);

  const handleKeypad = (key) => {
    if (key === "C") { updateCurrencyData({ amountStr: "0" }); setCalcValue(null); setOperator(null); return; }
    if (key === "DEL") { updateCurrencyData({ amountStr: amountStr.length > 1 ? amountStr.slice(0, -1) : "0" }); return; }
    if (["+", "-", "×", "÷"].includes(key)) { setCalcValue(parseFloat(amountStr)); setOperator(key); updateCurrencyData({ amountStr: "0" }); return; }
    if (key === "=" && operator && calcValue !== null) {
      const current = parseFloat(amountStr);
      let res = calcValue;
      if (operator === "+") res += current;
      else if (operator === "-") res -= current;
      else if (operator === "×") res *= current;
      else if (operator === "÷") res = current === 0 ? 0 : res / current;
      updateCurrencyData({ amountStr: String(Math.round(res * 100) / 100) });
      setCalcValue(null); setOperator(null);
      return;
    }
    const nextStr = amountStr === "0" ? (key === "." ? "0." : key) : amountStr + key;
    if (nextStr.length < 15) updateCurrencyData({ amountStr: nextStr }); // 寬容度增加，因應大面額幣別
  };

  const keypadButtons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["00", "0", ".", "+"],
    ["C", "DEL", "="],
  ];

  const openNewCardModal = () => { setEditingCardId(null); setCardDraft(createNewCard()); setCardModalOpen(true); };
  const openEditCardModal = () => { if (!activeCard) return; setEditingCardId(activeCard.id); setCardDraft({ ...activeCard }); setCardModalOpen(true); };
  const closeCardModal = () => setCardModalOpen(false);
  const saveCardFromDraft = () => {
    let updated = [...cards];
    if (cardDraft.isPrimary) updated = updated.map((c) => ({ ...c, isPrimary: false }));
    if (editingCardId) { updated = updated.map((c) => c.id === editingCardId ? { ...cardDraft, id: editingCardId } : c); updateCurrencyData({ cards: updated, activeCardId: editingCardId }); }
    else { const newCard = { ...cardDraft, id: `card-${Date.now()}` }; updated.push(newCard); updateCurrencyData({ cards: updated, activeCardId: newCard.id }); }
    setCardModalOpen(false);
  };
  const deleteCurrentCard = () => { const remain = cards.filter((c) => c.id !== editingCardId); const fallback = remain.length ? remain : DEFAULT_CARDS; updateCurrencyData({ cards: fallback, activeCardId: fallback[0].id }); setCardModalOpen(false); };

  return (
    <div className="pt-4 pb-24 px-4 space-y-10 min-h-screen">
      <PageHeader icon={Coins} title="匯率換算" subtitle="CURRENCY" themeId={themeId} />

      <section className="relative px-2">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-1">
             <div className="flex items-center justify-center gap-3 mb-6">
                <button 
                  onClick={() => fetchRate()} 
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all bg-white shadow-sm border ${loadingRate ? 'opacity-50' : 'active:scale-95'}`} 
                  style={{ color: currentTheme.main, borderColor: `${currentTheme.main}20` }}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingRate ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] font-black tracking-wider">
                    1 {baseCurrency} ≈ {formatRate(rate)} TWD
                  </span>
                </button>
             </div>
             <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black tracking-tighter" style={{ color: currentTheme.text }}>{currencyInfo.symbol}</span>
                {/* 套用千分位顯示 (方法 4) */}
                <h2 className="text-7xl font-black tracking-tighter" style={{ color: currentTheme.text }}>{formatAmountDisplay(amountStr)}</h2>
             </div>
          </div>

          <div className="relative flex items-center justify-center w-full px-8">
             <div className="h-[2px] flex-1 opacity-50" style={{ background: `linear-gradient(to right, transparent, ${currentTheme.main})` }} />
             <div className="mx-6 p-4 rounded-full border bg-white shadow-md rotate-90 scale-110" style={{ borderColor: `${currentTheme.main}30`, color: currentTheme.main }}>
                <ArrowRightLeft className="w-5 h-5" />
             </div>
              <div className="h-[2px] flex-1 opacity-50" style={{ background: `linear-gradient(to left, transparent, ${currentTheme.main})` }} />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full px-1">
             <div className="bg-white rounded-[2.5rem] p-5 border shadow-sm flex flex-col items-center justify-center relative overflow-hidden transition-all" 
                  style={{ borderColor: `${currentTheme.main}20` }}>
                <div className="absolute -bottom-3 -left-2 opacity-[0.15] pointer-events-none rotate-12">
                   <BadgeDollarSign className="w-16 h-16" style={{ color: currentTheme.main }} />
                </div>
                <div className="flex items-center gap-1.5 mb-2 opacity-50">
                   <BadgeDollarSign className="w-4 h-4" />
                   <span className="text-[12px] font-black uppercase tracking-widest">現金換算</span>
                </div>
                <div className="flex flex-col items-center z-10">
                   <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-black tracking-tighter" style={{ color: currentTheme.main }}>NT$</span>
                      <span className="text-3xl font-black tracking-tighter" style={{ color: currentTheme.main }}>{baseResultInt.toLocaleString()}</span>
                   </div>
                </div>
             </div>
             
             <div className="bg-white rounded-[2.5rem] p-5 border shadow-sm flex flex-col items-center justify-center relative overflow-hidden transition-all" 
                  style={{ borderColor: `${currentTheme.main}20` }}>
                <div className="absolute -bottom-3 -right-2 opacity-[0.15] pointer-events-none -rotate-12">
                   <CreditCard className="w-16 h-16" style={{ color: currentTheme.main }} />
                </div>
                <button onClick={openEditCardModal} className="absolute top-3 right-5 opacity-20 hover:opacity-100 transition-opacity"><Settings className="w-3.5 h-3.5" /></button>
                <div className="flex items-center gap-1.5 mb-2 opacity-50">
                   <CreditCard className="w-4 h-4" />
                   <span className="text-[12px] font-black uppercase truncate max-w-[70px]">{activeCard?.name}</span>
                </div>
                <div className="flex flex-col items-center z-10">
                   <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-black tracking-tighter" style={{ color: currentTheme.main }}>NT$</span>
                      <span className="text-3xl font-black tracking-tighter" style={{ color: currentTheme.main }}>{cardResultInt.toLocaleString()}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
           <h3 className="text-[14px] font-black uppercase tracking-[0.2em] opacity-70 shrink-0" style={{ color: currentTheme.text }}>信用卡選單</h3>
            <div className="h-[2px] flex-1 rounded-full opacity-50" style={{ background: `linear-gradient(to right, ${currentTheme.main}, transparent)` }} />
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-1 py-1">
          {cards.map((c) => (
            <button key={c.id} onClick={() => updateCurrencyData({ activeCardId: c.id })}
                    className="relative shrink-0 w-44 h-28 rounded-[2.2rem] border-2 transition-all p-5 flex flex-col justify-between overflow-hidden shadow-sm active:scale-95"
                    style={{ 
                      borderColor: c.id === activeCardId ? currentTheme.main : `${currentTheme.main}10`,
                      backgroundColor: c.id === activeCardId ? `${currentTheme.main}05` : "white"
                    }}>
              <div className="flex justify-between items-start">
                <CreditCard className={`w-6 h-6 ${c.id === activeCardId ? "opacity-100" : "opacity-20"}`} style={{ color: currentTheme.main }} />
                {c.isPrimary && <Star className="w-4 h-4 fill-current text-yellow-400" />}
              </div>
              <div className="text-left space-y-0.5">
                <p className={`text-sm font-black truncate ${c.id === activeCardId ? "opacity-100" : "opacity-60"}`} style={{ color: currentTheme.text }}>{c.name}</p>
                <div className="flex gap-2 text-[9px] font-bold opacity-30">
                  <span>手續費 {c.feePercent}%</span>
                  <span>回饋金 {c.cashbackPercent}%</span>
                </div>
              </div>
               {c.id === activeCardId && <div className="absolute -right-2 -bottom-2 w-10 h-10 rounded-full opacity-20" style={{ backgroundColor: currentTheme.main }} />}
            </button>
          ))}
          <button onClick={openNewCardModal} className="shrink-0 w-44 h-28 rounded-[2.2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 opacity-40 active:scale-95 transition-all" style={{ borderColor: `${currentTheme.main}40`, color: currentTheme.text }}>
             <PlusCircle className="w-6 h-6" />
             <span className="text-[10px] font-black uppercase tracking-wider">新增卡片</span>
          </button>
        </div>
      </section>

      <section className="pt-2 px-1">
        <div className="grid grid-cols-4 gap-3.5">
          {keypadButtons.flat().map((key) => {
            const isOperator = ["÷", "×", "-", "+", "="].includes(key);
            const isSpecial = ["C", "DEL"].includes(key);
            return (
              <button key={key} onClick={() => handleKeypad(key)}
                      className={`h-16 rounded-[1.8rem] text-lg font-black transition-all active:scale-90 shadow-sm flex items-center justify-center
                        ${key === "=" ? "col-span-2" : "bg-white"}
                      `}
                      style={{ 
                        backgroundColor: key === "=" ? currentTheme.main : "white",
                        color: key === "=" ? "white" : (isSpecial ? "#ff5a5a" : (isOperator ? currentTheme.main : currentTheme.text)),
                      }}>
                {key === "DEL" ? "⌫" : key}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 opacity-30 py-4 px-8 text-center">
         <div className="p-1 rounded-full border border-current">
          <Info className="w-3 h-3 shrink-0" />
         </div>
         <p className="text-[10px] font-bold leading-relaxed">僅供估算，實際金額以銀行發卡機構為準。</p>
      </div>

      {cardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-end z-[200]">
          <div className="w-full bg-white rounded-t-[3.5rem] p-10 space-y-8 shadow-2xl border-t" style={{ borderColor: `${currentTheme.main}20` }}>
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-black tracking-tight" style={{ color: currentTheme.text }}>{editingCardId ? "編輯支付" : "新增支付"}</h2>
               <button onClick={closeCardModal} className="p-2 rounded-full bg-gray-100"><X className="w-5 h-5 opacity-40" /></button>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">卡片名稱</label>
                  <input value={cardDraft.name} onChange={(e) => setCardDraft(p=>({...p, name: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 outline-none font-black text-lg" style={{ "--tw-ring-color": currentTheme.main }} placeholder="卡片名稱" />
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">手續費 %</label>
                    <input type="number" value={cardDraft.feePercent} onChange={(e) => setCardDraft(p=>({...p, feePercent: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 outline-none font-bold text-lg" style={{ "--tw-ring-color": currentTheme.main }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">回饋 %</label>
                    <input type="number" value={cardDraft.cashbackPercent} onChange={(e) => setCardDraft(p=>({...p, cashbackPercent: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 outline-none font-bold text-lg" style={{ "--tw-ring-color": currentTheme.main }} />
                  </div>
               </div>

               <div className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 cursor-pointer" onClick={() => setCardDraft(p => ({...p, isPrimary: !p.isPrimary}))}>
                  <div className="flex items-center gap-3">
                     <Star className={`w-5 h-5 ${cardDraft.isPrimary ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                     <span className="text-sm font-black opacity-70">設為主要卡片</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${cardDraft.isPrimary ? '' : 'bg-gray-200'}`} style={{ backgroundColor: cardDraft.isPrimary ? currentTheme.main : '' }}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${cardDraft.isPrimary ? 'right-1' : 'left-1'}`} />
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-4">
               {editingCardId && <button onClick={deleteCurrentCard} className="flex-1 py-5 rounded-[1.5rem] border border-red-100 text-red-500 text-sm font-black">刪除</button>}
               <button onClick={saveCardFromDraft} className="flex-[2] py-5 rounded-[1.5rem] text-white text-sm font-black shadow-xl" style={{ backgroundColor: currentTheme.main }}>確認儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}