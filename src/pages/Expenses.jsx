// src/pages/Expenses.jsx
import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import {
  PlusCircle,
  Users,
  Train,
  UtensilsCrossed,
  Landmark,
  ShoppingBag,
  Wallet,
  CreditCard,
  Trash2,
  Pencil,
  X,
  Check,
  HandCoins,
  ReceiptText,
  RefreshCcw
} from "lucide-react";
import { THEMES } from "../App";

const VIEWER_EXPENSES_KEY = "viewer_expenses_v1";

// 貨幣符號對照表
const CURRENCY_MAP = {
  JPY: { symbol: "¥", name: "日圓" },
  KRW: { symbol: "₩", name: "韓元" },
  EUR: { symbol: "€", name: "歐元" },
  USD: { symbol: "$", name: "美金" },
  THB: { symbol: "฿", name: "泰銖" },
  TWD: { symbol: "NT$", name: "台幣" },
  HKD: { symbol: "HK$", name: "港幣" },
  SGD: { symbol: "$", name: "星幣" },
  VND: { symbol: "₫", name: "越南盾" },
  GBP: { symbol: "£", name: "英鎊" },
  CNY: { symbol: "¥", name: "人民幣" },
};

const CATEGORY_MAP = {
  TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train, pillBg: "#E4F1E3", pillText: "#4E6B48" },
  FOOD: { key: "FOOD", label: "餐飲", icon: UtensilsCrossed, pillBg: "#FBE7DF", pillText: "#8C4A2F" },
  SIGHT: { key: "SIGHT", label: "景點", icon: Landmark, pillBg: "#E7EEF9", pillText: "#4A607F" },
  SHOP: { key: "SHOP", label: "購物", icon: ShoppingBag, pillBg: "#F3E3F0", pillText: "#7A4D6E" },
};

const CATEGORY_ORDER = ["TRANSPORT", "FOOD", "SIGHT", "SHOP"];
const DEFAULT_DATA = { members: [], expenses: [] };

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Expenses({ trip, setTrip, themeId }) {
  if (!trip) return null;

  const isViewer = trip?.shareMode === "viewer";
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;
  const [viewerData, setViewerData] = useState(null);

  const baseCurrency = trip.currency || "JPY";
  const currencyInfo = CURRENCY_MAP[baseCurrency] || { symbol: "$", name: "外幣" };

  const members = isViewer ? (viewerData?.members || DEFAULT_DATA.members) : (trip.members || DEFAULT_DATA.members);
  const expenses = isViewer ? (viewerData?.expenses || []) : (trip.expenses || []);
  const exchangeRate = isViewer ? (viewerData?.exchangeRate || trip.exchangeRate || null) : (trip.exchangeRate || null);

  useEffect(() => {
    if (!isViewer) return;
    try {
      const raw = localStorage.getItem(VIEWER_EXPENSES_KEY);
      if (raw) { setViewerData(JSON.parse(raw)); }
    } catch (e) { console.error(e); }
  }, [isViewer]);

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        const data = await res.json();
        if (!data?.rates?.TWD) return;
        const rateData = { RATE_TWD: data.rates.TWD, updatedAt: Date.now(), base: baseCurrency };
        
        if (isViewer) {
          setViewerData(prev => {
            const next = { ...prev, exchangeRate: rateData };
            localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
            return next;
          });
        } else {
          setTrip(prev => ({ ...prev, exchangeRate: rateData }));
        }
      } catch (e) { console.error("匯率抓取失敗", e); }
    }
    fetchRate();
  }, [baseCurrency, isViewer, setTrip]);

  const setMembers = (updater) => {
    if (isViewer) {
      setViewerData(prev => {
        const next = { ...prev, members: typeof updater === "function" ? updater(prev.members) : updater };
        localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setTrip(prev => ({ ...prev, members: typeof updater === "function" ? updater(prev.members) : updater }));
    }
  };

  const setExpenses = (updater) => {
    if (isViewer) {
      setViewerData(prev => {
        const next = { ...prev, expenses: typeof updater === "function" ? updater(prev.expenses) : updater };
        localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setTrip(prev => ({ ...prev, expenses: typeof updater === "function" ? updater(prev.expenses) : updater }));
    }
  };

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: todayString(), category: "TRANSPORT", title: "", amount: "", mode: "PERSONAL", advanceFor: [], payer: "ME", payMethod: "CASH",
  });

  const [filterCategory, setFilterCategory] = useState("ALL");
  const TO_TWD = exchangeRate?.RATE_TWD || 0;

  const totalBase = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses]);
  const totalTwd = Math.round(totalBase * TO_TWD);

  const categoryTotals = useMemo(() => {
    const r = { TRANSPORT: 0, FOOD: 0, SIGHT: 0, SHOP: 0 };
    expenses.forEach((e) => (r[e.category] += Number(e.amount)));
    return r;
  }, [expenses]);

  const advanceSummary = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (e.mode !== "ADVANCE" || e.payer !== "ME") return;
      const share = Number(e.amount) / (e.advanceFor.length || 1);
      e.advanceFor.forEach((id) => { map[id] = (map[id] || 0) + share; });
    });
    return Object.entries(map).map(([id, amt]) => ({
      id, name: members.find((m) => m.id === id)?.name || "", amount: Math.round(amt),
    }));
  }, [expenses, members]);

  const groupedByDate = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (filterCategory !== "ALL" && e.category !== filterCategory) return;
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => (a < b ? 1 : -1)).map(([date, items]) => ({
      date, dayTotal: items.reduce((s, e) => s + Number(e.amount), 0), items,
    }));
  }, [expenses, filterCategory]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ date: todayString(), category: "TRANSPORT", title: "", amount: "", mode: "PERSONAL", advanceFor: [], payer: "ME", payMethod: "CASH" });
    setExpenseModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditingId(exp.id);
    setForm({ ...exp, amount: String(exp.amount) });
    setExpenseModalOpen(true);
  };

  const updateForm = (patch) => setForm((p) => ({ ...p, ...patch }));
  const toggleAdvance = (id) => {
    setForm((p) => ({ ...p, advanceFor: p.advanceFor.includes(id) ? p.advanceFor.filter((x) => x !== id) : [...p.advanceFor, id] }));
  };

  const saveExpense = () => {
    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) return alert("請檢查輸入內容");
    const newItem = { ...form, id: editingId || `e-${Date.now()}`, amount: Number(form.amount), createdAt: editingId ? expenses.find((e) => e.id === editingId)?.createdAt : Date.now() };
    if (editingId) { setExpenses((prev) => prev.map((e) => (e.id === editingId ? newItem : e))); }
    else { setExpenses((prev) => [...prev, newItem]); }
    setExpenseModalOpen(false);
  };

  const deleteExpense = (id) => { if (window.confirm("確定刪除此筆花費？")) setExpenses((prev) => prev.filter((e) => e.id !== id)); };

  // --- 新增：動態匯率精度 (方法 1) ---
  const formatRate = (r) => {
    if (!r) return "--";
    return r < 0.1 ? r.toFixed(5) : r.toFixed(2);
  };

  // --- 修正：金額格式化處理，包含千分位 (方法 4) ---
  const formatCurrency = (n) => {
    const formatted = Number(n).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `${currencyInfo.symbol}${formatted}`;
  };

  return (
    <div className="px-4 py-6 pb-24">
      <PageHeader icon={Wallet} title="花費總覽" subtitle="EXPENSES" themeId={themeId} />

      <div className="flex justify-between items-center mb-6">
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black bg-white shadow-sm"
          style={{ borderColor: currentTheme.border, color: currentTheme.main }}
        >
          <RefreshCcw className="w-3 h-3 animate-spin-slow" />
          {/* 套用動態匯率精度 (方法 1) */}
          1 {baseCurrency} ≈ {formatRate(TO_TWD)} TWD
        </div>

        <div className="flex gap-2">
          <button onClick={() => setMemberModalOpen(true)} className="px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1 bg-white shadow-sm active:scale-95 transition-all" style={{ borderColor: currentTheme.border, color: currentTheme.text }}>
            <Users className="w-3.5 h-3.5" />夥伴
          </button>
          <button onClick={openAdd} className="px-3 py-1.5 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all" style={{ backgroundColor: currentTheme.main }}>
            <PlusCircle className="w-3.5 h-3.5" />新增
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="rounded-[2.5rem] p-5 shadow-lg flex flex-col justify-between min-h-[145px] relative overflow-hidden" 
             style={{ background: `linear-gradient(135deg, ${currentTheme.main}, ${currentTheme.main}dd)` }}>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2 opacity-80 text-white">
              <ReceiptText className="w-4 h-4" />
              <p className="text-[14px] font-black uppercase tracking-widest">Total</p>
            </div>
            {/* 套用千分位格式化 (方法 4) */}
            <p className="text-2xl font-black leading-tight truncate text-white">{formatCurrency(totalBase)}</p>
          </div>
          <p className="text-[11px] font-bold text-white/70 relative z-10 mt-2">≈ NT${totalTwd.toLocaleString()}</p>
          <div className="absolute -right-1.5 -bottom-1.5 opacity-10">
            <Wallet className="w-24 h-24 text-white rotate-12" />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-5 border-2 border-dashed shadow-sm flex flex-col justify-between min-h-[145px]" 
             style={{ borderColor: `${currentTheme.main}40` }}>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <HandCoins className="w-4 h-4" style={{ color: currentTheme.main }} />
              <p className="text-[14px] font-black uppercase tracking-widest" style={{ color: currentTheme.main }}>代墊總結</p>
            </div>
            <p className="text-2xl font-black leading-tight truncate" style={{ color: currentTheme.text }}>{formatCurrency(advanceSummary.reduce((s, a) => s + a.amount, 0))}</p>
          </div>
          <div className="mt-3 space-y-1.5">
            {advanceSummary.length > 0 ? (
              advanceSummary.slice(0, 2).map(a => (
                <div key={a.id} className="flex justify-between items-center px-3 py-1.5 rounded-xl" 
                     style={{ backgroundColor: `${currentTheme.main}0D` }}>
                  <span className="text-[11px] font-black truncate max-w-[55px]" style={{ color: currentTheme.main }}>{a.name}</span>
                  <span className="text-[11px] font-black" style={{ color: currentTheme.main }}>{formatCurrency(a.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-bold opacity-30 italic px-1" style={{ color: currentTheme.text }}>尚無代墊紀錄</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {CATEGORY_ORDER.map((c) => {
          const cat = CATEGORY_MAP[c];
          return (
            <div key={c} className="bg-white rounded-2xl border px-4 py-3 flex items-center gap-3 shadow-sm" style={{ borderColor: currentTheme.border }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cat.pillBg }}>
                <cat.icon className="w-4 h-4" style={{ color: cat.pillText }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black truncate opacity-50 uppercase" style={{ color: currentTheme.text }}>{cat.label}</p>
                <p className="text-[13px] font-black truncate" style={{ color: currentTheme.text }}>{formatCurrency(categoryTotals[c])}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {[{ key: "ALL", label: "全部" }, ...CATEGORY_ORDER.map((c) => ({ key: c, label: CATEGORY_MAP[c].label }))].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterCategory(t.key)}
            className="px-4 py-1.5 rounded-full text-xs font-black shrink-0 transition-all border"
            style={{ 
              backgroundColor: filterCategory === t.key ? currentTheme.main : "white",
              borderColor: currentTheme.border,
              color: filterCategory === t.key ? "white" : currentTheme.text
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <h3 className="text-sm font-black mb-4 px-1 flex items-center gap-2 opacity-60" style={{ color: currentTheme.text }}>
        近期花費明細 <div className="h-px flex-1" style={{ backgroundColor: `${currentTheme.main}15` }} />
      </h3>

      <div className="space-y-4">
        {groupedByDate.map((group) => (
          <div key={group.date} className="space-y-2">
            <div className="flex justify-between items-center text-[10px] px-2 font-black uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>
              <span>{group.date}</span>
              <span>當日 {formatCurrency(group.dayTotal)}</span>
            </div>
            {group.items.map((e) => {
              const isCard = e.payMethod === "CARD";
              const cat = CATEGORY_MAP[e.category];
              return (
                <div key={e.id} className="bg-white rounded-2xl border px-4 py-3 flex items-center justify-between shadow-sm" style={{ borderColor: currentTheme.border }}>
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${currentTheme.main}10` }}>
                      {isCard ? <CreditCard className="w-5 h-5" style={{ color: currentTheme.main }} /> : <Wallet className="w-5 h-5" style={{ color: currentTheme.main }} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black truncate" style={{ color: currentTheme.text }}>{e.title}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ backgroundColor: cat.pillBg, color: cat.pillText }}>{cat.label}</span>
                        {e.mode === "ADVANCE" && <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ backgroundColor: `${currentTheme.main}15`, color: currentTheme.main }}>代墊</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-black" style={{ color: currentTheme.text }}>{formatCurrency(e.amount)}</span>
                    <div className="flex gap-1">
                      {!isViewer && (
                        <>
                          <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg border hover:bg-black/5" style={{ borderColor: currentTheme.border }}>
                            <Pencil className="w-3 h-3 opacity-40" />
                          </button>
                          <button onClick={() => deleteExpense(e.id)} className="p-1.5 rounded-lg border hover:bg-red-50" style={{ borderColor: currentTheme.border }}>
                            <Trash2 className="w-3 h-3 text-red-400 opacity-60" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12">
          <div className="w-full max-w-lg rounded-[32px] border shadow-xl overflow-hidden flex flex-col bg-white" style={{ borderColor: currentTheme.border }}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between bg-white/50 border-b" style={{ borderColor: `${currentTheme.border}40` }}>
              <div>
                <p className="text-[10px] tracking-[0.2em] mb-1 uppercase font-black" style={{ color: currentTheme.main }}>Entry Details</p>
                <h2 className="text-lg font-black" style={{ color: currentTheme.text }}>{editingId ? "編輯花費" : "新增花費"}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setExpenseModalOpen(false)} className="w-8 h-8 rounded-full border flex items-center justify-center bg-white" style={{ borderColor: currentTheme.border }}><X className="w-4 h-4" style={{ color: currentTheme.main }} /></button>
                <button onClick={saveExpense} className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: currentTheme.main }}><Check className="w-4 h-4 text-white" /></button>
              </div>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] scrollbar-hide">
              <div><label className="block text-[10px] font-black mb-2 uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>日期</label><input type="date" value={form.date} onChange={(e) => updateForm({ date: e.target.value })} className="w-full h-11 border rounded-xl px-4 text-[13px] font-bold bg-white outline-none focus:ring-2" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text, "--tw-ring-color": `${currentTheme.main}10` }} /></div>
              
              <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>類別</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORY_ORDER.map((c) => { 
                    const cat = CATEGORY_MAP[c]; 
                    const active = form.category === c; 
                    return ( 
                      <button key={c} onClick={() => updateForm({ category: c })} className={`py-2.5 rounded-xl text-[11px] font-black flex flex-col items-center gap-1 border transition-all ${active ? "shadow-sm scale-105" : "opacity-40 hover:opacity-100"}`} style={{ backgroundColor: active ? cat.pillBg : 'white', color: active ? cat.pillText : currentTheme.text, borderColor: active ? cat.pillText : `${currentTheme.main}20` }} >
                        <cat.icon className="w-4 h-4" />{cat.label}
                      </button> 
                    ); 
                  })}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8"><label className="block text-[10px] font-black mb-2 uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>項目名稱</label><input type="text" value={form.title} onChange={(e) => updateForm({ title: e.target.value })} className="w-full border rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} placeholder="例如：拉麵" /></div>
                <div className="col-span-4">
                  <label className="block text-[10px] font-black mb-2 uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>金額 ({currencyInfo.symbol})</label>
                  <input type="number" value={form.amount} onChange={(e) => updateForm({ amount: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-[13px] font-black outline-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>支出類型</label>
                <div className="flex gap-2">
                  {["PERSONAL", "ADVANCE"].map((m) => ( 
                    <button key={m} onClick={() => updateForm({ mode: m })} className={`flex-1 py-2.5 rounded-xl text-[12px] font-black border transition-all ${form.mode === m ? "text-white shadow-md" : "bg-white opacity-40 hover:opacity-100"}`} style={{ backgroundColor: form.mode === m ? currentTheme.main : "white", borderColor: `${currentTheme.main}20`, color: form.mode === m ? "white" : currentTheme.text }}>
                      {m === "PERSONAL" ? "個人花費" : "代墊項目"}
                    </button> 
                  ))}
                </div>
              </div>

              {form.mode === "ADVANCE" && (
                <div className="rounded-2xl p-4 border animate-in slide-in-from-top-2" style={{ backgroundColor: `${currentTheme.main}05`, borderColor: `${currentTheme.main}20` }}>
                  <label className="text-[10px] font-black mb-3 block uppercase tracking-widest opacity-60" style={{ color: currentTheme.text }}>為誰代墊</label>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => (
                      <button key={m.id} onClick={() => toggleAdvance(m.id)} className={`px-4 py-1.5 rounded-full text-[11px] font-black border transition-all ${form.advanceFor.includes(m.id) ? "shadow-sm" : "bg-white opacity-50"}`} style={{ backgroundColor: form.advanceFor.includes(m.id) ? `${currentTheme.main}20` : "white", borderColor: `${currentTheme.main}20`, color: currentTheme.text }}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div><label className="text-[10px] font-black mb-2 block uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>付款人</label><div className="flex gap-2">{["ME", "THEM"].map((p) => ( <button key={p} onClick={() => updateForm({ payer: p })} className={`flex-1 py-2.5 rounded-xl text-[12px] font-black border transition-all ${form.payer === p ? "text-white shadow-sm" : "bg-white opacity-40 hover:opacity-100"}`} style={{ backgroundColor: form.payer === p ? currentTheme.main : "white", borderColor: `${currentTheme.main}20`, color: form.payer === p ? "white" : currentTheme.text }}> {p === "ME" ? "我付" : "他付"} </button> ))}</div></div>
                <div><label className="text-[10px] font-black mb-2 block uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>方式</label><div className="flex gap-2">{["CASH", "CARD"].map((m) => ( <button key={m} onClick={() => updateForm({ payMethod: m })} className={`flex-1 py-2.5 rounded-xl text-[12px] font-black border transition-all ${form.payMethod === m ? "text-white shadow-sm" : "bg-white opacity-40 hover:opacity-100"}`} style={{ backgroundColor: form.payMethod === m ? currentTheme.main : "white", borderColor: `${currentTheme.main}20`, color: form.payMethod === m ? "white" : currentTheme.text }}> {m === "CASH" ? "現金" : "刷卡"} </button> ))}</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12">
          <div className="w-full max-w-lg rounded-[32px] border shadow-xl overflow-hidden flex flex-col bg-white" style={{ borderColor: currentTheme.border }}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between bg-white/50 border-b" style={{ borderColor: `${currentTheme.border}40` }}>
              <div><p className="text-[10px] tracking-[0.2em] mb-1 font-black uppercase" style={{ color: currentTheme.main }}>Partners</p><h2 className="text-lg font-black" style={{ color: currentTheme.text }}>行程夥伴</h2></div>
              <button onClick={() => setMemberModalOpen(false)} className="w-8 h-8 rounded-full border flex items-center justify-center bg-white" style={{ borderColor: currentTheme.border }}><X className="w-4 h-4" style={{ color: currentTheme.main }} /></button>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh] scrollbar-hide">
              {members.map((m) => ( 
                <div key={m.id} className="flex items-center gap-2 bg-white border rounded-2xl px-4 py-3 shadow-sm" style={{ borderColor: `${currentTheme.main}20` }}> 
                  <input value={m.name} onChange={(e) => setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))} className="flex-1 min-w-0 outline-none text-[13px] font-bold bg-transparent" style={{ color: currentTheme.text }} placeholder="成員名稱" /> 
                  <button onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))} className="p-1.5 rounded-full hover:bg-red-50 text-red-500 shrink-0"><Trash2 className="w-4 h-4" /></button> 
                </div> 
              ))}
              <button onClick={() => setMembers((prev) => [...prev, { id: `m-${Date.now()}`, name: "" }])} className="w-full py-3 border-2 border-dashed rounded-2xl text-[11px] font-black transition-all hover:bg-gray-50 active:scale-[0.98]" style={{ borderColor: `${currentTheme.main}30`, color: currentTheme.main }}> + 新增夥伴 </button>
            </div>
            <div className="p-6 border-t" style={{ borderColor: `${currentTheme.border}10` }}><button onClick={() => setMemberModalOpen(false)} className="w-full py-4 text-white rounded-2xl font-black shadow-md active:scale-95 transition-all" style={{ backgroundColor: currentTheme.main }}>確認儲存</button></div>
          </div>
        </div>
      )}
    </div>
  );
}