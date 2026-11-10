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
  
  const [draftBrand, setDraftBrand] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftQuantity, setDraftQuantity] = useState("1");

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
    const newItemId = `item-${Date.now()}`;
    const newItem = { id: newItemId, brand: "", name: "", checked: false, imageId: null, price: null, quantity: 1 };
    
    updateShopping((list) => list.map((c) => c.id === catId ? { ...c, items: [...c.items, newItem] } : c));
    
    setEditingItem({ catId, item: newItem });
    setDraftBrand("");
    setDraftName("");
    setDraftPrice("");
    setDraftQuantity("1");
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

  const PhotoThumb = ({ imageId, activeColor, categoryIcon }) => {
    const [loading, setLoading] = useState(false);
    const [thumbData, setThumbData] = useState(imageCache[imageId] || null);

    useEffect(() => {
      if (!imageId) return;
      if (imageCache[imageId]) {
        setThumbData(imageCache[imageId]);
        return;
      }
      get(imageId).then(data => {
        if (data) {
          setImageCache(prev => ({ ...prev, [imageId]: data }));
          setThumbData(data);
        }
      });
    }, [imageId]);

    const handleClick = (e) => {
      e.stopPropagation();
      if (thumbData) setPreviewImage(thumbData);
    };

    if (!imageId) {
      return (
        <div 
          className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center relative border shadow-2xs overflow-hidden" 
          style={{ backgroundColor: `${activeColor}15`, borderColor: `${activeColor}40` }}
        >
          {/* 適中柔和的質感底座與圖示 */}
          <div className="absolute w-20 h-20 rounded-full opacity-25 blur-lg" style={{ backgroundColor: activeColor }} />
          <div className="relative z-10 w-12 h-12 rounded-full bg-white/90 shadow-xs border flex items-center justify-center" style={{ borderColor: `${activeColor}50` }}>
            {React.createElement(categoryIcon, { className: "w-5 h-5", style: { color: activeColor } })}
          </div>
        </div>
      );
    }

    return (
      <div 
        onClick={handleClick}
        className="w-full aspect-square rounded-2xl overflow-hidden bg-black/5 relative cursor-pointer group shadow-xs border"
        style={{ borderColor: `${activeColor}30` }}
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: activeColor }} />
          </div>
        ) : thumbData ? (
          <img src={thumbData} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 opacity-40" style={{ color: activeColor }} />
          </div>
        )}
      </div>
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

            <div className="p-3 pb-4 rounded-b-[24px]" style={dynamicDottedBg}>
              {currentCategoryItems.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center opacity-30 text-xs" style={{ color: currentTheme.accent }}>
                  <ShoppingBasket className="w-10 h-10 mb-2 stroke-[1px]" />
                  尚未加入任何商品
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 1. 待買項目列表 (Grid 2欄) */}
                  {activeItems.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {activeItems.map((item, index) => {
                        const qty = item.quantity || 1;
                        const hasPrice = typeof item.price === "number";
                        const isNearBottom = index >= 2;

                        return (
                          <div 
                            key={item.id} 
                            onClick={() => updateItem(activeTab, item.id, { checked: true })}
                            className="relative flex flex-col p-3 rounded-2xl bg-white border shadow-2xs transition-all cursor-pointer hover:border-slate-300 justify-between" 
                            style={{ borderColor: `${activeStyle.color}35` }}
                          >
                            {/* 照片上方的控制列：左邊打勾圓圈、右邊三個點 */}
                            <div className="flex items-center justify-between mb-1.5 px-0.5" onClick={(e) => e.stopPropagation()}>
                              <div 
                                onClick={() => updateItem(activeTab, item.id, { checked: !item.checked })}
                                className="w-5 h-5 rounded-full border flex items-center justify-center transition-all bg-white cursor-pointer shadow-xs"
                                style={{ borderColor: activeStyle.color, backgroundColor: item.checked ? activeStyle.color : "white" }}
                              >
                                {item.checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                              </div>

                              <button 
                                className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center transition"
                                onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }}
                              >
                                <MoreHorizontal className="w-4 h-4 opacity-70" style={{ color: activeStyle.color }} />
                              </button>
                            </div>

                            {/* 圖片縮圖 */}
                            <PhotoThumb imageId={item.imageId} activeColor={activeStyle.color} categoryIcon={activeStyle.icon} />

                            {/* 雙行商品資訊：第一行品牌、第二行名稱 */}
                            <div className="mt-2 text-center space-y-0.5">
                              {item.brand && (
                                <span className="block text-[12px] font-bold leading-tight truncate px-1 opacity-70"
                                      style={{ color: activeStyle.color }}>
                                  {item.brand}
                                </span>
                              )}
                              <span className="block text-[12px] font-bold leading-tight line-clamp-2 px-1"
                                    style={{ color: activeStyle.color, filter: "brightness(0.8)" }}>
                                {item.name}
                              </span>
                            </div>

                            {/* 金額或數量顯示 */}
                            <div className="mt-1.5 text-[11px] font-black leading-tight tabular-nums text-center min-h-[16px]" style={{ color: activeStyle.color }}>
                              {hasPrice ? (
                                qty >= 2 ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="opacity-70">{currentCurrencySymbol}{item.price.toLocaleString()}×{qty}</span>
                                    <span className="opacity-40">｜</span>
                                    <span>{currentCurrencySymbol}{(item.price * qty).toLocaleString()}</span>
                                  </div>
                                ) : (
                                  <div>{currentCurrencySymbol}{item.price.toLocaleString()}</div>
                                )
                              ) : (
                                qty >= 2 ? <div className="opacity-80">數量：{qty}</div> : null
                              )}
                            </div>
                            
                            {/* 下拉選單 */}
                            {menuOpenId === item.id && (
                              <div className={`absolute right-2 z-[110] w-38 bg-white border rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${isNearBottom ? "bottom-[42px]" : "top-[50px]}"}`}
                                   style={{ borderColor: `${activeStyle.color}20` }}
                                   onClick={(e) => e.stopPropagation()}>
                                <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium" style={{ color: activeStyle.color }} onClick={() => { setEditingItem({ catId: activeTab, item }); setDraftBrand(item.brand || ""); setDraftName(item.name || ""); setDraftPrice(item.price != null ? String(item.price) : ""); setDraftQuantity(item.quantity != null ? String(item.quantity) : "1"); setMenuOpenId(null); }}>
                                  <PencilLine className="w-4 h-4 shrink-0" />
                                  <span>編輯商品資訊</span>
                                </button>
                                <label className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium cursor-pointer" style={{ color: activeStyle.color }}>
                                  <ImageIcon className="w-4 h-4 shrink-0" />
                                  <span>更換照片</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], activeTab, item.id, item.imageId); setMenuOpenId(null); }} />
                                </label>
                                <div className="h-px my-1 mx-2" style={{ backgroundColor: `${activeStyle.color}10` }} />
                                <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-red-500 font-black hover:bg-red-50 w-full" onClick={() => { deleteItem(activeTab, item.id, item.imageId); setMenuOpenId(null); }}>
                                  <Trash2 className="w-4 h-4 shrink-0" />
                                  <span>刪除</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

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
                        <div className="mt-2.5 grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                          {completedItems.map((item, index) => {
                            const qty = item.quantity || 1;
                            const hasPrice = typeof item.price === "number";
                            const isNearBottom = index >= 2;

                            return (
                              <div 
                                key={item.id} 
                                onClick={() => updateItem(activeTab, item.id, { checked: false })}
                                className="relative flex flex-col p-3 rounded-2xl transition-all cursor-pointer opacity-75 hover:opacity-100 justify-between border" 
                                style={{ backgroundColor: `${activeStyle.color}12`, borderColor: `${activeStyle.color}30` }}
                              >
                                <div className="flex items-center justify-between mb-1.5 px-0.5" onClick={(e) => e.stopPropagation()}>
                                  <div 
                                    onClick={() => updateItem(activeTab, item.id, { checked: false })}
                                    className="w-5 h-5 rounded-full flex items-center justify-center shadow-xs cursor-pointer" 
                                    style={{ backgroundColor: activeStyle.color }}
                                  >
                                    <Check className="w-3 h-3 text-white stroke-[3]" />
                                  </div>

                                  <button 
                                    className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center transition"
                                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }}
                                  >
                                    <MoreHorizontal className="w-4 h-4 opacity-70" style={{ color: activeStyle.color }} />
                                  </button>
                                </div>

                                <PhotoThumb imageId={item.imageId} activeColor={activeStyle.color} categoryIcon={activeStyle.icon} />

                                <div className="mt-2 text-center space-y-0.5">
                                  {item.brand && (
                                    <span className="block text-[12px] font-bold leading-tight truncate px-1 opacity-60 line-through"
                                          style={{ color: activeStyle.color }}>
                                      {item.brand}
                                    </span>
                                  )}
                                  <span className="block text-[12px] line-through font-bold leading-tight line-clamp-2 px-1"
                                        style={{ color: activeStyle.color }}>
                                    {item.name}
                                  </span>
                                </div>

                                <div className="mt-1.5 text-[11px] font-black leading-tight tabular-nums text-center opacity-80 min-h-[16px]" style={{ color: activeStyle.color }}>
                                  {hasPrice ? (
                                    qty >= 2 ? (
                                      <div className="flex items-center justify-center gap-1">
                                        <span className="opacity-70">{currentCurrencySymbol}{item.price.toLocaleString()}×{qty}</span>
                                        <span className="opacity-40">｜</span>
                                        <span>{currentCurrencySymbol}{(item.price * qty).toLocaleString()}</span>
                                      </div>
                                    ) : (
                                      <div>{currentCurrencySymbol}{item.price.toLocaleString()}</div>
                                    )
                                  ) : (
                                    qty >= 2 ? <div className="opacity-80">數量：{qty}</div> : null
                                  )}
                                </div>
                                
                                {menuOpenId === item.id && (
                                  <div className={`absolute right-2 z-[110] w-38 bg-white border rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${isNearBottom ? "bottom-[42px]" : "top-[50px]}"}`}
                                       style={{ borderColor: `${activeStyle.color}20` }}
                                       onClick={(e) => e.stopPropagation()}>
                                    <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium" style={{ color: activeStyle.color }} onClick={() => { setEditingItem({ catId: activeTab, item }); setDraftBrand(item.brand || ""); setDraftName(item.name || ""); setDraftPrice(item.price != null ? String(item.price) : ""); setDraftQuantity(item.quantity != null ? String(item.quantity) : "1"); setMenuOpenId(null); }}>
                                      <PencilLine className="w-4 h-4 shrink-0" />
                                      <span>編輯商品資訊</span>
                                    </button>
                                    <label className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-black/5 w-full font-medium cursor-pointer" style={{ color: activeStyle.color }}>
                                      <ImageIcon className="w-4 h-4 shrink-0" />
                                      <span>更換照片</span>
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], activeTab, item.id, item.imageId); setMenuOpenId(null); }} />
                                    </label>
                                    <div className="h-px my-1 mx-2" style={{ backgroundColor: `${activeStyle.color}10` }} />
                                    <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-red-500 font-black hover:bg-red-50 w-full" onClick={() => { deleteItem(activeTab, item.id, item.imageId); setMenuOpenId(null); }}>
                                      <Trash2 className="w-4 h-4 shrink-0" />
                                      <span>刪除</span>
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

      {/* 統一的商品編輯彈窗（含拍照上傳功能） */}
      {editingItem && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-[2rem] border shadow-2xl p-6 w-full max-w-[320px] animate-in zoom-in-95 duration-200 bg-white" style={{ borderColor: `${activeStyle.color}40` }}>
            <h3 className="text-[14px] font-bold mb-4 tracking-wider text-center" style={{ color: activeStyle.color }}>編輯商品資訊</h3>
            
            <div className="space-y-3">
              {/* 照片上傳捷徑 */}
              <div className="flex flex-col items-center justify-center mb-2">
                <label className="w-full py-2.5 px-4 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition hover:bg-black/5" style={{ borderColor: `${activeStyle.color}60`, color: activeStyle.color }}>
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-[12px] font-bold">上傳 / 更換商品照片</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0], editingItem.catId, editingItem.item.id, editingItem.item.imageId);
                      }
                    }} 
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-70" style={{ color: activeStyle.color }}>品牌</label>
                <input 
                  type="text" 
                  value={draftBrand} 
                  onChange={(e) => setDraftBrand(e.target.value)} 
                  placeholder="例如：Lador / Anua"
                  className="w-full px-3 py-2 text-[13px] font-bold rounded-xl border bg-white outline-none" 
                  style={{ borderColor: `${activeStyle.color}30`, color: activeStyle.color }} 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 opacity-70" style={{ color: activeStyle.color }}>名稱 / 色號</label>
                <input 
                  type="text" 
                  value={draftName} 
                  onChange={(e) => setDraftName(e.target.value)} 
                  placeholder="例如：護髮油 150ml"
                  className="w-full px-3 py-2 text-[13px] font-bold rounded-xl border bg-white outline-none" 
                  style={{ borderColor: `${activeStyle.color}30`, color: activeStyle.color }} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-70" style={{ color: activeStyle.color }}>單價 ({currentCurrencySymbol})</label>
                  <input 
                    type="number" 
                    value={draftPrice} 
                    onChange={(e) => setDraftPrice(e.target.value)} 
                    placeholder="選填"
                    className="w-full px-3 py-2 text-[13px] font-bold rounded-xl border bg-white outline-none" 
                    style={{ borderColor: `${activeStyle.color}30`, color: activeStyle.color }} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-70" style={{ color: activeStyle.color }}>數量</label>
                  <input 
                    type="number" 
                    value={draftQuantity} 
                    onChange={(e) => setDraftQuantity(e.target.value)} 
                    min="1"
                    className="w-full px-3 py-2 text-[13px] font-bold rounded-xl border bg-white outline-none" 
                    style={{ borderColor: `${activeStyle.color}30`, color: activeStyle.color }} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
              <button 
                onClick={() => {
                  setEditingItem(null);
                }} 
                className="py-2.5 rounded-xl border text-[12px] font-bold bg-white active:scale-95 transition-all" 
                style={{ borderColor: `${currentTheme.border}`, color: currentTheme.text }}
              >
                取消
              </button>
              <button 
                onClick={() => {
                  updateItem(editingItem.catId, editingItem.item.id, {
                    brand: draftBrand.trim(),
                    name: draftName.trim() || "未命名商品",
                    price: draftPrice === "" ? null : Number(draftPrice),
                    quantity: draftQuantity === "" ? 1 : Number(draftQuantity)
                  });
                  setEditingItem(null);
                }} 
                className="py-2.5 text-white rounded-xl flex items-center justify-center gap-1 text-[12px] font-bold shadow-md active:scale-95 transition-all" 
                style={{ backgroundColor: activeStyle.color }}
              >
                確定
              </button>
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