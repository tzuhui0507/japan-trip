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
                  price: 0,
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

    // 只處理圖片
    if (!file.type.startsWith("image/")) {
      alert("請選擇圖片檔案");
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      // ===== 縮圖設定 =====
      const MAX_SIZE = 600; // 最長邊 600px（UI 超夠用）
      let { width, height } = img;

      if (width > height && width > MAX_SIZE) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }

      // ===== Canvas 縮圖 =====
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // ===== 壓縮成 JPEG（體積小很多）=====
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

      // 寫回 item
      updateItem(catId, itemId, {
        image: compressedBase64,
      });
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
                    {/* 💰 金額（¥） */}
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-[#8C6A4F]">¥</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={item.price ?? 0}
                        onChange={(e) =>
                          updateItem(cat.id, item.id, {
                            price: Number(e.target.value) || 0,
                          })
                        }
                        className="
                          w-16
                          text-right
                          text-sm
                          bg-transparent
                          border-b border-[#E5D5C5]
                          focus:outline-none
                          focus:border-[#C6A087]
                          text-[#5A4636]
                        "
                        placeholder="0"
                      />
                    </div>

                    {/* image icon (佔位用，避免高度不一) */}
                    <button
                      type="button"
                      onClick={() => item.image && setPreviewImage(item.image)}
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
