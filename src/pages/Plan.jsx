// src/pages/Plan.jsx
import React, { useEffect, useState } from "react";
import TransitCard from "../components/TransitCard";
import EditItemModal from "../components/EditItemModal";
import EditHeroModal from "../components/EditHeroModal";
import TicketDetail from "../components/TicketDetail";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Pencil,
  Trash2,
  SunMedium,
  Cloud,
  CloudRain,
  CloudSnow,
  MapPin,
  Clock,
  Phone,
  StickyNote,
  UtensilsCrossed,
  Landmark,
  Train,
  BedDouble,
  Ticket,
  MapPinned,
} from "lucide-react";

export default function Plan({ trip, setTrip, dayIndex }) {
  if (!trip) return null;

  const isViewer = trip.shareMode === "viewer";

  const numberToChinese = (num) => {
    const map = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
    if (num <= 10) return map[num];
    if (num < 20) return "十" + map[num - 10];
    return num;
  };

  /* ===============================
   * ✅ Day Index (唯一來源)
   * =============================== */
  const activeDayIndex =
    typeof dayIndex === "number"
      ? dayIndex
      : trip.activeDayIndex ?? 0;

  const days = trip.days || [];
  const currentDay = days[activeDayIndex];
  const currentItems = currentDay?.items || [];

  /* ===============================
   * UI State
   * =============================== */
  const [showHeroEdit, setShowHeroEdit] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [slideOpenId, setSlideOpenId] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);
  const [weatherHourly, setWeatherHourly] = useState([]);

  /* ===============================
   * ✅ 修復：定義 saveHero 函式
   * =============================== */
  const saveHero = (updatedHeroData) => {
    if (isViewer) return;
    setTrip((prev) => {
      const next = structuredClone(prev);
      if (next.days[activeDayIndex]) {
        next.days[activeDayIndex] = {
          ...next.days[activeDayIndex],
          ...updatedHeroData,
        };
      }
      return next;
    });
    setEditingHero(null);
  };

  /* ===============================
   * 天氣邏輯
   * =============================== */
  const weatherIcon = (code) => {
    if (code === 0) return <SunMedium className="w-4 h-4" />;
    if ([1, 2, 3].includes(code)) return <Cloud className="w-4 h-4" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
      return <CloudRain className="w-4 h-4" />;
    if ([71, 73, 75, 85, 86].includes(code))
      return <CloudSnow className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  useEffect(() => {
    if (!currentDay?.latitude || !currentDay?.longitude) return;

    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentDay.latitude}&longitude=${currentDay.longitude}&hourly=temperature_2m,weathercode&forecast_days=1&timezone=Asia%2FTokyo`;
        const res = await fetch(url);
        const data = await res.json();

        const list = data.hourly.time.map((t, index) => {
          const hour = new Date(t).getHours();
          return {
            timeLabel: `${String(hour).padStart(2, "0")}:00`,
            temp: Math.round(data.hourly.temperature_2m[index]),
            code: data.hourly.weathercode[index],
          };
        });

        setWeatherHourly(list);
      } catch (e) {
        console.error("天氣獲取失敗:", e);
      }
    }

    fetchWeather();
  }, [currentDay?.latitude, currentDay?.longitude]);

  /* ===============================
   * 行程 CRUD
   * =============================== */
  const addItem = () => {
    if (isViewer) return;
    setTrip((prev) => {
      const next = structuredClone(prev);
      next.days[activeDayIndex].items.push({
        id: `item-${Date.now()}`,
        time: "09:00",
        type: "ATTRACTION",
        title: "新的行程",
        ticketIds: [],
        subtitle: "",
        address: "",
        openingHours: "",
        phone: "",
        notes: "",
      });
      return next;
    });
  };

  const handleNavigation = (e, address, title) => {
    e.stopPropagation();
    if (!address && !title) return;
    const query = encodeURIComponent(address || title);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  const deleteItem = (id) => {
    if (isViewer) return;
    setTrip((prev) => {
      const next = structuredClone(prev);
      next.days[activeDayIndex].items = next.days[activeDayIndex].items.filter(
        (i) => i.id !== id
      );
      return next;
    });
  };

  const onDragEnd = (result) => {
    if (isViewer || !result.destination) return;
    setTrip((prev) => {
      const next = structuredClone(prev);
      const items = next.days[activeDayIndex].items;
      const [moved] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, moved);
      return next;
    });
  };

  const TYPE_META = {
    ATTRACTION: { label: "景點", pillBg: "#E7EEF9", pillText: "#4A607F", icon: Landmark },
    RESTAURANT: { label: "餐廳", pillBg: "#FBE7DF", pillText: "#8C4A2F", icon: UtensilsCrossed },
    TRANSPORT: { label: "交通", pillBg: "#E4F1E3", pillText: "#4E6B48", icon: Train },
    HOTEL: { label: "住宿", pillBg: "#F3E3F0", pillText: "#7A4D6E", icon: BedDouble },
  };

  if (!currentDay) {
    return <div className="pt-24 text-center text-sm text-[#8C6A4F]">行程資料載入中…</div>;
  }

  return (
    <div className="pt-4 pb-24">
      {/* 封面區域 */}
      <div className="mb-6 relative flex gap-4 items-stretch" style={{ height: 240 }}>
        <div className="w-12 flex flex-col items-center h-full">
          <span className="w-2 h-2 rounded-full bg-[#C6A087] mb-2 shrink-0" />
          <span className="w-px flex-1 bg-[#D8CFC4]" />
          <div
            className="mt-3 text-[#5A4636] font-semibold tracking-[0.4em]"
            style={{ writingMode: "vertical-rl", fontSize: "22px", lineHeight: "1.8" }}
          >
            第{numberToChinese(activeDayIndex + 1)}天
          </div>
        </div>
        <div
          className="flex-1 rounded-[18px] overflow-hidden relative shadow cursor-pointer"
          onClick={() => !isViewer && setShowHeroEdit(!showHeroEdit)}
          style={{
            backgroundImage: `url(${currentDay.heroImage || "/placeholder.jpg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {showHeroEdit && !isViewer && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditingHero(currentDay); }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-xl border border-white/50 shadow-lg"
            >
              <Pencil className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white drop-shadow-lg">
            {currentDay.heroLocation && (
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="w-4 h-4 text-[#CDA581]" />
                <span className="text-xs font-medium text-white">{currentDay.heroLocation}</span>
              </div>
            )}
            <div className="text-xl font-bold leading-tight">{currentDay.heroTitle || "未設定標題"}</div>
          </div>
        </div>
      </div>

      {/* 天氣區域 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <div>
            <p className="text-sm font-semibold text-[#5A4636]">{currentDay.weatherLocation || "未設定地點"}</p>
            <p className="text-[11px] text-[#8C6A4F]/80">未來 24 小時預報</p>
          </div>
          <span className="text-[11px] text-[#C6A087] border border-[#E5D5C5] rounded-full px-3 py-0.5 bg-white">Open-Meteo</span>
        </div>
        <div className="bg-[#F7F1EB] rounded-2xl px-3 py-3">
          <div className="flex gap-4 overflow-x-auto scrollbar-none">
            {weatherHourly.length > 0 ? weatherHourly.slice(0, 24).map((h) => (
              <div key={h.timeLabel} className="flex flex-col items-center min-w-[40px]">
                <span className="text-[11px] text-[#8C6A4F]">{h.timeLabel}</span>
                <div className="mt-1 text-[#C6A087]">{weatherIcon(h.code)}</div>
                <span className="mt-1 text-sm text-[#5A4636]">{h.temp}°</span>
              </div>
            )) : <p className="text-xs text-[#8C6A4F] w-full text-center">暫無天氣預報</p>}
          </div>
        </div>
      </section>

      {/* 行程列表 */}
      <DragDropContext onDragEnd={isViewer ? () => {} : onDragEnd}>
        <Droppable droppableId="day-items">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="relative border-l border-[#E5D5C5] mt-2 space-y-4 pb-10 ml-6"
            >
              {currentItems.map((item, index) => {
                const meta = TYPE_META[item.type] || TYPE_META.ATTRACTION;
                const TypeIcon = meta.icon;
                const isOpen = slideOpenId === item.id;

                return (
                  <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isViewer}>
                    {(drag) => (
                      <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} className="relative pl-6">
                        <div className="absolute -left-[7px] top-5 w-3 h-3 bg-[#F7F1EB] border-2 border-[#C6A087] rounded-full" />
                        <div className="relative">
                          {/* Slide Actions */}
                          <div className={`absolute top-1/2 -translate-y-1/2 right-3 flex gap-2 transition-all ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                            {!isViewer && (
                              <button onClick={() => setEditingItem(item)} className="w-9 h-9 rounded-full bg-[#F7C85C] flex items-center justify-center">
                                <Pencil className="w-4 h-4 text-[#5A4636]" />
                              </button>
                            )}
                            {!isViewer && (
                              <button onClick={() => deleteItem(item.id)} className="w-9 h-9 rounded-full bg-[#E35B5B] flex items-center justify-center">
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            )}
                          </div>

                          {/* Card */}
                          <div
                            onClick={() => !isViewer && setSlideOpenId(isOpen ? null : item.id)}
                            style={{ transform: isOpen ? "translateX(-100px)" : "translateX(0)", transition: "transform 0.3s ease" }}
                            className="bg-white border border-[#E5D5C5] rounded-[10px] px-5 py-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: meta.pillBg, color: meta.pillText }}>
                                <TypeIcon className="w-3.5 h-3.5" />
                                {meta.label}
                              </span>
                              <span className="text-xs text-[#8C6A4F]">{item.time}</span>
                            </div>
                            <h3 className="text-lg font-bold text-[#5A4636]">{item.title}</h3>
                            {item.subtitle && <p className="text-sm text-[#A8937C] mt-0.5">{item.subtitle}</p>}

                            {/* 地址與導航 */}
                            {item.address && (
                              <div className="flex items-center justify-between gap-3 mt-3">
                                <div onClick={(e) => handleNavigation(e, item.address, item.title)} className="flex items-start gap-2 text-sm text-[#5A4636] flex-1 truncate cursor-pointer hover:opacity-70">
                                  <MapPin className="w-4 h-4 text-[#C6A087] shrink-0" />
                                  <span className="truncate">{item.address}</span>
                                </div>
                                <button
                                  onClick={(e) => handleNavigation(e, item.address, item.title)}
                                  className="p-2 rounded-full bg-[#e3d5c3] text-[#cf5151] hover:bg-[#c7b9a7] active:scale-90 transition-all flex items-center justify-center group"
                                >
                                  <MapPinned className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={3} />
                                </button>
                              </div>
                            )}

                            {/* 票券 */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(item.ticketIds || []).map((id) => {
                                const ticket = typeof id === "object" ? id : trip.tickets?.find((t) => t.id === id);
                                if (!ticket) return null;
                                return (
                                  <button key={ticket.id} onClick={(e) => { e.stopPropagation(); setViewTicket(ticket); }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-[#E5D5C5] bg-[#F7F1EB] text-[#8C6A4F]">
                                    <Ticket className="w-4 h-4" />
                                    <span>{ticket.title}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Transit Card */}
                        {index < currentItems.length - 1 && (
                          <TransitCard
                            id={`transit-${item.id}`}
                            defaultData={item.transit}
                            isViewer={isViewer}
                            onUpdate={(transitId, data) => {
                              if (isViewer) return;
                              setTrip(prev => {
                                const next = structuredClone(prev);
                                const targetItem = next.days[activeDayIndex].items[index];
                                if (targetItem) targetItem.transit = { id: transitId, ...data };
                                return next;
                              });
                            }}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {!isViewer && (
        <div className="flex justify-center mt-6">
          <button onClick={addItem} className="px-4 py-2 rounded-full border border-dashed border-[#C6A087] bg-white text-sm text-[#8C6A4F] hover:bg-[#F7F1EB]">
            ＋ 新增行程項目
          </button>
        </div>
      )}

      {/* Modals */}
      {editingItem && !isViewer && (
        <EditItemModal
          item={editingItem}
          trip={trip}
          tickets={trip.tickets || []}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => {
            setTrip((prev) => {
              const next = structuredClone(prev);
              const items = next.days[activeDayIndex].items;
              const idx = items.findIndex((i) => i.id === updated.id);
              if (idx !== -1) items[idx] = updated;
              return next;
            });
            setEditingItem(null);
          }}
        />
      )}

      {editingHero && !isViewer && (
        <EditHeroModal dayData={editingHero} onClose={() => setEditingHero(null)} onSave={saveHero} />
      )}

      {viewTicket && <TicketDetail ticket={viewTicket} onClose={() => setViewTicket(null)} />}
    </div>
  );
}