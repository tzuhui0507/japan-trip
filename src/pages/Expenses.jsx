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
} from "lucide-react";

// ✅ STEP5-CHANGE: Viewer-only localStorage key
const VIEWER_EXPENSES_KEY = "viewer_expenses_v1";

const CATEGORY_MAP = {
  TRANSPORT: {
    key: "TRANSPORT",
    label: "交通",
    icon: Train,
    color: "#6B8EAE",
  },
  FOOD: {
    key: "FOOD",
    label: "餐飲",
    icon: UtensilsCrossed,
    color: "#C58B4B",
  },
  SIGHT: {
    key: "SIGHT",
    label: "景點",
    icon: Landmark,
    color: "#8A7CC2",
  },
  SHOP: {
    key: "SHOP",
    label: "購物",
    icon: ShoppingBag,
    color: "#5F8F6B",
  },
};

const CATEGORY_ORDER = ["TRANSPORT", "FOOD", "SIGHT", "SHOP"];

const DEFAULT_DATA = {
  members: [],
  expenses: [],
};

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Expenses({ trip, setTrip }) {
  if (!trip) return null;

  const isViewer = trip?.shareMode === "viewer";
  const [viewerData, setViewerData] = useState(null);

  const members = isViewer
    ? (viewerData?.members || DEFAULT_DATA.members)
    : (trip.members || DEFAULT_DATA.members);

  const expenses = isViewer
    ? (viewerData?.expenses || [])
    : (trip.expenses || []);

  const exchangeRate = isViewer
    ? (viewerData?.exchangeRate || trip.exchangeRate || null)
    : (trip.exchangeRate || null);

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
          exchangeRate: trip.exchangeRate || null,
        };
        localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(init));
        setViewerData(init);
      }
    } catch (e) {
      const init = { members: DEFAULT_DATA.members, expenses: [], exchangeRate: trip.exchangeRate || null };
      localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(init));
      setViewerData(init);
    }
  }, [isViewer, trip.exchangeRate]);

  const setMembers = (updater) => {
    if (isViewer) {
      setViewerData((prev) => {
        const base = prev || { members: DEFAULT_DATA.members, expenses: [], exchangeRate: exchangeRate || null };
        const nextMembers = typeof updater === "function" ? updater(base.members || DEFAULT_DATA.members) : updater;
        const next = { ...base, members: nextMembers };
        localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }
    setTrip((prev) => ({
      ...prev,
      members: typeof updater === "function" ? updater(prev.members || DEFAULT_DATA.members) : updater,
    }));
  };

  const setExpenses = (updater) => {
    if (isViewer) {
      setViewerData((prev) => {
        const base = prev || { members: DEFAULT_DATA.members, expenses: [], exchangeRate: exchangeRate || null };
        const nextExpenses = typeof updater === "function" ? updater(base.expenses || []) : updater;
        const next = { ...base, expenses: nextExpenses };
        localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }
    setTrip((prev) => ({
      ...prev,
      expenses: typeof updater === "function" ? updater(prev.expenses || []) : updater,
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
        const rateData = { JPY_TWD: data.rates.TWD, updatedAt: Date.now() };
        if (isViewer) {
          setViewerData((prev) => {
            const base = prev || { members: DEFAULT_DATA.members, expenses: [], exchangeRate: null };
            const next = { ...base, exchangeRate: rateData };
            localStorage.setItem(VIEWER_EXPENSES_KEY, JSON.stringify(next));
            return next;
          });
        } else {
          setTrip((prev) => ({ ...prev, exchangeRate: rateData }));
        }
      } catch (e) {
        console.error("匯率抓取失敗", e);
      }
    }
    fetchRate();
  }, [trip, isViewer, exchangeRate]);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  const [filterCategory, setFilterCategory] = useState("ALL");
  const YEN_TO_TWD = exchangeRate?.JPY_TWD || 0.22;

  const totalYen = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses]);
  const totalTwd = Math.round(totalYen * YEN_TO_TWD);

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
      advanceFor: p.advanceFor.includes(id) ? p.advanceFor.filter((x) => x !== id) : [...p.advanceFor, id],
    }));
  };

  const saveExpense = () => {
    if (!form.title.trim()) return alert("請輸入項目名稱");
    if (!form.amount || Number(form.amount) <= 0) return alert("金額錯誤");
    const newItem = {
      ...form,
      id: editingId || `e-${Date.now()}`,
      amount: Number(form.amount),
      createdAt: editingId ? expenses.find((e) => e.id === editingId)?.createdAt : Date.now(),
    };
    if (editingId) {
      setExpenses((prev) => prev.map((e) => (e.id === editingId ? newItem : e)));
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
      <PageHeader icon={Wallet} title="花費總覽" subtitle="EXPENSES" />

      <div className="flex justify-end gap-2 mb-6">
        <button onClick={() => setMemberModalOpen(true)} className="px-3 py-1.5 rounded-full border border-[#C6A087] text-sm text-[#5A4636] flex items-center gap-1">
          <Users className="w-4 h-4" />成員
        </button>
        <button onClick={openAdd} className="px-3 py-1.5 bg-[#C6A087] text-white rounded-full flex items-center gap-1 shadow-sm">
          <PlusCircle className="w-4 h-4" />新增
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#4A372A] text-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm tracking-[0.2em] opacity-80">TOTAL</p>
          <p className="text-3xl font-bold">{formatYen(totalYen)}</p>
          <p className="text-xs text-white/70">≈ NT${totalTwd.toLocaleString()}</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {CATEGORY_ORDER.map((c) => {
            const Icon = CATEGORY_MAP[c].icon;
            const style = {
              TRANSPORT: { bg: "#E4F1E3", color: "#4E6B48" },
              FOOD: { bg: "#FBE7DF", color: "#8C4A2F" },
              SIGHT: { bg: "#E7EEF9", color: "#4A607F" },
              SHOP: { bg: "#F3E3F0", color: "#7A4D6E" },
            }[c];

            return (
              <div key={c} className="bg-white rounded-2xl border border-[#E5D5C5] px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: style.bg }}>
                  <Icon className="w-4 h-4" style={{ color: style.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#8C6A4F]/70 truncate">{CATEGORY_MAP[c].label}</p>
                  <p className="text-sm font-semibold truncate">{formatYen(categoryTotals[c])}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#a9846a] text-white rounded-2xl p-5 mb-8 shadow-sm">
        <p className="text-sm font-semibold opacity-90">代墊結算</p>
        <p className="text-2xl font-bold">{formatYen(advanceSummary.reduce((s, a) => s + a.amount, 0))}</p>
        <div className="mt-3 space-y-2">
          {advanceSummary.length === 0 ? (
            <p className="text-xs text-white/80">尚無代墊紀錄</p>
          ) : (
            advanceSummary.map((a) => (
              <div key={a.id} className="flex justify-between bg-white/10 px-4 py-1.5 rounded-full text-xs">
                <span>{a.name}</span>
                <span>{formatYen(a.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
        {[{ key: "ALL", label: "全部" }, ...CATEGORY_ORDER.map((c) => ({ key: c, label: CATEGORY_MAP[c].label }))].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterCategory(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs shrink-0 transition-colors ${filterCategory === t.key ? "bg-[#8C6A4F] text-white shadow-sm" : "bg-white border border-[#E5D5C5] text-[#5A4636]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-[#5A4636] mb-2 px-1">近期花費</h3>

      <div className="space-y-4">
        {groupedByDate.map((group) => (
          <div key={group.date} className="space-y-2">
            <div className="flex justify-between text-xs text-[#8C6A4F]/70 px-1">
              <span>{group.date}</span>
              <span>{formatYen(group.dayTotal)}</span>
            </div>
            {group.items.map((e) => {
              const isCard = e.payMethod === "CARD";
              return (
                <div key={e.id} className="bg-white rounded-2xl border border-[#F0E3D5] px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#F5EEE6] flex items-center justify-center shrink-0">
                      {isCard ? <CreditCard className="w-5 h-5 text-[#C6A087]" /> : <Wallet className="w-5 h-5 text-[#C6A087]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#5A4636] truncate">{e.title}</p>
                      <div className="flex flex-wrap gap-1 text-[11px] text-[#8C6A4F] mt-1">
                        <span className="bg-[#F5EEE6] px-2 py-0.5 rounded-full">{CATEGORY_MAP[e.category].label}</span>
                        {e.mode === "ADVANCE" && <span className="bg-[#F5EEE6] px-2 py-0.5 rounded-full">代墊</span>}
                        <span className="bg-[#F5EEE6] px-2 py-0.5 rounded-full">{e.payMethod === "CARD" ? "刷卡" : "現金"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-bold">{formatYen(e.amount)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(e)} className="p-1 rounded-full bg-white border border-[#E5D5C5] hover:bg-[#F5EEE6] transition-colors">
                        <Pencil className="w-3 h-3 text-[#5A4636]" />
                      </button>
                      <button onClick={() => deleteExpense(e.id)} className="p-1 rounded-full bg-white border border-[#E5D5C5] hover:bg-red-50 transition-colors">
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

      {/* ----------------- 新增 / 編輯 Modal (優化外框與佈局) ----------------- */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12">
          <div className="w-full max-w-lg bg-[#FFF9F2] rounded-[32px] border border-[#E5D5C5] shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 pt-5 pb-3 flex items-start justify-between bg-white/50">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#C6A087] mb-1">新增花費</p>
                <h2 className="text-lg font-bold text-[#5A4636]">{editingId ? "編輯項目" : "新增項目"}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setExpenseModalOpen(false)} className="w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white">
                  <X className="w-4 h-4 text-[#8C6A4F]" />
                </button>
                <button onClick={saveExpense} className="w-9 h-9 rounded-full bg-[#C6A087] flex items-center justify-center shadow-sm">
                  <Check className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh] scrollbar-hide">
              <div>
                <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">日期</label>
                <input type="date" value={form.date} onChange={(e) => updateForm({ date: e.target.value })} className="w-full h-10 border border-[#E5D5C5] rounded-xl px-3 text-[13px] bg-white outline-none focus:ring-1 focus:ring-[#C6A087] appearance-none" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">類別</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {CATEGORY_ORDER.map((c) => {
                    const Icon = CATEGORY_MAP[c].icon;
                    const active = form.category === c;
                    return (
                      <button key={c} onClick={() => updateForm({ category: c })} className={`py-2 rounded-xl text-[11px] flex flex-col items-center gap-1 border transition-all ${active ? "bg-[#C6A087] border-[#C6A087] text-white shadow-sm" : "bg-white border-[#E5D5C5] text-[#5A4636]"}`}>
                        <Icon className="w-3.5 h-3.5" />{CATEGORY_MAP[c].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">項目</label>
                  <input type="text" value={form.title} onChange={(e) => updateForm({ title: e.target.value })} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-[13px] bg-white outline-none" placeholder="例如：Sky Liner" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">金額</label>
                  <input type="number" value={form.amount} onChange={(e) => updateForm({ amount: e.target.value })} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-2 text-[13px] bg-white outline-none" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">類型</label>
                <div className="flex gap-2">
                  {["PERSONAL", "ADVANCE"].map((m) => (
                    <button key={m} onClick={() => updateForm({ mode: m })} className={`flex-1 py-2 rounded-xl text-[13px] border transition-all ${form.mode === m ? "bg-[#C6A087] border-[#C6A087] text-white shadow-sm" : "bg-white border-[#E5D5C5] text-[#5A4636]"}`}>
                      {m === "PERSONAL" ? "個人" : "代墊"}
                    </button>
                  ))}
                </div>
              </div>

              {form.mode === "ADVANCE" && (
                <div className="bg-[#FDF9F5] border border-[#E5D5C5] rounded-2xl p-3 animate-in fade-in zoom-in-95 duration-200">
                  <label className="text-[10px] font-bold text-[#8C6A4F] mb-2 block uppercase tracking-widest">為誰代墊</label>
                  <div className="flex flex-wrap gap-1.5">
                    {members.map((m) => (
                      <button key={m.id} onClick={() => toggleAdvance(m.id)} className={`px-3 py-1.5 rounded-full text-[11px] border transition-all ${form.advanceFor.includes(m.id) ? "bg-[#F3C075] border-[#F3C075] text-[#5A4636] shadow-sm" : "bg-white border-[#E5D5C5] text-[#5A4636]"}`}>
                        {m.name}
                      </button>
                    ))}
                    {members.length === 0 && <p className="text-[11px] text-[#8C6A4F]/60">請先新增成員</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#8C6A4F] mb-1.5 block uppercase tracking-widest">誰付款</label>
                  <div className="flex gap-2">
                    {["ME", "THEM"].map((p) => (
                      <button key={p} onClick={() => updateForm({ payer: p })} className={`flex-1 py-2 rounded-xl text-[13px] border transition-all ${form.payer === p ? "bg-[#C6A087] border-[#C6A087] text-white shadow-sm" : "bg-white border-[#E5D5C5] text-[#5A4636]"}`}>
                        {p === "ME" ? "我付" : "他付"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8C6A4F] mb-1.5 block uppercase tracking-widest">付款方式</label>
                  <div className="flex gap-2">
                    {["CASH", "CARD"].map((m) => (
                      <button key={m} onClick={() => updateForm({ payMethod: m })} className={`flex-1 py-2 rounded-xl text-[13px] border transition-all ${form.payMethod === m ? "bg-[#C6A087] border-[#C6A087] text-white shadow-sm" : "bg-white border-[#E5D5C5] text-[#5A4636]"}`}>
                        {m === "CASH" ? "現金" : "刷卡"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- 成員管理 Modal (修正刪除按鈕位置與外框) ----------------- */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12">
          <div className="w-full max-w-lg bg-[#FFF9F2] rounded-[32px] border border-[#E5D5C5] shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 pt-5 pb-3 flex items-start justify-between bg-white/50">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#C6A087] mb-1">成員管理</p>
                <h2 className="text-lg font-bold text-[#5A4636]">行程夥伴</h2>
              </div>
              <button onClick={() => setMemberModalOpen(false)} className="w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white">
                <X className="w-4 h-4 text-[#8C6A4F]" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh] scrollbar-hide">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 bg-white border border-[#E5D5C5] rounded-2xl px-4 py-2.5 shadow-sm">
                  <input
                    value={m.name}
                    onChange={(e) => setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))}
                    className="flex-1 min-w-0 outline-none text-[13px] bg-transparent"
                    placeholder="成員名稱"
                  />
                  <button onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))} className="p-1.5 rounded-full hover:bg-red-50 text-red-500 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => setMembers((prev) => [...prev, { id: `m-${Date.now()}`, name: "" }])}
                className="w-full py-3 border-2 border-dashed border-[#E5D5C5] rounded-2xl text-[11px] text-[#8C6A4F] font-medium hover:bg-white/50 transition-colors"
              >
                + 新增成員
              </button>
            </div>

            <div className="p-6 border-t bg-white/30">
              <button onClick={() => setMemberModalOpen(false)} className="w-full py-3.5 bg-[#C6A087] text-white rounded-2xl font-bold shadow-md active:scale-95 transition-all">
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}