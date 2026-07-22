// src/pages/Plan.jsx
import React, { useEffect, useState } from "react";
import TransitCard from "../components/TransitCard";
import EditItemModal from "../components/EditItemModal";
import EditHeroModal from "../components/EditHeroModal";
import TicketDetail from "../components/TicketDetail";
import ShopListModal from "../components/ShopListModal";
import { THEMES } from "../App"; 

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Pencil,
  Trash2,
  Copy,
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
  AlertCircle,
  CalendarOff,
  ChevronDown,
  ChevronUp,
  Store, 
  Cherry,
  BellRing,
  Heart,
  Star,
  Flower2,
  Coffee,
  ShoppingBag,
  Camera,
  CameraIcon
} from "lucide-react";

export default function Plan({ trip, setTrip, dayIndex, themeId }) {
  if (!trip) return null;

  const isViewer = trip.shareMode === "viewer";
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;

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
  const [expandedCardNotes, setExpandedCardNotes] = useState({});
  const [selectedShop, setSelectedShop] = useState(null);

  const TYPE_META = {
    ATTRACTION: { label: "景點", pillBg: "#E7EEF9", pillText: "#4A607F", icon: Landmark },
    RESTAURANT: { label: "餐廳", pillBg: "#FBE7DF", pillText: "#8C4A2F", icon: UtensilsCrossed },
    TRANSPORT: { label: "交通", pillBg: "#E4F1E3", pillText: "#4E6B48", icon: Train },
    HOTEL: { label: "住宿", pillBg: "#F3E3F0", pillText: "#7A4D6E", icon: BedDouble },
  };

  const getShopIcon = (category) => {
    switch (category) {
      case "FOOD": return UtensilsCrossed;
      case "CAFE": return Coffee;
      case "SHOPPING": return ShoppingBag;
      case "SPOT": return Camera;
      default: return Store;
    }
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
      shops: item.shops || [],
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
    const query = address || title;
    if (!query) return;

    const hasKorean = /[\uAC00-\uD7AF]/.test(query);
    if (hasKorean) {
      window.open(`https://map.naver.com/v5/search/${encodeURIComponent(query)}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
    }
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

  const handleDuplicateItem = (e, targetItem, targetIndex) => {
    e.stopPropagation();
    if (isViewer) return;

    setTrip((prev) => {
      const next = structuredClone(prev);
      const clonedItem = structuredClone(targetItem);
      clonedItem.id = `item-cloned-${Date.now()}`;
      
      next.days[activeDayIndex].items.splice(targetIndex + 1, 0, clonedItem);
      return next;
    });
    
    setSlideOpenId(null);
  };

  const hasCollapsibleContent = (rawText, delimiter = "\n") => {
    if (!rawText) return false;
    const lines = rawText.split(delimiter);
    return lines.some((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      return trimmed.startsWith(">") || trimmed.startsWith("-") || trimmed.startsWith(">>") || (!trimmed.startsWith("!") && !trimmed.startsWith("="));
    });
  };

  const renderFormattedLines = (rawText, delimiter = "\n", isCollapsed = false) => {
    if (!rawText) return null;
    const lines = rawText.split(delimiter);
    let currentLevel = "star";

    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      let type = "";
      let content = "";

      if (trimmed.startsWith("!")) {
        type = "alert";
        content = trimmed.substring(1).trim();
        currentLevel = "alert";
      } else if (trimmed.startsWith(">>")) {
        type = "continue";
        content = trimmed.substring(2).trim();
      } else if (trimmed.startsWith(">")) {
        type = "heart";
        content = trimmed.substring(1).trim();
        currentLevel = "heart";
      } else if (trimmed.startsWith("-")) {
        type = "flower";
        content = trimmed.substring(1).trim();
        currentLevel = "flower";
      } else if (trimmed.startsWith("=")) {
        type = "star";
        content = trimmed.substring(1).trim();
        currentLevel = "star";
      } else {
        type = "continue";
        content = trimmed;
      }

      const activeType = type === "continue" ? currentLevel : type;
      const showIcon = type !== "continue";

      if (isCollapsed && activeType !== "star" && activeType !== "alert") {
        return null;
      }

      let paddingClass = "";
      if (activeType === "heart") paddingClass = "pl-4";
      if (activeType === "flower") paddingClass = "pl-8";

      const marginTopClass = lIdx === 0 ? "mt-0" : showIcon ? "mt-2.5" : "mt-0.5";

      let iconComponent = null;
      if (showIcon) {
        if (activeType === "alert") iconComponent = <BellRing className="w-3.5 h-3.5 text-[#FA5F73] mt-0.5 animate-pulse" />;
        else if (activeType === "heart") iconComponent = <Heart className="w-2.5 h-2.5 fill-[#E8B4B4] text-[#E8B4B4] mt-1" />;
        else if (activeType === "flower") iconComponent = <Flower2 className="w-2.5 h-2.5 text-[#FDBA74] mt-1" />;
        else iconComponent = <Star className="w-3.5 h-3.5 fill-[#FAF287] text-[#FAF287] mt-0.5" />;
      }

      let textClass = "text-[12px] font-bold";
      if (activeType === "alert") textClass = "text-[12px] font-bold text-[#FA5F73]";
      else if (activeType === "heart") textClass = "text-[11px] font-semibold";
      else if (activeType === "flower") textClass = "text-[11px] opacity-90";

      return (
        <div key={lIdx} className={`flex items-start ${paddingClass} ${marginTopClass}`}>
          <div className="w-5 flex-shrink-0 flex justify-center">
            {iconComponent}
          </div>
          <p className={`flex-1 leading-snug ${textClass}`} style={{ color: activeType !== "alert" ? currentTheme.text : undefined }}>
            {content}
          </p>
        </div>
      );
    });
  };

  return (
    <div className="pt-4 pb-24">
      {/* Header Banner */}
      <div className="mb-6 relative flex gap-1 items-stretch pr-2" style={{ height: 260 }}>
        <div className="w-10 flex flex-col items-center h-full shrink-0">
          <span className="w-2.5 h-2.5 rounded-full mb-2 shrink-0" style={{ backgroundColor: currentTheme.main }} />
          <span className="w-px flex-1" style={{ backgroundColor: currentTheme.border }} />
          <div className="mt-3 font-black tracking-[0.3em]" style={{ writingMode: "vertical-rl", fontSize: "18px", lineHeight: "1.2", color: currentTheme.text }}>
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
                <MapPin className="w-3 h-3" style={{ color: currentTheme.main }} />
                <span className="text-[11px] font-medium text-white/90">{currentDay.heroLocation}</span>
              </div>
            )}
            <div className="text-xl font-bold leading-tight tracking-tight">{currentDay?.heroTitle || "未設定標題"}</div>
          </div>
        </div>
      </div>

      {/* Weather Forecast */}
      <section className="mb-6 pl-2 pr-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <p className="text-sm font-bold" style={{ color: currentTheme.text }}>{currentDay?.weatherLocation || "未設定地點"}</p>
            <p className="text-[10px] opacity-60" style={{ color: currentTheme.accent }}>未來 24 小時預報</p>
          </div>
          <span className="text-[10px] border rounded-full px-2 py-0.5" style={{ color: currentTheme.main, borderColor: currentTheme.border }}>Open-Meteo</span>
        </div>
        <div className="px-1 py-2">
          <div className="flex gap-5 overflow-x-auto scrollbar-none">
            {weatherHourly.length > 0 ? weatherHourly.slice(0, 24).map((h) => (
              <div key={h.timeLabel} className="flex flex-col items-center min-w-[34px] shrink-0">
                <span className="text-[10px] opacity-80" style={{ color: currentTheme.accent }}>{h.timeLabel}</span>
                <div className="mt-2" style={{ color: currentTheme.main }}>{weatherIcon(h.code)}</div>
                <span className="mt-2 text-xs font-bold" style={{ color: currentTheme.text }}>{h.temp}°</span>
              </div>
            )) : <p className="text-xs w-full text-center" style={{ color: currentTheme.accent }}>載入中...</p>}
          </div>
        </div>
      </section>

      {/* Day Notes */}
      {currentDay?.dayNotes && (
        <section className="px-2 mb-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-2 px-1" style={{ color: currentTheme.text }}>
            <AlertCircle className="w-5 h-5" />
            <h4 className="text-[16px] font-black uppercase tracking-widest">今日行程提醒</h4>
          </div>
          
          <div 
            className="bg-white/80 border-2 border-dashed rounded-[1.5rem] py-4 px-5 shadow-sm relative transition-all" 
            style={{ borderColor: `${currentTheme.main}25` }}
          >
            <p className="text-[12px] leading-relaxed whitespace-pre-wrap font-semibold" style={{ color: currentTheme.text }}>
              {currentDay.dayNotes.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g).map((part, pIdx) => {
                const match = part.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
                if (match) {
                  return (
                    <a
                      key={pIdx}
                      href={match[2]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-black underline underline-offset-2 inline-flex items-center gap-0.5 mx-0.5 transition-all active:scale-[0.98]"
                      style={{ color: currentTheme.main }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {match[1]}
                    </a>
                  );
                }
                return part;
              })}
            </p>
          </div>
        </section>
      )}

      {/* Item Drag and Drop List */}
      <div className="mt-2 ml-5 mr-0 relative">
        <div className="absolute left-0 top-6 bottom-0 w-px -z-0" style={{ backgroundColor: currentTheme.border }} />

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
                  
                  const shopList = branch.shops || [];
                  const intro = branch.note;

                  const canCollapse = hasCollapsibleContent(intro, "\n");
                  const isNotesExpanded = !!expandedCardNotes[item.id];

                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isViewer}>
                      {(drag) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} className="relative pl-4 pr-2 mb-5">
                          <div className="absolute -left-[6px] top-6 w-3 h-3 bg-white border-2 rounded-full z-10" style={{ borderColor: currentTheme.main }} />
                          
                          <div className="relative overflow-visible">
                            <div className="absolute top-0 bottom-0 right-0 flex gap-2 items-center px-3 z-0">
                              {!isViewer && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="w-8 h-8 rounded-full bg-[#F7C85C] flex items-center justify-center shadow-sm active:scale-90 transition-transform"><Pencil className="w-4 h-4 text-[#5A4636]" /></button>
                                  <button onClick={(e) => handleDuplicateItem(e, item, index)} className="w-8 h-8 rounded-full bg-[#4A607F] flex items-center justify-center shadow-sm active:scale-90 transition-transform"><Copy className="w-3.5 h-3.5 text-white" /></button>
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
                                transform: isOpen ? "translateX(-140px)" : "translateX(0)", 
                                transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                                borderLeft: branch.hasBranch ? `4px solid ${currentTheme.main}` : `1px solid ${currentTheme.border}`,
                                borderTop: `1px solid ${currentTheme.border}`,
                                borderRight: `1px solid ${currentTheme.border}`,
                                borderBottom: `1px solid ${currentTheme.border}`,
                                backgroundColor: "white",
                                backgroundImage: `linear-gradient(${currentTheme.main}05, ${currentTheme.main}05)` 
                              }}
                              className="rounded-xl px-3 py-4 shadow-sm relative z-10 overflow-hidden"
                            >
                              {branch.hasBranch && (
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed" style={{ borderColor: currentTheme.border }}>
                                  <div className="text-[10px] font-black tracking-tight uppercase" style={{ color: currentTheme.main }}>方案 {branch.currentIndex + 1}</div>
                                  <div className="flex gap-1.5">
                                    {[0, 1, 2].slice(0, branch.branchCount).map((idx) => (
                                      <button
                                        key={idx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setBranchIndexMap(prev => ({ ...prev, [item.id]: idx }));
                                        }}
                                        className="w-6 h-6 rounded-full text-[10px] font-black transition-all flex items-center justify-center shadow-sm active:scale-95"
                                        style={{ 
                                          backgroundColor: branch.currentIndex === idx ? currentTheme.main : "white",
                                          borderColor: branch.currentIndex === idx ? currentTheme.main : currentTheme.border,
                                          color: branch.currentIndex === idx ? "white" : currentTheme.accent,
                                          borderWidth: "1px",
                                          borderStyle: "solid"
                                        }}
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
                                  <span className="text-[11px] font-bold tracking-tight" style={{ color: currentTheme.accent }}>{item.time}</span>
                                )}
                              </div>
                              
                              {/* 💡 左右雙欄對齊核心：右側相片加上 mr-2 內縮，並垂直置中 */}
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1 space-y-3">
                                  <div>
                                    <h3 className="text-base font-bold leading-snug" style={{ color: currentTheme.text }}>{branch.title}</h3>
                                    {branch.subtitle && <p className="text-[11px] mt-0.5 opacity-70" style={{ color: currentTheme.accent }}>{branch.subtitle}</p>}
                                  </div>

                                  {branch.ticketIds?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
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

                                  <div className="space-y-1.5">
                                    {branch.address && (
                                      <div onClick={(e) => handleNavigation(e, branch.address, branch.title)} className="flex items-start gap-1.5 text-[11px] cursor-pointer hover:opacity-70 transition-opacity" style={{ color: currentTheme.text }}>
                                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: currentTheme.main }} />
                                        <span className="break-words flex-1 font-bold underline">{branch.address}</span>
                                      </div>
                                    )}
                                    {branch.openingHours && <div className="flex items-start gap-1.5 text-[11px]" style={{ color: currentTheme.text }}><Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: currentTheme.main }} /><span>{branch.openingHours}</span></div>}
                                    {branch.offDay && (
                                      <div className="flex items-start gap-1.5 text-[11px] text-[#B43737] font-black">
                                        <CalendarOff className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>公休日：{branch.offDay}</span>
                                      </div>
                                    )}

                                    {branch.phone && <div className="flex items-start gap-1.5 text-[11px]" style={{ color: currentTheme.text }}><Phone className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: currentTheme.main }} /><span>{branch.phone}</span></div>}
                                    {linkData && (
                                      <div onClick={(e) => { e.stopPropagation(); window.open(linkData.url, "_blank"); }} className="flex items-start gap-1.5 text-[11px] text-blue-500 font-medium cursor-pointer hover:underline transition-all">
                                        <Link className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                        <span className="truncate flex-1">{linkData.label}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {item.image?.trim() && (
                                  <div className="shrink-0 w-[145px] sm:w-[165px] bg-white p-2 pb-3 rounded-xl border border-slate-200/80 shadow-md transform rotate-2 transition-transform hover:rotate-0 self-center mr-2">
                                    <div className="w-full h-[105px] sm:h-[120px] rounded-lg overflow-hidden bg-slate-100">
                                      <img 
                                        src={item.image} 
                                        alt={branch.title} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.parentElement.parentElement.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                    <div className="mt-1.5 text-[9px] font-bold text-center opacity-60 flex items-center justify-center gap-0.5" style={{ color: currentTheme.text }}>
                                      <CameraIcon className="w-3 h-3 opacity-90" style={{ color: currentTheme.main }} />
                                      <span className="opacity-60">｜</span>
                                      <span className="truncate">{branch.title}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* 備註 Note 區塊 */}
                              {intro && (
                                <div className="mt-4 rounded-xl px-3 py-3 flex flex-col text-[12px] leading-relaxed border-2 border-dashed shadow-inner" 
                                  style={{ 
                                    backgroundColor: `${currentTheme.light}80`, 
                                    borderColor: `${currentTheme.main}40`, 
                                    color: currentTheme.accent 
                                  }}>
                                  <div className="flex items-center justify-between mb-1.5 opacity-80">
                                    <div className="flex items-center gap-1.5">
                                      <StickyNote className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />
                                      <span className="text-[10px] font-black tracking-widest uppercase">Notes</span>
                                    </div>

                                    {canCollapse && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedCardNotes(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                        }}
                                        className="flex items-center gap-0.5 text-[10px] font-black tracking-tight hover:opacity-70 transition-opacity active:scale-95"
                                        style={{ color: currentTheme.main }}
                                      >
                                        <span>{isNotesExpanded ? "收合備註" : "展開完整備註"}</span>
                                        {isNotesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>
                                    )}
                                  </div>
                                  
                                  <div>
                                    {renderFormattedLines(intro, "\n", !isNotesExpanded)}
                                  </div>
                                </div>
                              )}

                              {/* 推薦店家清單 */}
                              {shopList.length > 0 && (
                                <div className="mt-3">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedNotes(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 bg-white border rounded-xl text-[11px] font-bold transition-all shadow-sm hover:shadow active:scale-[0.99]"
                                    style={{ borderColor: currentTheme.border, color: currentTheme.accent }}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Cherry className="w-3.5 h-3.5" style={{ color: currentTheme.main }} />
                                      <span>查看推薦清單 ({shopList.length})</span>
                                    </div>
                                    {expandedNotes[item.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                  
                                  {expandedNotes[item.id] && (
                                    <div className="mt-2 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                      {shopList.map((shop, sIdx) => {
                                        const ShopIconComponent = getShopIcon(shop.category);

                                        return (
                                          <button 
                                            key={sIdx} 
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setSelectedShop({ shops: shopList, initialIndex: sIdx, id: item.id }); 
                                            }}
                                            className="bg-white border rounded-xl px-2.5 py-2 text-[11px] text-left hover:opacity-80 active:scale-95 transition-all shadow-sm flex items-center gap-2 overflow-hidden"
                                            style={{ borderColor: currentTheme.border }}
                                          >
                                            <ShopIconComponent className="w-3.5 h-3.5 shrink-0 opacity-80" style={{ color: currentTheme.main }} />
                                            <span className="font-bold truncate flex-1" style={{ color: currentTheme.text }}>
                                              {shop.name || `店家 ${sIdx + 1}`}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                            </div>
                          </div>

                          {index < currentItems.length - 1 && (
                            <TransitCard
                              id={`transit-${item.id}`}
                              branchIndex={branchIndexMap[currentItems[index + 1]?.id] || branchIndexMap[item.id] || 0} 
                              defaultData={item.transit}
                              isViewer={isViewer}
                              themeId={themeId}
                              trip={trip}
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
            next.days[activeDayIndex].items.push({ id: `item-${Date.now()}`, time: "", type: "ATTRACTION", title: "新的行程", ticketIds: [], subtitle: "", address: "", openingHours: "", offDay: "", phone: "", notes: "", shops: [], link: "" });
            return next;
          })} className="w-full max-w-xs py-2.5 rounded-full border border-dashed bg-white text-xs font-bold shadow-sm active:scale-95 transition-all" style={{ borderColor: currentTheme.main, color: currentTheme.accent }}>
            ＋ 新增行程
          </button>
        </div>
      )}

      {/* 推薦店家清單瀏覽 Modal */}
      {selectedShop && (
        <ShopListModal
          shops={selectedShop.shops}
          themeId={themeId}
          initialIndex={selectedShop.initialIndex || 0}
          onClose={() => setSelectedShop(null)}
          onEdit={!isViewer ? () => setEditingItem(currentItems.find(i => i.id === selectedShop.id)) : null}
        />
      )}

      {/* 編輯行程 Modal */}
      {editingItem && !isViewer && (
        <EditItemModal
          item={editingItem} 
          trip={trip} 
          tickets={trip.tickets || []}
          themeId={themeId}
          onClose={() => setEditingItem(null)}
          onSave={(updated, targetDayIndex) => {
            setTrip((prev) => {
              const next = structuredClone(prev);
              
              if (targetDayIndex === undefined || targetDayIndex === activeDayIndex) {
                const items = next.days[activeDayIndex].items;
                const idx = items.findIndex((i) => i.id === updated.id);
                if (idx !== -1) items[idx] = updated;
              } else {
                next.days[activeDayIndex].items = next.days[activeDayIndex].items.filter(
                  (i) => i.id !== updated.id
                );
                
                if (next.days[targetDayIndex]) {
                  next.days[targetDayIndex].items.push(updated);
                }
              }
              return next;
            });
            setEditingItem(null);
          }}
        />
      )}
      {editingHero && !isViewer && <EditHeroModal dayData={editingHero} onClose={() => setEditingHero(null)} onSave={saveHero} themeId={themeId} />}
      {viewTicket && <TicketDetail ticket={viewTicket} onClose={() => setViewTicket(null)} themeId={themeId} />}
    </div>
  );
}