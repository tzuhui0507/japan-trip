// src/pages/ListTab.jsx
import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import {
  Check,
  Plus,
  Trash2,
  StickyNote,
  Luggage as LuggageIcon,
  PencilLine,
  Info,
  Briefcase,
  Shirt,
  Bath,
  Pill,
  Shapes,
  Sparkles, 
  Settings2,
  GripVertical,
  // 標題專用圖示
  Palette,
  Eye,
  Wand2,
  Smile,
  Brush,
  HouseHeart
} from "lucide-react";
import LuggageEditModal from "../components/LuggageEditModal";
import { Luggage as LuggageHeaderIcon } from "lucide-react";

/* ================== 完美馬卡龍配色 CONFIG ================== */
const CATEGORY_CONFIG = {
  carry: { color: "#8BBAB2", light: "#F1F8F7", en: "CARRY-ON", icon: Briefcase },
  clothes: { color: "#D49BA7", light: "#FFF0F3", en: "CLOTHES", icon: Shirt },
  toiletries: { color: "#7FB3D5", light: "#EEF6FB", en: "TOILETRIES", icon: Bath },
  medicine: { color: "#E89C81", light: "#FFF1ED", en: "MEDICINE", icon: Pill },
  misc: { color: "#A3B18A", light: "#F4F7EE", en: "MISCELLANEOUS", icon: Shapes },
  other: { color: "#B197B4", light: "#F8F2F9", en: "MAKEUP", icon: Sparkles },
};

// 標題專用 Icon 對照表
const HEADER_ICONS = {
  h1: Palette,     // 底妝
  h2: Eye,         // 眼妝
  h3: Wand2,       // 修容打亮
  h4: Smile,       // 唇妝
  h5: Brush,       // 工具小物
  h6: HouseHeart,  // 補妝急救
};

const dottedBg = {
  backgroundColor: "#FFF9F2", 
  backgroundImage: "radial-gradient(#E8E1DA 1px, transparent 1px)",
  backgroundSize: "12px 12px",
};

function createDefaultLuggage() {
  return {
    categories: [
      { id: "carry", title: "隨身用品", items: [
        { id: "passport", label: "護照", checked: false },
        { id: "wallet", label: "錢包", checked: false },
        { id: "id-card", label: "身分證", checked: false },
        { id: "currency", label: "外幣", checked: false },
        { id: "credit-card", label: "信用卡", checked: false },
        { id: "transport-card", label: "交通卡", checked: false },
        { id: "tw-license", label: "台灣駕照", checked: false },
        { id: "intl-license", label: "國際駕照 / 譯本", checked: false },
        { id: "sim", label: "SIM卡 / eSIM", checked: false },
        { id: "camera", label: "相機", checked: false },
        { id: "power-bank", label: "行動電源", checked: false },
        { id: "earphone", label: "耳機", checked: false },
        { id: "tissue", label: "衛生紙", checked: false },
        { id: "wet-tissue", label: "濕紙巾", checked: false },
      ]},
      { id: "clothes", title: "個人衣物", items: [
        { id: "wear", label: "衣服", checked: false },
        { id: "underwear", label: "內衣褲", checked: false },
        { id: "pajamas", label: "睡衣", checked: false },
        { id: "thermal-top", label: "發熱衣", checked: false },
        { id: "thermal-pants", label: "發熱褲", checked: false },
        { id: "socks", label: "襪子", checked: false },
        { id: "shoes", label: "鞋子", checked: false },
        { id: "slippers", label: "拖鞋", checked: false },
        { id: "jacket", label: "外套", checked: false },
        { id: "hat", label: "帽子", checked: false },
        { id: "glove", label: "手套", checked: false },
        { id: "scarf", label: "圍巾", checked: false },
        { id: "accessories", label: "飾品", checked: false },
        { id: "sunglasses", label: "太陽眼鏡", checked: false },
      ]},
      { id: "toiletries", title: "盥洗用品", items: [
        { id: "wash-set", label: "洗髮、潤髮、沐浴乳", checked: false },
        { id: "tooth-set", label: "牙膏、牙刷", checked: false },
        { id: "towel", label: "浴巾 / 毛巾", checked: false },
        { id: "remover", label: "卸妝用品", checked: false },
        { id: "facewash", label: "洗面乳", checked: false },
        { id: "skincare", label: "保養品", checked: false },
        { id: "sunscreen", label: "防曬-臉 / 身體", checked: false },
        { id: "contact-lens", label: "隱形眼鏡", checked: false },
        { id: "lens-care", label: "水盒、保養液", checked: false },
        { id: "glasses", label: "眼鏡", checked: false },
        { id: "hair-tool", label: "平板夾、電棒捲", checked: false },
        { id: "hair-care", label: "護髮油、髮膠", checked: false },
        { id: "comb-mirror", label: "梳子、鏡子", checked: false },
        { id: "shave", label: "刮鬍刀 / 泡", checked: false },
      ]},
      { id: "medicine", title: "個人藥品", items: [
        { id: "motion", label: "暈車藥", checked: false },
        { id: "allergy", label: "過敏藥", checked: false },
        { id: "alcohol", label: "酒精消毒", checked: false },
        { id: "cold", label: "感冒藥", checked: false },
        { id: "mosquito", label: "蚊蟲止癢藥", checked: false },
        { id: "eyedrop", label: "眼藥水", checked: false },
      ]},
      { id: "misc", title: "雜物專區", items: [
        { id: "cable", label: "充電線", checked: false },
        { id: "charger", label: "充電器", checked: false },
        { id: "adapter", label: "轉接頭", checked: false },
        { id: "extension", label: "延長線", checked: false },
        { id: "memory-card", label: "相機記憶卡", checked: false },
        { id: "spare-battery", label: "相機備用電池", checked: false },
        { id: "shopping-bag", label: "摺疊購物袋", checked: false },
        { id: "earplug", label: "耳塞", checked: false },
        { id: "mask", label: "口罩", checked: false },
        { id: "umbrella", label: "雨傘", checked: false },
      ]},
    ],
    otherCustom: [
      { id: "h1", label: "底妝 Base Makeup", isHeader: true },
      { id: "base1", label: "妝前乳", checked: false },
      { id: "base2", label: "粉底液 / 氣墊", checked: false },
      { id: "base3", label: "遮瑕膏", checked: false },
      { id: "base4", label: "定妝蜜粉 / 噴霧", checked: false },
      { id: "h2", label: "眼妝 Eye Makeup", isHeader: true },
      { id: "eye1", label: "眉筆 / 眉粉", checked: false },
      { id: "eye2", label: "眼線筆", checked: false },
      { id: "eye3", label: "眼影盤", checked: false },
      { id: "eye4", label: "睫毛膏", checked: false },
      { id: "eye5", label: "睫毛夾 / 燙睫毛器", checked: false },
      { id: "h3", label: "修容打亮 Contouring", isHeader: true },
      { id: "face1", label: "腮紅", checked: false },
      { id: "face2", label: "修容", checked: false },
      { id: "face3", label: "打亮", checked: false },
      { id: "h4", label: "唇妝 Lip Makeup", isHeader: true },
      { id: "lip1", label: "護唇膏", checked: false },
      { id: "lip2", label: "口紅", checked: false },
      { id: "lip3", label: "唇釉 / 唇蜜", checked: false },
      { id: "h5", label: "工具小物 Tools", isHeader: true },
      { id: "tool1", label: "美妝蛋 / 粉撲", checked: false },
      { id: "tool2", label: "化妝刷", checked: false },
      { id: "tool3", label: "髮捲", checked: false },
      { id: "h6", label: "補妝急救 SOS", isHeader: true },
      { id: "sos1", label: "吸油面紙", checked: false },
      { id: "sos2", label: "面膜", checked: false },
    ],
    bags: [
      { id: "bag-checked", type: "托運", icon: "Luggage", title: "25 KG", subtitle: "再次確認航空規範", notes: "" },
      { id: "bag-carry", type: "隨身", icon: "Backpack", title: "手提 + 隨身", subtitle: "22×25×43cm", notes: "行動電源、鋰電池必需放隨身包包！" },
    ],
  };
}

export default function ListTab({ trip, setTrip }) {
  const isViewer = trip?.shareMode === "viewer";
  const VIEWER_LUGGAGE_KEY = "viewer_luggage_v1";
  const [viewerLuggage, setViewerLuggage] = useState(null);
  const [activeTab, setActiveTab] = useState("carry");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingItem, setEditingItem] = useState(null); 
  const [draftValue, setDraftValue] = useState("");
  const [bagSlideId, setBagSlideId] = useState(null);
  const [editingBag, setEditingBag] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const luggage = isViewer ? (viewerLuggage || createDefaultLuggage()) : (trip.luggage || createDefaultLuggage());

  // --- 自動補丁邏輯：解決新版本內容未出現的問題 ---
  useEffect(() => {
    if (!isViewer && trip.luggage) {
      const defaultData = createDefaultLuggage();
      let needsUpdate = false;
      const updatedLuggage = { ...trip.luggage };

      // 檢查 otherCustom 是否需要更新（例如舊資料沒有分組標題）
      if (!updatedLuggage.otherCustom || updatedLuggage.otherCustom.length < defaultData.otherCustom.length) {
        updatedLuggage.otherCustom = defaultData.otherCustom;
        needsUpdate = true;
      }

      // 同步檢查各分類內容 (例如隨身用品新增的駕照等)
      updatedLuggage.categories = updatedLuggage.categories.map((cat, idx) => {
        const defaultCat = defaultData.categories[idx];
        if (defaultCat && cat.items.length < defaultCat.items.length) {
          needsUpdate = true;
          return defaultCat; // 如果數量不對，直接更新為最新預設
        }
        return cat;
      });

      if (needsUpdate) {
        setTrip(prev => ({ ...prev, luggage: updatedLuggage }));
      }
    }
  }, [trip.luggage, isViewer, setTrip]);

  useEffect(() => {
    if (!isViewer) return;
    const raw = localStorage.getItem(VIEWER_LUGGAGE_KEY);
    if (raw) setViewerLuggage(JSON.parse(raw));
    else {
      const init = trip.luggage || createDefaultLuggage();
      localStorage.setItem(VIEWER_LUGGAGE_KEY, JSON.stringify(init));
      setViewerLuggage(init);
    }
  }, [isViewer]);

  useEffect(() => {
    if (isViewer) return;
    if (!trip?.luggage) {
      const init = createDefaultLuggage();
      setTrip((prev) => ({ ...prev, luggage: init }));
    }
  }, [isViewer, trip, setTrip]);

  const updateLuggage = (updater) => {
    if (isViewer) {
      setViewerLuggage((prev) => {
        const next = typeof updater === "function" ? updater(prev || createDefaultLuggage()) : updater;
        localStorage.setItem(VIEWER_LUGGAGE_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }
    setTrip((prev) => ({
      ...prev,
      luggage: typeof updater === "function" ? updater(prev.luggage || createDefaultLuggage()) : updater,
    }));
  };

  const handleDragStart = (index) => setDraggedIndex(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    updateLuggage((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const targetItems = activeTab === "other" ? next.otherCustom : next.categories.find(c => c.id === activeTab).items;
      const itemToMove = targetItems.splice(draggedIndex, 1)[0];
      targetItems.splice(index, 0, itemToMove);
      setDraggedIndex(index);
      return next;
    });
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const toggleItem = (categoryId, itemId, isOther = false) => {
    updateLuggage((prev) => {
      if (isOther) {
        return { ...prev, otherCustom: prev.otherCustom.map((it) => it.id === itemId ? { ...it, checked: !it.checked } : it) };
      }
      return {
        ...prev,
        categories: prev.categories.map((cat) => cat.id === categoryId
          ? { ...cat, items: cat.items.map((it) => it.id === itemId ? { ...it, checked: !it.checked } : it) }
          : cat
        ),
      };
    });
  };

  const addItem = (categoryId) => {
    const newId = `item-${Date.now()}`;
    updateLuggage((prev) => {
      if (categoryId === "other") return { ...prev, otherCustom: [...prev.otherCustom, { id: newId, label: "新項目", checked: false }] };
      return {
        ...prev,
        categories: prev.categories.map((cat) => cat.id === categoryId ? { ...cat, items: [...cat.items, { id: newId, label: "新項目", checked: false }] } : cat),
      };
    });
  };

  const updateItemLabel = (categoryId, itemId, newLabel) => {
    updateLuggage((prev) => {
      if (categoryId === "other" || !categoryId) return { ...prev, otherCustom: prev.otherCustom.map((it) => it.id === itemId ? { ...it, label: newLabel } : it) };
      return {
        ...prev,
        categories: prev.categories.map((cat) => cat.id === categoryId ? { ...cat, items: cat.items.map((it) => it.id === itemId ? { ...it, label: newLabel } : it) } : cat),
      };
    });
  };

  const deleteItem = (categoryId, itemId) => {
    updateLuggage((prev) => {
      if (!categoryId || categoryId === "other") return { ...prev, otherCustom: prev.otherCustom.filter((it) => it.id !== itemId) };
      return {
        ...prev,
        categories: prev.categories.map((cat) => cat.id === categoryId ? { ...cat, items: cat.items.filter((it) => it.id !== itemId) } : cat),
      };
    });
  };

  const saveBag = (updatedBag) => {
    updateLuggage((prev) => ({ ...prev, bags: prev.bags.map((b) => (b.id === updatedBag.id ? updatedBag : b)) }));
    setEditingBag(null);
  };

  const { categories, otherCustom, bags } = luggage;
  const activeCategoryData = activeTab === "other" ? { id: "other", title: "化妝用品", items: otherCustom } : categories.find(c => c.id === activeTab);
  const activeConfig = CATEGORY_CONFIG[activeTab];

  return (
    <div className="pt-2 pb-24 space-y-4 px-4" onClick={() => setMenuOpenId(null)}>
      <PageHeader icon={LuggageHeaderIcon} title="行李清單" subtitle="LUGGAGE CHECKLIST" />

      {/* ===== 行李資訊區塊 ===== */}
      <section className="space-y-2 px-1">
        <div className="flex items-center gap-1.5 opacity-70">
          <Info className="w-3 h-3 text-[#8C6A4F]" />
          <h4 className="text-[10px] font-black text-[#8C6A4F] uppercase tracking-widest">Luggage Info</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {bags.map((bag) => {
            const isOpen = !isViewer && bagSlideId === bag.id;
            return (
              <div key={bag.id} className="relative">
                {!isViewer && (
                  <div className={`absolute top-1/2 right-2 -translate-y-1/2 flex gap-1 transition-all ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <button onClick={() => setEditingBag(bag)} className="w-7 h-7 rounded-full bg-[#F7C85C] flex items-center justify-center shadow-sm active:scale-90"><PencilLine className="w-3.5 h-3.5 text-[#5A4636]" /></button>
                  </div>
                )}
                <div 
                  onClick={() => !isViewer && setBagSlideId(isOpen ? null : bag.id)}
                  style={{ transform: isOpen ? "translateX(-65px)" : "translateX(0)" }}
                  className={`bg-white rounded-2xl border border-dashed border-[#E1D3C5] px-3 py-2.5 shadow-sm transition-transform flex flex-col justify-center min-h-[64px] ${isViewer ? "" : "cursor-pointer active:scale-[0.98]"}`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="inline-flex px-1.5 py-0.5 rounded-md bg-[#B7A591]/10 text-[9px] font-black text-[#8C6A4F] border border-[#B7A591]/20 uppercase tracking-tighter shrink-0">{bag.type}</span>
                    <span className="text-[12.5px] font-bold text-[#4F3B2B] truncate leading-none">{bag.title}</span>
                  </div>
                  <p className="text-[10px] text-[#8C6A4F] truncate opacity-80 pl-0.5">{bag.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
        {bags.some(b => b.notes) && (
          <div className="space-y-1.5 mt-0.5">
            {bags.filter(b => b.notes).map(b => (
              <div key={`note-${b.id}`} className="bg-[#FAF0E6]/80 rounded-xl px-3 py-1.5 flex items-start gap-2 border border-[#F4C289]/30">
                <StickyNote className="w-3.5 h-3.5 shrink-0 text-[#A56A3A] mt-0.5" />
                <p className="text-[10px] text-[#A56A3A] leading-relaxed"><span className="font-black mr-1 uppercase">[{b.type}]</span>{b.notes}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== 3*2 固定網格頁籤 ===== */}
      <div className="grid grid-cols-3 gap-2 bg-[#E8E1DA]/30 p-2 rounded-[20px] border border-white/50 shadow-inner">
        {[...categories, { id: "other", title: "化妝用品" }].map((cat) => {
          const isActive = activeTab === cat.id;
          const config = CATEGORY_CONFIG[cat.id];
          const Icon = config.icon;
          return (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)} className={`py-2 rounded-xl text-[11.5px] font-black transition-all duration-300 border flex items-center justify-center gap-1.5 ${isActive ? "bg-white border-[#EDE3D8] shadow-md scale-[1.02]" : "bg-white/40 border-transparent text-[#8C6A4F]/50"}`} style={{ color: isActive ? config.color : undefined }}>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* ===== 內容卡片：沉浸式化妝分組標題 ===== */}
      <div className="rounded-[28px] border border-[#EDE3D8] shadow-sm bg-white animate-in fade-in duration-300 relative overflow-visible z-20">
        {activeCategoryData && (
          <>
            <div className="px-5 py-3.5 flex items-center justify-between rounded-t-[28px]" style={{ backgroundColor: activeConfig.light }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0" style={{ backgroundColor: activeConfig.color }}>
                   {React.createElement(activeConfig.icon, { className: "w-4.5 h-4.5" })}
                </div>
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <h3 className="font-bold text-[#5A4636] text-[15px] leading-tight truncate">{activeCategoryData.title}</h3>
                  <p className="text-[9px] text-[#8C6A4F] uppercase tracking-wider opacity-60 font-black truncate">{activeConfig.en}</p>
                </div>
              </div>
              <button onClick={() => addItem(activeTab)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform shadow-sm border border-[#F0E3D5] shrink-0">
                <Plus className="w-4.5 h-4.5 text-[#8C6A4F]" />
              </button>
            </div>

            <div className="p-4 pt-2 rounded-b-[28px] pb-4" style={dottedBg}>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {activeCategoryData.items.map((item, index) => {
                  // 分組標題樣式優化：靠左對齊 + Lucide Icon + 後方延伸線
                  if (item.isHeader) {
                    const HeaderIcon = HEADER_ICONS[item.id] || Sparkles;
                    return (
                      <div key={item.id} className="col-span-2 flex items-center gap-2 mt-4 mb-2">
                        <HeaderIcon className="w-3.5 h-3.5 text-[#B197B4]" />
                        <span className="text-[11px] font-black text-[#B197B4] uppercase tracking-wider whitespace-nowrap">
                          {item.label}
                        </span>
                        <div className="h-[1px] flex-1 bg-[#B197B4]/30 ml-2" />
                      </div>
                    );
                  }

                  const checked = item.checked;
                  const isBeingDragged = draggedIndex === index;
                  return (
                    <div key={item.id} className={`relative group transition-all ${isBeingDragged ? "opacity-30 scale-95" : "opacity-100"}`} onDragOver={(e) => handleDragOver(e, index)}>
                      <div className="flex items-center h-8.5 px-1 rounded-xl active:bg-black/5 group">
                        <button onClick={() => toggleItem(activeTab === "other" ? null : activeTab, item.id, activeTab === "other")} className="flex-1 flex items-center gap-2 text-left min-w-0">
                          <span className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${checked ? "bg-[#91867A] border-[#91867A]" : "bg-white border-[#D5C7B8]"}`}>
                            {checked && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                          </span>
                          <span className={`text-[12.5px] font-medium transition-all truncate ${checked ? "text-[#B3A496] line-through" : "text-[#4F3B2B]"}`}>{item.label}</span>
                        </button>

                        <div 
                          draggable 
                          onDragStart={() => handleDragStart(index)} 
                          onDragEnd={handleDragEnd}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white/40 opacity-0 group-active:opacity-100 group-hover:opacity-100 transition-opacity cursor-move touch-none"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }}
                        >
                          <Settings2 className="w-3 h-3 text-[#8C6A4F]/40" />
                        </div>
                      </div>

                      {menuOpenId === item.id && (
                        <div className={`absolute right-0 z-[110] w-28 bg-white border border-[#E5D5C5] rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-200 ${index >= 12 ? "bottom-full mb-1" : "top-full mt-1"}`}>
                          <button className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#5A4636] font-bold hover:bg-[#F7F1EB] w-full" onClick={() => { setEditingItem({ categoryId: activeTab, item }); setDraftValue(item.label); setMenuOpenId(null); }}>
                            <PencilLine className="w-3.5 h-3.5 text-[#C6A087]" /> 編輯
                          </button>
                          <div className="h-px bg-[#F0E3D5] mx-2" />
                          <button className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-500 font-bold hover:bg-red-50 w-full" onClick={() => { deleteItem(activeTab === "other" ? null : activeTab, item.id); setMenuOpenId(null); }}>
                            <Trash2 className="w-3.5 h-3.5" /> 刪除
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 編輯名稱浮層 */}
      {editingItem && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FFF9F2] rounded-[2rem] border border-[#E5D5C5] shadow-2xl p-6 w-full max-w-[300px] animate-in zoom-in-95 duration-200">
            <h3 className="text-[13px] font-bold mb-4 text-[#5A4636] uppercase tracking-widest text-center">修改名稱</h3>
            <div className="bg-white rounded-xl border border-[#E5D5C5] px-4 py-2.5 shadow-inner">
              <input autoFocus type="text" value={draftValue} onChange={(e) => setDraftValue(e.target.value)} className="w-full text-center text-[16px] font-bold bg-transparent outline-none text-[#5A4636]" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => setEditingItem(null)} className="py-2.5 rounded-xl border border-[#E5D5C5] text-[12px] font-bold text-[#8C6A4F] bg-white active:scale-95 transition-all">取消</button>
              <button onClick={() => { updateItemLabel(editingItem.categoryId, editingItem.item.id, draftValue); setEditingItem(null); }} className="py-2.5 bg-[#C6A087] text-white rounded-xl flex items-center justify-center gap-1 text-[12px] font-bold shadow-md active:scale-95 transition-all">確定</button>
            </div>
          </div>
        </div>
      )}

      {editingBag && <LuggageEditModal bag={editingBag} onClose={() => setEditingBag(null)} onSave={saveBag} />}
    </div>
  );
}