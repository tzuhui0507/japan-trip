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
} from "lucide-react";

export default function Plan({ trip, setTrip }) {
  if (!trip) return null;

  // ✅ ShareMode 判斷
  const isViewer = trip?.shareMode === "viewer";

  const tickets = trip?.tickets || [];

  // ============================================================
  // 依 startDate / endDate 生成 Days
  // ============================================================
  const generateDays = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    if (isNaN(start) || isNaN(end) || end < start) return trip.days || [];

    const ONE_DAY = 86400000;
    const total = Math.round((end - start) / ONE_DAY) + 1;
    const weekdayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const list = [];
    for (let i = 0; i < total; i++) {
      const d = new Date(start.getTime() + i * ONE_DAY);
      const original = trip.days?.[i] || {};

      list.push({
        id: `day-${i + 1}`,
        label: `第 ${i + 1} 天`,
        weekday: weekdayMap[d.getDay()],
        dayNumber: d.getDate(),

        heroTitle: original.heroTitle || "",
        heroLocation: original.heroLocation || "",
        heroImage: original.heroImage || "",

        weatherLocation: original.weatherLocation || "東京",
        latitude: original.latitude || 35.6895,
        longitude: original.longitude || 139.6917,
        items: original.items || [],
      });
    }
    return list;
  };

  const [days, setDays] = useState(generateDays());
  const [activeDayIndex, setActiveDayIndex] = useState(trip.activeDayIndex || 0);

  useEffect(() => {
    if (trip.days && trip.days.length > 0) return;

    const newDays = generateDays();
    setDays(newDays);
    setActiveDayIndex(0);

    setTrip((prev) => ({
      ...prev,
      days: newDays,
      activeDayIndex: 0,
    }));
  }, [trip.startDate, trip.endDate]);

  const currentDay = days[activeDayIndex];

  const switchDay = (i) => {
    setActiveDayIndex(i);
    if (isViewer) return;
    setTrip((p) => ({ ...p, activeDayIndex: i }));
  };

  // ============================================================
  // 天氣
  // ============================================================
  const [weatherHourly, setWeatherHourly] = useState([]);

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
    if (!currentDay) return;
    const { latitude, longitude } = currentDay;

    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&forecast_days=1&timezone=Asia%2FTokyo`;
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
        console.error(e);
      }
    }

    fetchWeather();
  }, [currentDay?.id]);

  // ============================================================
  // 行程 CRUD
  // ============================================================
  const addItem = () => {
    if (isViewer) return;
    const newItem = {
      id: `item-${Date.now()}`,
      time: "09:00",
      type: "ATTRACTION",
      title: "新的行程",
      ticket:"",
      subtitle: "",
      address: "",
      openingHours: "",
      phone: "",
      notes: "",
    };

    const newDays = [...days];
    newDays[activeDayIndex].items.push(newItem);
    setDays(newDays);
    setTrip((p) => ({ ...p, days: newDays }));
  };

  const deleteItem = (id) => {
    if (isViewer) return;
    const newDays = [...days];
    newDays[activeDayIndex].items = newDays[activeDayIndex].items.filter(
      (i) => i.id !== id
    );
    setDays(newDays);
    setTrip((p) => ({ ...p, days: newDays }));
  };

  // ============================================================
  // 拖曳排序
  // ============================================================
  const onDragEnd = (result) => {
    if (isViewer) return;
    if (!result.destination) return;

    const newDays = [...days];
    const items = [...newDays[activeDayIndex].items];

    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    newDays[activeDayIndex].items = items;
    setDays(newDays);
    setTrip((p) => ({ ...p, days: newDays }));
  };

  // ============================================================
  // 類別 UI meta
  // ============================================================
  
  const TYPE_META = {
    ATTRACTION: {
      label: "景點",
      pillBg: "#E7EEF9",
      pillText: "#4A607F",
      icon: Landmark,
    },
    RESTAURANT: {
      label: "餐廳",
      pillBg: "#FBE7DF",
      pillText: "#8C4A2F",
      icon: UtensilsCrossed,
    },
    TRANSPORT: {
      label: "交通",
      pillBg: "#E4F1E3",
      pillText: "#4E6B48",
      icon: Train,
    },
    HOTEL: {
      label: "住宿",
      pillBg: "#F3E3F0",
      pillText: "#7A4D6E",
      icon: BedDouble,
    },
  };

  const [slideOpenId, setSlideOpenId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);

  // ------------------------------
  // HERO 編輯
  // ------------------------------
  const [editingHero, setEditingHero] = useState(null);

  const saveHero = (updatedDay) => {
    if (isViewer) return;
    const newDays = [...days];
    newDays[activeDayIndex] = updatedDay;
    setDays(newDays);
    setTrip((p) => ({ ...p, days: newDays }));
    setEditingHero(null);
  };

  // 控制 HERO 是否顯示編輯鍵
  const [showHeroEdit, setShowHeroEdit] = useState(false);

  const currentItems = currentDay?.items || [];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="pt-4 pb-24">

      {/* ---------------- HERO 大圖區塊 ---------------- */}
      <div className="mb-6 relative">
        <div
          className="w-full rounded-3xl overflow-hidden relative shadow"
          onClick={() => {
            if (isViewer) return;
            setShowHeroEdit(!showHeroEdit);
          }}
          style={{
            height: "280px",
            backgroundImage: `url(${currentDay.heroImage || "/placeholder.jpg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* 右上角 Pencil（點大圖才出現） */}
          {showHeroEdit && !isViewer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingHero(currentDay);
              }}
              className="
                absolute top-4 right-4
                w-10 h-10 rounded-full
                flex items-center justify-center
                bg-white/25
                backdrop-blur-xl
                border border-white/50
                shadow-lg
              "
            >
              <Pencil className="w-5 h-5 text-white" />
            </button>
          )}

          {/* 下方漸層 */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />

          {/* 文字區塊 */}
          <div className="absolute bottom-6 left-6 text-white drop-shadow-lg">

            {/* DAY + 地點 */}
            <div className="flex items-center gap-3 mb-3">

              {/* DAY 玻璃效果 */}
              <div
                className="
                  px-4 py-1.5 rounded-full
                  bg-white/45
                  backdrop-blur-3xl
                  border border-white/70
                  text-white text-sm font-semibold tracking-[0.25em]
                  shadow-xl brightness-125
                "
              >
                DAY {activeDayIndex + 1}
              </div>

              {/* 地點（無底色） */}
              {currentDay.heroLocation && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#CDA581] opacity-90" />
                  <span className="text-sm font-medium text-white opacity-90">
                    {currentDay.heroLocation}
                  </span>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="text-3xl font-bold leading-tight">
              {currentDay.heroTitle || "未設定標題"}
            </div>

          </div>
        </div>
      </div>

      {/* ---------------- Day Tabs ---------------- */}
      <div className="flex justify-between mb-4">
        {days.map((day, index) => {
          const active = index === activeDayIndex;
          return (
            <button
              key={day.id}
              onClick={() => switchDay(index)}
              className="flex-1 flex flex-col items-center"
            >
              <span
                className={`text-[11px] tracking-[0.3em] ${
                  active ? "text-[#5A4636]" : "text-[#D1C2B3]"
                }`}
              >
                {day.weekday}
              </span>
              <span
                className={`mt-1 text-xl ${
                  active ? "text-[#5A4636]" : "text-[#D1C2B3]"
                }`}
              >
                {day.dayNumber}
              </span>
              <span
                className={`mt-1 w-1.5 h-1.5 rounded-full bg-[#C22929] ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ---------------- 天氣區 ---------------- */}
      {currentDay && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <div>
              <p className="text-sm font-semibold text-[#5A4636]">
                {currentDay.weatherLocation}
              </p>
              <p className="text-[11px] text-[#8C6A4F]/80">未來 24 小時預報</p>
            </div>

            <span className="text-[11px] text-[#C6A087] border border-[#E5D5C5] rounded-full px-3 py-0.5 bg-white">
              Open-Meteo
            </span>
          </div>

          <div className="bg-[#F7F1EB] rounded-2xl px-3 py-3">
            <div className="flex gap-4 overflow-x-auto scrollbar-none">
              {weatherHourly.slice(0, 24).map((h) => (
                <div key={h.timeLabel} className="flex flex-col items-center min-w-[40px]">
                  <span className="text-[11px] text-[#8C6A4F]">{h.timeLabel}</span>
                  <div className="mt-1 text-[#C6A087]">{weatherIcon(h.code)}</div>
                  <span className="mt-1 text-sm text-[#5A4636]">{h.temp}°</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- 行程卡片區 ---------------- */}
      <DragDropContext onDragEnd={isViewer ? () => {} : onDragEnd}>
        <Droppable droppableId="day-items">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="relative border-l border-[#E5D5C5] mt-2 space-y-4 pb-10"
            >
              {currentItems.map((item, index) => {
                console.log("🧩 item", item);
                const meta = TYPE_META[item.type];
                const TypeIcon = meta.icon;

                const isOpen = slideOpenId === item.id;

                return (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        {...drag.dragHandleProps}
                        className="relative pl-6"
                      >
                        {/* timeline */}
                        <div className="absolute -left-[7px] top-5 w-3 h-3 bg-[#F7F1EB] border-2 border-[#C6A087] rounded-full" />

                        {/* Slide Buttons */}
                        <div className="relative">
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 right-3 flex gap-2 transition-all ${
                              isOpen
                                ? "opacity-100"
                                : "opacity-0 pointer-events-none"
                            }`}
                          >
                            {!isViewer && (
                            <button
                              onClick={() => setEditingItem(item)}
                              className="w-9 h-9 rounded-full bg-[#F7C85C] flex items-center justify-center"
                            >
                              <Pencil className="w-4 h-4 text-[#5A4636]" />
                            </button>
                            )}

                            {!isViewer && (
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="w-9 h-9 rounded-full bg-[#E35B5B] flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                            )}
                          </div>

                          {/* Card */}
                          <div
                            onClick={() =>
                              setSlideOpenId(isOpen ? null : item.id)
                            }
                            style={{
                              transform: isOpen
                                ? "translateX(-100px)"
                                : "translateX(0)",
                              transition: "transform 0.3s ease",
                            }}
                            className="bg-white border border-[#E5D5C5] rounded-3xl px-5 py-4 shadow-sm"
                          >
                            {/* 類別 pill + 時間 */}
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: meta.pillBg,
                                  color: meta.pillText,
                                }}
                              >
                                <TypeIcon className="w-3.5 h-3.5" />
                                {meta.label}
                              </span>

                              <span className="text-xs text-[#8C6A4F]">
                                {item.time}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-[#5A4636]">
                              {item.title}
                            </h3>

                            {item.subtitle && (
                              <p className="text-sm text-[#A8937C] mt-0.5">
                                {item.subtitle}
                              </p>
                            )}

                            {/* 🎟 綁定的票券（依票券類別上色） */}
                            {(() => {
                              const ticketIds =
                                item.ticketIds ||
                                item.tickets ||
                                (item.ticket ? [item.ticket] : []);

                              if (!ticketIds || ticketIds.length === 0) return null;

                              // 🎨 票券專用色系（跟 Tickets 頁一致）
                              const TICKET_META = {
                                ATTRACTION: {
                                  bg: "#E7EEF9",
                                  text: "#4A607F",
                                  border: "#D5E0F2",
                                },
                                TRANSPORT: {
                                  bg: "#E4F1E3",
                                  text: "#4E6B48",
                                  border: "#CFE3CD",
                                },
                                HOTEL: {
                                  bg: "#F3E3F0",
                                  text: "#7A4D6E",
                                  border: "#E6CFE0",
                                },
                                FOOD: {
                                  bg: "#FBE7DF",
                                  text: "#8C4A2F",
                                  border: "#F2D2C3",
                                },
                              };
                              const TICKET_TYPE_ICON = {
                                ATTRACTION: Landmark,
                                TRANSPORT: Train,
                                HOTEL: BedDouble,
                                FOOD: UtensilsCrossed,
                              };

                              return (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {ticketIds.map((id) => {
                                    const ticket =
                                      typeof id === "object"
                                        ? id
                                        : trip.tickets.find((t) => t.id === id);

                                    if (!ticket) return null;

                                    const meta =
                                      TICKET_META[ticket.type] || {
                                        bg: "#F0F0F0",
                                        text: "#555",
                                        border: "#DDD",
                                      };

                                    const TypeIcon =
                                      TICKET_TYPE_ICON[ticket.type] || Landmark;

                                    return (
                                      <button
                                        key={ticket.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation(); // ⭐ 關鍵：阻止左滑
                                          setTrip((p) => ({ ...p, viewTicket: ticket }))
                                        }}
                                        className="
                                          inline-flex items-center gap-1.5
                                          px-2.5 py-1
                                          rounded-full
                                          text-xs
                                          whitespace-nowrap
                                        "
                                        style={{
                                          backgroundColor: meta.bg,
                                          color: meta.text,
                                          border: `1px solid ${meta.border}`,
                                        }}
                                      >
                                        {/* 票券 icon */}
                                        <Ticket className="w-4 h-4" />

                                        {/* 類別 icon */}
                                        <TypeIcon
                                          className="w-3.5 h-3.5"
                                          style={{ color: meta.text }}
                                        />

                                        {/* 票券名稱 */}
                                        <span>{ticket.title || "未命名票券"}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                            
                            {/* 地址/營業/電話 */}
                            <div className="space-y-1.5 text-sm text-[#5A4636] mt-3">
                              {item.address && (
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-[#C6A087] mt-[1px]" />
                                  <span>{item.address}</span>
                                </div>
                              )}

                              {item.openingHours && (
                                <div className="flex items-start gap-2">
                                  <Clock className="w-4 h-4 text-[#C6A087] mt-[1px]" />
                                  <span>{item.openingHours}</span>
                                </div>
                              )}

                              {item.phone && (
                                <div className="flex items-start gap-2">
                                  <Phone className="w-4 h-4 text-[#C6A087] mt-[1px]" />
                                  <span>{item.phone}</span>
                                </div>
                              )}
                            </div>

                            {/* 備註 */}
                            {item.notes && (
                              <div className="mt-3 rounded-2xl bg-[#F7F1EB] px-4 py-3 flex gap-2 text-sm text-[#8C6A4F]">
                                <StickyNote className="w-4 h-4 mt-[2px]" />
                                <p>{item.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                                      {/* Transit Card */}
                                      {index < currentItems.length - 1 && (
                                        <TransitCard
                                          id={item.transit?.id ?? `transit-${item.id}`}
                                          defaultData={item.transit}
                                          onUpdate={(transitId, data) => {
                                            if (isViewer) return; // Viewer 防呆 (保留)
                                            setDays((prev) => {
                                              const next = structuredClone(prev);
                                              const day = next[activeDayIndex];
                                              if (!day) return prev;

                                              const idx = day.items.findIndex(
                                                (i) => i.id === item.id
                                              );
                                              if (idx === -1) return prev;

                                              day.items[idx] = {
                                                ...day.items[idx],
                                                transit: {
                                                  id: transitId,
                                                  ...data,
                                                },
                                              };

                                              setTrip((p) => ({
                                                ...p,
                                                days: next,
                                              }));

                                              return next;
                                            });
                                          }}
                                          isViewer={isViewer}
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

      {/* 新增行程按鈕 */}
      <div className="flex justify-center mt-6">
      {!isViewer && (
        <button
          onClick={addItem}
          className="px-4 py-2 rounded-full border border-dashed border-[#C6A087] bg-white text-sm text-[#8C6A4F] hover:bg-[#F7F1EB]"
        >
          ＋ 新增行程項目
        </button>
        )}
      </div>

      {/* Modal：編輯行程 */}
      {editingItem && !isViewer && (
        <EditItemModal
          item={editingItem}
          trip={trip} // ⭐ 一定要加
          tickets={trip.tickets || []} // ⭐ 關鍵
          onClose={() => setEditingItem(null)}
          onSave={(updated) => {
            const newDays = [...days];
            const list = [...newDays[activeDayIndex].items];
            const idx = list.findIndex((i) => i.id === updated.id);
            if (idx !== -1) list[idx] = updated;

            newDays[activeDayIndex].items = list;
            setDays(newDays);
            setTrip((p) => ({ ...p, days: newDays }));
            setEditingItem(null);
          }}
          />
        )}

      {/* Modal：編輯 HERO */}
      {editingHero && !isViewer && (
        <EditHeroModal
          dayData={editingHero}
          onClose={() => setEditingHero(null)}
          onSave={saveHero}
        />
      )}

      {viewTicket && (
        <TicketDetail
          ticket={viewTicket}
          onClose={() => setViewTicket(null)}
        />
      )}
    </div>
  );
}
