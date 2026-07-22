// src/components/EditShopModal.jsx
import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Store,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  Camera,
} from "lucide-react";
import { THEMES } from "../App";

// 💡 預設店家類別與對應 Icon 選擇清單
export const SHOP_CATEGORIES = [
  { id: "STORE", label: "通用店家", icon: Store },
  { id: "FOOD", label: "美食/餐廳", icon: UtensilsCrossed },
  { id: "CAFE", label: "咖啡/甜點", icon: Coffee },
  { id: "SHOPPING", label: "購物/選物", icon: ShoppingBag },
  { id: "SPOT", label: "景點/體驗", icon: Camera },
];

export default function EditShopModal({ shops = [], onSave, onClose, themeId }) {
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;

  // 複製一份內部狀態供編輯，若傳入空的則預設給予一個空白店家
  const [shopList, setShopList] = useState(() => {
    if (shops && shops.length > 0) {
      return structuredClone(shops);
    }
    return [
      {
        id: `shop-${Date.now()}`,
        category: "STORE",
        name: "",
        subtitle: "",
        hours: "",
        image: "",
        desc: "",
      },
    ];
  });

  // 控制當前展開編輯哪一家店（預設展開第一家）
  const [expandedIndex, setExpandedIndex] = useState(0);

  // 更新指定店家的欄位值
  const handleUpdateField = (index, field, value) => {
    setShopList((prev) => {
      const next = structuredClone(prev);
      next[index][field] = value;
      return next;
    });
  };

  // 新增一家店
  const handleAddShop = () => {
    const newShop = {
      id: `shop-${Date.now()}`,
      category: "STORE",
      name: "",
      subtitle: "",
      hours: "",
      image: "",
      desc: "",
    };
    setShopList((prev) => [...prev, newShop]);
    setExpandedIndex(shopList.length); // 自動展開新建立的店家
  };

  // 刪除指定店家
  const handleRemoveShop = (index, e) => {
    e.stopPropagation();
    if (shopList.length === 1) {
      // 若只剩一家，清空內容而非直接刪除，保持至少有一個編輯框
      setShopList([
        {
          id: `shop-${Date.now()}`,
          category: "STORE",
          name: "",
          subtitle: "",
          hours: "",
          image: "",
          desc: "",
        },
      ]);
      return;
    }
    setShopList((prev) => prev.filter((_, idx) => idx !== index));
    if (expandedIndex >= index && expandedIndex > 0) {
      setExpandedIndex((prev) => prev - 1);
    }
  };

  // 儲存並關閉
  const handleSave = () => {
    // 過濾掉店名與介紹皆為空的無效資料
    const cleanedShops = shopList.filter(
      (s) => s.name?.trim() || s.desc?.trim() || s.image?.trim()
    );
    onSave(cleanedShops);
  };

  return (
    <div
      className="fixed inset-0 z-[350] flex items-center justify-center p-3 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[95%] max-w-[420px] rounded-[2rem] border shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "white",
          borderColor: currentTheme.border,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header 頁眉 */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b shrink-0"
          style={{
            backgroundColor: `${currentTheme.main}10`,
            borderColor: currentTheme.border,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
              style={{ color: currentTheme.main }}
            >
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black" style={{ color: currentTheme.text }}>
                編輯推薦店家清單
              </h3>
              <p className="text-[10px] font-bold opacity-60" style={{ color: currentTheme.accent }}>
                共 {shopList.length} 間店家
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center transition-transform active:scale-90 shadow-sm"
            style={{ color: currentTheme.accent }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body 表單內容區塊 */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-none">
          {shopList.map((shop, index) => {
            const isExpanded = expandedIndex === index;
            const currentCat = shop.category || "STORE";

            return (
              <div
                key={shop.id || index}
                className="rounded-2xl border transition-all overflow-hidden"
                style={{
                  borderColor: isExpanded ? currentTheme.main : currentTheme.border,
                  backgroundColor: isExpanded ? `${currentTheme.main}05` : "white",
                }}
              >
                {/* 折疊標題列 */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <span
                      className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isExpanded ? currentTheme.main : `${currentTheme.main}20`,
                        color: isExpanded ? "white" : currentTheme.main,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      className="text-xs font-bold truncate flex-1"
                      style={{ color: currentTheme.text }}
                    >
                      {shop.name?.trim() ? shop.name : "新店家 (點擊展開編輯)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleRemoveShop(index, e)}
                      className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:text-red-500 transition-all active:scale-90"
                      title="刪除此店家"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 opacity-50" />
                    ) : (
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    )}
                  </div>
                </div>

                {/* 展開後的詳細表單 */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-dashed" style={{ borderColor: `${currentTheme.main}20` }}>
                    {/* 💡 店家類別選擇器 */}
                    <div>
                      <label className="text-[10px] font-bold opacity-60 mb-1 block" style={{ color: currentTheme.accent }}>
                        店家類別
                      </label>
                      <div className="grid grid-cols-5 gap-1">
                        {SHOP_CATEGORIES.map((cat) => {
                          const IconComp = cat.icon;
                          const isSelected = currentCat === cat.id;

                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleUpdateField(index, "category", cat.id)}
                              className="flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all active:scale-95"
                              style={{
                                backgroundColor: isSelected ? currentTheme.main : "white",
                                borderColor: isSelected ? currentTheme.main : currentTheme.border,
                                color: isSelected ? "white" : currentTheme.text,
                              }}
                            >
                              <IconComp className="w-3.5 h-3.5 mb-0.5" />
                              <span className="text-[9px] font-bold">{cat.label.split("/")[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 店名 */}
                    <div>
                      <label className="text-[10px] font-bold opacity-60 mb-1 block" style={{ color: currentTheme.accent }}>
                        店家名稱 *
                      </label>
                      <input
                        type="text"
                        value={shop.name || ""}
                        onChange={(e) => handleUpdateField(index, "name", e.target.value)}
                        placeholder="例：海雲台咖啡廳"
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 transition-all"
                        style={{
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }}
                      />
                    </div>

                    {/* 分店 / 副標題 */}
                    <div>
                      <label className="text-[10px] font-bold opacity-60 mb-1 block" style={{ color: currentTheme.accent }}>
                        分店名 / 副標題 (韓文搜尋關鍵字)
                      </label>
                      <input
                        type="text"
                        value={shop.subtitle || ""}
                        onChange={(e) => handleUpdateField(index, "subtitle", e.target.value)}
                        placeholder="例：海雲台總店 /必吃布丁"
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 transition-all"
                        style={{
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }}
                      />
                    </div>

                    {/* 營業時間 */}
                    <div>
                      <label className="text-[10px] font-bold opacity-60 mb-1 flex items-center gap-1" style={{ color: currentTheme.accent }}>
                        <Clock className="w-3 h-3" /> 營業時間
                      </label>
                      <input
                        type="text"
                        value={shop.hours || ""}
                        onChange={(e) => handleUpdateField(index, "hours", e.target.value)}
                        placeholder="例：11:00 - 20:00 (週三公休)"
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 transition-all"
                        style={{
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }}
                      />
                    </div>

                    {/* 圖片網址與預覽 */}
                    <div>
                      <label className="text-[10px] font-bold opacity-60 mb-1 flex items-center gap-1" style={{ color: currentTheme.accent }}>
                        <ImageIcon className="w-3 h-3" /> 圖片網址 (URL)
                      </label>
                      <input
                        type="text"
                        value={shop.image || ""}
                        onChange={(e) => handleUpdateField(index, "image", e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 transition-all mb-2"
                        style={{
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }}
                      />

                      {/* 圖片即時預覽 */}
                      {shop.image?.trim() && (
                        <div className="relative w-full h-28 rounded-xl overflow-hidden border shadow-inner bg-slate-50">
                          <img
                            src={shop.image}
                            alt="店家預覽"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/600x400?text=Image+Not+Found";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* 詳細介紹 */}
                    <div>
                      <label className="text-[10px] font-bold opacity-60 mb-1 flex items-center gap-1" style={{ color: currentTheme.accent }}>
                        <Sparkles className="w-3 h-3" /> 詳細介紹 / 推薦點餐
                      </label>
                      <textarea
                        rows={3}
                        value={shop.desc || ""}
                        onChange={(e) => handleUpdateField(index, "desc", e.target.value)}
                        placeholder="支援換行語法，例如：\n= 招牌草莓蛋糕\n> 人氣法式吐司"
                        className="w-full bg-white border rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 transition-all leading-relaxed"
                        style={{
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 新增店家按鈕 */}
          <button
            type="button"
            onClick={handleAddShop}
            className="w-full py-3 border-2 border-dashed rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] bg-white hover:opacity-80"
            style={{
              borderColor: `${currentTheme.main}40`,
              color: currentTheme.main,
            }}
          >
            <Plus className="w-4 h-4" /> 新增推薦店家
          </button>
        </div>

        {/* Footer 底部動作欄 */}
        <div
          className="p-4 border-t flex gap-2 shrink-0 bg-white"
          style={{ borderColor: currentTheme.border }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-xs font-bold border transition-all active:scale-95"
            style={{
              borderColor: currentTheme.border,
              color: currentTheme.accent,
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
            style={{ backgroundColor: currentTheme.main }}
          >
            <Check className="w-4 h-4" /> 儲存變更
          </button>
        </div>
      </div>
    </div>
  );
}