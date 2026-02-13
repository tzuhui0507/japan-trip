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
  Pencil,
  CircleDollarSign,
  ShoppingBasket,
  Loader2,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { get, set, del } from "idb-keyval";

/* ================== constants ================== */
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

// 奶茶色底色點點背景 (#FFF9F2)
const dottedBg = {
  backgroundColor: "#FFF9F2", 
  backgroundImage: "radial-gradient(#E8E1DA 1px, transparent 1px)",
  backgroundSize: "12px 12px",
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
        const MAX_WIDTH = 1100;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
  });
};

/* ================== component ================== */
export default function Shopping({ trip, setTrip }) {
  const isViewer = trip?.shareMode === "viewer";
  const [viewerShopping, setViewerShopping] = useState(null);
  const [activeTab, setActiveTab] = useState("drugstore");

  const [previewImage, setPreviewImage] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingItem, setEditingItem] = useState(null); 
  const [editingField, setEditingField] = useState(null); 
  const [draftValue, setDraftValue] = useState("");
  const [imageCache, setImageCache] = useState({});

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

  const PhotoButton = ({ imageId, isChecked }) => {
    const [loading, setLoading] = useState(false);
    const handleClick = async () => {
      if (imageCache[imageId]) { setPreviewImage(imageCache[imageId]); return; }
      setLoading(true);
      const data = await get(imageId);
      if (data) { setImageCache(prev => ({ ...prev, [imageId]: data })); setPreviewImage(data); }
      setLoading(false);
    };
    return (
      <button type="button" onClick={handleClick} disabled={loading} className={`p-1.5 rounded-full hover:bg-white/50 transition ${isChecked ? "opacity-50" : "opacity-100"}`}>
        {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin text-[#C6A087]" /> : <ImageIcon className="w-4.5 h-4.5 text-[#A8937C]" />}
      </button>
    );
  };

  const activeCategoryData = shopping.find(c => c.id === activeTab);
  const activeStyle = CATEGORY_STYLES[activeTab];

  return (
    <div className="pt-2 pb-24 space-y-5 px-4" onClick={() => setMenuOpenId(null)}>
      <PageHeader icon={ShoppingBag} title="購物清單" subtitle="SHOPPING LIST" />

      {/* 頁籤導覽：加寬、加高，並優化文字與圖示比例 */}
      <div className="bg-[#E8E1DA]/40 p-1.5 rounded-full flex relative border border-white/40 h-[48px] items-stretch z-30 shadow-inner">
        {shopping.map((cat) => {
          const isActive = activeTab === cat.id;
          const catStyle = CATEGORY_STYLES[cat.id];
          return (
            <button
              key={cat.id}
              onClick={(e) => { e.stopPropagation(); setActiveTab(cat.id); }}
              className={`flex-1 text-[13px] font-black transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5`}
              style={{ color: isActive ? catStyle.color : "#8C6A4F99" }}
            >
              {React.createElement(catStyle.icon, { className: "w-4 h-4 shrink-0" })}
              {cat.title}
            </button>
          );
        })}
        {/* 滑動藥丸背景：配合高度增加進行微調 */}
        <div 
          className="absolute top-1 bottom-1 transition-all duration-300 bg-white rounded-full shadow-md z-0 border border-[#EDE3D8]"
          style={{ width: "calc(25% - 8px)", left: `${shopping.findIndex(c => c.id === activeTab) * 25 + 1}%` }}
        />
      </div>

      {/* 內容卡片 */}
      <div className="rounded-[24px] border border-[#EDE3D8] shadow-sm bg-white animate-in fade-in duration-300 relative overflow-visible z-20">
        {activeCategoryData && (
          <>
            <div className="px-5 py-4 flex items-center justify-between rounded-t-[24px]" style={{ backgroundColor: activeStyle.light }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: activeStyle.color }}>
                   {React.createElement(activeStyle.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="font-bold text-[#5A4636] text-[15.5px] leading-tight">{activeCategoryData.title}</h3>
                  <p className="text-[9px] text-[#8C6A4F] uppercase tracking-wider opacity-60 font-black">
                    {activeStyle.en}
                  </p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); addItem(activeCategoryData.id); }} className="w-8.5 h-8.5 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform shadow-sm border border-[#F0E3D5]">
                <Plus className="w-4.5 h-4.5 text-[#8C6A4F]" />
              </button>
            </div>

            {/* 內容區域：奶茶色底點點背景樣式 */}
            <div className="p-3.5 space-y-2 min-h-[380px] rounded-b-[24px]" style={dottedBg}>
              {activeCategoryData.items.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-[#A8937C] opacity-30 text-sm">
                  <ShoppingBasket className="w-10 h-10 mb-2 stroke-[1px]" />
                  尚未加入任何商品
                </div>
              ) : (
                [...activeCategoryData.items]
                  .sort((a, b) => Number(a.checked) - Number(b.checked))
                  .map((item, index, arr) => {
                    const shouldOpenUp = index >= arr.length - 2 && arr.length > 2;

                    return (
                      <React.Fragment key={item.id}>
                        <div className={`relative flex items-center h-[54px] px-3.5 rounded-2xl transition-all ${item.checked ? "bg-[#F7F1EB]/60 opacity-80" : "bg-white border border-[#F0E3D5] shadow-sm"}`}>
                          <input type="checkbox" className="shrink-0 w-5 h-5 accent-[#D8C2AE] cursor-pointer rounded-full" checked={item.checked} onChange={(e) => updateItem(activeCategoryData.id, item.id, { checked: e.target.checked })} />
                          <span className={`ml-4 flex-1 text-[14px] truncate transition ${item.checked ? "line-through text-[#A8937C]" : "text-[#5A4636] font-bold"}`}>
                            {item.name}
                          </span>
                          {typeof item.price === "number" && item.quantity > 0 && (
                            <div className="mr-3 text-right leading-tight tabular-nums">
                              <div className="text-[11.5px] font-black text-[#5A4636]">¥{(item.price * item.quantity).toLocaleString()}</div>
                              <div className="text-[8.5px] text-[#A8937C] font-bold">¥{item.price.toLocaleString()} × {item.quantity}</div>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {item.imageId && <PhotoButton imageId={item.imageId} isChecked={item.checked} />}
                            <button className="p-1.5 rounded-full hover:bg-gray-50" onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }}>
                              <MoreHorizontal className="w-4.5 h-4.5 text-[#8C6A4F]/60" />
                            </button>
                          </div>
                          
                          {menuOpenId === item.id && (
                            <div 
                              className={`absolute right-1 z-[110] w-38 bg-white border border-[#E5D5C5] rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${
                                shouldOpenUp ? "bottom-[58px]" : "top-[52px]"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-[#F7F1EB] w-full text-[#5A4636] font-medium" onClick={() => { setEditingItem({ catId: activeCategoryData.id, item }); setEditingField("name"); setDraftValue(item.name); setMenuOpenId(null); }}>
                                <Pencil className="w-4 h-4 text-[#C6A087]" /> 名稱
                              </button>
                              <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-[#F7F1EB] w-full text-[#5A4636] font-medium" onClick={() => { setEditingItem({ catId: activeCategoryData.id, item }); setEditingField("price"); setDraftValue(item.price != null ? String(item.price) : ""); setMenuOpenId(null); }}>
                                <CircleDollarSign className="w-4 h-4 text-[#C6A087]" /> 單價
                              </button>
                              <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-[#F7F1EB] w-full text-[#5A4636] font-medium" onClick={() => { setEditingItem({ catId: activeCategoryData.id, item }); setEditingField("quantity"); setDraftValue(item.quantity != null ? String(item.quantity) : "1"); setMenuOpenId(null); }}>
                                <ShoppingBasket className="w-4 h-4 text-[#C6A087]" /> 數量
                              </button>
                              <label className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-[#F7F1EB] w-full text-[#5A4636] font-medium cursor-pointer">
                                <ImageIcon className="w-4 h-4 text-[#C6A087]" /> 照片
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], activeCategoryData.id, item.id, item.imageId); setMenuOpenId(null); }} />
                              </label>
                              <div className="h-px bg-[#F0E3D5] my-1.5 mx-2" />
                              <button className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-red-500 font-black hover:bg-red-50 w-full" onClick={() => { deleteItem(activeCategoryData.id, item.id, item.imageId); setMenuOpenId(null); }}>
                                <Trash2 className="w-4 h-4" /> 刪除
                              </button>
                            </div>
                          )}
                        </div>
                        {arr[index + 1]?.checked && !item.checked && <div className="my-2 h-[1.5px] rounded-full bg-[#E5D5C5]/60" />}
                      </React.Fragment>
                    );
                  })
              )}
            </div>
          </>
        )}
      </div>

      {/* 編輯浮層 */}
      {editingItem && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FFF9F2] rounded-[2rem] border border-[#E5D5C5] shadow-2xl p-6 w-full max-w-[300px] animate-in zoom-in-95 duration-200">
            <h3 className="text-[13.5px] font-bold mb-4 text-[#5A4636] uppercase tracking-widest text-center">編輯清單</h3>
            <div className="bg-white rounded-xl border border-[#E5D5C5] px-4 py-3 shadow-inner">
              <input autoFocus type={editingField === "name" ? "text" : "number"} value={draftValue} onChange={(e) => setDraftValue(e.target.value)} className="w-full text-center text-[16.5px] font-bold bg-transparent outline-none text-[#5A4636]" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => setEditingItem(null)} className="py-3 rounded-xl border border-[#E5D5C5] text-[12.5px] font-bold text-[#8C6A4F] bg-white active:scale-95 transition-all">取消</button>
              <button onClick={() => {
                  if (editingField === "price") updateItem(editingItem.catId, editingItem.item.id, { price: Number(draftValue) });
                  else if (editingField === "quantity") updateItem(editingItem.catId, editingItem.item.id, { quantity: Number(draftValue) });
                  else updateItem(editingItem.catId, editingItem.item.id, { name: draftValue });
                  setEditingItem(null);
                }} className="py-3 bg-[#C6A087] text-white rounded-xl flex items-center justify-center gap-1 text-[12.5px] font-bold shadow-md active:scale-95 transition-all">確定</button>
            </div>
          </div>
        </div>
      )}

      {/* 圖片預覽 */}
      {previewImage && (
        <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-full" onClick={e => e.stopPropagation()}>
             <button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 text-white flex items-center gap-1 text-[12px] font-bold">關閉 <X className="w-4.5 h-4.5" /></button>
             <img src={previewImage} alt="" className="max-w-[85vw] max-h-[70vh] rounded-[24px] shadow-2xl border-4 border-white/20" />
          </div>
        </div>
      )}
    </div>
  );
}