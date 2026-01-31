// src/pages/Info.jsx
import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import {
  Plane,
  BedDouble,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  MapPin,
  Info as InfoIcon,
  BookUser,
  ShieldAlert,
  Check,
  MoveRight
} from "lucide-react";

const DEFAULT_INFO = {
  flights: [
    { id: "flight-out", direction: "去程", flightNo: "UA838", airline: "聯合航空公司", airlineEn: "UNITED AIRLINES", from: "KHH", fromEn: "高雄國際機場", terminalFrom: "TERMINAL I", to: "NRT", toEn: "成田國際機場", terminalTo: "TERMINAL 1", timeStart: "11:30", timeEnd: "15:55", baggage: "23 KG / 1件" },
    { id: "flight-back", direction: "回程", flightNo: "UA837", airline: "聯合航空公司", airlineEn: "UNITED AIRLINES", from: "NRT", fromEn: "成田國際機場", terminalFrom: "TERMINAL 1", to: "KHH", toEn: "高雄國際機場", terminalTo: "TERMINAL I", timeStart: "17:50", timeEnd: "21:20", baggage: "23 KG / 1件" },
  ],
  hotels: [
    { id: "hotel-1", name: "OMO3 東京赤坂 by 星野集團", dateRange: "3月11日 - 3月14日", addressLine1: "〒107-0052 東京都港區赤坂4丁目3-2", addressLine2: "4 Chome-3-2 Akasaka, Minato City, Tokyo 107-0052", phone: "+81-50-3134-8895" },
  ],
  visitJapan: { title: "Visit Japan Web", subtitle: "入境審查 & 海關申報", url: "https://vjw-lp.digital.go.jp/" },
  emergency110: { label: "警察 (POLICE)", number: "110" },
  emergency119: { label: "救護／火警", number: "119" },
  jnto: { title: "訪日外國人 醫療＆急難熱線", subtitle: "JAPAN VISITOR HOTLINE", phone: "050-3816-2787", note: "※ 24小時對應。" },
  taipei: { badge: "外交部", title: "台北駐日經濟文化代表處", officePhone: "03-3280-7811", officeNote: "（上班）", emergencyPhone: "080-1009-7179", emergencyNote: "（急難）" },
};

export default function Info({ trip, setTrip }) {
  if (!trip) return null;
  const isReadOnly = trip?.shareMode === "viewer";

  useEffect(() => {
    if (!trip.info && !isReadOnly) {
      setTrip((prev) => ({ ...prev, info: { ...DEFAULT_INFO, ...prev.info } }));
    }
  }, [trip, setTrip, isReadOnly]);

  const info = trip.info || DEFAULT_INFO;
  const { flights, hotels, visitJapan, emergency110, emergency119, jnto, taipei } = info;

  const updateInfo = (patch) => {
    if (isReadOnly) return;
    setTrip((prev) => ({ ...prev, info: { ...prev.info, ...patch } }));
  };

  const [openFlightId, setOpenFlightId] = useState(null);
  const [openHotelId, setOpenHotelId] = useState(null);
  const [editingFlight, setEditingFlight] = useState(null);
  const [editingHotel, setEditingHotel] = useState(null);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitDraft, setVisitDraft] = useState(visitJapan);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  
  const [emDraft, setEmDraft] = useState({
    label110: emergency110.label, number110: emergency110.number, label119: emergency119.label, number119: emergency119.number,
    jntoTitle: jnto.title, jntoSubtitle: jnto.subtitle, jntoPhone: jnto.phone, jntoNote: jnto.note,
    taipeiBadge: taipei.badge, taipeiTitle: taipei.title, taipeiOfficePhone: taipei.officePhone, taipeiOfficeNote: taipei.officeNote,
    taipeiEmergencyPhone: taipei.emergencyPhone, taipeiEmergencyNote: taipei.emergencyNote,
  });

  const openEditFlight = (f) => !isReadOnly && setEditingFlight(f || { id: `flight-${Date.now()}`, direction: "去程", flightNo: "", airline: "", airlineEn: "", from: "", fromEn: "", terminalFrom: "", to: "", toEn: "", terminalTo: "", timeStart: "", timeEnd: "", baggage: "" });
  const saveFlight = () => { if (isReadOnly) return; updateInfo({ flights: flights.some((f) => f.id === editingFlight.id) ? flights.map((f) => (f.id === editingFlight.id ? editingFlight : f)) : [...flights, editingFlight] }); setEditingFlight(null); };
  const openEditHotel = (h) => !isReadOnly && setEditingHotel(h || { id: `hotel-${Date.now()}`, name: "", dateRange: "", addressLine1: "", addressLine2: "", phone: "" });
  const saveHotel = () => { if (isReadOnly) return; updateInfo({ hotels: hotels.some((h) => h.id === editingHotel.id) ? hotels.map((h) => (h.id === editingHotel.id ? editingHotel : h)) : [...hotels, editingHotel] }); setEditingHotel(null); };
  const saveVisit = () => { updateInfo({ visitJapan: visitDraft }); setVisitModalOpen(false); };
  const saveEmergency = () => {
    updateInfo({
      emergency110: { label: emDraft.label110, number: emDraft.number110 },
      emergency119: { label: emDraft.label119, number: emDraft.number119 },
      jnto: { title: emDraft.jntoTitle, subtitle: emDraft.jntoSubtitle, phone: emDraft.jntoPhone, note: emDraft.jntoNote },
      taipei: { badge: emDraft.taipeiBadge, title: emDraft.taipeiTitle, officePhone: emDraft.taipeiOfficePhone, officeNote: emDraft.taipeiOfficeNote, emergencyPhone: emDraft.taipeiEmergencyPhone, emergencyNote: emDraft.taipeiEmergencyNote },
    });
    setEmergencyModalOpen(false);
  };

  const handleNavigation = (e, address) => {
    e.stopPropagation();
    if (!address) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
  };

  const telHref = (phone) => `tel:${phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "")}`;

  return (
    <div className="pb-24 space-y-10">
      <PageHeader icon={InfoIcon} title="行程資訊" subtitle="TRIP INFORMATION" />

      {/* 航班資訊 */}
      <section>
        <div className="flex items-center justify-between mb-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#F7F1EB] flex items-center justify-center"><Plane className="w-3.5 h-3.5 text-[#5A4636]" /></div>
            <h2 className="text-sm font-bold text-[#5A4636]">航班資訊</h2>
          </div>
          {!isReadOnly && <button onClick={() => openEditFlight(null)} className="px-2.5 py-1 rounded-full text-[10px] bg-white border border-[#C6A087] text-[#5A4636] font-black shadow-sm">＋ 新增航班</button>}
        </div>
        
        <div className="space-y-5 px-4">
          {flights.map((f) => (
            <div key={f.id} className="relative overflow-visible">
              {!isReadOnly && (
                <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2 z-0">
                  <button onClick={(e) => { e.stopPropagation(); openEditFlight(f); }} className="w-8 h-8 rounded-full bg-[#F7C85C] flex items-center justify-center shadow active:scale-90 transition-transform"><Pencil className="w-4 h-4 text-[#5A4636]" /></button>
                  <button onClick={(e) => { e.stopPropagation(); updateInfo({ flights: flights.filter(x => x.id !== f.id) }); }} className="w-8 h-8 rounded-full bg-[#E35B5B] flex items-center justify-center shadow active:scale-90 transition-transform"><Trash2 className="w-4 h-4 text-white" /></button>
                </div>
              )}
              
              <div 
                onClick={() => !isReadOnly && setOpenFlightId(openFlightId === f.id ? null : f.id)} 
                style={{ transform: !isReadOnly && openFlightId === f.id ? "translateX(-100px)" : "translateX(0)", transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)" }} 
                className="bg-white rounded-[1.8rem] shadow-sm flex min-h-[150px] relative z-10 overflow-hidden"
              >
                {/* 實體大半圓：上下對齊虛線位置 */}
                <div className="absolute -top-4 left-[71%] -translate-x-1/2 w-9 h-9 bg-[#FDF9F5] rounded-full z-20" />
                <div className="absolute -bottom-4 left-[71%] -translate-x-1/2 w-9 h-9 bg-[#FDF9F5] rounded-full z-20" />

                {/* 票券左側 */}
                <div className="flex-[7.1] p-5 pr-8 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[10px] font-bold text-[#5A4636] mb-0.5 opacity-60">出發地</p>
                      <h4 className="text-2xl font-black text-[#5A4636] tracking-tighter leading-none">{f.from || "---"}</h4>
                    </div>
                    <div className="flex-[0.8] flex items-center justify-center pt-4 opacity-20 px-1">
                      <div className="w-full flex items-center">
                        <div className="flex-1 h-[1px] border-t border-dotted border-[#5A4636]" />
                        <Plane className="text-[#5A4636] w-3.5 h-3.5 mx-0.5 shrink-0" fill="currentColor" />
                        <div className="flex-1 h-[1px] border-t border-dotted border-[#5A4636]" />
                      </div>
                    </div>
                    <div className="flex-1 text-left ml-6">
                      <p className="text-[10px] font-bold text-[#5A4636] mb-0.5 opacity-60">抵達地</p>
                      <h4 className="text-2xl font-black text-[#5A4636] tracking-tighter leading-none">{f.to || "---"}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-start">
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-bold text-[#333] leading-none truncate">{f.fromEn || "---"}</p>
                      <p className="text-[8px] font-black text-[#333] uppercase opacity-50">{f.terminalFrom || "---"}</p>
                    </div>
                    <div className="space-y-0.5 text-left ml-6">
                      <p className="text-[10px] font-bold text-[#333] leading-none truncate">{f.toEn || "---"}</p>
                      <p className="text-[8px] font-black text-[#333] uppercase opacity-50">{f.terminalTo || "---"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 px-0.5">
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-[#5A4636] mb-0.5 uppercase tracking-widest opacity-60">DEPARTURE</p>
                      <p className="text-xl font-black text-[#444] tracking-tight">{f.timeStart || "--:--"}</p>
                    </div>
                    <div className="text-left flex-1 ml-6">
                      <p className="text-[9px] font-bold text-[#5A4636] mb-0.5 uppercase tracking-widest opacity-60">ARRIVAL</p>
                      <p className="text-xl font-black text-[#444] tracking-tight">{f.timeEnd || "--:--"}</p>
                    </div>
                  </div>
                </div>

                {/* 粗虛線分隔 */}
                <div className="absolute top-6 bottom-6 left-[71%] border-l-[3.5px] border-dashed border-[#E8DCCF]" style={{ height: 'calc(100% - 48px)' }} />

                {/* 票券右側 (存根聯) */}
                <div className="flex-[2.9] p-5 pl-7 flex flex-col justify-between bg-[#FDFBF9]/50 relative">
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] font-bold text-[#5A4636] mb-0.5 uppercase tracking-wider opacity-60">FLIGHT</p>
                    <h5 className="text-[11px] font-bold text-[#333] leading-tight truncate">{f.airline || "---"}</h5>
                    <p className="text-[8px] font-bold text-[#333] uppercase opacity-40 leading-none">{f.airlineEn || ""}</p>
                    <h4 className="text-xl font-black text-[#5A4636] tracking-tighter mt-1">{f.flightNo || "---"}</h4>
                  </div>

                  <div className="space-y-0.5 text-left mb-1">
                    <p className="text-[9px] font-bold text-[#5A4636] uppercase tracking-wider opacity-60 leading-none">BAGGAGE</p>
                    <p className="text-sm font-black text-[#333] leading-tight">{f.baggage || "---"}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 住宿資訊 */}
      <section>
        <div className="flex items-center justify-between mb-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F7F1EB] flex items-center justify-center"><BedDouble className="w-4 h-4 text-[#8C6A4F]" /></div>
            <h2 className="text-base font-semibold text-[#5A4636]">住宿資訊</h2>
          </div>
          {!isReadOnly && <button onClick={() => openEditHotel(null)} className="px-3 py-1.5 rounded-full text-xs bg-white border border-[#C6A087] text-[#5A4636] font-bold shadow-sm">＋ 新增住宿</button>}
        </div>
        <div className="space-y-3 px-4">
          {hotels.map((h) => (
            <div key={h.id} className="relative">
              {!isReadOnly && (
                <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
                  <button onClick={() => openEditHotel(h)} className="w-9 h-9 rounded-full bg-[#F7C85C] flex items-center justify-center shadow transition-transform active:scale-90"><Pencil className="w-4 h-4 text-[#5A4636]" /></button>
                  <button onClick={() => updateInfo({ hotels: hotels.filter(x => x.id !== h.id) })} className="w-9 h-9 rounded-full bg-[#E35B5B] flex items-center justify-center shadow transition-transform active:scale-90"><Trash2 className="w-4 h-4 text-white" /></button>
                </div>
              )}
              <div onClick={() => !isReadOnly && setOpenHotelId(openHotelId === h.id ? null : h.id)} style={{ transform: !isReadOnly && openHotelId === h.id ? "translateX(-100px)" : "translateX(0)", transition: "transform 0.3s ease" }} className="bg-white rounded-3xl shadow-sm border border-[#F0E3D5] px-5 py-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#F7F1EB] text-xs text-[#8C6A4F] font-bold">HOTEL</div>
                  <div className="flex items-center gap-1 text-[11px] text-[#8C6A4F] font-medium"><CalendarDays className="w-3 h-3" /><span>{h.dateRange}</span></div>
                </div>
                <h3 className="text-xl font-bold text-[#5A4636] mb-3 leading-snug">{h.name}</h3>
                <div className="border-t border-[#F0E3D5] pt-3 mt-1 space-y-2 text-[13px] text-[#5A4636]">
                  <div onClick={(e) => handleNavigation(e, h.addressLine1)} className="flex items-start gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                    <MapPin className="w-4 h-4 mt-0.5 text-[#C6A087] shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium underline underline-offset-2">{h.addressLine1}</p>
                      <p className="text-[11px] text-[#8C6A4F]/70 mt-0.5 leading-relaxed">{h.addressLine2}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm pt-1">
                    <span className="text-[#8C6A4F]">電話：</span><a href={telHref(h.phone)} className="font-bold text-[#5A4636] underline">{h.phone}</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visit Japan Web */}
      <section className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F7F1EB] flex items-center justify-center"><BookUser className="w-5 h-5 text-[#3E5370]" /></div>
            <h2 className="text-base font-semibold text-[#3E5370]">Visit Japan Web</h2>
          </div>
          {!isReadOnly && <button onClick={() => { setVisitDraft(visitJapan); setVisitModalOpen(true); }} className="flex items-center gap-1 text-xs text-[#364D6E] px-2.5 py-1 rounded-full border border-[#A7C3EB] bg-white"><Pencil className="w-3 h-3" />編輯</button>}
        </div>
        <button onClick={() => window.open(visitJapan.url, "_blank")} className="w-full text-left bg-white rounded-[2rem] p-5 flex items-center justify-between shadow-sm border border-[#F0E3D5] active:bg-[#FDF9F5] transition-all">
          <div className="min-w-0 flex-1">
            <div className="inline-flex px-2.5 py-0.5 rounded-full bg-[#E7EEF9] text-[12px] text-[#4A607F] font-bold mb-2 uppercase tracking-wider">Must Have</div>
            <h3 className="text-[17px] font-bold text-[#5A4636] leading-tight">{visitJapan.title}</h3>
            <p className="text-[12px] text-[#8C6A4F] mt-1 opacity-80">{visitJapan.subtitle}</p>
          </div>
          <ExternalLink className="w-5 h-5 text-[#364D6E] ml-4 shrink-0" />
        </button>
      </section>

      {/* 緊急聯絡 */}
      <section className="px-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1"><div className="w-8 h-8 flex items-center justify-center"><ShieldAlert className="w-5 h-5 text-[#B43737]" /></div><h2 className="text-base font-semibold text-[#B43737]">緊急聯絡＆支援</h2></div>
          {!isReadOnly && <button onClick={() => { setEmDraft({ label110: emergency110.label, number110: emergency110.number, label119: emergency119.label, number119: emergency119.number, jntoTitle: jnto.title, jntoSubtitle: jnto.subtitle, jntoPhone: jnto.phone, jntoNote: jnto.note, taipeiBadge: taipei.badge, taipeiTitle: taipei.title, taipeiOfficePhone: taipei.officePhone, taipeiOfficeNote: taipei.officeNote, taipeiEmergencyPhone: taipei.emergencyPhone, taipeiEmergencyNote: taipei.emergencyNote }); setEmergencyModalOpen(true); }} className="flex items-center gap-1 text-xs text-[#B43737] px-2.5 py-1 rounded-full border border-[#F1C8C8] bg-white shadow-sm"><Pencil className="w-3 h-3" />編輯</button>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[2rem] border border-[#F0E3D5] p-3 text-center shadow-sm"><p className="text-[14px] text-[#8C6A4F] mb-1 font-medium">{emergency110.label}</p><p className="text-3xl font-bold text-[#B43737]">{emergency110.number}</p></div>
          <div className="bg-white rounded-[2rem] border border-[#F0E3D5] p-3 text-center shadow-sm"><p className="text-[14px] text-[#8C6A4F] mb-1 font-medium">{emergency119.label}</p><p className="text-3xl font-bold text-[#B43737]">{emergency119.number}</p></div>
        </div>
        <div className="bg-white rounded-[2rem] border border-[#F0E3D5] p-6 shadow-sm"><p className="text-[18px] font-bold text-[#5A4636] mb-0.5">{jnto.title}</p><p className="text-[11px] text-[#8C6A4F] font-medium">{jnto.subtitle}</p><a href={telHref(jnto.phone)} className="block text-xl font-bold text-[#5A4636] my-2 underline underline-offset-4">{jnto.phone}</a><p className="text-[10px] text-[#8C6A4F] opacity-70 font-medium">{jnto.note}</p></div>
        <div className="bg-white rounded-[2rem] border border-[#F0E3D5] p-6 shadow-sm"><div className="flex items-center gap-2 mb-3"><div className="inline-flex px-2.5 py-0.5 rounded-full bg-[#F7F1EB] text-[12px] text-[#8C6A4F] font-bold shrink-0">{taipei.badge}</div><p className="text-[14px] font-bold text-[#5A4636] truncate">{taipei.title}</p></div><div className="space-y-2 text-[14px]"><div className="flex items-center justify-between font-medium"><a href={telHref(taipei.officePhone)} className="font-bold text-[#5A4636] underline">{taipei.officePhone}</a><span className="text-[14px] text-[#5A4636]">{taipei.officeNote}</span></div><div className="flex items-center justify-between font-medium"><a href={telHref(taipei.emergencyPhone)} className="font-bold text-[#B43737] underline">{taipei.emergencyPhone}</a><span className="text-[14px] text-[#B43737]">{taipei.emergencyNote}</span></div></div></div>
      </section>

      {/* --- Modals 保持不變 --- */}
      {(editingFlight || editingHotel || visitModalOpen || emergencyModalOpen) && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-6 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#FFF9F2] rounded-[2.5rem] border border-[#E5D5C5] shadow-2xl overflow-hidden mb-10 transition-all mx-auto">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5D5C5]/50 bg-white/50">
              <h2 className="text-base font-bold text-[#5A4636] truncate">
                {editingFlight ? "編輯航班資訊" : editingHotel ? "編輯住宿資訊" : visitModalOpen ? "編輯 Visit Japan Web" : "編輯緊急聯絡資訊"}
              </h2>
              <button onClick={() => { setEditingFlight(null); setEditingHotel(null); setVisitModalOpen(false); setEmergencyModalOpen(false); }} className="w-8 h-8 rounded-full border border-[#E5D5C5] flex items-center justify-center bg-white active:scale-95 transition-all"><X className="w-4 h-4 text-[#8C6A4F]" /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {editingFlight && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">航空公司</label><input type="text" placeholder="例：聯合航空" value={editingFlight.airline} onChange={(e) => setEditingFlight({...editingFlight, airline: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">英文名稱</label><input type="text" placeholder="例：UNITED" value={editingFlight.airlineEn} onChange={(e) => setEditingFlight({...editingFlight, airlineEn: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">航班號</label><input type="text" placeholder="例：UA838" value={editingFlight.flightNo} onChange={(e) => setEditingFlight({...editingFlight, flightNo: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">類型 (去/回)</label><input type="text" value={editingFlight.direction} onChange={(e) => setEditingFlight({...editingFlight, direction: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  </div>
                  <hr className="border-[#E5D5C5]/50" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-[#C6A087]">出發資訊</p>
                      <input type="text" placeholder="簡稱 (例：高雄)" value={editingFlight.from} onChange={(e) => setEditingFlight({...editingFlight, from: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" />
                      <input type="text" placeholder="全名 (例：高雄國際機場)" value={editingFlight.fromEn} onChange={(e) => setEditingFlight({...editingFlight, fromEn: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" />
                      <input type="text" placeholder="航廈" value={editingFlight.terminalFrom} onChange={(e) => setEditingFlight({...editingFlight, terminalFrom: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-[#C6A087]">抵達資訊</p>
                      <input type="text" placeholder="簡稱 (例：成田)" value={editingFlight.to} onChange={(e) => setEditingFlight({...editingFlight, to: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" />
                      <input type="text" placeholder="全名 (例：成田國際機場)" value={editingFlight.toEn} onChange={(e) => setEditingFlight({...editingFlight, toEn: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" />
                      <input type="text" placeholder="航廈" value={editingFlight.terminalTo} onChange={(e) => setEditingFlight({...editingFlight, terminalTo: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" />
                    </div>
                  </div>
                  <hr className="border-[#E5D5C5]/50" />
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">起飛時間</label><input type="text" value={editingFlight.timeStart} onChange={(e) => setEditingFlight({...editingFlight, timeStart: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">抵達時間</label><input type="text" value={editingFlight.timeEnd} onChange={(e) => setEditingFlight({...editingFlight, timeEnd: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  </div>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">行李限制</label><input type="text" value={editingFlight.baggage} onChange={(e) => setEditingFlight({...editingFlight, baggage: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  <div className="pt-2 flex gap-3"><button onClick={() => setEditingFlight(null)} className="flex-1 py-3 rounded-2xl border border-[#E5D5C5] text-sm text-[#8C6A4F] font-bold bg-white active:scale-95 transition-all">取消</button><button onClick={saveFlight} className="flex-1 py-3 rounded-2xl bg-[#C6A087] text-white text-sm font-bold shadow-md active:scale-95 transition-all">儲存</button></div>
                </>
              )}
              {editingHotel && (
                <>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">名稱</label><input type="text" value={editingHotel.name} onChange={(e) => setEditingHotel({...editingHotel, name: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none bg-white shadow-inner" /></div>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">日期範圍</label><input type="text" value={editingHotel.dateRange} onChange={(e) => setEditingHotel({...editingHotel, dateRange: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">地址（第一行）</label><input type="text" value={editingHotel.addressLine1} onChange={(e) => setEditingHotel({...editingHotel, addressLine1: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none mb-2 shadow-inner" /><input type="text" value={editingHotel.addressLine2} onChange={(e) => setEditingHotel({...editingHotel, addressLine2: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">電話</label><input type="text" value={editingHotel.phone} onChange={(e) => setEditingHotel({...editingHotel, phone: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  <div className="pt-2 flex gap-3"><button onClick={() => setEditingHotel(null)} className="flex-1 py-3 rounded-2xl border border-[#E5D5C5] text-sm text-[#8C6A4F] font-bold bg-white active:scale-95 transition-all">取消</button><button onClick={saveHotel} className="flex-1 py-3 rounded-2xl bg-[#C6A087] text-white text-sm font-bold shadow-md active:scale-95 transition-all">儲存</button></div>
                </>
              )}
              {visitModalOpen && (
                <>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">標題</label><input type="text" value={visitDraft.title} onChange={(e) => setVisitDraft({...visitDraft, title: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none bg-white shadow-inner" /></div>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">說明</label><input type="text" value={visitDraft.subtitle} onChange={(e) => setVisitDraft({...visitDraft, subtitle: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">網址</label><input type="text" value={visitDraft.url} onChange={(e) => setVisitDraft({...visitDraft, url: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  <div className="pt-2 flex gap-3"><button onClick={() => setVisitModalOpen(false)} className="flex-1 py-3 rounded-2xl border border-[#E5D5C5] text-sm text-[#8C6A4F] font-bold bg-white active:scale-95 transition-all">取消</button><button onClick={saveVisit} className="flex-1 py-3 rounded-2xl bg-[#C6A087] text-white text-sm font-bold shadow-md active:scale-95 transition-all">儲存</button></div>
                </>
              )}
              {emergencyModalOpen && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">警察標籤</label><input type="text" value={emDraft.label110} onChange={(e) => setEmDraft({...emDraft, label110: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">號碼</label><input type="text" value={emDraft.number110} onChange={(e) => setEmDraft({...emDraft, number110: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">救護標籤</label><input type="text" value={emDraft.label119} onChange={(e) => setEmDraft({...emDraft, label119: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1 uppercase tracking-widest">號碼</label><input type="text" value={emDraft.number119} onChange={(e) => setEmDraft({...emDraft, number119: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  </div>
                  <hr className="border-[#E5D5C5]/50" />
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-[#C6A087] uppercase tracking-[0.2em]">醫療支援 (JNTO)</p>
                    <div><label className="block text-[10px] text-[#8C6A4F] mb-1">主標題</label><input type="text" value={emDraft.jntoTitle} onChange={(e) => setEmDraft({...emDraft, jntoTitle: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] text-[#8C6A4F] mb-1">副標題</label><input type="text" value={emDraft.jntoSubtitle} onChange={(e) => setEmDraft({...emDraft, jntoSubtitle: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] text-[#8C6A4F] mb-1">電話</label><input type="text" value={emDraft.jntoPhone} onChange={(e) => setEmDraft({...emDraft, jntoPhone: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] text-[#8C6A4F] mb-1">備註</label><input type="text" value={emDraft.jntoNote} onChange={(e) => setEmDraft({...emDraft, jntoNote: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  </div>
                  <hr className="border-[#E5D5C5]/50" />
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-[#C6A087] uppercase tracking-[0.2em]">駐外代表處</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] text-[#8C6A4F] mb-1">標籤</label><input type="text" value={emDraft.taipeiBadge} onChange={(e) => setEmDraft({...emDraft, taipeiBadge: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                      <div><label className="block text-[10px] text-[#8C6A4F] mb-1">全名</label><input type="text" value={emDraft.taipeiTitle} onChange={(e) => setEmDraft({...emDraft, taipeiTitle: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] text-[#8C6A4F] mb-1">上班電話</label><input type="text" value={emDraft.taipeiOfficePhone} onChange={(e) => setEmDraft({...emDraft, taipeiOfficePhone: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                      <div><label className="block text-[10px] text-[#8C6A4F] mb-1">上班備註</label><input type="text" value={emDraft.taipeiOfficeNote} onChange={(e) => setEmDraft({...emDraft, taipeiOfficeNote: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] text-[#8C6A4F] mb-1">急難電話</label><input type="text" value={emDraft.taipeiEmergencyPhone} onChange={(e) => setEmDraft({...emDraft, taipeiEmergencyPhone: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                      <div><label className="block text-[10px] text-[#8C6A4F] mb-1">急難備註</label><input type="text" value={emDraft.taipeiEmergencyNote} onChange={(e) => setEmDraft({...emDraft, taipeiEmergencyNote: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3"><button onClick={() => setEmergencyModalOpen(false)} className="flex-1 py-3 rounded-2xl border border-[#E5D5C5] text-sm text-[#8C6A4F] font-bold bg-white active:scale-95 transition-all">取消</button><button onClick={saveEmergency} className="flex-1 py-3 rounded-2xl bg-[#C6A087] text-white text-sm font-bold shadow-md active:scale-95 transition-all">儲存</button></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}