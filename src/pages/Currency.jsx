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
  Info,
  Calculator
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

  const [viewerCurrencyData, setViewerCurrencyData] = useState({
    rate: 0,
    cards: DEFAULT_CARDS,
    activeCardId: "card-default",
    amountStr: "0"
  });

  const [loadingRate, setLoadingRate] = useState(false);
  const [rateError, setRateError] = useState("");
  const [calcValue, setCalcValue] = useState(null);
  const [operator, setOperator] = useState(null);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardDraft, setCardDraft] = useState(createNewCard());

  // 用於處理下滑關閉的手勢起點
  const touchStartY = useRef(0);

  useEffect(() => {
    if (!trip) return;
    if (isViewer) {
      const storageKey = VIEWER_CURRENCY_KEY;
      const rawCurrency = localStorage.getItem(storageKey);
      if (rawCurrency) { 
        try { setViewerCurrencyData(JSON.parse(rawCurrency)); } catch(e) { console.error(e); }
      }
    }
  }, [trip, isViewer]);

  const currencyData = isViewer ? viewerCurrencyData : (trip?.currencyData || {});
  const { rate = 0, cards = DEFAULT_CARDS, activeCardId = "card-default", amountStr = "0" } = currencyData;

  const formatRate = (r) => {
    if (!r) return "--";
    return r < 0.1 ? r.toFixed(5) : r.toFixed(2);
  };

  const formatAmountDisplay = (str) => {
    if (!str || str === "0") return "0";
    const parts = str.split(".");
    parts[0] = parseInt(parts[0] || 0).toLocaleString();
    return parts.join(".");
  };

  const updateCurrencyData = (patch) => {
    if (isViewer) {
      setViewerCurrencyData((prev) => {
        const next = { ...prev, ...patch };
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
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${code}`);
      const json = await res.json();
      if (!json?.rates?.TWD) throw new Error();
      updateCurrencyData({ rate: json.rates.TWD });
    } catch { setRateError("失敗"); } finally { setLoadingRate(false); }
  };

  useEffect(() => { fetchRate(baseCurrency); }, [baseCurrency]);

  const activeCard = cards.find((c) => c.id === activeCardId) || cards[0];
  const amount = parseFloat(amountStr) || 0;
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
    if (nextStr.length < 15) updateCurrencyData({ amountStr: nextStr });
  };

  const keypadButtons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["00", "0", ".", "+"],
    ["C", "DEL", "="],
  ];

  // 下滑關閉邏輯
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY - touchStartY.current > 100) { setKeypadOpen(false); }
  };

  return (
    <div className="pt-4 pb-20 px-3 space-y-4 h-[calc(100dvh-64px)] overflow-hidden flex flex-col">
      <PageHeader icon={Coins} title="匯率換算" subtitle="CURRENCY" themeId={themeId} />

      <div className="flex-1 flex flex-col justify-between">
        <section className="relative px-1">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-3 mb-1">
                <button 
                  onClick={() => fetchRate()} 
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white shadow-sm border ${loadingRate ? 'opacity-50' : 'active:scale-95'}`} 
                  style={{ color: currentTheme.main, borderColor: `${currentTheme.main}20` }}
                >
                  <RefreshCw className={`w-3 h-3 ${loadingRate ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] font-black tracking-wider">
                    1 {baseCurrency} ≈ {formatRate(rate)} TWD
                  </span>
                </button>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-black tracking-tighter" style={{ color: currentTheme.text }}>{currencyInfo.symbol}</span>
                <h2 className="text-6xl font-black tracking-tighter" style={{ color: currentTheme.text }}>{formatAmountDisplay(amountStr)}</h2>
              </div>
            </div>

            <div className="relative flex items-center justify-center w-full px-4">
              <div className="h-[1px] flex-1 opacity-30" style={{ background: `linear-gradient(to right, transparent, ${currentTheme.main})` }} />
              <div className="flex gap-4 mx-4">
                <div className="p-3 rounded-full border bg-white shadow-sm rotate-90" style={{ borderColor: `${currentTheme.main}30`, color: currentTheme.main }}>
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <button 
                  onClick={() => setKeypadOpen(true)}
                  className="p-3 rounded-full border bg-white shadow-md transition-transform active:scale-90" 
                  style={{ borderColor: currentTheme.main, color: currentTheme.main }}
                >
                  <Calculator className="w-5 h-5" />
                </button>
              </div>
              <div className="h-[1px] flex-1 opacity-30" style={{ background: `linear-gradient(to left, transparent, ${currentTheme.main})` }} />
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-white rounded-[2rem] p-4 border shadow-sm flex flex-col items-center justify-center relative overflow-hidden" 
                   style={{ borderColor: `${currentTheme.main}20` }}>
                <div className="absolute -bottom-3 -left-2 opacity-[0.15] rotate-12"><BadgeDollarSign className="w-14 h-14" style={{ color: currentTheme.main }} /></div>
                <div className="flex items-center gap-1.5 mb-1 opacity-50"><BadgeDollarSign className="w-4 h-4" /><span className="text-[11px] font-black uppercase tracking-widest">現金換算</span></div>
                <div className="flex flex-col items-center z-10">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-black tracking-tighter" style={{ color: currentTheme.main }}>NT$</span>
                    <span className="text-2xl font-black tracking-tighter" style={{ color: currentTheme.main }}>{baseResultInt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-[2rem] p-4 border shadow-sm flex flex-col items-center justify-center relative overflow-hidden" 
                   style={{ borderColor: `${currentTheme.main}20` }}>
                <div className="absolute -bottom-3 -right-2 opacity-[0.15] -rotate-12"><CreditCard className="w-14 h-14" style={{ color: currentTheme.main }} /></div>
                <button onClick={() => { if (!activeCard) return; setEditingCardId(activeCard.id); setCardDraft({ ...activeCard }); setCardModalOpen(true); }} className="absolute top-2 right-4 opacity-20 hover:opacity-100"><Settings className="w-3 h-3" /></button>
                <div className="flex items-center gap-1.5 mb-1 opacity-50"><CreditCard className="w-4 h-4" /><span className="text-[11px] font-black uppercase truncate max-w-[60px]">{activeCard?.name}</span></div>
                <div className="flex flex-col items-center z-10">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-black tracking-tighter" style={{ color: currentTheme.main }}>NT$</span>
                    <span className="text-2xl font-black tracking-tighter" style={{ color: currentTheme.main }}>{cardResultInt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2 mt-4">
          <div className="flex items-center gap-3 px-1">
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] opacity-60 shrink-0" style={{ color: currentTheme.text }}>信用卡選單</h3>
            <div className="h-[1px] flex-1 rounded-full opacity-30" style={{ background: `linear-gradient(to right, ${currentTheme.main}, transparent)` }} />
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
            {cards.map((c) => (
              <button key={c.id} onClick={() => updateCurrencyData({ activeCardId: c.id })}
                      className="relative shrink-0 w-36 h-24 rounded-[1.8rem] border-2 transition-all p-4 flex flex-col justify-between overflow-hidden shadow-sm active:scale-95"
                      style={{ 
                        borderColor: c.id === activeCardId ? currentTheme.main : `${currentTheme.main}10`,
                        backgroundColor: c.id === activeCardId ? `${currentTheme.main}05` : "white"
                      }}>
                <div className="flex justify-between items-start">
                  <CreditCard className={`w-5 h-5 ${c.id === activeCardId ? "opacity-100" : "opacity-20"}`} style={{ color: currentTheme.main }} />
                  {c.isPrimary && <Star className="w-3 h-3 fill-current text-yellow-400" />}
                </div>
                <div className="text-left">
                  <p className={`text-xs font-black truncate ${c.id === activeCardId ? "opacity-100" : "opacity-60"}`} style={{ color: currentTheme.text }}>{c.name}</p>
                  <div className="flex gap-1.5 text-[8px] font-bold opacity-30"><span>{c.feePercent}%</span><span>回饋{c.cashbackPercent}%</span></div>
                </div>
              </button>
            ))}
            <button onClick={() => { setEditingCardId(null); setCardDraft(createNewCard()); setCardModalOpen(true); }} className="shrink-0 w-36 h-24 rounded-[1.8rem] border-2 border-dashed flex flex-col items-center justify-center gap-1 opacity-40 active:scale-95 transition-all" style={{ borderColor: `${currentTheme.main}40`, color: currentTheme.text }}>
               <PlusCircle className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-wider">新增卡片</span>
            </button>
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 opacity-30 py-4 text-center mt-auto">
          <Info className="w-3 h-3 shrink-0" /><p className="text-[9px] font-bold">僅供估算，實際金額以銀行發卡機構為準。</p>
        </div>
      </div>

      {keypadOpen && (
        <div className="fixed inset-0 z-[300] bg-black/20 flex items-end animate-in fade-in duration-200" onClick={() => setKeypadOpen(false)}>
           <div className="w-full bg-white rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300" 
                style={{ backgroundColor: currentTheme.bg }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}>
              <div className="flex justify-center mb-6"><div className="w-12 h-1.5 rounded-full bg-gray-300" /></div>
              <div className="grid grid-cols-4 gap-3">
                {keypadButtons.flat().map((key) => {
                  const isOperator = ["÷", "×", "-", "+", "="].includes(key);
                  const isSpecial = ["C", "DEL"].includes(key);
                  return (
                    <button key={key} onClick={() => handleKeypad(key)}
                            className={`h-14 rounded-2xl text-lg font-black transition-all active:scale-90 shadow-sm flex items-center justify-center ${key === "=" ? "col-span-2" : "bg-white"}`}
                            style={{ 
                              backgroundColor: key === "=" ? currentTheme.main : "white",
                              color: key === "=" ? "white" : (isSpecial ? "#ff5a5a" : (isOperator ? currentTheme.main : currentTheme.text)),
                            }}>{key === "DEL" ? "⌫" : key}</button>
                  );
                })}
              </div>
           </div>
        </div>
      )}

      {cardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-end z-[400]">
          <div className="w-full bg-white rounded-t-[3rem] p-8 space-y-6 shadow-2xl border-t" style={{ borderColor: `${currentTheme.main}20` }}>
            <div className="flex justify-between items-center"><h2 className="text-xl font-black tracking-tight" style={{ color: currentTheme.text }}>{editingCardId ? "編輯支付" : "新增支付"}</h2><button onClick={() => setCardModalOpen(false)} className="p-2 rounded-full bg-gray-100"><X className="w-4 h-4 opacity-40" /></button></div>
            <div className="space-y-4">
               <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">卡片名稱</label><input value={cardDraft.name} onChange={(e) => setCardDraft(p=>({...p, name: e.target.value}))} className="w-full px-5 py-3.5 rounded-xl bg-gray-50 outline-none font-black text-base" placeholder="卡片名稱" /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">手續費 %</label><input type="number" value={cardDraft.feePercent} onChange={(e) => setCardDraft(p=>({...p, feePercent: e.target.value}))} className="w-full px-5 py-3.5 rounded-xl bg-gray-50 outline-none font-bold" /></div>
                  <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">回饋 %</label><input type="number" value={cardDraft.cashbackPercent} onChange={(e) => setCardDraft(p=>({...p, cashbackPercent: e.target.value}))} className="w-full px-5 py-3.5 rounded-xl bg-gray-50 outline-none font-bold" /></div>
               </div>
            </div>
            <div className="flex gap-3 pt-2">
               {editingCardId && <button onClick={() => { const remain = cards.filter((c) => c.id !== editingCardId); const fallback = remain.length ? remain : DEFAULT_CARDS; updateCurrencyData({ cards: fallback, activeCardId: fallback[0].id }); setCardModalOpen(false); }} className="flex-1 py-4 rounded-2xl border border-red-100 text-red-500 text-xs font-black">刪除</button>}
               <button onClick={() => {
                  let updated = [...cards];
                  if (cardDraft.isPrimary) updated = updated.map((c) => ({ ...c, isPrimary: false }));
                  if (editingCardId) { updated = updated.map((c) => c.id === editingCardId ? { ...cardDraft, id: editingCardId } : c); updateCurrencyData({ cards: updated, activeCardId: editingCardId }); }
                  else { const newCard = { ...cardDraft, id: `card-${Date.now()}` }; updated.push(newCard); updateCurrencyData({ cards: updated, activeCardId: newCard.id }); }
                  setCardModalOpen(false);
               }} className="flex-[2] py-4 rounded-2xl text-white text-xs font-black shadow-lg" style={{ backgroundColor: currentTheme.main }}>確認儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}