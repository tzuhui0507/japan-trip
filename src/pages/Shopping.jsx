// src/pages/Shopping.jsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  ShoppingBag,
  Droplet,
  Cookie,
  Plug,
  MoreHorizontal,
  X,
  PencilLine,
  CircleDollarSign,
  ShoppingBasket,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Check
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { get, set, del } from "idb-keyval";
import { THEMES } from "../App";

/* ================== constants ================== */
const CURRENCY_MAP = {
  JPY: "¥",
  TWD: "NT$",
  USD: "$",
  KRW: "₩",
  THB: "฿",
  EUR: "€",
  HKD: "HK$",
  SGD: "$",
  VND: "₫",
  GBP: "£",
  CNY: "¥"
};

const DEFAULT_CATEGORIES = [
  { id: "drugstore", title: "藥妝", items: [] },
  { id: "snack", title: "零食", items: [] },
  { id: "electronics", title: "電器", items: [] },
  { id: "other", title: "其他", items: [] },
];

const CATEGORY_STYLES = {
  drugstore: { color: "#CFA1A8", light: "#FCEFF1", icon: Droplet, en: "DRUGSTORE" },
  snack: { color: "#D4A18A", light: "#FCF3EE", icon: Cookie, en: "SNACK" },
  electronics: { color: "#AFC1A9", light: "#F4F7F2", icon: Plug, en: "ELECTRONICS" },
  other: { color: "#B7A2BC", light: "#F5F1F7", icon: MoreHorizontal, en: "OTHERS" },
};

const VIEWER_SHOPPING_KEY = "viewer_shopping_v1";

/* ================== helper functions ================== */
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
    };
  });
};

/* ================== component ================== */
export default function Shopping({ trip, setTrip, themeId }) {
  const isViewer = trip?.shareMode === "viewer";
  const [viewerShopping, setViewerShopping] = useState(null);
  const [activeTab, setActiveTab] = useState("drugstore");

  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;

  const currentCurrencyCode = trip.currency || "JPY";
  const currentCurrencySymbol = CURRENCY_MAP[currentCurrencyCode] || "$";

  const [previewImage, setPreviewImage] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingItem, setEditingItem] = useState(null); 
  const [editingField, setEditingField] = useState(null); 
  const [draftValue, setDraftValue] = useState("");
  const [imageCache, setImageCache] = useState({});
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);

  useEffect(() => {
    const runMigration = async () => {
      if (!trip.shopping) return;
      let hasMigrated = false;
      const nextShopping = JSON.parse(JSON.stringify(trip.shopping));
      for (const cat of nextShopping) {
        for (const item of cat.items) {
          if (item.image && item.image.startsWith("data:image")) {
            const imageId = `img_${item.id}_${Date.now()}`;
            await set(imageId, item.image);
            item.imageId = imageId;
            delete item.image;
            hasMigrated = true;
          }
        }
      }
      if (hasMigrated) setTrip(p => ({ ...p, shopping: nextShopping }));
    };
    if (!isViewer) runMigration();
  }, [trip.shopping, setTrip, isViewer]);

  useEffect(() => {
    if (!isViewer) return;
    const raw = localStorage.getItem(VIEWER_SHOPPING_KEY);
    if (raw) setViewerShopping(JSON.parse(raw));
    else {
      const init = trip.shopping || DEFAULT_CATEGORIES;
      localStorage.setItem(VIEWER_SHOPPING_KEY, JSON.stringify(init));
      setViewerShopping(init);
    }
  }, [isViewer, trip.shopping]);

  useEffect(() => {
    if (isViewer) return;
    if (!trip.shopping) setTrip((p) => ({ ...p, shopping: DEFAULT_CATEGORIES }));
  }, [isViewer, trip.shopping, setTrip]);

  const shopping = isViewer ? viewerShopping || DEFAULT_CATEGORIES : trip.shopping || DEFAULT_CATEGORIES;

  const updateShopping = (updater) => {
    if (isViewer) {
      setViewerShopping((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem(VIEWER_SHOPPING_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setTrip((p) => ({ ...p, shopping: typeof updater === "function" ? updater(p.shopping) : updater }));
    }
  };

  const addItem = (catId) => {
    updateShopping((list) => list.map((c) => c.id === catId ? { ...c, items: [...c.items, { id: `item-${Date.now()}`, name: "新的項目", checked: false, imageId: null, price: null, quantity: 1 }] } : c));
  };

  const updateItem = (catId, itemId, patch) => {
    updateShopping((list) => list.map((c) => c.id === catId ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, ...patch } : i) } : c));
  };

  const deleteItem = async (catId, itemId, imageId) => {
    if (imageId) await del(imageId);
    updateShopping((list) => list.map((c) => c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c));
  };

  const handleImageUpload = async (file, catId, itemId, oldImageId) => {
    if (!file) return;
    try {
      const compressedBase64 = await compressImage(file);
      const newImageId = `img_${itemId}_${Date.now()}`;
      await set(newImageId, compressedBase64);
      if (oldImageId) await del(oldImageId);
      updateItem(catId, itemId, { imageId: newImageId });
      setImageCache(prev => ({ ...prev, [newImageId]: compressedBase64 }));
    } catch (err) { alert("圖片處理失敗，請重試"); }
  };

  const PhotoButton = ({ imageId, isChecked, activeColor }) => {
    const [loading, setLoading] = useState(false);
    const handleClick = async () => {
      if (imageCache[imageId]) { setPreviewImage(imageCache[imageId]); return; }
      setLoading(true);
      const data = await get(imageId);
      if (data) { setImageCache(prev => ({ ...prev, [imageId]: data })); setPreviewImage(data); }
      setLoading(false);
    };
    return (
      <button type="button" onClick={handleClick} disabled={loading} className={`p-1 rounded-full hover:bg-black/5 transition ${isChecked ? "opacity-60" : "opacity-100"}`}>
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: activeColor }} /> : <ImageIcon className="w-3.5 h-3.5" style={{ color: activeColor }} />}
      </button>
    );
  };

  const activeCategoryIndex = shopping.findIndex(c => c.id === activeTab);
  const activeStyle = CATEGORY_STYLES[activeTab];

  const dynamicDottedBg = {
    backgroundColor: "#fdfdfd", 
    backgroundImage: `radial-gradient(${activeStyle.color}40 1.5px, transparent 1px)`,
    backgroundSize: "12px 12px",
  };

  const currentCategoryItems = shopping[activeCategoryIndex]?.items || [];
  const activeItems = currentCategoryItems.filter(i => !i.checked);
  const completedItems = currentCategoryItems.filter(i => i.checked);

  return (
    <div className="pt-2 pb-24 space-y-4 px-4" onClick={() => { setMenuOpenId(null); }}>
      <div className="flex items-center justify-between">
        <PageHeader icon={ShoppingBag} title="購物清單" subtitle="SHOPPING LIST" themeId={themeId} />
        
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border shadow-sm text-[11px] font-bold"
          style={{ borderColor: currentTheme.border, color: currentTheme.text }}
        >
          <CircleDollarSign className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />
          {currentCurrencyCode}
        </div>
      </div>

      <div className="p-1 rounded-2xl grid grid-cols-4 relative h-[46px] items-stretch shadow-inner overflow-hidden" style={{ backgroundColor: `${currentTheme.main}15`, border: `1px solid ${currentTheme.border}` }}>
        <div 
          className="absolute top-1.5 bottom-1.5 transition-all duration-300 bg-white rounded-xl shadow-md z-0 border"
          style={{ 
            width: "calc(25% - 12px)", 
            left: `calc(${activeCategoryIndex * 25}% + 6px)`,
            borderColor: currentTheme.border
          }}
        />
        
        {shopping.map((cat) => {
          const isActive = activeTab === cat.id;
          const catStyle = CATEGORY_STYLES[cat.id];
          return (
            <button
              key={cat.id}
              onClick={(e) => { e.stopPropagation(); setActiveTab(cat.id); }}
              className={`relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-300`}
              style={{ color: isActive ? catStyle.color : `${currentTheme.accent}80` }}
            >
              {React.createElement(catStyle.icon, { className: "w-3.5 h-3.5 shrink-0" })}
              <span className="text-[12.5px] font-black">{cat.title}</span>
            </button>
          );
        })}
      </div>

      <div 
        className="rounded-[24px] border shadow-sm bg-white animate-in fade-in duration-300 relative overflow-visible z-20"
        style={{ borderColor: currentTheme.border }}
      >
        {shopping[activeCategoryIndex] && (
          <>
            <div className="px-5 py-3.5 flex items-center justify-between rounded-t-[24px]" style={{ backgroundColor: activeStyle.light }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: activeStyle.color }}>
                   {React.createElement(activeStyle.icon, { className: "w-4.5 h-4.5" })}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[15px] leading-tight" style={{ color: activeStyle.color }}>{shopping[activeCategoryIndex].title}</h3>
                  <p className="text-[9px] uppercase tracking-wider opacity-60 font-black" style={{ color: activeStyle.color }}>
                    {activeStyle.en}
                  </p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); addItem(activeTab); }} className="w-8 h-8 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform shadow-sm border" style={{ borderColor: `${activeStyle.color}40` }}>
                <Plus className="w-4.5 h-4.5" style={{ color: activeStyle.color }} />
              </button>
            </div>

            <div className="p-3 min-h-[380px] rounded-b-[24px]" style={dynamicDottedBg}>
              {currentCategoryItems.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center opacity-30 text-xs" style={{ color: currentTheme.accent }}>
                  <ShoppingBasket className="w-10 h-10 mb-2 stroke-[1px]" />
                  尚未加入任何商品
                </div>
              ) : (
                <div className="space-y-2">
                  {/* 1. 待買項目列表 */}
                  {activeItems.map((item) => {
                    const qty = item.quantity || 1;
                    const hasPrice = typeof item.price === "number";
                    const showDetail = hasPrice || qty > 1;

                    return (
                      <div 
                        key={item.id} 
                        onClick={() => updateItem(activeTab, item.id, { checked: true })}
                        className="relative flex items-center h-[46px] px-3 rounded-xl bg-white border shadow-2xs transition-all gap-2.5 cursor-pointer hover:border-slate-300" 
                        style={{ borderColor: `${activeStyle.color}35` }}
                      >
                        {/* 極簡圓點 Checkbox */}
                        <div 
                          className="shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all bg-white"
                          style={{ borderColor: `${activeStyle.color}80` }}
                        >
                          <div className="w-2 h-2 rounded-full opacity-0 transition-opacity" style={{ backgroundColor: activeStyle.color }} />
                        </div>
                        
                        {/* 商品名稱（安全截斷） */}
                        <span className="min-w-0 flex-1 text-[13px] truncate font-bold"
                              style={{ color: activeStyle.color, filter: "brightness(0.8)" }}>
                          {item.name}
                        </span>

                        {showDetail && (
                          <div className="shrink-0 text-right leading-tight tabular-nums">
                            {hasPrice ? (
                              <>
                                <div className="text-[10px] font-black" style={{ color: activeStyle.color }}>
                                  {currentCurrencySymbol}{(item.price * qty).toLocaleString()}
                                </div>
                                <div className="text-[7.5px] font-bold opacity-60" style={{ color: activeStyle.color }}>
                                  {currentCurrencySymbol}{item.price.toLocaleString()} × {qty}
                                </div>
                              </>
                            ) : (
                              <div className="text-[10px] font-black" style={{ color: activeStyle.color }}>數量：{qty}</div>
                            )}
                          </div>
                        )}

                        <div className="shrink-0 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                          {item.imageId && <PhotoButton imageId={item.imageId} isChecked={false} activeColor={activeStyle.color} />}
                          <button className="p-1 rounded-full hover:bg-black/5" onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }}>
                            <MoreHorizontal className="w-4 h-4 opacity-60" style={{ color: activeStyle.color }} />
                          </button>
                        </div>
                        
                        {menuOpenId === item.id && (
                          <div className="absolute right-1 top-[42px] z-[110] w-38 bg-white border rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                               style={{ borderColor: `${activeStyle.color}20` }}
                               onClick={(e) => e.stopPropagation()}>
                            <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium" style={{ color: activeStyle.color }} onClick={() => { setEditingItem({ catId: activeTab, item }); setEditingField("name"); setDraftValue(item.name); setMenuOpenId(null); }}>
                              <div className="w-5 flex-shrink-0"><PencilLine className="w-4 h-4" /></div>
                              <span className="ml-1">名稱</span>
                            </button>
                            <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium" style={{ color: activeStyle.color }} onClick={() => { setEditingItem({ catId: activeTab, item }); setEditingField("price"); setDraftValue(item.price != null ? String(item.price) : ""); setMenuOpenId(null); }}>
                              <div className="w-5 flex-shrink-0"><CircleDollarSign className="w-4 h-4" /></div>
                              <span className="ml-1">單價</span>
                            </button>
                            <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium" style={{ color: activeStyle.color }} onClick={() => { setEditingItem({ catId: activeTab, item }); setEditingField("quantity"); setDraftValue(item.quantity != null ? String(item.quantity) : "1"); setMenuOpenId(null); }}>
                              <div className="w-5 flex-shrink-0"><ShoppingBasket className="w-4 h-4" /></div>
                              <span className="ml-1">數量</span>
                            </button>
                            <label className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium cursor-pointer" style={{ color: activeStyle.color }}>
                              <div className="w-5 flex-shrink-0"><ImageIcon className="w-4 h-4" /></div>
                              <span className="ml-1">照片</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], activeTab, item.id, item.imageId); setMenuOpenId(null); }} />
                            </label>
                            <div className="h-px my-1 mx-2" style={{ backgroundColor: `${activeStyle.color}10` }} />
                            <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-red-500 font-black hover:bg-red-50 w-full" onClick={() => { deleteItem(activeTab, item.id, item.imageId); setMenuOpenId(null); }}>
                              <div className="w-5 flex-shrink-0"><Trash2 className="w-4 h-4" /></div>
                              <span className="ml-1">刪除</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 2. 已完成（折疊）區塊 */}
                  {completedItems.length > 0 && (
                    <div className="mt-5 pt-2 border-t border-dashed" style={{ borderColor: `${activeStyle.color}40` }}>
                      <button 
                        onClick={() => setIsCompletedOpen(!isCompletedOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all bg-black/5 hover:bg-black/10 active:scale-[0.99]"
                        style={{ color: activeStyle.color }}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>已購入 <span className="inline-block">(๑&gt;◡&lt;๑)</span> ({completedItems.length})</span>
                        </div>
                        {isCompletedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isCompletedOpen && (
                        <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
                          {completedItems.map((item) => {
                            const qty = item.quantity || 1;
                            const hasPrice = typeof item.price === "number";
                            const showDetail = hasPrice || qty > 1;

                            return (
                              <div 
                                key={item.id} 
                                onClick={() => updateItem(activeTab, item.id, { checked: false })}
                                className="relative flex items-center h-[46px] px-3 rounded-xl transition-all gap-2.5 cursor-pointer opacity-75 hover:opacity-100" 
                                style={{ backgroundColor: `${activeStyle.color}12` }}
                              >
                                <div 
                                  className="shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all"
                                  style={{ backgroundColor: activeStyle.color, borderColor: activeStyle.color }}
                                >
                                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                </div>
                                
                                <span className="min-w-0 flex-1 text-[13px] truncate line-through font-medium"
                                      style={{ color: activeStyle.color }}>
                                  {item.name}
                                </span>

                                {showDetail && (
                                  <div className="shrink-0 text-right leading-tight tabular-nums opacity-65" style={{ color: activeStyle.color }}>
                                    {hasPrice ? (
                                      <>
                                        <div className="text-[10px] font-black">{currentCurrencySymbol}{(item.price * qty).toLocaleString()}</div>
                                        <div className="text-[7.5px] font-bold opacity-65">{currentCurrencySymbol}{item.price.toLocaleString()} × {qty}</div>
                                      </>
                                    ) : (
                                      <div className="text-[10px] font-black">數量：{qty}</div>
                                    )}
                                  </div>
                                )}

                                <div className="shrink-0 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                  {item.imageId && <PhotoButton imageId={item.imageId} isChecked={true} activeColor={activeStyle.color} />}
                                  <button className="p-1 rounded-full hover:bg-black/5" onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }}>
                                    <MoreHorizontal className="w-4 h-4 opacity-60" style={{ color: activeStyle.color }} />
                                  </button>
                                </div>
                                
                                {menuOpenId === item.id && (
                                  <div className="absolute right-1 top-[42px] z-[110] w-38 bg-white border rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                                       style={{ borderColor: `${activeStyle.color}20` }}
                                       onClick={(e) => e.stopPropagation()}>
                                    <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium" style={{ color: activeStyle.color }} onClick={() => { setEditingItem({ catId: activeTab, item }); setEditingField("name"); setDraftValue(item.name); setMenuOpenId(null); }}>
                                      <div className="w-5 flex-shrink-0"><PencilLine className="w-4 h-4" /></div>
                                      <span className="ml-1">名稱</span>
                                    </button>
                                    <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium" style={{ color: activeStyle.color }} onClick={() => { setEditingItem({ catId: activeTab, item }); setEditingField("price"); setDraftValue(item.price != null ? String(item.price) : ""); setMenuOpenId(null); }}>
                                      <div className="w-5 flex-shrink-0"><CircleDollarSign className="w-4 h-4" /></div>
                                      <span className="ml-1">單價</span>
                                    </button>
                                    <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium" style={{ color: activeStyle.color }} onClick={() => { setEditingItem({ catId: activeTab, item }); setEditingField("quantity"); setDraftValue(item.quantity != null ? String(item.quantity) : "1"); setMenuOpenId(null); }}>
                                      <div className="w-5 flex-shrink-0"><ShoppingBasket className="w-4 h-4" /></div>
                                      <span className="ml-1">數量</span>
                                    </button>
                                    <label className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium cursor-pointer" style={{ color: activeStyle.color }}>
                                      <div className="w-5 flex-shrink-0"><ImageIcon className="w-4 h-4" /></div>
                                      <span className="ml-1">照片</span>
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], activeTab, item.id, item.imageId); setMenuOpenId(null); }} />
                                    </label>
                                    <div className="h-px my-1 mx-2" style={{ backgroundColor: `${activeStyle.color}10` }} />
                                    <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-red-500 font-black hover:bg-red-50 w-full" onClick={() => { deleteItem(activeTab, item.id, item.imageId); setMenuOpenId(null); }}>
                                      <div className="w-5 flex-shrink-0"><Trash2 className="w-4 h-4" /></div>
                                      <span className="ml-1">刪除</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 編輯浮層 */}
      {editingItem && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-[2rem] border shadow-2xl p-6 w-full max-w-[300px] animate-in zoom-in-95 duration-200" style={{ backgroundColor: "white", borderColor: `${activeStyle.color}40` }}>
            <h3 className="text-[13px] font-bold mb-4 uppercase tracking-widest text-center" style={{ color: activeStyle.color }}>編輯</h3>
            <div className="bg-white rounded-xl border px-4 py-2.5 shadow-inner" style={{ borderColor: `${activeStyle.color}20` }}>
              <input autoFocus type={editingField === "name" ? "text" : "number"} value={draftValue} onChange={(e) => setDraftValue(e.target.value)} className="w-full text-center text-[15px] font-bold bg-transparent outline-none" style={{ color: activeStyle.color, filter: "brightness(0.7)" }} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button onClick={() => setEditingItem(null)} className="py-2 rounded-xl border text-[11px] font-bold bg-white active:scale-95 transition-all" style={{ borderColor: `${currentTheme.border}`, color: currentTheme.text }}>取消</button>
              <button onClick={() => {
                  if (editingField === "price") updateItem(editingItem.catId, editingItem.item.id, { price: draftValue === "" ? null : Number(draftValue) });
                  else if (editingField === "quantity") updateItem(editingItem.catId, editingItem.item.id, { quantity: Number(draftValue) });
                  else updateItem(editingItem.catId, editingItem.item.id, { name: draftValue });
                  setEditingItem(null);
                }} className="py-2 text-white rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold shadow-md active:scale-95 transition-all" style={{ backgroundColor: activeStyle.color }}>確定</button>
            </div>
          </div>
        </div>
      )}

      {/* 圖片預覽 */}
      {previewImage && (
        <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-full" onClick={e => e.stopPropagation()}>
             <button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 text-white flex items-center gap-1 text-[11px] font-bold">關閉 <X className="w-4 h-4" /></button>
             <img src={previewImage} alt="" className="max-w-[85vw] max-h-[70vh] rounded-[24px] shadow-2xl border-4 border-white/20" />
          </div>
        </div>
      )}
    </div>
  );
}