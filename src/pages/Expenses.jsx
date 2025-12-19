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
} from "lucide-react";

// ✅ STEP5-CHANGE: Viewer-only localStorage key（viewer 改的只存自己）
const VIEWER_EXPENSES_KEY = "viewer_expenses_v1";

// 類別定義
const CATEGORY_MAP = {
TRANSPORT: { key: "TRANSPORT", label: "交通", icon: Train },
FOOD: { key: "FOOD", label: "餐飲", icon: UtensilsCrossed },
SIGHT: { key: "SIGHT", label: "景點", icon: Landmark },
SHOP: { key: "SHOP", label: "購物", icon: ShoppingBag },
};

const CATEGORY_ORDER = ["TRANSPORT", "FOOD", "SIGHT", "SHOP"];

const DEFAULT_DATA = {
members: [
{ id: "m1", name: "A" },
{ id: "m2", name: "B" },
{ id: "m3", name: "C" },
],
expenses: [],
};

// 日期格式化
function todayString() {
const d = new Date();
return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
2,
"0"
)}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Expenses({ trip, setTrip }) {
if (!trip) return null;

// ✅ STEP5-CHANGE: 判斷 viewer（可編輯但只存自己）
const isViewer = trip?.shareMode === "viewer";

// ✅ STEP5-CHANGE: viewer 的資料容器（members/expenses/exchangeRate 都放這裡）
const [viewerData, setViewerData] = useState(null);

// ✅ STEP5-CHANGE: 依模式分流資料來源
const members = isViewer
  ? (viewerData?.members || DEFAULT_DATA.members)
  : (trip.members || DEFAULT_DATA.members);

const expenses = isViewer
  ? (viewerData?.expenses || [])
  : (trip.expenses || []);

const exchangeRate = isViewer
  ? (viewerData?.exchangeRate || trip.exchangeRate || null)
  : (trip.exchangeRate || null);

// ✅ STEP5-CHANGE: viewer 初始化（只跑一次）
useEffect(() => {
  if (!isViewer) return;

  try {
    const raw = localStorage.getItem(VIEWER_EXPENSES_KEY);
    if (raw) {
      setViewerData(JSON.parse(raw));
    } else {
      const init = {
        members: DEFAULT_DATA.members,
        expenses: [],
        exchangeRate: trip.exchangeRate || null, // 先用 owner 的匯率當預設也可以
      };
      localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(init));
      setViewerData(init);
    }
  } catch (e) {
    const init = { members: DEFAULT_DATA.members, expenses: [], exchangeRate: trip.exchangeRate || null };
    localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(init));
    setViewerData(init);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isViewer]);

// ✅ STEP5-CHANGE: members 更新（viewer -> localStorage / owner -> trip）
const setMembers = (updater) => {
  if (isViewer) {
    setViewerData((prev) => {
      const base = prev || { members: DEFAULT_DATA.members, expenses: [], exchangeRate: exchangeRate || null };
      const nextMembers =
        typeof updater === "function" ? updater(base.members || DEFAULT_DATA.members) : updater;

      const next = { ...base, members: nextMembers };
      localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
      return next;
    });
    return;
  }

  // owner 原本邏輯（寫回 trip）
  setTrip((prev) => ({
    ...prev,
    members:
      typeof updater === "function"
        ? updater(prev.members || DEFAULT_DATA.members)
        : updater,
  }));
};

// ✅ STEP5-CHANGE: expenses 更新（viewer -> localStorage / owner -> trip）
const setExpenses = (updater) => {
  if (isViewer) {
    setViewerData((prev) => {
      const base = prev || { members: DEFAULT_DATA.members, expenses: [], exchangeRate: exchangeRate || null };
      const nextExpenses =
        typeof updater === "function" ? updater(base.expenses || []) : updater;

      const next = { ...base, expenses: nextExpenses };
      localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
      return next;
    });
    return;
  }

  // owner 原本邏輯（寫回 trip）
  setTrip((prev) => ({
    ...prev,
    expenses:
      typeof updater === "function"
        ? updater(prev.expenses || [])
        : updater,
  }));
};

useEffect(() => {
  if (!trip) return;

  const last = exchangeRate?.updatedAt || 0;
  const ONE_DAY = 1000 * 60 * 60 * 24;
  if (Date.now() - last < ONE_DAY) return;

  async function fetchRate() {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/JPY");
      const data = await res.json();
      if (!data?.rates?.TWD) return;

      const rateData = {
        JPY_TWD: data.rates.TWD,
        updatedAt: Date.now(),
      };

      if (isViewer) {
        setViewerData((prev) => {
          const base = prev || {
            members: DEFAULT_DATA.members,
            expenses: [],
            exchangeRate: null,
          };
          const next = { ...base, exchangeRate: rateData };
          localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
          return next;
        });
      } else {
        setTrip((prev) => ({
          ...prev,
          exchangeRate: rateData,
        }));
      }
    } catch (e) {
      console.error("匯率抓取失敗", e);
    }
  }

  fetchRate();
}, [trip, isViewer, exchangeRate]);

// Modal 狀態
const [expenseModalOpen, setExpenseModalOpen] = useState(false);
const [memberModalOpen, setMemberModalOpen] = useState(false);

const [editingId, setEditingId] = useState(null);

// 表單
const [form, setForm] = useState({
date: todayString(),
category: "TRANSPORT",
title: "",
amount: "",
mode: "PERSONAL",
advanceFor: [],
payer: "ME",
payMethod: "CASH",
});

// 類別篩選
const [filterCategory, setFilterCategory] = useState("ALL");

// ✅ STEP5-CHANGE: 匯率來源改用 exchangeRate（已分流）
const YEN_TO_TWD = exchangeRate?.JPY_TWD || 0.22;

// 計算總額
const totalYen = useMemo(
() => expenses.reduce((s, e) => s + Number(e.amount), 0),
[expenses]
);

const totalTwd = Math.round(totalYen * YEN_TO_TWD);

// 類別小計
const categoryTotals = useMemo(() => {
const r = { TRANSPORT: 0, FOOD: 0, SIGHT: 0, SHOP: 0 };
expenses.forEach((e) => (r[e.category] += Number(e.amount)));
return r;
}, [expenses]);

// 代墊計算
const advanceSummary = useMemo(() => {
const map = {};
expenses.forEach((e) => {
if (e.mode !== "ADVANCE") return;
if (e.payer !== "ME") return;

const share = Number(e.amount) / e.advanceFor.length;
e.advanceFor.forEach((id) => {
map[id] = (map[id] || 0) + share;
});
});

return Object.entries(map).map(([id, amt]) => ({
id,
name: members.find((m) => m.id === id)?.name || "",
amount: Math.round(amt),
}));
}, [expenses, members]);

// 依日期分組
const groupedByDate = useMemo(() => {
const map = {};
expenses.forEach((e) => {
if (filterCategory !== "ALL" && e.category !== filterCategory) return;
if (!map[e.date]) map[e.date] = [];
map[e.date].push(e);
});

return Object.entries(map)
.sort(([a], [b]) => (a < b ? 1 : -1))
.map(([date, items]) => ({
date,
dayTotal: items.reduce((s, e) => s + Number(e.amount), 0),
items,
}));
}, [expenses, filterCategory]);

const openAdd = () => {
setEditingId(null);
setForm({
date: todayString(),
category: "TRANSPORT",
title: "",
amount: "",
mode: "PERSONAL",
advanceFor: [],
payer: "ME",
payMethod: "CASH",
});
setExpenseModalOpen(true);
};

const openEdit = (exp) => {
setEditingId(exp.id);
setForm({ ...exp, amount: String(exp.amount) });
setExpenseModalOpen(true);
};

const updateForm = (patch) => setForm((p) => ({ ...p, ...patch }));

const toggleAdvance = (id) => {
setForm((p) => ({
...p,
advanceFor: p.advanceFor.includes(id)
? p.advanceFor.filter((x) => x !== id)
: [...p.advanceFor, id],
}));
};

const saveExpense = () => {
if (!form.title.trim()) return alert("請輸入項目名稱");
if (!form.amount || Number(form.amount) <= 0)
return alert("金額錯誤");

const newItem = {
...form,
id: editingId || `e-${Date.now()}`,
amount: Number(form.amount),
createdAt: editingId
? expenses.find((e) => e.id === editingId)?.createdAt
: Date.now(),
};

if (editingId) {
setExpenses((prev) =>
prev.map((e) => (e.id === editingId ? newItem : e))
);
} else {
setExpenses((prev) => [...prev, newItem]);
}

setExpenseModalOpen(false);
};

const deleteExpense = (id) => {
if (!window.confirm("刪除?")) return;
setExpenses((prev) => prev.filter((e) => e.id !== id));
};

const formatYen = (n) => `¥${n.toLocaleString("ja-JP")}`;

return (
<div className="px-4 py-6 pb-24">

{/* ---------------- Header（新版） ---------------- */}
<PageHeader
  icon={Wallet}
  title="花費總覽"
  subtitle="EXPENSES"
/>

{/* -------------- Buttons -------------- */}
<div className="flex justify-end gap-2 mb-6">
<button
onClick={() => setMemberModalOpen(true)}
className="px-3 py-1.5 rounded-full border border-[#C6A087] text-sm text-[#5A4636]"
>
<Users className="w-4 h-4 inline" /> 成員
</button>
<button
onClick={openAdd}
className="px-3 py-1.5 bg-[#C6A087] text-white rounded-full"
>
<PlusCircle className="w-4 h-4 inline" /> 新增
</button>
</div>

 {/* ----------------- 總額區塊 ----------------- */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <div className="bg-[#4A372A] text-white rounded-2xl p-5">
 <p className="text-sm tracking-[0.2em]">TOTAL</p>
 <p className="text-3xl font-bold">{formatYen(totalYen)}</p>
 <p className="text-xs text-white/70">
 ≈ NT${totalTwd.toLocaleString()}
 </p>
 </div>

 {/* 類別統計 */}
 <div className="md:col-span-2 grid grid-cols-2 gap-3">
 {CATEGORY_ORDER.map((c) => {
 const Icon = CATEGORY_MAP[c].icon;
 return (
 <div
 key={c}
 className="bg-white rounded-2xl border border-[#E5D5C5] px-4 py-3 flex items-center gap-3"
 >
 <div className="w-8 h-8 rounded-full border border-[#C6A087] flex items-center justify-center">
 <Icon className="w-4 h-4 text-[#C6A087]" />
 </div>
 <div>
 <p className="text-xs text-[#8C6A4F]/70">
 {CATEGORY_MAP[c].label}
 </p>
 <p className="text-sm font-semibold">
 {formatYen(categoryTotals[c])}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* ----------------- 代墊結算 ----------------- */}
 <div className="bg-[#a9846a] text-white rounded-2xl p-5 mb-8">
 <p className="text-sm font-semibold">代墊結算</p>
 <p className="text-2xl font-bold">
 {formatYen(
 advanceSummary.reduce((s, a) => s + a.amount, 0)
 )}
 </p>

 <div className="mt-3 space-y-2">
 {advanceSummary.length === 0 ? (
 <p className="text-xs text-white/80">
 尚無代墊紀錄
 </p>
 ) : (
 advanceSummary.map((a) => (
 <div
 key={a.id}
 className="flex justify-between bg-white/10 px-3 py-1.5 rounded-full"
 >
 <span>{a.name}</span>
 <span>{formatYen(a.amount)}</span>
 </div>
 ))
 )}
 </div>
 </div>

 {/* ----------------- 篩選 Tabs ----------------- */}
 <div className="flex gap-2 mb-3">
 {[
 { key: "ALL", label: "全部" },
 ...CATEGORY_ORDER.map((c) => ({
 key: c,
 label: CATEGORY_MAP[c].label,
 })),
 ].map((t) => (
 <button
 key={t.key}
 onClick={() => setFilterCategory(t.key)}
 className={`px-3 py-1 rounded-full text-xs ${
 filterCategory === t.key
 ? "bg-[#8C6A4F] text-white"
 : "bg-white border border-[#E5D5C5] text-[#5A4636]"
 }`}
 >
 {t.label}
 </button>
 ))}
 </div>

 {/* ----------------- 近期花費 ----------------- */}
 <h3 className="text-lg font-semibold text-[#5A4636] mb-2">
 近期花費
 </h3>

 <div className="space-y-4">
 {groupedByDate.map((group) => (
 <div key={group.date} className="space-y-2">
 <div className="flex justify-between text-xs text-[#8C6A4F]/70">
 <span>{group.date}</span>
 <span>{formatYen(group.dayTotal)}</span>
 </div>

 {group.items.map((e) => {
 const isCard = e.payMethod === "CARD";
 return (
 <div
 key={e.id}
 className="bg-white rounded-2xl border border-[#F0E3D5] px-4 py-3 flex items-center justify-between"
 >
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 rounded-full bg-[#F5EEE6] flex items-center justify-center">
 {isCard ? (
 <CreditCard className="w-5 h-5 text-[#C6A087]" />
 ) : (
 <Wallet className="w-5 h-5 text-[#C6A087]" />
 )}
 </div>

 <div>
 <p className="text-sm font-semibold text-[#5A4636]">
 {e.title}
 </p>
 <div className="flex flex-wrap gap-1 text-[11px] text-[#8C6A4F] mt-1">
 <span className="bg-[#F5EEE6] px-2 py-0.5 rounded-full">
 {CATEGORY_MAP[e.category].label}
 </span>
 {e.mode === "ADVANCE" && (
 <span className="bg-[#F5EEE6] px-2 py-0.5 rounded-full">
 代墊
 </span>
 )}
 <span className="bg-[#F5EEE6] px-2 py-0.5 rounded-full">
 {e.payMethod === "CARD" ? "刷卡" : "現金"}
 </span>
 </div>
 </div>
 </div>

 <div className="flex flex-col items-end gap-2">
 <span className="text-sm font-bold">
 {formatYen(e.amount)}
 </span>
 <div className="flex gap-2">
 <button
 onClick={() => openEdit(e)}
 className="p-1 rounded-full bg-white border border-[#E5D5C5]"
 >
 <Pencil className="w-3 h-3 text-[#5A4636]" />
 </button>
 <button
 onClick={() => deleteExpense(e.id)}
 className="p-1 rounded-full bg-white border border-[#E5D5C5]"
 >
 <Trash2 className="w-3 h-3 text-red-500" />
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 ))}
 </div>

 {/* ----------------- 新增 / 編輯 Modal ----------------- */}
 {expenseModalOpen && (
 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
 <div className="w-full max-w-lg bg-[#FFF9F2] border border-[#F0E3D5] rounded-2xl p-4">
 <div className="flex justify-between items-center pb-3 border-b">
 <h2 className="text-sm font-bold text-[#5A4636]">
 {editingId ? "編輯花費" : "新增花費"}
 </h2>
 <button
 onClick={() => setExpenseModalOpen(false)}
 className="p-1 hover:bg-black/10 rounded-full"
 >
 <X className="w-4 h-4 text-[#8C6A4F]" />
 </button>
 </div>

 <div className="space-y-3 mt-4 text-sm">
 {/* 日期 */}
 <div>
 <label className="block text-xs text-[#8C6A4F] mb-1">
 日期
 </label>
 <input
 type="date"
 value={form.date}
 onChange={(e) => updateForm({ date: e.target.value })}
 className="w-full border rounded-md px-3 py-2 text-sm"
 />
 </div>

 {/* 類別 */}
 <div>
 <label className="block text-xs text-[#8C6A4F] mb-1">
 類別
 </label>
 <div className="flex gap-2 flex-wrap">
 {CATEGORY_ORDER.map((c) => {
 const Icon = CATEGORY_MAP[c].icon;
 return (
 <button
 key={c}
 onClick={() => updateForm({ category: c })}
 className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1 ${
 form.category === c
 ? "bg-[#C6A087] text-white"
 : "bg-white border border-[#E5D5C5]"
 }`}
 >
 <Icon className="w-3 h-3" />
 {CATEGORY_MAP[c].label}
 </button>
 );
 })}
 </div>
 </div>

 {/* 項目 + 金額 */}
 <div className="grid grid-cols-3 gap-2">
 <div className="col-span-2">
 <label className="block text-xs text-[#8C6A4F] mb-1">
 項目
 </label>
 <input
 type="text"
 value={form.title}
 onChange={(e) => updateForm({ title: e.target.value })}
 className="w-full border rounded-md px-3 py-2 text-sm"
 />
 </div>
 <div>
 <label className="block text-xs text-[#8C6A4F] mb-1">
 金額
 </label>
 <input
 type="number"
 value={form.amount}
 onChange={(e) => updateForm({ amount: e.target.value })}
 className="w-full border rounded-md px-3 py-2 text-sm"
 />
 </div>
 </div>

 {/* 個人/代墊 */}
 <div>
 <label className="block text-xs text-[#8C6A4F] mb-1">
 類型
 </label>
 <div className="flex gap-2">
 <button
 onClick={() => updateForm({ mode: "PERSONAL" })}
 className={`px-3 py-1.5 rounded-full text-xs ${
 form.mode === "PERSONAL"
 ? "bg-[#C6A087] text-white"
 : "bg-white border"
 }`}
 >
 個人
 </button>
 <button
 onClick={() => updateForm({ mode: "ADVANCE" })}
 className={`px-3 py-1.5 rounded-full text-xs ${
 form.mode === "ADVANCE"
 ? "bg-[#C6A087] text-white"
 : "bg-white border"
 }`}
 >
 代墊
 </button>
 </div>
 </div>

 {/* 為誰代墊 */}
 {form.mode === "ADVANCE" && (
 <div>
 <label className="text-xs text-[#8C6A4F]">
 代墊對象
 </label>
 <div className="flex flex-wrap gap-2 mt-2">
 {members.map((m) => (
 <button
 key={m.id}
 onClick={() => toggleAdvance(m.id)}
 className={`px-3 py-1 rounded-full text-xs ${
 form.advanceFor.includes(m.id)
 ? "bg-[#F3C075]"
 : "bg-white border"
 }`}
 >
 {m.name}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* 付款方式 */}
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-xs text-[#8C6A4F]">誰付</label>
 <div className="flex gap-2 mt-2">
 <button
 onClick={() => updateForm({ payer: "ME" })}
 className={`px-3 py-1.5 rounded-full text-xs ${
 form.payer === "ME"
 ? "bg-[#C6A087] text-white"
 : "bg-white border"
 }`}
 >
 我付
 </button>
 <button
 onClick={() => updateForm({ payer: "THEM" })}
 className={`px-3 py-1.5 rounded-full text-xs ${
 form.payer === "THEM"
 ? "bg-[#C6A087] text-white"
 : "bg-white border"
 }`}
 >
 他付
 </button>
 </div>
 </div>

 <div>
 <label className="text-xs text-[#8C6A4F]">付款方式</label>
 <div className="flex gap-2 mt-2">
 <button
 onClick={() => updateForm({ payMethod: "CASH" })}
 className={`px-3 py-1.5 rounded-full text-xs ${
 form.payMethod === "CASH"
 ? "bg-[#C6A087] text-white"
 : "bg-white border"
 }`}
 >
 現金
 </button>
 <button
 onClick={() => updateForm({ payMethod: "CARD" })}
 className={`px-3 py-1.5 rounded-full text-xs ${
 form.payMethod === "CARD"
 ? "bg-[#C6A087] text-white"
 : "bg-white border"
 }`}
 >
 刷卡
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="flex justify-end gap-2 pt-4 border-t mt-4">
 <button
 onClick={() => setExpenseModalOpen(false)}
 className="px-3 py-1.5 border rounded-full text-xs"
 >
 取消
 </button>
 <button
 onClick={saveExpense}
 className="px-4 py-1.5 bg-[#C6A087] text-white rounded-full text-xs"
 >
 儲存
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ----------------- 成員設定 Modal ----------------- */}
 {memberModalOpen && (
 <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
 <div className="w-full max-w-lg bg-[#FFF9F2] rounded-2xl border p-4">
 <div className="flex justify-between items-center pb-3 border-b">
 <h2 className="text-sm font-bold text-[#5A4636]">
 成員管理
 </h2>
 <button
 onClick={() => setMemberModalOpen(false)}
 className="p-1 hover:bg-black/10 rounded-full"
 >
 <X className="w-4 h-4 text-[#8C6A4F]" />
 </button>
 </div>

 <div className="mt-4 space-y-3">
 {members.map((m) => (
 <div
 key={m.id}
 className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2"
 >
 <input
 value={m.name}
 onChange={(e) =>
 setMembers((prev) =>
 prev.map((x) =>
 x.id === m.id ? { ...x, name: e.target.value } : x
 )
 )
 }
 className="flex-1 outline-none text-sm"
 placeholder="成員名稱"
 />
 <button
 onClick={() =>
 setMembers((prev) =>
 prev.filter((x) => x.id !== m.id)
 )
 }
 className="p-1 rounded-full hover:bg-red-50"
 >
 <Trash2 className="w-3 h-3 text-red-500" />
 </button>
 </div>
 ))}

 <button
 onClick={() =>
 setMembers((prev) => [
 ...prev,
 { id: `m-${Date.now()}`, name: "" },
 ])
 }
 className="w-full py-2 border border-dashed rounded-lg text-xs"
 >
 + 新增成員
 </button>
 </div>

 <div className="flex justify-end border-t mt-4 pt-3">
 <button
 onClick={() => setMemberModalOpen(false)}
 className="px-4 py-1.5 border rounded-full text-xs"
 >
 完成
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}