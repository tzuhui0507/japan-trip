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
        const next =
          typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem(VIEWER_SHOPPING_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setTrip((p) => ({
        ...p,
        shopping:
          typeof updater === "function"
            ? updater(p.shopping)
            : updater,
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

  /* ================== render ================== */
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
            className="rounded-3xl border border-[#E5D5C5] bg-white overflow-visible"
          >
            {/* header */}
            <div
              className={`px-4 py-3 flex items-center justify-between rounded-t-3xl ${
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

            {/* body */}
            <div
              className="p-4 space-y-2 bg-[#FFF9F2] rounded-b-3xl"
              style={dottedBg}
            >
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="
                    relative w-full
                    flex items-center
                    h-[52px]
                    px-4
                    bg-white
                    border border-[#F0E3D5]
                    rounded-2xl
                  "
                >
                  {/* checkbox */}
                  <input
                    type="checkbox"
                    className="shrink-0 w-4 h-4 accent-[#8C6A4F]"
                    checked={item.checked}
                    onChange={(e) =>
                      updateItem(cat.id, item.id, {
                        checked: e.target.checked,
                      })
                    }
                  />

                  {/* name */}
                  <button
                    onClick={() =>
                      item.image && setPreviewImage(item.image)
                    }
                    className={`ml-3 flex-1 pr-2 text-left text-sm truncate ${
                      item.checked
                        ? "line-through text-[#A8937C]"
                        : "text-[#5A4636]"
                    }`}
                  >
                    {item.name}
                  </button>

                  {/* right tools */}
                  <div className="ml-auto flex items-center gap-2 shrink-0">
                    {/* image icon (佔位用，避免高度不一) */}
                    <button
                      type="button"
                      onClick={() =>
                        item.image && setPreviewImage(item.image)
                      }
                      className={`p-1.5 rounded-full hover:bg-[#F7F1EB] transition ${
                        item.image
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <ImageIcon className="w-5 h-5 text-[#A8937C]" />
                    </button>

                    {/* more */}
                    <button
                      type="button"
                      onClick={() =>
                        setMenuOpenId(
                          menuOpenId === item.id ? null : item.id
                        )
                      }
                      className="p-1.5 rounded-full hover:bg-[#F7F1EB]"
                    >
                      <MoreHorizontal className="w-5 h-5 text-[#8C6A4F]" />
                    </button>
                  </div>

                  {/* menu */}
                  {menuOpenId === item.id && (
                    <div className="absolute right-2 top-[56px] z-50 w-40 bg-white border border-[#E5D5C5] rounded-lg shadow-lg">
                      <button
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F1EB] w-full"
                        onClick={() => {
                          const name = prompt("編輯名稱", item.name);
                          if (name !== null) {
                            updateItem(cat.id, item.id, { name });
                          }
                          setMenuOpenId(null);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                        編輯名稱
                      </button>

                      <label className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F7F1EB] cursor-pointer">
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

                      <button
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-[#F7F1EB] w-full"
                        onClick={() => {
                          deleteItem(cat.id, item.id);
                          setMenuOpenId(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        刪除
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* image preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="relative bg-white rounded-2xl p-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2"
            >
              <X />
            </button>
            <img
              src={previewImage}
              alt=""
              className="max-w-[80vw] max-h-[70vh] rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
