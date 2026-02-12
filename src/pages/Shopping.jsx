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
  Check,
  ShoppingBasket,
  Loader2, // 新增讀取圖示
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { get, set, del } from "idb-keyval"; // 引入 IndexedDB 工具

/* ================== constants ================== */
const DEFAULT_CATEGORIES = [
  { id: "drugstore", title: "藥妝", items: [] },
  { id: "snack", title: "零食", items: [] },
  { id: "electronics", title: "電器", items: [] },
  { id: "other", title: "其他", items: [] },
];

const CATEGORY_STYLES = {
  drugstore: { header: "bg-[#CFA1A8]", icon: Droplet },
  snack: { header: "bg-[#D4A18A]", icon: Cookie },
  electronics: { header: "bg-[#AFC1A9]", icon: Plug },
  other: { header: "bg-[#B7A2BC]", icon: MoreHorizontal },
};

const dottedBg = {
  backgroundImage: "radial-gradient(#E8E1DA 1px, transparent 1px)",
  backgroundSize: "12px 12px",
};

const VIEWER_SHOPPING_KEY = "viewer_shopping_v1";

/* ================== helper functions ================== */

// 圖片壓縮工具：大幅節省空間並提升效能
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200; // 限制最大寬度
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7)); // 壓縮品質 0.7
      };
    };
  });
};

/* ================== component ================== */
export default function Shopping({ trip, setTrip }) {
  const isViewer = trip?.shareMode === "viewer";
  const [viewerShopping, setViewerShopping] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [editingItem, setEditingItem] = useState(null); 
  const [editingField, setEditingField] = useState(null); 
  const [draftValue, setDraftValue] = useState("");
  
  // 用於暫存從 IndexedDB 撈出來的圖片，避免重複讀取
  const [imageCache, setImageCache] = useState({});

  /* ---------- 核心：資料遷移與圖片載入 ---------- */
  useEffect(() => {
    const runMigration = async () => {
      if (!trip.shopping) return;
      
      let hasMigrated = false;
      const nextShopping = JSON.parse(JSON.stringify(trip.shopping));

      // 檢查購物清單中是否有舊的 Base64 圖片
      for (const cat of nextShopping) {
        for (const item of cat.items) {
          if (item.image && item.image.startsWith("data:image")) {
            // 1. 搬家到 IndexedDB
            const imageId = `img_${item.id}_${Date.now()}`;
            await set(imageId, item.image);
            // 2. LocalStorage 只存 ID
            item.imageId = imageId;
            delete item.image;
            hasMigrated = true;
          }
        }
      }

      if (hasMigrated) {
        setTrip(p => ({ ...p, shopping: nextShopping }));
        console.log("✅ 圖片成功遷移至 IndexedDB，LocalStorage 已釋放空間");
      }
    };

    if (!isViewer) runMigration();
  }, [trip.shopping, setTrip, isViewer]);

  /* ---------- init ---------- */
  useEffect(() => {
    if (!isViewer) return;
    const raw = localStorage.getItem(VIEWER_SHOPPING_KEY);
    if (raw) {
      setViewerShopping(JSON.parse(raw));
    } else {
      const init = trip.shopping || DEFAULT_CATEGORIES;
      localStorage.setItem(VIEWER_SHOPPING_KEY, JSON.stringify(init));
      setViewerShopping(init);
    }
  }, [isViewer, trip.shopping]);

  useEffect(() => {
    if (isViewer) return;
    if (!trip.shopping) {
      setTrip((p) => ({ ...p, shopping: DEFAULT_CATEGORIES }));
    }
  }, [isViewer, trip.shopping, setTrip]);

  const shopping = isViewer
    ? viewerShopping || DEFAULT_CATEGORIES
    : trip.shopping || DEFAULT_CATEGORIES;

  /* ---------- helpers ---------- */
  const updateShopping = (updater) => {
    if (isViewer) {
      setViewerShopping((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem(VIEWER_SHOPPING_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setTrip((p) => ({
        ...p,
        shopping: typeof updater === "function" ? updater(p.shopping) : updater,
      }));
    }
  };

  const addItem = (catId) => {
    updateShopping((list) =>
      list.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: [
                ...c.items,
                {
                  id: `item-${Date.now()}`,
                  name: "新的項目",
                  checked: false,
                  imageId: null, // 改用 imageId
                  price: null,
                  quantity: 1,
                },
              ],
            }
          : c
      )
    );
  };

  const updateItem = (catId, itemId, patch) => {
    updateShopping((list) =>
      list.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, ...patch } : i
              ),
            }
          : c
      )
    );
  };

  const deleteItem = async (catId, itemId, imageId) => {
    if (imageId) await del(imageId); // 同步刪除資料庫圖片
    updateShopping((list) =>
      list.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      )
    );
  };

  const handleImageUpload = async (file, catId, itemId, oldImageId) => {
    if (!file) return;
    try {
      // 1. 壓縮圖片
      const compressedBase64 = await compressImage(file);
      // 2. 存入 IndexedDB
      const newImageId = `img_${itemId}_${Date.now()}`;
      await set(newImageId, compressedBase64);
      // 3. 刪除舊圖
      if (oldImageId) await del(oldImageId);
      // 4. 更新行程狀態
      updateItem(catId, itemId, { imageId: newImageId });
      // 5. 更新快取
      setImageCache(prev => ({ ...prev, [newImageId]: compressedBase64 }));
    } catch (err) {
      alert("圖片處理失敗，請重試");
    }
  };

  // 異步讀取圖片的組件按鈕
  const PhotoButton = ({ imageId, isChecked }) => {
    const [loading, setLoading] = useState(false);
    
    const handleClick = async () => {
      if (imageCache[imageId]) {
        setPreviewImage(imageCache[imageId]);
        return;
      }
      setLoading(true);
      const data = await get(imageId);
      if (data) {
        setImageCache(prev => ({ ...prev, [imageId]: data }));
        setPreviewImage(data);
      }
      setLoading(false);
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`p-1.5 rounded-full hover:bg-[#F7F1EB] transition ${isChecked ? "opacity-50" : "opacity-100"}`}
      >
        {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin text-[#C6A087]" /> : <ImageIcon className="w-4.5 h-4.5 text-[#A8937C]" />}
      </button>
    );
  };

  return (
    <div className="pt-2 pb-24 space-y-4 px-3">
      <PageHeader icon={ShoppingBag} title="購物清單" subtitle="SHOPPING LIST" />

      {shopping.map((cat) => {
        const Icon = CATEGORY_STYLES[cat.id]?.icon;

        return (
          <div key={cat.id} className="rounded-2xl overflow-visible">
            <div className={`px-4 py-3 flex items-center justify-between rounded-t-2xl border border-[#EDE3D8] border-b-0 ${CATEGORY_STYLES[cat.id]?.header || ""}`}>
              <div className="flex items-center gap-2 text-white">
                {Icon && <Icon className="w-5 h-5" />}
                <h3 className="font-semibold">{cat.title}</h3>
              </div>
              <button onClick={() => addItem(cat.id)} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center active:scale-90 transition-transform shadow-sm">
                <Plus className="w-4 h-4 text-[#5A4636]" />
              </button>
            </div>

            <div className="p-3 space-y-2 bg-[#FFF9F2] rounded-b-2xl border border-[#EDE3D8] border-t-0" style={dottedBg}>
              {[...cat.items]
                .sort((a, b) => Number(a.checked) - Number(b.checked))
                .map((item, index, arr) => {
                  const nextItem = arr[index + 1];

                  return (
                    <React.Fragment key={item.id}>
                      <div className={`relative flex items-center h-[52px] px-3 rounded-xl transition ${item.checked ? "bg-[#F7F1EB] border border-[#E8DCCF]" : "bg-white border border-[#F0E3D5] shadow-sm"}`}>
                        <input
                          type="checkbox"
                          className="shrink-0 w-4.5 h-4.5 accent-[#D8C2AE] cursor-pointer"
                          checked={item.checked}
                          onChange={(e) => updateItem(cat.id, item.id, { checked: e.target.checked })}
                        />

                        <span className={`ml-3 flex-1 text-[13px] truncate transition ${item.checked ? "line-through text-[#A8937C]" : "text-[#5A4636] font-medium"}`}>
                          {item.name}
                        </span>

                        {typeof item.price === "number" && item.quantity > 0 && (
                          <div className={`mr-2 text-right leading-tight tabular-nums transition ${item.checked ? "opacity-60" : ""}`}>
                            <div className="text-[11px] font-bold text-[#5A4636]">¥ {(item.price * item.quantity).toLocaleString()}</div>
                            <div className="text-[9px] text-[#A8937C]">¥{item.price.toLocaleString()} × {item.quantity}</div>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          {item.imageId && <PhotoButton imageId={item.imageId} isChecked={item.checked} />}

                          <button className="p-1.5" onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}>
                            <MoreHorizontal className="w-5 h-5 text-[#8C6A4F]" />
                          </button>
                        </div>

                        {menuOpenId === item.id && (
                          <div className="absolute right-0 bottom-[54px] z-[60] w-36 bg-white border border-[#E5D5C5] rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <button className="flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-[#F7F1EB] w-full text-[#5A4636]" onClick={() => { setEditingItem({ catId: cat.id, item }); setEditingField("name"); setDraftValue(item.name); setMenuOpenId(null); }}>
                              <Pencil className="w-4 h-4 text-[#C6A087]" /> 編輯名稱
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-[#F7F1EB] w-full text-[#5A4636]" onClick={() => { setEditingItem({ catId: cat.id, item }); setEditingField("price"); setDraftValue(item.price != null ? String(item.price) : ""); setMenuOpenId(null); }}>
                              <CircleDollarSign className="w-4 h-4 text-[#C6A087]" /> 編輯單價
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-[#F7F1EB] w-full text-[#5A4636]" onClick={() => { setEditingItem({ catId: cat.id, item }); setEditingField("quantity"); setDraftValue(item.quantity != null ? String(item.quantity) : "1"); setMenuOpenId(null); }}>
                              <ShoppingBasket className="w-4 h-4 text-[#C6A087]" /> 編輯數量
                            </button>
                            <label className="flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-[#F7F1EB] w-full text-[#5A4636] cursor-pointer">
                              <ImageIcon className="w-4 h-4 text-[#C6A087]" /> 編輯照片
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (!e.target.files?.[0]) return;
                                  handleImageUpload(e.target.files[0], cat.id, item.id, item.imageId);
                                  setMenuOpenId(null);
                                }}
                              />
                            </label>
                            <div className="h-px bg-[#F0E3D5] my-1 mx-2" />
                            <button className="flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 font-bold hover:bg-red-50 w-full" onClick={() => { deleteItem(cat.id, item.id, item.imageId); setMenuOpenId(null); }}>
                              <Trash2 className="w-4 h-4" /> 刪除項目
                            </button>
                          </div>
                        )}
                      </div>

                      {!item.checked && nextItem?.checked && (
                        <div className="my-2 h-[2px] rounded-full bg-[#E5D5C5]" />
                      )}
                    </React.Fragment>
                  );
                })}
            </div>
          </div>
        );
      })}

      {/* 編輯浮層 */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FFF9F2] rounded-[2.5rem] border border-[#E5D5C5] shadow-2xl p-7 w-full max-w-[320px] animate-in zoom-in-95 duration-200">
            <h3 className="text-[14px] font-bold mb-5 text-[#5A4636] uppercase tracking-widest text-center">
              {editingField === "name" ? "編輯名稱" : editingField === "price" ? "編輯單價" : "編輯數量"}
            </h3>
            <div className="bg-white rounded-2xl border border-[#E5D5C5] px-4 py-3.5 shadow-inner">
              <input autoFocus type={editingField === "name" ? "text" : "number"} value={draftValue} onChange={(e) => setDraftValue(e.target.value)} className="w-full text-center text-[18px] font-bold bg-transparent outline-none text-[#5A4636]" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => setEditingItem(null)} className="py-3 rounded-2xl border border-[#E5D5C5] text-[13px] font-bold text-[#8C6A4F] bg-white active:scale-95 transition-all">取消</button>
              <button onClick={() => {
                  if (editingField === "price") updateItem(editingItem.catId, editingItem.item.id, { price: Number(draftValue) });
                  else if (editingField === "quantity") updateItem(editingItem.catId, editingItem.item.id, { quantity: Number(draftValue) });
                  else updateItem(editingItem.catId, editingItem.item.id, { name: draftValue });
                  setEditingItem(null);
                }} className="py-3 bg-[#C6A087] text-white rounded-2xl flex items-center justify-center gap-1 text-[13px] font-bold shadow-md active:scale-95 transition-all">確定</button>
            </div>
          </div>
        </div>
      )}

      {/* 圖片預覽 */}
      {previewImage && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-full" onClick={e => e.stopPropagation()}>
             <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white flex items-center gap-1 text-sm font-bold">關閉 <X className="w-5 h-5" /></button>
             <img src={previewImage} alt="" className="max-w-[90vw] max-h-[80vh] rounded-3xl shadow-2xl border-4 border-white/20" />
          </div>
        </div>
      )}
    </div>
  );
}