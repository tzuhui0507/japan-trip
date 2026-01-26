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
  Link, // 🆕 引入外部連結圖示
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

  const activeDayIndex = typeof dayIndex === "number" ? dayIndex : trip.activeDayIndex ?? 0;
  const days = trip.days || [];
  const currentDay = days[activeDayIndex];
  const currentItems = currentDay?.items || [];

  const [showHeroEdit, setShowHeroEdit] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [slideOpenId, setSlideOpenId] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);
  const [weatherHourly, setWeatherHourly] = useState([]);

  const TYPE_META = {
    ATTRACTION: { label: "景點", pillBg: "#E7EEF9", pillText: "#4A607F", icon: Landmark },
    RESTAURANT: { label: "餐廳", pillBg: "#FBE7DF", pillText: "#8C4A2F", icon: UtensilsCrossed },
    TRANSPORT: { label: "交通", pillBg: "#E4F1E3", pillText: "#4E6B48", icon: Train },
    HOTEL: { label: "住宿", pillBg: "#F3E3F0", pillText: "#7A4D6E", icon: BedDouble },
  };

  // 🆕 解析連結標題與網址的輔助函式
  const getLinkDisplay = (text) => {
    if (!text) return null;
    const mdMatch = text.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    if (mdMatch) return { label: mdMatch[1], url: mdMatch[2] };
    return { label: "查看連結", url: text };
  };

  const saveHero = (updatedHeroData) => {
    if (isViewer) return;
    setTrip((prev) => {
      const next = structuredClone(prev);
      if (next.days[activeDayIndex]) {
        next.days[activeDayIndex] = { ...next.days[activeDayIndex], ...updatedHeroData };
      }
      return next;
    });
    setEditingHero(null);
  };

  const weatherIcon = (code) => {
    if (code === 0) return <SunMedium className="w-4 h-4" />;
    if ([1, 2, 3].includes(code)) return <Cloud className="w-4 h-4" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className="w-4 h-4" />;
    if ([71, 73, 75, 85, 86].includes(code)) return <CloudSnow className="w-4 h-4" />;
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
      } catch (e) { console.error("天氣獲取失敗:", e); }
    }
    fetchWeather();
  }, [currentDay?.latitude, currentDay?.longitude]);

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
        link: "", // 🆕 確保有 link 欄位
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
      next.days[activeDayIndex].items = next.days[activeDayIndex].items.filter((i) => i.id !== id);
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

  if (!currentDay) return <div className="pt-24 text-center text-sm text-[#8C6A4F]">行程資料載入中…</div>;

  return (
    <div className="pt-4 pb-24">
      {/* 封面區域 */}
      <div className="mb-6 relative flex gap-4 items-stretch" style={{ height: 240 }}>
        <div className="w-12 flex flex-col items-center h-full">
          <span className="w-2 h-2 rounded-full bg-[#C6A087] mb-2 shrink-0" />
          <span className="w-px flex-1 bg-[#D8CFC4]" />
          <div className="mt-3 text-[#5A4636] font-semibold tracking-[0.4em]" style={{ writingMode: "vertical-rl", fontSize: "20px", lineHeight: "1.8" }}>
            第{numberToChinese(activeDayIndex + 1)}天
          </div>
        </div>
        <div
          className="flex-1 rounded-[18px] overflow-hidden relative shadow cursor-pointer"
          onClick={() => !isViewer && setShowHeroEdit(!showHeroEdit)}
          style={{ backgroundImage: `url(${currentDay.heroImage || "/placeholder.jpg"})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          {showHeroEdit && !isViewer && (
            <button onClick={(e) => { e.stopPropagation(); setEditingHero(currentDay); }} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-xl border border-white/50 shadow-lg">
              <Pencil className="w-4 h-4 text-white" />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white drop-shadow-lg">
            {currentDay.heroLocation && (
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#CDA581]" />
                <span className="text-xs font-medium text-white">{currentDay.heroLocation}</span>
              </div>
            )}
            <div className="text-lg font-bold leading-tight">{currentDay.heroTitle || "未設定標題"}</div>
          </div>
        </div>
      </div>

      {/* 天氣預報 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <div>
            <p className="text-sm font-semibold text-[#5A4636]">{currentDay.weatherLocation || "未設定地點"}</p>
            <p className="text-[10px] text-[#8C6A4F]/80">未來 24 小時預報</p>
          </div>
          <span className="text-[10px] text-[#C6A087] border border-[#E5D5C5] rounded-full px-2.5 py-0.5 bg-white">Open-Meteo</span>
        </div>
        <div className="bg-[#F7F1EB] rounded-2xl px-3 py-3">
          <div className="flex gap-4 overflow-x-auto scrollbar-none">
            {weatherHourly.length > 0 ? weatherHourly.slice(0, 24).map((h) => (
              <div key={h.timeLabel} className="flex flex-col items-center min-w-[36px]">
                <span className="text-[10px] text-[#8C6A4F]">{h.timeLabel}</span>
                <div className="mt-1 text-[#C6A087]">{weatherIcon(h.code)}</div>
                <span className="mt-1 text-xs text-[#5A4636] font-medium">{h.temp}°</span>
              </div>
            )) : <p className="text-xs text-[#8C6A4F] w-full text-center">暫無天氣預報</p>}
          </div>
        </div>
      </section>

      {/* 行程列表 */}
      <DragDropContext onDragEnd={isViewer ? () => {} : onDragEnd}>
        <Droppable droppableId="day-items">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="relative border-l border-[#E5D5C5] mt-2 space-y-4 pb-10 ml-6">
              {currentItems.map((item, index) => {
                const meta = TYPE_META[item.type] || TYPE_META.ATTRACTION;
                const TypeIcon = meta.icon;
                const isOpen = slideOpenId === item.id;
                const linkData = getLinkDisplay(item.link); // 🆕 解析連結

                return (
                  <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isViewer}>
                    {(drag) => (
                      <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} className="relative pl-6">
                        <div className="absolute -left-[7.5px] top-5 w-3 h-3 bg-[#F7F1EB] border-2 border-[#C6A087] rounded-full" />
                        <div className="relative">
                          <div className={`absolute top-1/2 -translate-y-1/2 right-2 flex gap-2 transition-all ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                            {!isViewer && (
                              <>
                                <button onClick={() => setEditingItem(item)} className="w-8 h-8 rounded-full bg-[#F7C85C] flex items-center justify-center shadow-sm"><Pencil className="w-4 h-4 text-[#5A4636]" /></button>
                                <button onClick={() => deleteItem(item.id)} className="w-8 h-8 rounded-full bg-[#E35B5B] flex items-center justify-center shadow-sm"><Trash2 className="w-4 h-4 text-white" /></button>
                              </>
                            )}
                          </div>

                          <div
                            onClick={() => !isViewer && setSlideOpenId(isOpen ? null : item.id)}
                            style={{ transform: isOpen ? "translateX(-90px)" : "translateX(0)", transition: "transform 0.3s ease" }}
                            className="bg-white border border-[#E5D5C5] rounded-xl px-4 py-3 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: meta.pillBg, color: meta.pillText }}>
                                <TypeIcon className="w-3 h-3" /> {meta.label}
                              </span>
                              <span className="text-[11px] text-[#8C6A4F] font-medium">{item.time}</span>
                            </div>
                            <h3 className="text-base font-bold text-[#5A4636] leading-snug">{item.title}</h3>
                            {item.subtitle && <p className="text-[11px] text-[#8C6A4F]/70 mt-0.5 leading-relaxed">{item.subtitle}</p>}

                            {/* 票券 */}
                            {item.ticketIds?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {item.ticketIds.map((id) => {
                                  const ticket = typeof id === "object" ? id : trip.tickets?.find((t) => t.id === id);
                                  if (!ticket) return null;
                                  const styleConfig = TYPE_META[ticket.type] || { pillBg: "#F7F1EB", pillText: "#8C6A4F" };
                                  return (
                                    <button key={ticket.id} onClick={(e) => { e.stopPropagation(); setViewTicket(ticket); }} style={{ backgroundColor: styleConfig.pillBg, color: styleConfig.pillText, borderColor: `${styleConfig.pillText}20` }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border font-bold active:scale-95 transition-all">
                                      <Ticket className="w-3 h-3" /> <span>{ticket.title}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* 詳細內容 */}
                            <div className="space-y-1.5 mt-2.5">
                              {item.address && (
                                <div onClick={(e) => handleNavigation(e, item.address, item.title)} className="flex items-start gap-1.5 text-xs text-[#5A4636] cursor-pointer hover:opacity-70">
                                  <MapPin className="w-3.5 h-3.5 text-[#C6A087] shrink-0 mt-0.5" />
                                  <span className="truncate flex-1">{item.address}</span>
                                </div>
                              )}
                              {item.openingHours && (
                                <div className="flex items-start gap-1.5 text-xs text-[#5A4636]">
                                  <Clock className="w-3.5 h-3.5 text-[#C6A087] shrink-0 mt-0.5" />
                                  <span>{item.openingHours}</span>
                                </div>
                              )}
                              {item.phone && (
                                <div className="flex items-start gap-1.5 text-xs text-[#5A4636]">
                                  <Phone className="w-3.5 h-3.5 text-[#C6A087] shrink-0 mt-0.5" />
                                  <span>{item.phone}</span>
                                </div>
                              )}
                              {/* 🆕 獨立連結區塊：放在電話下方，有連結才顯示 */}
                              {linkData && (
                                <div onClick={(e) => { e.stopPropagation(); window.open(linkData.url, "_blank"); }} className="flex items-start gap-1.5 text-xs text-blue-500 font-medium cursor-pointer hover:underline">
                                  <Link className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                  <span className="truncate flex-1">{linkData.label}</span>
                                </div>
                              )}
                            </div>

                            {/* 備註 */}
                            {item.notes && (
                              <div className="mt-3 rounded-xl bg-[#F7F1EB] px-3 py-2 flex gap-2 text-[12px] text-[#8C6A4F] leading-relaxed">
                                <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <p className="whitespace-pre-wrap">{item.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

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
        <div className="flex justify-center mt-4">
          <button onClick={addItem} className="px-4 py-2 rounded-full border border-dashed border-[#C6A087] bg-white text-xs text-[#8C6A4F] font-bold hover:bg-[#F7F1EB]">
            ＋ 新增項目
          </button>
        </div>
      )}

      {editingItem && !isViewer && (
        <EditItemModal
          item={editingItem} trip={trip} tickets={trip.tickets || []}
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
      {editingHero && !isViewer && <EditHeroModal dayData={editingHero} onClose={() => setEditingHero(null)} onSave={saveHero} />}
      {viewTicket && <TicketDetail ticket={viewTicket} onClose={() => setViewTicket(null)} />}
    </div>
  );
}