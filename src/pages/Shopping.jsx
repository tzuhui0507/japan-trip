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
} from "lucide-react";
import PageHeader from "../components/PageHeader";

/* 預設購物分類 */
const DEFAULT_CATEGORIES = [
  { id: "drugstore", title: "藥妝", items: [] },
  { id: "snack", title: "零食", items: [] },
  { id: "electronics", title: "電器", items: [] },
  { id: "other", title: "其他", items: [] },
];

/* 分類樣式 */
const CATEGORY_STYLES = {
  drugstore: { header: "bg-[#CFA1A8]", icon: Droplet },
  snack: { header: "bg-[#D4A18A]", icon: Cookie },
  electronics: { header: "bg-[#AFC1A9]", icon: Plug },
  other: { header: "bg-[#B7A2BC]", icon: MoreHorizontal },
};

/* 行李清單同款點點背景 */
const dottedBg = {
  backgroundImage: "radial-gradient(#E8E1DA 1px, transparent 1px)",
  backgroundSize: "12px 12px",
};

const VIEWER_SHOPPING_KEY = "viewer_shopping_v1";

export default function Shopping({ trip, setTrip }) {
  const isViewer = trip?.shareMode === "viewer";
  const [viewerShopping, setViewerShopping] = useState(null);

  /* viewer 初始化 */
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

  /* owner 初始化 */
  useEffect(() => {
    if (isViewer) return;
    if (!trip.shopping) {
      setTrip((p) => ({ ...p, shopping: DEFAULT_CATEGORIES }));
    }
  }, [isViewer, trip.shopping, setTrip]);

  const shopping = isViewer
    ? viewerShopping || DEFAULT_CATEGORIES
    : trip.shopping || DEFAULT_CATEGORIES;

  /* 🔑 統一寫入出口 */
  const updateShopping = (updater) => {
    if (isViewer) {
      setViewerShopping((prev) => {
        const base = prev || DEFAULT_CATEGORIES;
        const next =
          typeof updater === "function" ? updater(base) : updater;
        localStorage.setItem(
          VIEWER_SHOPPING_KEY,
          JSON.stringify(next)
        );
        return next;
      });
      return;
    }

    setTrip((p) => ({
      ...p,
      shopping:
        typeof updater === "function"
          ? updater(p.shopping || DEFAULT_CATEGORIES)
          : updater,
    }));
  };

  /* 新增項目 */
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
                  name: "",
                  checked: false,
                  image: null,
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
          <div
            key={cat.id}
            className="rounded-3xl border border-[#E5D5C5] overflow-hidden bg-white"
          >
            <div
              className={`px-4 py-3 flex items-center justify-between ${
                CATEGORY_STYLES[cat.id]?.header || ""
              }`}
            >
              <div className="flex items-center gap-2 text-white">
                {Icon && <Icon className="w-5 h-5" />}
                <h3 className="font-semibold">{cat.title}</h3>
              </div>

              <button
                onClick={() => addItem(cat.id)}
                className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-[#5A4636]" />
              </button>
            </div>

            <div
              className="p-4 space-y-3 bg-[#FFF9F2]"
              style={dottedBg}
            >
              {cat.items.length === 0 && (
                <p className="text-xs text-[#A8937C]">尚無項目</p>
              )}

              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-start border border-[#F0E3D5] rounded-xl p-3 bg-white"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) =>
                      updateItem(cat.id, item.id, {
                        checked: e.target.checked,
                      })
                    }
                  />

                  <div className="flex-1 space-y-2">
                    <input
                      value={item.name}
                      onChange={(e) =>
                        updateItem(cat.id, item.id, {
                          name: e.target.value,
                        })
                      }
                      placeholder="輸入購物項目"
                      className="w-full bg-transparent border-b border-[#E5D5C5] text-sm outline-none"
                    />

                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    ) : (
                      <label className="inline-flex items-center gap-1 text-xs text-[#8C6A4F] cursor-pointer">
                        <ImageIcon className="w-4 h-4" />
                        上傳照片
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            e.target.files &&
                            handleImageUpload(
                              e.target.files[0],
                              cat.id,
                              item.id
                            )
                          }
                        />
                      </label>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      deleteItem(cat.id, item.id)
                    }
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
