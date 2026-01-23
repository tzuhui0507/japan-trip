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
} from "lucide-react";
import PageHeader from "../components/PageHeader";

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

/* ================== component ================== */
export default function Shopping({ trip, setTrip }) {
  const isViewer = trip?.shareMode === "viewer";
  const [viewerShopping, setViewerShopping] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [editingItem, setEditingItem] = useState(null); // { catId, item }
  const [editingField, setEditingField] = useState(null); // "name" | "price" | "quantity"
  const [draftValue, setDraftValue] = useState("");

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
                  image: null,
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

  const deleteItem = (catId, itemId) => {
    updateShopping((list) =>
      list.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      )
    );
  };

  const handleImageUpload = (file, catId, itemId) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("請選擇圖片檔案");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("圖片太大，請選擇 2MB 以下的照片");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateItem(catId, itemId, { image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pt-4 pb-24 space-y-4">
      <PageHeader
        icon={ShoppingBag}
        title="購物清單"
        subtitle="SHOPPING LIST"
      />

      {shopping.map((cat) => {
        const Icon = CATEGORY_STYLES[cat.id]?.icon;

        return (
          <div key={cat.id} className="rounded-2xl overflow-visible">
            <div
              className={`px-4 py-3 flex items-center justify-between rounded-t-2xl border border-[#EDE3D8] border-b-0 ${
                CATEGORY_STYLES[cat.id]?.header || ""
              }`}
            >
              <div className="flex items-center gap-2 text-white">
                {Icon && <Icon className="w-5 h-5" />}
                <h3 className="font-semibold">{cat.title}</h3>
              </div>
              <button
                onClick={() => addItem(cat.id)}
                className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4 text-[#5A4636]" />
              </button>
            </div>

            <div
              className="p-4 space-y-2 bg-[#FFF9F2] rounded-b-2xl border border-[#EDE3D8] border-t-0"
              style={dottedBg}
            >
              {[...cat.items]
                .sort((a, b) => Number(a.checked) - Number(b.checked))
                .map((item, index, arr) => {
                  const nextItem = arr[index + 1];

                  return (
                    <React.Fragment key={item.id}>
                      <div
                        className={`relative flex items-center h-[52px] px-4 rounded-xl transition ${
                          item.checked
                            ? "bg-[#F7F1EB] border border-[#E8DCCF]"
                            : "bg-white border border-[#F0E3D5]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="shrink-0 w-4 h-4 accent-[#D8C2AE]"
                          checked={item.checked}
                          onChange={(e) =>
                            updateItem(cat.id, item.id, { checked: e.target.checked })
                          }
                        />

                        <span
                          className={`ml-3 flex-1 text-sm truncate transition ${
                            item.checked ? "line-through text-[#A8937C]" : "text-[#5A4636]"
                          }`}
                        >
                          {item.name}
                        </span>

                        {typeof item.price === "number" &&
                          typeof item.quantity === "number" &&
                          item.quantity > 0 && (
                            <div className={`mr-2 text-right leading-snug tabular-nums transition ${item.checked ? "opacity-60" : ""}`}>
                              <div className="text-[12px] font-medium text-[#5A4636]">
                                ¥ {(item.price * item.quantity).toLocaleString()}
                              </div>
                              <div className="text-[9px] text-[#A8937C]">
                                ¥ {item.price.toLocaleString()} × {item.quantity}
                              </div>
                            </div>
                          )}

                        {item.image && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(item.image)}
                            className={`p-1.5 rounded-full hover:bg-[#F7F1EB] transition ${item.checked ? "opacity-50" : "opacity-100"}`}
                          >
                            <ImageIcon className="w-5 h-5 text-[#A8937C]" />
                          </button>
                        )}

                        <button onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}>
                          <MoreHorizontal className="w-5 h-5 text-[#8C6A4F]" />
                        </button>

                        {/* menu */}
                        {menuOpenId === item.id && (
                          <div className="absolute right-2 top-[56px] z-50 w-40 bg-white border border-[#E5D5C5] rounded-lg shadow-lg py-1">
                            <button
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F1EB] w-full"
                              onClick={() => {
                                setEditingItem({ catId: cat.id, item });
                                setEditingField("name");
                                setDraftValue(item.name);
                                setMenuOpenId(null);
                              }}
                            >
                              <Pencil className="w-4 h-4" /> 編輯名稱
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F1EB] w-full"
                              onClick={() => {
                                setEditingItem({ catId: cat.id, item });
                                setEditingField("price");
                                setDraftValue(item.price != null ? String(item.price) : "");
                                setMenuOpenId(null);
                              }}
                            >
                              <CircleDollarSign className="w-4 h-4" /> 編輯單價
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F1EB] w-full"
                              onClick={() => {
                                setEditingItem({ catId: cat.id, item });
                                setEditingField("quantity");
                                setDraftValue(item.quantity != null ? String(item.quantity) : "1");
                                setMenuOpenId(null);
                              }}
                            >
                              <ShoppingBasket className="w-4 h-4" /> 編輯數量
                            </button>
                            <label className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F1EB] cursor-pointer">
                              <ImageIcon className="w-4 h-4" /> 編輯照片
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (!e.target.files?.[0]) return;
                                  handleImageUpload(e.target.files[0], cat.id, item.id);
                                  setMenuOpenId(null);
                                }}
                              />
                            </label>
                            <button
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-[#F7F1EB] w-full"
                              onClick={() => deleteItem(cat.id, item.id)}
                            >
                              <Trash2 className="w-4 h-4" /> 刪除
                            </button>
                          </div>
                        )}
                      </div>

                      {!item.checked && nextItem?.checked && (
                        <div className="my-3 h-[3px] rounded-full bg-[#ADA69E]" />
                      )}
                    </React.Fragment>
                  );
                })}
            </div>
          </div>
        );
      })}

      {/* ===== 優化後的編輯浮層 ===== */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-32 transition-all">
          <div className="bg-[#FFF9F2] rounded-[2rem] border border-[#E5D5C5] shadow-2xl p-6 w-full max-w-[300px] animate-in zoom-in-95 duration-200">
            <h3 className="text-[13px] font-bold mb-4 text-[#5A4636] uppercase tracking-widest text-center">
              {editingField === "name"
                ? "編輯項目名稱"
                : editingField === "price"
                ? "編輯單價 (JPY)"
                : "編輯項目數量"}
            </h3>

            <div className="flex items-center gap-2 bg-white rounded-xl border border-[#E5D5C5] px-3 py-2.5 focus-within:ring-1 focus-within:ring-[#C6A087] transition-all">
              {editingField === "price" && <span className="text-[#8C6A4F] font-bold text-sm">¥</span>}
              <input
                autoFocus
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                className="flex-1 text-[13px] bg-transparent outline-none text-[#5A4636] placeholder-[#A8937C]"
                placeholder={editingField === "price" ? "0" : editingField === "quantity" ? "1" : "輸入名稱"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="py-2.5 rounded-xl border border-[#E5D5C5] text-xs font-medium text-[#8C6A4F] bg-white active:scale-95 transition-all"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (editingField === "price") {
                    const num = Number(draftValue);
                    if (Number.isNaN(num) || num < 0) return;
                    updateItem(editingItem.catId, editingItem.item.id, { price: num });
                  } else if (editingField === "quantity") {
                    const qty = Number(draftValue);
                    if (!Number.isInteger(qty) || qty <= 0) return;
                    updateItem(editingItem.catId, editingItem.item.id, { quantity: qty });
                  } else {
                    updateItem(editingItem.catId, editingItem.item.id, { name: draftValue });
                  }
                  setEditingItem(null);
                }}
                className="py-2.5 bg-[#C6A087] text-white rounded-xl flex items-center justify-center gap-1 text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" /> 確定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* image preview */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative bg-white rounded-3xl p-2 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border border-[#E5D5C5]"
            >
              <X className="w-5 h-5 text-[#8C6A4F]" />
            </button>
            <img
              src={previewImage}
              alt=""
              className="max-w-[85vw] max-h-[75vh] rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}