// src/pages/ListTab.jsx
import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import {
  Check,
  Plus,
  Trash2,
  StickyNote,
  Luggage as LuggageIcon,
  Backpack,
  Pencil,
} from "lucide-react";
import LuggageEditModal from "../components/LuggageEditModal";

// Header 用 icon
import { Luggage as LuggageHeaderIcon } from "lucide-react";

// ----------------------------------------------------
// 建立預設行李資料
// ----------------------------------------------------
function createDefaultLuggage() {
  return {
    categories: [
      {
        id: "carry",
        title: "隨身用品",
        color: "#B38352",
        items: [
          { id: "passport", label: "護照", checked: false },
          { id: "wallet", label: "錢包", checked: false },
          { id: "coat", label: "外套", checked: false },
          { id: "credit-card", label: "信用卡", checked: false },
          { id: "power-bank", label: "行動電源", checked: false },
          { id: "sim", label: "SIM卡／eSIM", checked: false },
          { id: "earphone", label: "耳機", checked: false },
          { id: "tissue", label: "衛生紙", checked: false },
          { id: "wet-tissue", label: "濕紙巾", checked: false },
        ],
      },
      {
        id: "clothes",
        title: "個人衣物",
        color: "#8C7A6B",
        items: [
          { id: "wear", label: "衣服", checked: false },
          { id: "underwear", label: "內衣褲", checked: false },
          { id: "socks", label: "襪子", checked: false },
          { id: "shoes", label: "鞋子", checked: false },
          { id: "jacket", label: "外套", checked: false },
          { id: "hat", label: "帽子", checked: false },
          { id: "glove", label: "手套", checked: false },
          { id: "scarf", label: "圍巾", checked: false },
        ],
      },
      {
        id: "toiletries",
        title: "盥洗用品",
        color: "#5B4537",
        items: [
          { id: "remover", label: "卸妝用品", checked: false },
          { id: "facewash", label: "洗面乳", checked: false },
          { id: "tooth", label: "牙膏、牙刷", checked: false },
          { id: "lotion", label: "保養品", checked: false },
          { id: "makeup", label: "化妝品、防曬", checked: false },
          { id: "towel", label: "浴巾、毛巾", checked: false },
          { id: "lens", label: "隱形眼鏡", checked: false },
          { id: "glasses", label: "眼鏡", checked: false },
          { id: "hair", label: "平板夾、護髮", checked: false },
        ],
      },
      {
        id: "medicine",
        title: "個人藥品",
        color: "#BF6E2A",
        items: [
          { id: "motion", label: "暈車藥", checked: false },
          { id: "allergy", label: "過敏藥", checked: false },
          { id: "alcohol", label: "酒精消毒", checked: false },
          { id: "cold", label: "感冒藥", checked: false },
          { id: "mosquito", label: "蚊蟲止癢藥", checked: false },
          { id: "eyedrop", label: "眼藥水", checked: false },
        ],
      },
      {
        id: "misc",
        title: "雜物專區",
        color: "#8F9771",
        items: [
          { id: "cable", label: "充電線", checked: false },
          { id: "charger", label: "充電器", checked: false },
          { id: "extension", label: "延長線", checked: false },
          { id: "earplug", label: "耳塞", checked: false },
          { id: "mask", label: "口罩", checked: false },
          { id: "umbrella", label: "雨傘", checked: false },
        ],
      },
    ],

    otherCustom: [],

    bags: [
      {
        id: "bag-checked",
        type: "托運",
        icon: "Luggage",
        title: "23kg * 1",
        subtitle: "請再次確認航空公司具體規範。",
        notes: "",
      },
      {
        id: "bag-carry",
        type: "隨身",
        icon: "Backpack",
        title: "隨身包 * 1",
        subtitle: "尺寸限制：22 × 25 × 43 cm",
        notes: "行動電源一定要放在隨身包包！",
      },
    ],
  };
}

export default function ListTab({ trip, setTrip }) {
  const isViewer = trip?.shareMode === "viewer";
  const VIEWER_LUGGAGE_KEY = "viewer_luggage_v1";
  const [viewerLuggage, setViewerLuggage] = useState(null);
  // luggage 資料來源分流
  const luggage = isViewer
    ? (viewerLuggage || createDefaultLuggage())
    : (trip.luggage || createDefaultLuggage());

  // viewer 初始化（只跑一次）
  useEffect(() => {
    if (!isViewer) return;

    const raw = localStorage.getItem(VIEWER_LUGGAGE_KEY);
    if (raw) {
      setViewerLuggage(JSON.parse(raw));
    } else {
      const init = trip.luggage || createDefaultLuggage();
      localStorage.setItem(VIEWER_LUGGAGE_KEY, JSON.stringify(init));
      setViewerLuggage(init);
    }
  }, [isViewer]);

  // owner 初始化（原本行為）
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
        const base = prev || createDefaultLuggage();
        const next =
          typeof updater === "function" ? updater(base) : updater;

        localStorage.setItem(VIEWER_LUGGAGE_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }

    // owner
    setTrip((prev) => ({
      ...prev,
      luggage:
        typeof updater === "function"
          ? updater(prev.luggage || createDefaultLuggage())
          : updater,
    }));
  };

  const toggleItem = (categoryId, itemId, isOther = false) => {
    updateLuggage((prev) => {
      if (isOther) {
        return {
          ...prev,
          otherCustom: prev.otherCustom.map((it) =>
            it.id === itemId ? { ...it, checked: !it.checked } : it
          ),
        };
      }

      return {
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((it) =>
                  it.id === itemId ? { ...it, checked: !it.checked } : it
                ),
              }
            : cat
        ),
      };
    });
  };

  const [otherInput, setOtherInput] = useState("");

  const addOtherItem = () => {
    const label = otherInput.trim();
    if (!label) return;

    updateLuggage((prev) => ({
      ...prev,
      otherCustom: [
        ...prev.otherCustom,
        { id: `other-${Date.now()}`, label, checked: false },
      ],
    }));
    setOtherInput("");
  };

  const deleteOtherItem = (id) => {
    updateLuggage((prev) => ({
      ...prev,
      otherCustom: prev.otherCustom.filter((it) => it.id !== id),
    }));
  };

  const [bagSlideId, setBagSlideId] = useState(null);
  const [editingBag, setEditingBag] = useState(null);

  const openEditBag = (bag) => setEditingBag(bag);

  const saveBag = (updatedBag) => {
    updateLuggage((prev) => ({
      ...prev,
      bags: prev.bags.map((b) => (b.id === updatedBag.id ? updatedBag : b)),
    }));
    setEditingBag(null);
  };

  const deleteBag = (id) => {
    updateLuggage((prev) => ({
      ...prev,
      bags: prev.bags.filter((b) => b.id !== id),
    }));
    setBagSlideId(null);
  };

  const getBagIcon = (bag) => {
    if (bag.icon === "Backpack") return Backpack;
    return LuggageIcon;
  };

  const { categories, otherCustom, bags } = luggage;

  const renderCategoryCard = (cat) => (
    <div
      key={cat.id}
      className="bg-[#FFFDFA] rounded-[28px] shadow-sm overflow-hidden border border-[#E5D5C5] flex flex-col"
    >
      {/* Header */}
      <div
        className="h-16 px-6 relative flex items-center justify-center"
        style={{ backgroundColor: cat.color }}
      >
        <span className="absolute left-6 w-2 h-2 rounded-full bg-white/75" />
        <span className="absolute right-6 w-2 h-2 rounded-full bg-white/75" />

        <span className="text-xl font-bold tracking-[0.15em] text-white text-center">
          {cat.title}
        </span>
      </div>

      {/* Body */}
      <div
        className="flex-1 px-6 py-4"
        style={{
          backgroundImage:
            "radial-gradient(circle, #E9DED3 1px, transparent 0)",
          backgroundSize: "14px 14px",
          backgroundRepeat: "repeat",
          backgroundPosition: "0 0",
        }}
      >
        <div className="space-y-2">
          {cat.items.map((item) => {
            const checked = item.checked;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(cat.id, item.id)}
                className="w-full flex items-center gap-3 text-left"
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    checked
                      ? "bg-[#91867A] border-[#D5C7B8]"
                      : "bg-white border-[#D5C7B8]"
                  }`}
                >
                  {checked && (
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  )}
                </span>

                <span
                  className={
                    checked
                      ? "text-[15px] text-[#B3A496] line-through"
                      : "text-[15px] text-[#4F3B2B]"
                  }
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderOtherCard = () => (
    <div className="bg-[#FFFDFA] rounded-[28px] shadow-sm overflow-hidden border border-[#E5D5C5] flex flex-col">
      <div
        className="h-16 px-6 relative flex items-center justify-center"
        style={{ backgroundColor: "#A46875" }}
      >
        <span className="absolute left-6 w-2 h-2 rounded-full bg-white/75" />
        <span className="absolute right-6 w-2 h-2 rounded-full bg-white/75" />

        <span className="text-xl font-bold tracking-[0.15em] text-white">
          其他
        </span>
      </div>

      <div
        className="flex-1 px-6 pt-4 pb-4 flex flex-col gap-3"
        style={{
          backgroundImage:
            "radial-gradient(circle, #E9DED3 1px, transparent 0)",
          backgroundSize: "14px 14px",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="space-y-2 min-h-[96px]">
          {otherCustom.length === 0 ? (
            <p className="text-sm text-[#C0AFA0] italic text-center mt-4">
              ＊暫無項目，請新增
            </p>
          ) : (
            otherCustom.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(null, item.id, true)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      item.checked
                        ? "bg-[#91867A] border-[#D5C7B8]"
                        : "bg-white border-[#D5C7B8]"
                    }`}
                  >
                    {item.checked && (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    )}
                  </span>
                  <span
                    className={
                      item.checked
                        ? "text-[15px] text-[#B3A496] line-through"
                        : "text-[15px] text-[#4F3B2B]"
                    }
                  >
                    {item.label}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteOtherItem(item.id)}
                  className="w-7 h-7 rounded-full bg-white/80 border border-[#E0D1C3] flex items-center justify-center"
                >
                  <Trash2 className="w-3 h-3 text-[#C06C5A]" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-2 border-t border-[#F0E4D8]">
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={otherInput}
            onChange={(e) => setOtherInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOtherItem()}
            placeholder="輸入項目..."
            className="
              flex-1 min-w-0
              rounded-xl
              border border-[#E5D5C5]
              bg-[#FFFDFA]
              px-3 py-2
              text-sm
            "
          />

          <button
            onClick={addOtherItem}
            className="
              w-9 h-9
              shrink-0
              rounded-xl
              bg-[#9c7f6d]
              flex items-center justify-center
              text-white
              shadow-sm
            "
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );

  const renderBagCard = (bag) => {
    const isOpen = bagSlideId === bag.id;
    const Icon = getBagIcon(bag);

    return (
      <div key={bag.id} className="relative">
        <div
          className={`absolute top-1/2 right-4 -translate-y-1/2 flex gap-2 transition-all ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={() => openEditBag(bag)}
            className="w-9 h-9 rounded-full bg-[#F7C85C] flex items-center justify-center shadow-sm"
          >
            <Pencil className="w-4 h-4 text-[#5A4636]" />
          </button>
          <button
            onClick={() => deleteBag(bag.id)}
            className="w-9 h-9 rounded-full bg-[#E35B5B] flex items-center justify-center shadow-sm"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>

        <div
          onClick={() => setBagSlideId(isOpen ? null : bag.id)}
          style={{
            transform: isOpen ? "translateX(-100px)" : "translateX(0)",
          }}
          className="relative bg-[#FFFCF7] rounded-3xl border border-dashed border-[#E1D3C5] px-5 py-4 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#B7A591]/10 border border-[#B7A591]/40 text-xs text-[#8C6A4F]">
              {bag.type}
            </span>
            <span className="text-base font-semibold text-[#4F3B2B]">
              {bag.title}
            </span>
          </div>

          {bag.subtitle && (
            <p className="text-sm text-[#8C6A4F] mb-2">{bag.subtitle}</p>
          )}

          {bag.notes && (
            <div className="mt-2 rounded-2xl bg-[#FAF0E6] px-4 py-3 flex gap-2 border border-[#F4C289]/100 text-sm text-[#A56A3A]">
              <StickyNote className="w-4 h-4 text-[#A56A3A]" />
              <p>{bag.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-4 pb-24 px-4">

      {/* ===== Header（新版） ===== */}
      <PageHeader
        icon={LuggageHeaderIcon}
        title="行李清單"
        subtitle="LUGGAGE CHECKLIST"
      />

      {/* ===== 永遠兩欄的分類區塊 ===== */}
      <section className="grid grid-cols-2 gap-5 mb-6">
        {categories.map((cat) => renderCategoryCard(cat))}
        {renderOtherCard()}
      </section>

      {/* 下方托運／隨身卡片 */}
      <section className="mt-4 bg-[#FFF9F2] border border-[#E5D5C5] rounded-[32px] px-5 py-6">
        <div className="space-y-4">
          {bags.map((bag) => renderBagCard(bag))}
        </div>
      </section>

      {/* Modal */}
      {editingBag && (
        <LuggageEditModal
          bag={editingBag}
          onClose={() => setEditingBag(null)}
          onSave={saveBag}
        />
      )}
    </div>
  );
}
