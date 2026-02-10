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
  Link,
  ArrowLeftRight,
  AlertCircle,
  CalendarOff,
  ChevronDown,
  ChevronUp,
  Store, 
  X,
  Sparkles,
  Map,
  ShoppingBag,
  Heart,
  Circle,
  Minus,
  Star // ✅ 引入經典星星
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
  const [branchIndexMap, setBranchIndexMap] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});
  const [selectedShop, setSelectedShop] = useState(null);

  const TYPE_META = {
    ATTRACTION: { label: "景點", pillBg: "#E7EEF9", pillText: "#4A607F", icon: Landmark },
    RESTAURANT: { label: "餐廳", pillBg: "#FBE7DF", pillText: "#8C4A2F", icon: UtensilsCrossed },
    TRANSPORT: { label: "交通", pillBg: "#E4F1E3", pillText: "#4E6B48", icon: Train },
    HOTEL: { label: "住宿", pillBg: "#F3E3F0", pillText: "#7A4D6E", icon: BedDouble },
  };

  const getLinkDisplay = (text) => {
    if (!text) return null;
    const mdMatch = text.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    if (mdMatch) return { label: mdMatch[1], url: mdMatch[2] };
    return { label: "查看連結", url: text };
  };

  const getBranchData = (item) => {
    const split = (val) => (typeof val === "string" ? val.split("---") : [val]);
    const currentIndex = branchIndexMap[item.id] || 0;
    const allTitles = split(item.title);
    const branchCount = allTitles.length;

    const getVal = (val) => {
      const parts = split(val);
      return (parts[currentIndex] !== undefined && parts[currentIndex].trim() !== "") 
        ? parts[currentIndex] 
        : parts[0];
    };

    return {
      hasBranch: branchCount > 1,
      currentIndex,
      branchCount,
      title: getVal(item.title),
      subtitle: getVal(item.subtitle),
      note: getVal(item.notes),
      address: getVal(item.address),
      openingHours: getVal(item.openingHours),
      offDay: getVal(item.offDay),
      phone: getVal(item.phone),
      link: getVal(item.link),
      ticketIds: typeof item.ticketIds === "string" 
        ? (split(item.ticketIds)[currentIndex] || split(item.ticketIds)[0]).split(",").filter(Boolean)
        : (Array.isArray(item.ticketIds) ? item.ticketIds : [])
    };
  };

  const saveHero = (updatedHeroData) => {
    if (isViewer) return;
    setTrip((prev) => {
      const next = structuredClone(prev);
      if (next.days[activeDayIndex]) next.days[activeDayIndex] = { ...next.days[activeDayIndex], ...updatedHeroData };
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
        setWeatherHourly(data.hourly.time.map((t, index) => ({
          timeLabel: `${String(new Date(t).getHours()).padStart(2, "0")}:00`,
          temp: Math.round(data.hourly.temperature_2m[index]),
          code: data.hourly.weathercode[index],
        })));
      } catch (e) { console.error("天氣獲取失敗:", e); }
    }
    fetchWeather();
  }, [currentDay?.latitude, currentDay?.longitude, activeDayIndex]);

  const handleNavigation = (e, address, title) => {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || title)}`, "_blank");
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

  const parseNotes = (noteText) => {
    if (!noteText) return { intro: "", shops: [] };
    const lines = noteText.split("\n");
    const shops = lines.filter(l => l.trim().startsWith("*")).map(l => {
      const parts = l.trim().substring(1).split("|").map(p => p.trim());
      return {
        name: parts[0] || "",
        subtitle: parts[1] || "",
        hours: parts[2] || "",
        desc: parts[3] || ""
      };
    });
    const intro = lines.filter(l => !l.trim().startsWith("*")).join("\n").trim();
    return { intro, shops };
  };

  return (
    <div className="pt-4 pb-24">
      {/* 封面區域 */}
      <div className="mb-6 relative flex gap-1 items-stretch pr-2" style={{ height: 260 }}>
        <div className="w-10 flex flex-col items-center h-full shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C6A087] mb-2 shrink-0" />
          <span className="w-px flex-1 bg-[#D8CFC4]" />
          <div className="mt-3 text-[#5A4636] font-semibold tracking-[0.3em]" style={{ writingMode: "vertical-rl", fontSize: "18px", lineHeight: "1.2" }}>
            第{numberToChinese(activeDayIndex + 1)}天
          </div>
        </div>
        <div
          className="flex-1 rounded-[24px] overflow-hidden relative shadow-sm cursor-pointer"
          onClick={() => !isViewer && setShowHeroEdit(!showHeroEdit)}
          style={{ backgroundImage: `url(${currentDay?.heroImage || "/placeholder.jpg"})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          {showHeroEdit && !isViewer && (
            <button onClick={(e) => { e.stopPropagation(); setEditingHero(currentDay); }} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-xl border border-white/50 shadow-lg">
              <Pencil className="w-4 h-4 text-white" />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white drop-shadow-lg">
            {currentDay?.heroLocation && (
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-[#CDA581]" />
                <span className="text-[11px] font-medium text-white/90">{currentDay.heroLocation}</span>
              </div>
            )}
            <div className="text-xl font-bold leading-tight tracking-tight">{currentDay?.heroTitle || "未設定標題"}</div>
          </div>
        </div>
      </div>

      {/* 天氣預報 */}
      <section className="mb-1 pl-2 pr-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <p className="text-sm font-bold text-[#5A4636]">{currentDay?.weatherLocation || "未設定地點"}</p>
            <p className="text-[10px] text-[#8C6A4F]/60">未來 24 小時預報</p>
          </div>
          <span className="text-[10px] text-[#C6A087]/70 border border-[#E5D5C5] rounded-full px-2 py-0.5 bg-white/50">Open-Meteo</span>
        </div>
        <div className="bg-[#F7F1EB]/80 rounded-[20px] px-2 py-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-none">
            {weatherHourly.length > 0 ? weatherHourly.slice(0, 24).map((h) => (
              <div key={h.timeLabel} className="flex flex-col items-center min-w-[34px] shrink-0">
                <span className="text-[10px] text-[#8C6A4F]/80">{h.timeLabel}</span>
                <div className="mt-1.5 text-[#C6A087]">{weatherIcon(h.code)}</div>
                <span className="mt-1.5 text-xs text-[#5A4636] font-bold">{h.temp}°</span>
              </div>
            )) : <p className="text-xs text-[#8C6A4F] w-full text-center">載入中...</p>}
          </div>
        </div>
      </section>

      {/* 今日行程小提醒 */}
      {currentDay?.dayNotes && (
        <section className="px-2 mb-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <AlertCircle className="w-5 h-5 text-[#5A4636]" />
            <h4 className="text-m font-bold text-[#5A4636] uppercase tracking-wider">今日行程提醒</h4>
          </div>
          <div className="bg-[#FFFEFC] border border-[#F0E3D5] rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C6A087]" />
            <p className="text-[13px] text-[#5A4636] leading-relaxed whitespace-pre-wrap font-medium">
              {currentDay.dayNotes}
            </p>
          </div>
        </section>
      )}

      {/* 行程列表區域 */}
      <div className="mt-2 ml-5 mr-0 relative">
        <div className="absolute left-0 top-6 bottom-0 w-px bg-[#E5D5C5] -z-0" />

        <DragDropContext onDragEnd={isViewer ? () => {} : onDragEnd}>
          <Droppable droppableId="day-items">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="pb-10 relative z-10">
                {currentItems.map((item, index) => {
                  const meta = TYPE_META[item.type] || TYPE_META.ATTRACTION;
                  const TypeIcon = meta.icon;
                  const isOpen = slideOpenId === item.id;
                  const branch = getBranchData(item);
                  const linkData = getLinkDisplay(branch.link);
                  const { intro, shops } = parseNotes(branch.note);

                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isViewer}>
                      {(drag) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} className="relative pl-4 pr-2 mb-5">
                          <div className="absolute -left-[6px] top-6 w-3 h-3 bg-[#F7F1EB] border-2 border-[#C6A087] rounded-full z-10" />
                          
                          <div className="relative overflow-visible">
                            <div className="absolute top-0 bottom-0 right-0 flex gap-2 items-center px-3 z-0">
                              {!isViewer && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="w-8 h-8 rounded-full bg-[#F7C85C] flex items-center justify-center shadow-sm active:scale-90 transition-transform"><Pencil className="w-4 h-4 text-[#5A4636]" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); setTrip(prev => {
                                    const next = structuredClone(prev);
                                    next.days[activeDayIndex].items = next.days[activeDayIndex].items.filter((i) => i.id !== item.id);
                                    return next;
                                  }); }} className="w-8 h-8 rounded-full bg-[#E35B5B] flex items-center justify-center shadow-sm active:scale-90 transition-transform"><Trash2 className="w-4 h-4 text-white" /></button>
                                </>
                              )}
                            </div>

                            <div
                              onClick={() => !isViewer && setSlideOpenId(isOpen ? null : item.id)}
                              style={{ 
                                transform: isOpen ? "translateX(-100px)" : "translateX(0)", 
                                transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                                borderLeft: branch.hasBranch ? "4px solid #C6A087" : "1px solid #E5D5C5" 
                              }}
                              className="bg-white border border-[#E5D5C5] rounded-xl px-3 py-4 shadow-sm relative z-10 overflow-hidden"
                            >
                              {branch.hasBranch && (
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-[#F0E3D5]">
                                  <div className="text-[10px] font-bold text-[#C6A087] tracking-tight uppercase font-black">方案 {branch.currentIndex + 1}</div>
                                  <div className="flex gap-1.5">
                                    {[0, 1, 2].slice(0, branch.branchCount).map((idx) => (
                                      <button
                                        key={idx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setBranchIndexMap(prev => ({ ...prev, [item.id]: idx }));
                                        }}
                                        className={`w-6 h-6 rounded-full text-[10px] font-black transition-all flex items-center justify-center shadow-sm ${
                                          branch.currentIndex === idx 
                                          ? "bg-[#C6A087] text-white scale-110" 
                                          : "bg-[#F7F1EB] text-[#8C6A4F] hover:bg-[#E5D5C5]"
                                        }`}
                                      >
                                        {idx + 1}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between mb-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm" style={{ backgroundColor: meta.pillBg, color: meta.pillText }}>
                                  <TypeIcon className="w-3 h-3" /> {meta.label}
                                </span>
                                {item.time && (
                                  <span className="text-[11px] text-[#8C6A4F] font-bold tracking-tight">{item.time}</span>
                                )}
                              </div>
                              
                              <h3 className="text-base font-bold text-[#5A4636] leading-snug">{branch.title}</h3>
                              {branch.subtitle && <p className="text-[11px] text-[#8C6A4F]/70 mt-0.5">{branch.subtitle}</p>}

                              {branch.ticketIds?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {branch.ticketIds.map((ticketId) => {
                                    const ticket = trip.tickets?.find((t) => t.id === ticketId);
                                    if (!ticket) return null;
                                    const styleConfig = TYPE_META[ticket.type] || { pillBg: "#F7F1EB", pillText: "#8C6A4F" };
                                    return (
                                      <button key={ticketId} onClick={(e) => { e.stopPropagation(); setViewTicket(ticket); }} style={{ backgroundColor: styleConfig.pillBg, color: styleConfig.pillText, borderColor: `${styleConfig.pillText}20` }} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] border font-bold active:scale-95 transition-all shadow-sm">
                                        <Ticket className="w-3 h-3" /> <span>{ticket.title}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              <div className="space-y-1 mt-3">
                                {branch.address && (
                                  <div onClick={(e) => handleNavigation(e, branch.address, branch.title)} className="flex items-start gap-1.5 text-[11px] text-[#5A4636] cursor-pointer hover:opacity-70 transition-opacity">
                                    <MapPin className="w-3.5 h-3.5 text-[#C6A087] shrink-0 mt-0.5" />
                                    <span className="truncate flex-1 font-bold underline">{branch.address}</span>
                                  </div>
                                )}
                                {branch.openingHours && <div className="flex items-start gap-1.5 text-[11px] text-[#5A4636]"><Clock className="w-3.5 h-3.5 text-[#C6A087] shrink-0 mt-0.5" /><span>{branch.openingHours}</span></div>}
                                {branch.offDay && (
                                  <div className="flex items-start gap-1.5 text-[11px] text-[#B43737] font-black">
                                    <CalendarOff className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    <span>公休日：{branch.offDay}</span>
                                  </div>
                                )}

                                {branch.phone && <div className="flex items-start gap-1.5 text-[11px] text-[#5A4636]"><Phone className="w-3.5 h-3.5 text-[#C6A087] shrink-0 mt-0.5" /><span>{branch.phone}</span></div>}
                                {linkData && (
                                  <div onClick={(e) => { e.stopPropagation(); window.open(linkData.url, "_blank"); }} className="flex items-start gap-1.5 text-[11px] text-blue-500 font-medium cursor-pointer hover:underline transition-all">
                                    <Link className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                    <span className="truncate flex-1">{linkData.label}</span>
                                  </div>
                                )}
                              </div>

                              {(intro || shops.length > 0) && (
                                <div className="mt-3">
                                  {intro && (
                                    <div className="rounded-xl bg-[#F7F1EB] px-3 py-2.5 flex gap-2 text-[12px] text-[#8C6A4F] leading-relaxed border border-[#E5D5C5]/30">
                                      <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C6A087]" />
                                      <p className="whitespace-pre-wrap">{intro}</p>
                                    </div>
                                  )}

                                  {shops.length > 0 && (
                                    <div className="mt-2">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedNotes(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#E5D5C5] rounded-xl text-[11px] font-bold text-[#8C6A4F] hover:bg-[#F7F1EB] transition-colors"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <Store className="w-3 h-3 text-[#C6A087]" />
                                          <span>查看清單 ({shops.length})</span>
                                        </div>
                                        {expandedNotes[item.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>
                                      
                                      {expandedNotes[item.id] && (
                                        <div className="mt-2 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                          {shops.map((shop, sIdx) => (
                                            <button 
                                              key={sIdx} 
                                              onClick={(e) => { e.stopPropagation(); setSelectedShop(shop); }}
                                              className="bg-[#FDFBF9] border border-[#F0E3D5] rounded-xl p-2.5 text-[11px] text-left hover:bg-[#F7F1EB] active:scale-95 transition-all shadow-sm flex items-center gap-2"
                                            >
                                              <div className="w-1.5 h-1.5 rounded-full bg-[#C6A087] shrink-0" />
                                              <span className="text-[#5A4636] font-bold truncate">{shop.name}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {index < currentItems.length - 1 && (
                            <TransitCard
                              id={`transit-${item.id}`}
                              defaultData={item.transit}
                              isViewer={isViewer}
                              branchIndex={branchIndexMap[currentItems[index + 1]?.id] || 0} 
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
      </div>

      {!isViewer && (
        <div className="flex justify-center mt-4 px-2">
          <button onClick={() => setTrip((prev) => {
            const next = structuredClone(prev);
            next.days[activeDayIndex].items.push({ id: `item-${Date.now()}`, time: "", type: "ATTRACTION", title: "新的行程", ticketIds: [], subtitle: "", address: "", openingHours: "", offDay: "", phone: "", notes: "", link: "" });
            return next;
          })} className="w-full max-w-xs py-2.5 rounded-full border border-dashed border-[#C6A087] bg-white text-xs text-[#8C6A4F] font-bold shadow-sm active:scale-95 transition-all">
            ＋ 新增行程
          </button>
        </div>
      )}

      {/* ✅ 彈窗優化：可愛星星 (Star) 版 */}
      {selectedShop && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedShop(null)}>
          <div className="w-full max-w-[300px] bg-[#FFF9F2] rounded-[2.5rem] border border-[#E5D5C5] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            
            <div className="h-16 bg-[#F7F1EB] flex flex-col items-center justify-center relative">
               <span className="text-[8px] font-bold text-[#C6A087] tracking-[0.3em] uppercase mb-1 opacity-60">Shop Information</span>
               <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm"><Store className="w-4 h-4 text-[#C6A087]" /></div>
               <button onClick={() => setSelectedShop(null)} className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-white/60 text-[#8C6A4F] active:scale-90 transition-all z-10"><X className="w-4 h-4" /></button>
            </div>

            <div className="px-6 pb-8 pt-6 flex flex-col items-center">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-[#5A4636] leading-tight">{selectedShop.name}</h3>
                {selectedShop.subtitle && (
                  <p className="text-[12px] text-[#8C6A4F] font-bold mt-1 tracking-wide opacity-80 italic">
                    {selectedShop.subtitle}
                  </p>
                )}
              </div>
              
              <div className="w-full space-y-4 text-left overflow-y-auto max-h-[40vh] scrollbar-none pr-1">
                {/* 營業時間 */}
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8C6A4F] opacity-70 uppercase tracking-tight ml-1">
                      <Clock className="w-3 h-3" /> 營業時間
                   </div>
                   <div className="bg-white rounded-2xl p-3.5 border border-[#F0E3D5] text-[13px] text-[#5A4636] font-medium leading-relaxed shadow-sm text-center">
                      {selectedShop.hours || "請參考現場公告"}
                   </div>
                </div>

                {/* 詳細介紹 (經典星星 + 愛心版) */}
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8C6A4F] opacity-70 uppercase tracking-tight ml-1">
                      <Sparkles className="w-3 h-3" /> 詳細介紹
                   </div>
                   <div className="bg-white rounded-2xl p-4 border border-[#F0E3D5] shadow-sm">
                      {selectedShop.desc ? (
                        <div className="space-y-3">
                          {selectedShop.desc.split("\\").map((line, lIdx) => {
                            const trimmed = line.trim();
                            const isSubItem = trimmed.startsWith(">");
                            const content = isSubItem ? trimmed.substring(1).trim() : trimmed;

                            return (
                              <div key={lIdx} className={`flex items-start gap-2 ${isSubItem ? "pl-5" : ""}`}>
                                {isSubItem ? (
                                  <Heart className="w-2.5 h-2.5 fill-[#E8B4B4] text-[#E8B4B4] mt-1.5 shrink-0" />
                                ) : (
                                  // ✅ 大項目：經典五角星 (Star)
                                  <Star className="w-3.5 h-3.5 fill-[#FAF287] text-[#FAF287] mt-1 shrink-0" />
                                )}
                                <p className={`${isSubItem ? "text-[11px] text-[#8C6A4F]" : "text-[12px] font-bold text-[#5A4636]"} leading-relaxed flex-1`}>
                                  {content}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#8C6A4F] text-center italic">暫無詳細備註...</p>
                      )}
                   </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  const query = encodeURIComponent(selectedShop.name);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                }}
                className="mt-8 w-full py-4 bg-[#C6A087] text-white rounded-2xl text-[13px] font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#8C6A4F]"
              >
                <Map className="w-4 h-4" /> 查看店家地圖
              </button>
            </div>
          </div>
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