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
  Coins,
  Trash2,
  Pencil,
  X,
  Check,
  HandCoins,
  ReceiptText,
  RefreshCcw,
  ChevronRight,
  MoreHorizontal,
  Cat,
  PawPrint,
  Smile,
  Heart,
  Star,
  Zap,
  Ghost,
  Rabbit,
  Dog,
  Squirrel,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { THEMES } from "../App";

const VIEWER_EXPENSES_KEY = "viewer_expenses_v1";

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

// 🛠️ 充滿可愛動物與精選風格的 Lucide Icon 清單
const ICON_OPTIONS = [
  { id: "Cat", label: "小貓", icon: Cat },
  { id: "Rabbit", label: "兔子", icon: Rabbit },
  { id: "Dog", label: "小狗", icon: Dog },
  { id: "Squirrel", label: "小松鼠", icon: Squirrel },
  { id: "PawPrint", label: "腳印", icon: PawPrint },
  { id: "Ghost", label: "幽靈", icon: Ghost },
  { id: "Smile", label: "笑臉", icon: Smile },
  { id: "Heart", label: "愛心", icon: Heart },
  { id: "Star", label: "星星", icon: Star },
  { id: "Zap", label: "閃電", icon: Zap },
];

function getMemberIconComponent(iconName) {
  const found = ICON_OPTIONS.find((i) => i.id === iconName);
  return found ? found.icon : Cat;
}

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

  const rawMembers = isViewer ? viewerData?.members : trip?.members;
  const members = Array.isArray(rawMembers) ? rawMembers : DEFAULT_DATA.members;
    
  const rawExpenses = isViewer ? viewerData?.expenses : trip?.expenses;
  const expenses = Array.isArray(rawExpenses) ? rawExpenses : [];

  const exchangeRate = isViewer ? (viewerData?.exchangeRate || trip.exchangeRate || null) : (trip.exchangeRate || null);

  useEffect(() => {
    if (!isViewer) return;
    try {
      const raw = localStorage.getItem(VIEWER_EXPENSES_KEY);
      if (raw) { setViewerData(JSON.parse(raw)); }
    } catch (e) { console.error(e); }
  }, [isViewer]);

  useEffect(() => {
    if (exchangeRate && exchangeRate.base === baseCurrency) return;

    async function fetchRate() {
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        if (!res.ok) throw new Error("Network response was not ok");
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
  }, [baseCurrency]);

  const setMembers = (updater) => {
    if (isViewer) {
      setViewerData(prev => {
        const currentList = Array.isArray(prev?.members) ? prev.members : DEFAULT_DATA.members;
        const resolvedMembers = typeof updater === "function" ? updater(currentList) : updater;
        const next = { ...prev, members: Array.isArray(resolvedMembers) ? resolvedMembers : DEFAULT_DATA.members };
        localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setTrip(prev => {
        const currentList = Array.isArray(prev?.members) ? prev.members : DEFAULT_DATA.members;
        const resolvedMembers = typeof updater === "function" ? updater(currentList) : updater;
        return { ...prev, members: Array.isArray(resolvedMembers) ? resolvedMembers : DEFAULT_DATA.members };
      });
    }
  };

  const setExpenses = (updater) => {
    if (isViewer) {
      setViewerData(prev => {
        const currentList = Array.isArray(prev?.expenses) ? prev.expenses : [];
        const resolvedExpenses = typeof updater === "function" ? updater(currentList) : updater;
        const next = { ...prev, expenses: Array.isArray(resolvedExpenses) ? resolvedExpenses : [] };
        localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setTrip(prev => {
        const currentList = Array.isArray(prev?.expenses) ? prev.expenses : [];
        const resolvedExpenses = typeof updater === "function" ? updater(currentList) : updater;
        return { ...prev, expenses: Array.isArray(resolvedExpenses) ? resolvedExpenses : [] };
      });
    }
  };

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [activeIconPickerId, setActiveIconPickerId] = useState(null);

  const [form, setForm] = useState({
    date: todayString(), category: "TRANSPORT", title: "", amount: "", mode: "PERSONAL", advanceFor: [], payer: "ME", paidByMemberId: "", payMethod: "CASH",
  });

  const [filterCategory, setFilterCategory] = useState("ALL");
  const TO_TWD = exchangeRate?.RATE_TWD || 0;

  const totalBase = useMemo(() => {
    return expenses
      .filter((e) => e.payer !== "THEM")
      .reduce((s, e) => s + Number(e.amount), 0);
  }, [expenses]);
  
  const totalTwd = Math.round(totalBase * TO_TWD);

  const categoryTotals = useMemo(() => {
    const r = { TRANSPORT: 0, FOOD: 0, SIGHT: 0, SHOP: 0 };
    expenses.forEach((e) => {
      if (e.payer !== "THEM" && r[e.category] !== undefined) {
        r[e.category] += Number(e.amount);
      }
    });
    return r;
  }, [expenses]);

  const advanceSummaryMap = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (e.mode !== "ADVANCE" || e.payer !== "ME") return;
      
      const shares = e.fixedShares;
      const advanceList = Array.isArray(e.advanceFor) ? e.advanceFor : [];
      
      if (shares && typeof shares === "object") {
        advanceList.forEach((id) => {
          const amt = Number(shares[id]) || 0;
          map[id] = (map[id] || 0) + amt;
        });
      } else if (advanceList.length > 0) {
        const share = Number(e.amount) / advanceList.length;
        advanceList.forEach((id) => { 
          map[id] = (map[id] || 0) + share; 
        });
      }
    });
    return map;
  }, [expenses]);

  const owedToOthersMap = useMemo(() => {
    const map = {};
    let totalOwed = 0;
    expenses.forEach((e) => {
      if (e.payer !== "THEM") return;
      const amt = Number(e.amount) || 0;
      totalOwed += amt;
      const memberId = e.paidByMemberId || "unknown";
      if (!map[memberId]) map[memberId] = 0;
      map[memberId] += amt;
    });
    return { totalOwed, map };
  }, [expenses]);

  const netSettlementList = useMemo(() => {
    const memberIds = new Set([...Object.keys(advanceSummaryMap), ...Object.keys(owedToOthersMap.map)]);
    const list = [];

    memberIds.forEach((id) => {
      const theyOweMe = advanceSummaryMap[id] || 0; 
      const iOweThem = owedToOthersMap.map[id] || 0; 
      const net = theyOweMe - iOweThem; 

      const foundMember = members.find((m) => m.id === id);
      list.push({
        id,
        name: foundMember ? foundMember.name : "指定夥伴",
        avatarIcon: foundMember?.avatarIcon || "Cat",
        theyOweMe: Math.round(theyOweMe),
        iOweThem: Math.round(iOweThem),
        net: Math.round(net),
      });
    });

    return list;
  }, [advanceSummaryMap, owedToOthersMap, members]);

  const totalSummaryDisplayAmount = useMemo(() => {
    return netSettlementList.reduce((s, item) => s + Math.abs(item.net), 0);
  }, [netSettlementList]);

  const handleOneTouchSettle = (memberId, memberName) => {
    if (!window.confirm(`要把跟「${memberName + "♪"}」的帳目一次結清嗎？這會幫你把代墊歸零，並把幫付的個人花費記錄收進 Total 唷！`)) return;

    setExpenses((prev) => 
      prev.map((e) => {
        let nextE = { ...e };

        if (nextE.payer === "THEM" && nextE.paidByMemberId === memberId) {
          return {
            ...nextE,
            payer: "ME",
            paidByMemberId: ""
          };
        }

        if (nextE.mode === "ADVANCE" && nextE.payer === "ME" && Array.isArray(nextE.advanceFor) && nextE.advanceFor.includes(memberId)) {
          let currentShares = nextE.fixedShares;
          if (!currentShares) {
            currentShares = {};
            const defaultShare = Number(nextE.amount) / nextE.advanceFor.length;
            nextE.advanceFor.forEach(id => { currentShares[id] = defaultShare; });
          }

          const nextAdvanceFor = nextE.advanceFor.filter(id => id !== memberId);
          const nextFixedShares = { ...currentShares };
          nextFixedShares[memberId] = 0;

          if (nextAdvanceFor.length === 0) {
            return null; 
          } else {
            return {
              ...nextE,
              advanceFor: nextAdvanceFor,
              fixedShares: nextFixedShares
            };
          }
        }

        return nextE;
      }).filter(Boolean)
    );
  };

  const groupedByDate = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (filterCategory !== "ALL" && e.category !== filterCategory) return;
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => (a < b ? 1 : -1)).map(([date, items]) => ({
      date, dayTotal: items.reduce((s, e) => (e.payer !== "THEM" ? s + Number(e.amount) : s), 0), items,
    }));
  }, [expenses, filterCategory]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ date: todayString(), category: "TRANSPORT", title: "", amount: "", mode: "PERSONAL", advanceFor: [], payer: "ME", paidByMemberId: members[0]?.id || "", payMethod: "CASH" });
    setExpenseModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditingId(exp.id);
    setForm({ 
      ...exp, 
      amount: String(exp.amount), 
      advanceFor: Array.isArray(exp.advanceFor) ? exp.advanceFor : [],
      paidByMemberId: exp.paidByMemberId || members[0]?.id || "" 
    });
    setExpenseModalOpen(true);
  };

  const updateForm = (patch) => setForm((p) => ({ ...p, ...patch }));
  const toggleAdvance = (id) => {
    setForm((p) => ({ 
      ...p, 
      advanceFor: Array.isArray(p.advanceFor) 
        ? (p.advanceFor.includes(id) ? p.advanceFor.filter((x) => x !== id) : [...p.advanceFor, id])
        : [id] 
    }));
  };

  const saveExpense = () => {
    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) return alert("請檢查輸入內容");
    
    let initialFixedShares = form.fixedShares;
    if (form.mode === "ADVANCE" && Array.isArray(form.advanceFor) && form.advanceFor.length > 0) {
      if (!initialFixedShares || editingId === null) {
        initialFixedShares = {};
        const shareAmt = Number(form.amount) / form.advanceFor.length;
        form.advanceFor.forEach(id => { initialFixedShares[id] = shareAmt; });
      }
    }

    const newItem = { 
      ...form, 
      id: editingId || `e-${Date.now()}`, 
      amount: Number(form.amount), 
      paidByMemberId: form.payer === "THEM" ? form.paidByMemberId : "",
      fixedShares: initialFixedShares,
      createdAt: editingId ? expenses.find((e) => e.id === editingId)?.createdAt : Date.now() 
    };

    if (editingId) { setExpenses((prev) => prev.map((e) => (e.id === editingId ? newItem : e))); }
    else { setExpenses((prev) => [...prev, newItem]); }
    setExpenseModalOpen(false);
  };

  const deleteExpense = (id) => { if (window.confirm("確定刪除此筆花費？")) setExpenses((prev) => prev.filter((e) => e.id !== id)); };

  const formatRate = (r) => {
    if (!r) return "--";
    return r < 0.1 ? r.toFixed(5) : r.toFixed(2);
  };

  const formatCurrency = (n) => {
    const formatted = Number(n).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `${currencyInfo.symbol}${formatted}`;
  };

  return (
    <div className="px-4 py-6 pb-24" onClick={() => setMenuOpenId(null)}>
      <PageHeader icon={Wallet} title="花費總覽" subtitle="EXPENSES" themeId={themeId} />

      <div className="flex justify-between items-center mb-6">
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black bg-white shadow-sm"
          style={{ borderColor: currentTheme.border, color: currentTheme.main }}
        >
          <RefreshCcw className="w-3 h-3 animate-spin-slow" />
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

      <div className="grid grid-cols-2 gap-3 mb-8 items-stretch">
        <div className="rounded-[2.5rem] p-5 shadow-lg flex flex-col justify-between h-full relative overflow-hidden" 
             style={{ background: `linear-gradient(135deg, ${currentTheme.main}, ${currentTheme.main}dd)` }}>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2 opacity-80 text-white">
              <ReceiptText className="w-4 h-4" />
              <p className="text-[14px] font-black uppercase tracking-widest">Total</p>
            </div>
            <p className="text-2xl font-black leading-tight truncate text-white">{formatCurrency(totalBase)}</p>
          </div>
          <p className="text-[11px] font-bold text-white/70 relative z-10 mt-2">≈ NT${totalTwd.toLocaleString()}</p>
          <div className="absolute -right-1.5 -bottom-1.5 opacity-10">
            <Wallet className="w-24 h-24 text-white rotate-12" />
          </div>
        </div>

        <button 
          onClick={() => setAdvanceModalOpen(true)}
          className="bg-white rounded-[2.5rem] p-5 border-2 border-dashed shadow-sm flex flex-col justify-between h-full text-left active:scale-[0.98] transition-all group"
          style={{ borderColor: `${currentTheme.main}40` }}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <HandCoins className="w-4 h-4" style={{ color: currentTheme.main }} />
              <p className="text-[14px] font-black uppercase tracking-widest" style={{ color: currentTheme.main }}>代墊總結</p>
            </div>
            <p className="text-2xl font-black leading-tight truncate" style={{ color: currentTheme.text }}>{formatCurrency(totalSummaryDisplayAmount)}</p>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-2 border-t w-full" style={{ borderColor: `${currentTheme.main}15` }}>
            <span className="text-[11px] font-black opacity-60" style={{ color: currentTheme.text }}>查看明細對帳</span>
            <div className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5" style={{ backgroundColor: `${currentTheme.main}15`, color: currentTheme.main }}>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>
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
            {group.items.map((e, index) => {
              const isCard = e.payMethod === "CARD";
              const cat = CATEGORY_MAP[e.category] || CATEGORY_MAP.TRANSPORT;
              const isNearBottom = index >= group.items.length - 2;
              const paidMember = members.find(m => m.id === e.paidByMemberId);

              return (
                <div key={e.id} className="relative bg-white rounded-2xl border px-4 py-3 flex items-center justify-between shadow-sm" style={{ borderColor: currentTheme.border }}>
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${currentTheme.main}10` }}>
                      {isCard ? <CreditCard className="w-5 h-5" style={{ color: currentTheme.main }} /> : <Coins className="w-5 h-5" style={{ color: currentTheme.main }} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black truncate" style={{ color: currentTheme.text }}>{e.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ backgroundColor: cat.pillBg, color: cat.pillText }}>{cat.label}</span>
                        {e.mode === "ADVANCE" && <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ backgroundColor: `${currentTheme.main}15`, color: currentTheme.main }}>代墊</span>}
                        {e.payer === "THEM" && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gray-100 text-gray-600">
                            {paidMember ? `${paidMember.name}付` : "他付"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black" style={{ color: currentTheme.text }}>{formatCurrency(e.amount)}</span>
                    
                    <div className="relative">
                      <button 
                        onClick={(ev) => { ev.stopPropagation(); setMenuOpenId(menuOpenId === e.id ? null : e.id); }}
                        className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center transition"
                      >
                        <MoreHorizontal className="w-4 h-4 opacity-50" style={{ color: currentTheme.main }} />
                      </button>

                      {menuOpenId === e.id && (
                        <div 
                          className={`absolute right-0 z-35 w-32 bg-white border rounded-2xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${isNearBottom ? "bottom-9" : "top-9"}`}
                          style={{ borderColor: currentTheme.border }}
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <button 
                            onClick={() => { openEdit(e); setMenuOpenId(null); }}
                            className="flex items-center gap-2 px-3.5 py-2 text-[12px] font-bold hover:bg-black/5 w-full text-left transition"
                            style={{ color: currentTheme.text }}
                          >
                            <Pencil className="w-3.5 h-3.5 opacity-60" />
                            <span>編輯</span>
                          </button>
                          <button 
                            onClick={() => { deleteExpense(e.id); setMenuOpenId(null); }}
                            className="flex items-center gap-2 px-3.5 py-2 text-[12px] font-black text-red-500 hover:bg-red-50 w-full text-left transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>刪除</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 代墊與智慧互抵結算清單 Modal */}
      {advanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[32px] border shadow-xl overflow-hidden flex flex-col bg-white max-h-[85vh]" style={{ borderColor: currentTheme.border }}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between bg-white/50 border-b shrink-0" style={{ borderColor: `${currentTheme.border}40` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${currentTheme.main}15`, color: currentTheme.main }}>
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black" style={{ color: currentTheme.text }}>智慧互抵結算清單</h2>
                  <p className="text-[10px] tracking-[0.2em] uppercase font-black opacity-40" style={{ color: currentTheme.main }}>Net Settlement</p>
                </div>
              </div>
              <button onClick={() => setAdvanceModalOpen(false)} className="w-8 h-8 rounded-full border flex items-center justify-center bg-white shadow-sm" style={{ borderColor: currentTheme.border }}>
                <X className="w-4 h-4" style={{ color: currentTheme.main }} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider mb-2 opacity-50" style={{ color: currentTheme.text }}>✨ 我們的旅費小結算</p>

                {netSettlementList.length > 0 ? (
                  <div className="space-y-3">
                    {netSettlementList.map(item => {
                      const IconComp = getMemberIconComponent(item.avatarIcon);
                      const isPositive = item.net > 0; 
                      const absNet = Math.abs(item.net);

                      return (
                        <div key={item.id} className="p-4 rounded-2xl border bg-white shadow-sm space-y-3" style={{ borderColor: `${currentTheme.main}20` }}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${currentTheme.main}10`, color: currentTheme.main }}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-black" style={{ color: currentTheme.text }}>{item.name}</span>
                            </div>
                            
                            <div className="text-right">
                              {item.net === 0 ? (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-500">已完美互抵 ✨</span>
                              ) : isPositive ? (
                                <span className="px-3 py-1 rounded-full text-xs font-black" style={{ backgroundColor: `${currentTheme.main}20`, color: currentTheme.main }}>
                                  🎉 準備收回 {formatCurrency(absNet)}
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-50 text-orange-600">
                                  💌 準備給他 {formatCurrency(absNet)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: `${currentTheme.border}30` }}>
                            <div className="text-[11px] font-bold opacity-60" style={{ color: currentTheme.text }}>
                              <span>夥伴先幫墊: {formatCurrency(item.theyOweMe)}</span>
                              <span className="ml-3">你幫夥伴代付: {formatCurrency(item.iOweThem)}</span>
                            </div>

                            {(item.theyOweMe > 0 || item.iOweThem > 0) && (
                              <button
                                onClick={() => handleOneTouchSettle(item.id, item.name)}
                                className="px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all text-white"
                                style={{ backgroundColor: currentTheme.main }}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                一鍵結清
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-xs font-bold opacity-40 italic" style={{ color: currentTheme.text }}>目前大家帳目都很清爽，沒有待結算紀錄唷～</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal (新增/編輯花費) - 完美置中、絕對不被切到、美化日期欄位 */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-[32px] border shadow-2xl overflow-hidden flex flex-col bg-white my-auto max-h-[85vh]" style={{ borderColor: currentTheme.border }}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between bg-white/90 backdrop-blur border-b shrink-0 z-10" style={{ borderColor: `${currentTheme.border}40` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${currentTheme.main}15`, color: currentTheme.main }}>
                  <ReceiptText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black" style={{ color: currentTheme.text }}>{editingId ? "編輯花費" : "新增花費"}</h2>
                  <p className="text-[10px] tracking-[0.2em] uppercase font-black opacity-40" style={{ color: currentTheme.main }}>Add Expense</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setExpenseModalOpen(false)} className="w-8 h-8 rounded-full border flex items-center justify-center bg-white" style={{ borderColor: currentTheme.border }}><X className="w-4 h-4" style={{ color: currentTheme.main }} /></button>
                <button onClick={saveExpense} className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: currentTheme.main }}><Check className="w-4 h-4 text-white" /></button>
              </div>
            </div>
            
            {/* 捲動區塊與底部充足留白 pb-28 */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 pb-28">
              
              {/* 日期選擇美化：完美解決排版歪掉問題 */}
              <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>日期</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: currentTheme.main }}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={(e) => updateForm({ date: e.target.value })} 
                    className="w-full h-12 border rounded-2xl pl-11 pr-4 text-[13px] font-black bg-white outline-none focus:ring-2 appearance-none cursor-pointer" 
                    style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text, "--tw-ring-color": `${currentTheme.main}15` }} 
                  />
                </div>
              </div>
              
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

              {/* 為誰代墊：一排四個網格 */}
              {form.mode === "ADVANCE" && (
                <div className="rounded-2xl p-4 border animate-in slide-in-from-top-2" style={{ backgroundColor: `${currentTheme.main}05`, borderColor: `${currentTheme.main}20` }}>
                  <label className="text-[10px] font-black mb-3 block uppercase tracking-widest opacity-60" style={{ color: currentTheme.text }}>為誰代墊</label>
                  <div className="grid grid-cols-4 gap-2">
                    {members.map((m) => {
                      const isSelected = Array.isArray(form.advanceFor) && form.advanceFor.includes(m.id);
                      const IconComp = getMemberIconComponent(m.avatarIcon);
                      return (
                        <button key={m.id} onClick={() => toggleAdvance(m.id)} className={`py-2 px-1 rounded-xl text-[11px] font-black border flex flex-col items-center justify-center gap-1 transition-all ${isSelected ? "shadow-sm scale-105" : "bg-white opacity-50"}`} style={{ backgroundColor: isSelected ? `${currentTheme.main}20` : "white", borderColor: `${currentTheme.main}20`, color: currentTheme.text }}>
                          <IconComp className="w-4 h-4 shrink-0" />
                          <span className="truncate w-full text-center">{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] font-black mb-2 block uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>付款人</label>
                  <div className="flex gap-2">
                    {["ME", "THEM"].map((p) => ( 
                      <button key={p} onClick={() => updateForm({ payer: p })} className={`flex-1 py-2.5 rounded-xl text-[12px] font-black border transition-all ${form.payer === p ? "text-white shadow-sm" : "bg-white opacity-40 hover:opacity-100"}`} style={{ backgroundColor: form.payer === p ? currentTheme.main : "white", borderColor: `${currentTheme.main}20`, color: form.payer === p ? "white" : currentTheme.text }}> 
                        {p === "ME" ? "我付" : "他付"} 
                      </button> 
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black mb-2 block uppercase tracking-widest opacity-40" style={{ color: currentTheme.text }}>方式</label>
                  <div className="flex gap-2">
                    {["CASH", "CARD"].map((m) => ( 
                      <button key={m} onClick={() => updateForm({ payMethod: m })} className={`flex-1 py-2.5 rounded-xl text-[12px] font-black border transition-all ${form.payMethod === m ? "text-white shadow-sm" : "bg-white opacity-40 hover:opacity-100"}`} style={{ backgroundColor: form.payMethod === m ? currentTheme.main : "white", borderColor: `${currentTheme.main}20`, color: form.payMethod === m ? "white" : currentTheme.text }}> 
                        {m === "CASH" ? "現金" : "刷卡"} 
                      </button> 
                    ))}
                  </div>
                </div>
              </div>

              {/* 是哪位夥伴幫你付的？：一排四個網格 */}
              {form.payer === "THEM" && (
                <div className="rounded-2xl p-4 border animate-in slide-in-from-top-2" style={{ backgroundColor: `${currentTheme.main}05`, borderColor: `${currentTheme.main}20` }}>
                  <label className="text-[10px] font-black mb-3 block uppercase tracking-widest opacity-60" style={{ color: currentTheme.text }}>是哪位夥伴幫你付的？</label>
                  {members.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {members.map((m) => {
                        const isSelected = form.paidByMemberId === m.id;
                        const IconComp = getMemberIconComponent(m.avatarIcon);
                        return (
                          <button 
                            key={m.id} 
                            onClick={() => updateForm({ paidByMemberId: m.id })} 
                            className={`py-2 px-1 rounded-xl text-[11px] font-black border flex flex-col items-center justify-center gap-1 transition-all ${isSelected ? "shadow-sm scale-105" : "bg-white opacity-50"}`} 
                            style={{ backgroundColor: isSelected ? `${currentTheme.main}20` : "white", borderColor: `${currentTheme.main}20`, color: currentTheme.text }}
                          >
                            <IconComp className="w-4 h-4 shrink-0" />
                            <span className="truncate w-full text-center">{m.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs opacity-50 italic">尚未新增行程夥伴，請先至上方「夥伴」按鈕新增。</p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[32px] border shadow-xl overflow-hidden flex flex-col bg-white max-h-[85vh]" style={{ borderColor: currentTheme.border }}>
            <div className="px-6 pt-5 pb-3 flex items-start justify-between bg-white/50 border-b shrink-0" style={{ borderColor: `${currentTheme.border}40` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${currentTheme.main}15`, color: currentTheme.main }}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black" style={{ color: currentTheme.text }}>行程夥伴</h2>
                  <p className="text-[10px] tracking-[0.2em] uppercase font-black opacity-40" style={{ color: currentTheme.main }}>Partners</p>
                </div>
              </div>
              <button onClick={() => setMemberModalOpen(false)} className="w-8 h-8 rounded-full border flex items-center justify-center bg-white" style={{ borderColor: currentTheme.border }}><X className="w-4 h-4" style={{ color: currentTheme.main }} /></button>
            </div>
            
            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              {members.map((m, index) => {
                const currentIconId = m.avatarIcon || "Cat";
                const SelectedIconComp = getMemberIconComponent(currentIconId);
                const isPickerOpen = activeIconPickerId === m.id;
                
                const isTopThree = index < 3;

                return ( 
                  <div key={m.id} className="relative bg-white border rounded-2xl p-3 shadow-sm flex items-center gap-2" style={{ borderColor: `${currentTheme.main}20` }}> 
                    
                    <button
                      onClick={() => setActiveIconPickerId(isPickerOpen ? null : m.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-all hover:scale-105"
                      style={{ 
                        backgroundColor: `${currentTheme.main}10`,
                        borderColor: `${currentTheme.main}30`,
                        color: currentTheme.main
                      }}
                      title="點擊更換圖示"
                    >
                      <SelectedIconComp className="w-5 h-5" />
                    </button>

                    <input 
                      value={m.name} 
                      onChange={(e) => setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))} 
                      className="flex-1 min-w-0 outline-none text-[13px] font-bold bg-transparent px-2" 
                      style={{ color: currentTheme.text }} 
                      placeholder="成員名稱 (例如：小慈)" 
                    /> 

                    <button onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))} className="p-2 rounded-full hover:bg-red-50 text-red-500 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isPickerOpen && (
                      <div 
                        className={`absolute left-3 z-20 bg-white rounded-2xl border p-3 shadow-xl w-[260px] animate-in fade-in zoom-in-95 ${
                          isTopThree ? "top-16" : "bottom-16"
                        }`} 
                        style={{ borderColor: currentTheme.border }}
                      >
                        <div className="flex justify-between items-center mb-2 pb-1.5 border-b" style={{ borderColor: `${currentTheme.border}40` }}>
                          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: currentTheme.text }}>選擇專屬圖示</span>
                          <button onClick={() => setActiveIconPickerId(null)} className="w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-50 hover:opacity-100">✕</button>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {ICON_OPTIONS.map((opt) => {
                            const IconComp = opt.icon;
                            const isSelected = currentIconId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, avatarIcon: opt.id } : x)));
                                  setActiveIconPickerId(null);
                                }}
                                className={`h-9 rounded-xl flex items-center justify-center border transition-all ${isSelected ? "shadow-sm scale-105" : "opacity-50 hover:opacity-100"}`}
                                style={{ 
                                  backgroundColor: isSelected ? `${currentTheme.main}20` : "white",
                                  borderColor: isSelected ? currentTheme.main : `${currentTheme.main}20`,
                                  color: isSelected ? currentTheme.main : currentTheme.text
                                }}
                              >
                                <IconComp className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div> 
                );
              })}
              <button onClick={() => setMembers((prev) => [...prev, { id: `m-${Date.now()}`, name: "", avatarIcon: "Cat" }])} className="w-full py-3 border-2 border-dashed rounded-2xl text-[11px] font-black transition-all hover:bg-gray-50 active:scale-[0.98]" style={{ borderColor: `${currentTheme.main}30`, color: currentTheme.main }}> + 新增夥伴 </button>
            </div>
            
            <div className="p-6 border-t shrink-0" style={{ borderColor: `${currentTheme.border}10` }}>
              <button onClick={() => setMemberModalOpen(false)} className="w-full py-4 text-white rounded-2xl font-black shadow-md active:scale-95 transition-all" style={{ backgroundColor: currentTheme.main }}>確認儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}