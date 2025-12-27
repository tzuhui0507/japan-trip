// src/pages/Shopping.jsx
import React from "react";
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

/* 點點背景 */
const dottedBg = {
  backgroundImage: "radial-gradient(#E8E1DA 1px, transparent 1px)",
  backgroundSize: "12px 12px",
};

export default function Shopping({ trip, setTrip }) {
  if (!trip) return null;

  const isViewer = trip?.shareMode === "viewer";

  const shopping =
    Array.isArray(trip.shopping) && trip.shopping.length > 0
      ? trip.shopping
      : DEFAULT_CATEGORIES;

  if (!Array.isArray(shopping)) {
    return (
      <div className="pt-24 text-center text-sm text-[#8C6A4F]">
        購物清單載入中…
      </div>
    );
  }

  const addItem = (catId) => {
    if (isViewer) return;
    setTrip((p) => ({
      ...p,
      shopping: shopping.map((c) =>
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
      ),
    }));
  };

  const updateItem = (catId, itemId, patch) => {
    if (isViewer) return;
    setTrip((p) => ({
      ...p,
      shopping: p.shopping.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, ...patch } : i
              ),
            }
          : c
      ),
    }));
  };

  const deleteItem = (catId, itemId) => {
    if (isViewer) return;
    setTrip((p) => ({
      ...p,
      shopping: p.shopping.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      ),
    }));
  };

  const handleImageUpload = (file, catId, itemId) => {
    if (isViewer) return;
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
                CATEGORY_STYLES[cat.id]?.header || "bg-[#8C6A4F]"
              }`}
            >
              <div className="flex items-center gap-2 text-white">
                {Icon && <Icon className="w-5 h-5 opacity-90" />}
                <h3 className="font-semibold tracking-wide">{cat.title}</h3>
              </div>

              {!isViewer && (
                <button
                  onClick={() => addItem(cat.id)}
                  className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 text-[#5A4636]" />
                </button>
              )}
            </div>

            <div className="p-4 space-y-3 bg-[#FFF9F2]" style={dottedBg}>
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
                    disabled={isViewer}
                    onChange={(e) =>
                      updateItem(cat.id, item.id, {
                        checked: e.target.checked,
                      })
                    }
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-2">
                    <input
                      value={item.name}
                      disabled={isViewer}
                      onChange={(e) =>
                        updateItem(cat.id, item.id, {
                          name: e.target.value,
                        })
                      }
                      placeholder="輸入購物項目"
                      className="w-full bg-transparent border-b border-[#E5D5C5] text-sm outline-none"
                    />

                    {!isViewer &&
                      (item.image ? (
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
                      ))}
                  </div>

                  {!isViewer && (
                    <button
                      onClick={() => deleteItem(cat.id, item.id)}
                      className="p-1"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
