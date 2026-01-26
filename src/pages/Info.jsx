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
  Check
} from "lucide-react";

/* =========================
   預設 Info 結構
========================= */
const DEFAULT_INFO = {
  flights: [
    { id: "flight-out", direction: "去程", flightNo: "UA838", from: "KHH", to: "NRT", time: "11:30 - 15:55", baggage: "行李：23KG" },
    { id: "flight-back", direction: "回程", flightNo: "UA837", from: "NRT", to: "KHH", time: "17:50 - 21:20", baggage: "行李：23KG" },
  ],
  hotels: [
    {
      id: "hotel-1",
      name: "OMO3 東京赤坂 by 星野集團",
      dateRange: "3月11日 - 3月14日",
      addressLine1: "〒107-0052 東京都港區赤坂4丁目3-2",
      addressLine2: "4 Chome-3-2 Akasaka, Minato City, Tokyo 107-0052",
      phone: "+81-50-3134-8895",
    },
  ],
  visitJapan: { title: "Visit Japan Web", subtitle: "入境審查 & 海關申報（請截圖 QR Code）", url: "https://vjw-lp.digital.go.jp/" },
  emergency110: { label: "警察 (POLICE)", number: "110" },
  emergency119: { label: "救護／火警", number: "119" },
  jnto: { title: "訪日外國人 醫療＆急難熱線", subtitle: "JAPAN VISITOR HOTLINE (JNTO)", phone: "050-3816-2787", note: "※ 24小時對應（英／中／韓）。" },
  taipei: { badge: "外交部", title: "台北駐日經濟文化代表處", officePhone: "03-3280-7811", officeNote: "（上班時間）", emergencyPhone: "080-1009-7179", emergencyNote: "（急難救助）" },
};

export default function Info({ trip, setTrip }) {
  if (!trip) return null;
  const isReadOnly = trip?.shareMode === "viewer";

  useEffect(() => {
    if (!trip.info && !isReadOnly) {
      setTrip((prev) => ({ ...prev, info: DEFAULT_INFO }));
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
    label110: emergency110.label, number110: emergency110.number,
    label119: emergency119.label, number119: emergency119.number,
    jntoTitle: jnto.title, jntoSubtitle: jnto.subtitle, jntoPhone: jnto.phone, jntoNote: jnto.note,
    taipeiBadge: taipei.badge, taipeiTitle: taipei.title,
    taipeiOfficePhone: taipei.officePhone, taipeiOfficeNote: taipei.officeNote,
    taipeiEmergencyPhone: taipei.emergencyPhone, taipeiEmergencyNote: taipei.emergencyNote,
  });

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

  const openEditFlight = (f) => !isReadOnly && setEditingFlight(f || { id: `flight-${Date.now()}`, direction: "去程", flightNo: "", from: "", to: "", time: "", baggage: "" });
  const openEditHotel = (h) => !isReadOnly && setEditingHotel(h || { id: `hotel-${Date.now()}`, name: "", dateRange: "", addressLine1: "", addressLine2: "", phone: "" });
  const saveFlight = () => { if (isReadOnly) return; updateInfo({ flights: flights.some((f) => f.id === editingFlight.id) ? flights.map((f) => (f.id === editingFlight.id ? editingFlight : f)) : [...flights, editingFlight] }); setEditingFlight(null); };
  const saveHotel = () => { if (isReadOnly) return; updateInfo({ hotels: hotels.some((h) => h.id === editingHotel.id) ? hotels.map((h) => (h.id === editingHotel.id ? editingHotel : h)) : [...hotels, editingHotel] }); setEditingHotel(null); };

  const handleNavigation = (e, address) => {
    e.stopPropagation();
    if (!address) return;
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const telHref = (phone) => `tel:${phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "")}`;

  return (
    <div className="pb-24 space-y-10">
      <PageHeader icon={InfoIcon} title="行程資訊" subtitle="TRIP INFORMATION" />

      {/* 航班資訊 */}
      <section>
        <div className="flex items-center justify-between mb-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F7F1EB] flex items-center justify-center"><Plane className="w-4 h-4 text-[#8C6A4F]" /></div>
            <h2 className="text-base font-semibold text-[#5A4636]">航班資訊</h2>
          </div>
        </div>
        <div className="space-y-3 px-4">
          {flights.map((f) => (
            <div key={f.id} className="relative">
              {!isReadOnly && (
                <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
                  <button onClick={() => openEditFlight(f)} className="w-9 h-9 rounded-full bg-[#F7C85C] flex items-center justify-center shadow"><Pencil className="w-4 h-4 text-[#5A4636]" /></button>
                  <button onClick={() => updateInfo({ flights: flights.filter(x => x.id !== f.id) })} className="w-9 h-9 rounded-full bg-[#E35B5B] flex items-center justify-center shadow"><Trash2 className="w-4 h-4 text-white" /></button>
                </div>
              )}
              <div onClick={() => !isReadOnly && setOpenFlightId(openFlightId === f.id ? null : f.id)} style={{ transform: !isReadOnly && openFlightId === f.id ? "translateX(-100px)" : "translateX(0)", transition: "transform 0.3s ease" }} className="bg-white rounded-2xl shadow-sm border border-[#F0E3D5] px-4 py-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D88B4A] rounded-l-2xl" />
                <div className="flex items-center justify-between mb-3 pl-3">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#F7F1EB] text-xs text-[#8C6A4F] font-bold">{f.direction}</div>
                  <span className="text-xs text-[#8C6A4F] font-medium">{f.flightNo}</span>
                </div>
                <div className="flex items-center justify-between pl-3 mb-2 relative">
                  <span className="text-2xl font-bold text-[#5A4636] z-10">{f.from}</span>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Plane className="w-4 h-4 text-[#C6A087]" />
                  </div>
                  <span className="text-2xl font-bold text-[#5A4636] z-10">{f.to}</span>
                </div>
                <div className="flex items-center justify-between pl-3 text-[11px] text-[#8C6A4F] font-medium"><span>{f.time}</span><span>{f.baggage}</span></div>
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
                  <button onClick={() => openEditHotel(h)} className="w-9 h-9 rounded-full bg-[#F7C85C] flex items-center justify-center shadow"><Pencil className="w-4 h-4 text-[#5A4636]" /></button>
                  <button onClick={() => updateInfo({ hotels: hotels.filter(x => x.id !== h.id) })} className="w-9 h-9 rounded-full bg-[#E35B5B] flex items-center justify-center shadow"><Trash2 className="w-4 h-4 text-white" /></button>
                </div>
              )}
              <div onClick={() => !isReadOnly && setOpenHotelId(openHotelId === h.id ? null : h.id)} style={{ transform: !isReadOnly && openHotelId === h.id ? "translateX(-100px)" : "translateX(0)", transition: "transform 0.3s ease" }} className="bg-white rounded-2xl shadow-sm border border-[#F0E3D5] px-5 py-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#F7F1EB] text-xs text-[#8C6A4F] font-bold">HOTEL</div>
                  <div className="flex items-center gap-1 text-[11px] text-[#8C6A4F] font-medium"><CalendarDays className="w-3 h-3" /><span>{h.dateRange}</span></div>
                </div>
                <h3 className="text-xl font-bold text-[#5A4636] mb-3 leading-snug">{h.name}</h3>
                <div className="border-t border-[#F0E3D5] pt-3 mt-1 space-y-2 text-[13px] text-[#5A4636]">
                  {/* 地址：點擊導航功能與樣式優化 */}
                  <div 
                    onClick={(e) => handleNavigation(e, h.addressLine1)} 
                    className="flex items-start gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                  >
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
            <div className="w-8 h-8 rounded-full bg-[#F7F1EB] flex items-center justify-center"><BookUser className="w-5 h-5 text-[#8C6A4F]" /></div>
            <h2 className="text-base font-semibold text-[#5A4636]">Visit Japan Web</h2>
          </div>
          {!isReadOnly && <button onClick={() => { setVisitDraft(visitJapan); setVisitModalOpen(true); }} className="flex items-center gap-1 text-xs text-[#364D6E] px-2.5 py-1 rounded-full border border-[#A7C3EB] bg-white"><Pencil className="w-3 h-3" />編輯</button>}
        </div>
        <button onClick={() => window.open(visitJapan.url, "_blank")} className="w-full text-left bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-[#F0E3D5] active:bg-[#FDF9F5] transition-all">
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
          <div className="bg-white rounded-2xl border border-[#F0E3D5] p-3 text-center shadow-sm"><p className="text-[14px] text-[#8C6A4F] mb-1 font-medium">{emergency110.label}</p><p className="text-3xl font-bold text-[#B43737]">{emergency110.number}</p></div>
          <div className="bg-white rounded-2xl border border-[#F0E3D5] p-3 text-center shadow-sm"><p className="text-[14px] text-[#8C6A4F] mb-1 font-medium">{emergency119.label}</p><p className="text-3xl font-bold text-[#B43737]">{emergency119.number}</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-[#F0E3D5] p-4 shadow-sm"><p className="text-[18px] font-bold text-[#5A4636] mb-0.5">{jnto.title}</p><p className="text-[11px] text-[#8C6A4F] font-medium">{jnto.subtitle}</p><a href={telHref(jnto.phone)} className="block text-xl font-bold text-[#5A4636] my-2 underline underline-offset-4">{jnto.phone}</a><p className="text-[10px] text-[#8C6A4F] opacity-70 font-medium">{jnto.note}</p></div>
        <div className="bg-white rounded-2xl border border-[#F0E3D5] p-4 shadow-sm"><div className="flex items-center gap-2 mb-3"><div className="inline-flex px-2.5 py-0.5 rounded-full bg-[#F7F1EB] text-[12px] text-[#8C6A4F] font-bold shrink-0">{taipei.badge}</div><p className="text-[14px] font-bold text-[#5A4636] truncate">{taipei.title}</p></div><div className="space-y-2 text-[14px]"><div className="flex items-center justify-between font-medium"><a href={telHref(taipei.officePhone)} className="font-bold text-[#5A4636] underline">{taipei.officePhone}</a><span className="text-[14px] text-[#5A4636]">{taipei.officeNote}</span></div><div className="flex items-center justify-between font-medium"><a href={telHref(taipei.emergencyPhone)} className="font-bold text-[#B43737] underline">{taipei.emergencyPhone}</a><span className="text-[14px] text-[#B43737]">{taipei.emergencyNote}</span></div></div></div>
      </section>

      {/* --- Modals --- */}
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
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">去程 / 回程</label><input type="text" value={editingFlight.direction} onChange={(e) => setEditingFlight({...editingFlight, direction: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">航班</label><input type="text" value={editingFlight.flightNo} onChange={(e) => setEditingFlight({...editingFlight, flightNo: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-2 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">出發</label><input type="text" value={editingFlight.from} onChange={(e) => setEditingFlight({...editingFlight, from: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-2 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                    <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">抵達</label><input type="text" value={editingFlight.to} onChange={(e) => setEditingFlight({...editingFlight, to: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-2 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  </div>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">時間</label><input type="text" value={editingFlight.time} onChange={(e) => setEditingFlight({...editingFlight, time: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
                  <div><label className="block text-[10px] font-bold text-[#8C6A4F] mb-1.5 uppercase tracking-widest">行李</label><input type="text" value={editingFlight.baggage} onChange={(e) => setEditingFlight({...editingFlight, baggage: e.target.value})} className="w-full border border-[#E5D5C5] rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" /></div>
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