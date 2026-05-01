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
  Globe
} from "lucide-react";
import { THEMES } from "../App";

const DEFAULT_INFO = {
  flights: [
    { id: "flight-out", direction: "去程", flightNo: "UA838", airline: "聯合航空公司", airlineEn: "UNITED AIRLINES", from: "KHH", fromEn: "高雄國際機場", terminalFrom: "TERMINAL I", to: "NRT", toEn: "成田國際機場", terminalTo: "TERMINAL 1", timeStart: "11:30", timeEnd: "15:55", baggage: "23 KG / 1件" },
    { id: "flight-back", direction: "回程", flightNo: "UA837", airline: "聯合航空公司", airlineEn: "UNITED AIRLINES", from: "NRT", fromEn: "成田國際機場", terminalFrom: "TERMINAL 1", to: "KHH", toEn: "高雄國際機場", terminalTo: "TERMINAL I", timeStart: "17:50", timeEnd: "21:20", baggage: "23 KG / 1件" },
  ],
  hotels: [
    { id: "hotel-1", name: "OMO3 東京赤坂 by 星野集團", dateRange: "3月11日 - 3月14日", addressLine1: "〒107-0052 東京都港區赤坂4丁目3-2", addressLine2: "4 Chome-3-2 Akasaka, Minato City, Tokyo 107-0052", phone: "+81-50-3134-8895" },
  ],
  externalLink: { title: "Visit Japan Web", subtitle: "入境審查 & 海關申報", url: "https://vjw-lp.digital.go.jp/", badge: "Must Have" },
  emergency110: { label: "警察 (POLICE)", number: "110" },
  emergency119: { label: "救護／火警", number: "119" },
  jnto: { title: "訪日外國人 醫療＆急難熱線", subtitle: "JAPAN VISITOR HOTLINE", phone: "050-3816-2787", note: "※ 24小時對應。" },
  taipei: { badge: "外交部", title: "台北駐日經濟文化代表處", officePhone: "03-3280-7811", officeNote: "（上班）", emergencyPhone: "080-1009-7179", emergencyNote: "（急難）" },
};

export default function Info({ trip, setTrip, themeId }) {
  if (!trip) return null;
  const isReadOnly = trip?.shareMode === "viewer";
  const currentTheme = THEMES[themeId] || THEMES.milkTea;

  useEffect(() => {
    if (!trip.info && !isReadOnly) {
      setTrip((prev) => ({ ...prev, info: { ...DEFAULT_INFO, ...prev.info } }));
    }
  }, [trip, setTrip, isReadOnly]);

  const info = trip.info || DEFAULT_INFO;
  const linkData = info.externalLink || info.visitJapan || DEFAULT_INFO.externalLink;
  const { flights, hotels, emergency110, emergency119, jnto, taipei } = info;

  const updateInfo = (patch) => {
    if (isReadOnly) return;
    setTrip((prev) => ({ ...prev, info: { ...prev.info, ...patch } }));
  };

  const [openFlightId, setOpenFlightId] = useState(null);
  const [openHotelId, setOpenHotelId] = useState(null);
  const [editingFlight, setEditingFlight] = useState(null);
  const [editingHotel, setEditingHotel] = useState(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState(linkData);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  
  const [emDraft, setEmDraft] = useState({
    label110: emergency110?.label, number110: emergency110?.number, label119: emergency119?.label, number119: emergency119?.number,
    jntoTitle: jnto?.title, jntoSubtitle: jnto?.subtitle, jntoPhone: jnto?.phone, jntoNote: jnto?.note,
    taipeiBadge: taipei?.badge, taipeiTitle: taipei?.title, taipeiOfficePhone: taipei?.officePhone, taipeiOfficeNote: taipei?.officeNote,
    taipeiEmergencyPhone: taipei?.emergencyPhone, taipeiEmergencyNote: taipei?.emergencyNote,
  });

  const openEditFlight = (f) => !isReadOnly && setEditingFlight(f || { id: `flight-${Date.now()}`, direction: "去程", flightNo: "", airline: "", airlineEn: "", from: "", fromEn: "", terminalFrom: "", to: "", toEn: "", terminalTo: "", timeStart: "", timeEnd: "", baggage: "" });
  const saveFlight = () => { if (isReadOnly) return; updateInfo({ flights: flights.some((f) => f.id === editingFlight.id) ? flights.map((f) => (f.id === editingFlight.id ? editingFlight : f)) : [...flights, editingFlight] }); setEditingFlight(null); };
  const openEditHotel = (h) => !isReadOnly && setEditingHotel(h || { id: `hotel-${Date.now()}`, name: "", dateRange: "", addressLine1: "", addressLine2: "", phone: "" });
  const saveHotel = () => { if (isReadOnly) return; updateInfo({ hotels: hotels.some((h) => h.id === editingHotel.id) ? hotels.map((h) => (h.id === editingHotel.id ? editingHotel : h)) : [...hotels, editingHotel] }); setEditingHotel(null); };
  const saveLink = () => { updateInfo({ externalLink: linkDraft, visitJapan: undefined }); setLinkModalOpen(false); };
  
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

  const telHref = (phone) => `tel:${phone?.replace(/\s+/g, "").replace(/[^0-9+]/g, "")}`;

  return (
    <div className="pb-24 space-y-10">
      <PageHeader icon={InfoIcon} title="行程資訊" subtitle="TRIP INFORMATION" themeId={themeId} />

      {/* 航班資訊 */}
      <section>
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5" style={{ color: currentTheme.main }} />
            <h2 className="text-base font-semibold" style={{ color: currentTheme.text }}>航班資訊</h2>
          </div>
          {!isReadOnly && (
            <button onClick={() => openEditFlight(null)} className="px-3 py-1.5 rounded-full text-xs bg-white border font-bold shadow-sm" style={{ borderColor: currentTheme.border, color: currentTheme.text }}>
              ＋ 新增航班
            </button>
          )}
        </div>
        
        <div className="space-y-6 px-4">
          {flights.map((f) => (
            <div key={f.id} className="relative overflow-visible">
              {!isReadOnly && (
                <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3 z-0">
                  <button onClick={(e) => { e.stopPropagation(); openEditFlight(f); }} className="w-10 h-10 rounded-full bg-[#F7C85C] flex items-center justify-center shadow transition-transform active:scale-90"><Pencil className="w-5 h-5 text-[#5A4636]" /></button>
                  <button onClick={(e) => { e.stopPropagation(); updateInfo({ flights: flights.filter(x => x.id !== f.id) }); }} className="w-10 h-10 rounded-full bg-[#E35B5B] flex items-center justify-center shadow transition-transform active:scale-90"><Trash2 className="w-5 h-5 text-white" /></button>
                </div>
              )}
              
              <div 
                onClick={() => !isReadOnly && setOpenFlightId(openFlightId === f.id ? null : f.id)} 
                style={{ 
                  transform: !isReadOnly && openFlightId === f.id ? "translateX(-115px)" : "translateX(0)", 
                  transition: "transform 0.4s cubic-bezier(0.1, 0.7, 0.1, 1)",
                  WebkitMaskImage: "radial-gradient(circle at 71% 0px, transparent 21.5px, black 22px), radial-gradient(circle at 71% 100%, transparent 21.5px, black 22px)",
                  maskImage: "radial-gradient(circle at 71% 0px, transparent 21.5px, black 22px), radial-gradient(circle at 71% 100%, transparent 21.5px, black 22px)",
                  borderColor: currentTheme.border
                }} 
                className="bg-white rounded-[1.5rem] shadow-md border flex min-h-[160px] relative z-10 overflow-hidden"
              >
                <div className="flex-[7] p-6 pr-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[10px] font-bold mb-0.5 opacity-60" style={{ color: currentTheme.text }}>出發地</p>
                      <h4 className="text-2xl font-black tracking-tighter leading-tight" style={{ color: currentTheme.text }}>{f.from || "---"}</h4>
                    </div>
                    <div className="flex-[0.8] flex items-center justify-center pt-4 opacity-20 px-1">
                      <div className="w-full flex items-center">
                        <div className="flex-1 h-[1.5px] border-t-[1.5px] border-dotted" style={{ borderColor: currentTheme.text }} />
                        <Plane className="w-4 h-4 mx-0.5 shrink-0" fill="currentColor" style={{ color: currentTheme.text }} />
                        <div className="flex-1 h-[1.5px] border-t-[1.5px] border-dotted" style={{ borderColor: currentTheme.text }} />
                      </div>
                    </div>
                    <div className="flex-1 text-right min-w-0 pr-2">
                      <p className="text-[10px] font-bold mb-0.5 opacity-60" style={{ color: currentTheme.text }}>抵達地</p>
                      <h4 className="text-2xl font-black tracking-tighter leading-tight" style={{ color: currentTheme.text }}>{f.to || "---"}</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-start mt-1">
                    <div className="space-y-0.5 text-left">
                      <p className="text-[11px] font-bold text-[#333] leading-none truncate">{f.fromEn || "---"}</p>
                      <p className="text-[9px] font-black text-[#333] uppercase opacity-50">{f.terminalFrom || "---"}</p>
                    </div>
                    <div className="space-y-0.5 text-right pr-2">
                      <p className="text-[11px] font-bold text-[#333] leading-none truncate">{f.toEn || "---"}</p>
                      <p className="text-[9px] font-black text-[#333] uppercase opacity-50">{f.terminalTo || "---"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-5 px-0.5">
                    <div className="text-left">
                      <p className="text-[10px] font-bold mb-0.5 uppercase tracking-widest opacity-60" style={{ color: currentTheme.text }}>出發時間</p>
                      <p className="text-xl font-black tracking-tight leading-none text-[#444]">{f.timeStart || "--:--"}</p>
                    </div>
                    <div className="text-right pr-2">
                      <p className="text-[10px] font-bold mb-0.5 uppercase tracking-widest opacity-60" style={{ color: currentTheme.text }}>抵達時間</p>
                      <p className="text-xl font-black tracking-tight leading-none text-[#444]">{f.timeEnd || "--:--"}</p>
                    </div>
                  </div>
                </div>
                <div className="w-[4px] border-l-[4px] border-dashed my-8 relative" style={{ borderColor: currentTheme.border }} />
                <div className="flex-[3] p-6 pl-5 flex flex-col justify-between bg-[#FDFBF9]/40 relative">
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] font-bold mb-1 uppercase tracking-wider opacity-60" style={{ color: currentTheme.text }}>航班</p>
                    <h5 className="text-[12px] font-bold text-[#333] leading-tight truncate">{f.airline || "---"}</h5>
                    <p className="text-[8px] font-bold text-[#333] uppercase opacity-40 leading-none">{f.airlineEn || ""}</p>
                    <h4 className="text-xl font-black tracking-tighter mt-1 leading-none" style={{ color: currentTheme.text }}>{f.flightNo || "---"}</h4>
                  </div>
                  <div className="space-y-0.5 text-left mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 leading-none" style={{ color: currentTheme.text }}>行李</p>
                    <p className="text-[13px] font-black text-[#333] leading-tight">{f.baggage || "---"}</p>
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
            <BedDouble className="w-5 h-5" style={{ color: currentTheme.main }} />
            <h2 className="text-base font-semibold" style={{ color: currentTheme.text }}>住宿資訊</h2>
          </div>
          {!isReadOnly && (
            <button onClick={() => openEditHotel(null)} className="px-3 py-1.5 rounded-full text-xs bg-white border font-bold shadow-sm" style={{ borderColor: currentTheme.border, color: currentTheme.text }}>
              ＋ 新增住宿
            </button>
          )}
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
              <div 
                onClick={() => !isReadOnly && setOpenHotelId(openHotelId === h.id ? null : h.id)} 
                style={{ 
                  transform: !isReadOnly && openHotelId === h.id ? "translateX(-100px)" : "translateX(0)", 
                  transition: "transform 0.3s ease",
                  borderColor: currentTheme.border
                }} 
                className="bg-white rounded-3xl shadow-sm border px-5 py-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${currentTheme.main}15`, color: currentTheme.main }}>HOTEL</div>
                  <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: currentTheme.main }}><CalendarDays className="w-3 h-3" /><span>{h.dateRange}</span></div>
                </div>
                <h3 className="text-xl font-bold mb-3 leading-snug" style={{ color: currentTheme.text }}>{h.name}</h3>
                <div className="border-t pt-3 mt-1 space-y-2 text-[13px]" style={{ borderColor: `${currentTheme.border}40`, color: currentTheme.text }}>
                  <div onClick={(e) => handleNavigation(e, h.addressLine1)} className="flex items-start gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: currentTheme.main }} />
                    <div className="flex-1">
                      <p className="font-medium underline underline-offset-2">{h.addressLine1}</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed opacity-70">{h.addressLine2}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm pt-1">
                    <span className="opacity-70">電話：</span><a href={telHref(h.phone)} className="font-bold underline">{h.phone}</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 外部連結 */}
      <section className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {linkData.title.includes("Japan") ? <BookUser className="w-5 h-5" style={{ color: currentTheme.main }} /> : <Globe className="w-5 h-5" style={{ color: currentTheme.main }} />}
            <h2 className="text-base font-semibold" style={{ color: currentTheme.text }}>入境相關連結</h2>
          </div>
          {!isReadOnly && (
            <button onClick={() => { setLinkDraft(linkData); setLinkModalOpen(true); }} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border bg-white" style={{ borderColor: currentTheme.border, color: currentTheme.text }}>
              <Pencil className="w-3 h-3" />編輯
            </button>
          )}
        </div>
        <button onClick={() => window.open(linkData.url, "_blank")} className="w-full text-left bg-white rounded-[2rem] p-5 flex items-center justify-between shadow-sm border active:bg-black/5 transition-all" style={{ borderColor: currentTheme.border }}>
          <div className="min-w-0 flex-1">
            {linkData.badge && (
              <div className="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-bold mb-2 uppercase tracking-wider" style={{ backgroundColor: `${currentTheme.main}15`, color: currentTheme.main }}>{linkData.badge}</div>
            )}
            <h3 className="text-[17px] font-bold leading-tight" style={{ color: currentTheme.text }}>{linkData.title}</h3>
            <p className="text-[12px] mt-1 opacity-80" style={{ color: currentTheme.accent }}>{linkData.subtitle}</p>
          </div>
          <ExternalLink className="w-5 h-5 ml-4 shrink-0" style={{ color: currentTheme.main }} />
        </button>
      </section>

      {/* 緊急聯絡 */}
      <section className="px-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#B43737]" />
            <h2 className="text-base font-semibold text-[#B43737]">緊急聯絡＆支援</h2>
          </div>
          {!isReadOnly && <button onClick={() => { setEmDraft({ label110: emergency110?.label, number110: emergency110?.number, label119: emergency119?.label, number119: emergency119?.number, jntoTitle: jnto?.title, jntoSubtitle: jnto?.subtitle, jntoPhone: jnto?.phone, jntoNote: jnto?.note, taipeiBadge: taipei?.badge, taipeiTitle: taipei?.title, taipeiOfficePhone: taipei?.officePhone, taipeiOfficeNote: taipei?.officeNote, taipeiEmergencyPhone: taipei?.emergencyPhone, taipeiEmergencyNote: taipei?.emergencyNote }); setEmergencyModalOpen(true); }} className="flex items-center gap-1 text-xs text-[#B43737] px-2.5 py-1 rounded-full border border-[#F1C8C8] bg-white shadow-sm"><Pencil className="w-3 h-3" />編輯</button>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[2rem] border p-3 text-center shadow-sm" style={{ borderColor: currentTheme.border }}><p className="text-[14px] mb-1 font-medium" style={{ color: currentTheme.accent }}>{emergency110?.label}</p><p className="text-3xl font-bold text-[#B43737]">{emergency110?.number}</p></div>
          <div className="bg-white rounded-[2rem] border p-3 text-center shadow-sm" style={{ borderColor: currentTheme.border }}><p className="text-[14px] mb-1 font-medium" style={{ color: currentTheme.accent }}>{emergency119?.label}</p><p className="text-3xl font-bold text-[#B43737]">{emergency119?.number}</p></div>
        </div>
        <div className="bg-white rounded-[2rem] border p-6 shadow-sm" style={{ borderColor: currentTheme.border }}>
          <p className="text-[18px] font-bold mb-0.5" style={{ color: currentTheme.text }}>{jnto?.title}</p>
          <p className="text-[11px] font-medium" style={{ color: currentTheme.main }}>{jnto?.subtitle}</p>
          <a href={telHref(jnto?.phone)} className="block text-xl font-bold my-2 underline underline-offset-4" style={{ color: currentTheme.text }}>{jnto?.phone}</a>
          <p className="text-[10px] opacity-70 font-medium" style={{ color: currentTheme.accent }}>{jnto?.note}</p>
        </div>
        <div className="bg-white rounded-[2rem] border p-6 shadow-sm" style={{ borderColor: currentTheme.border }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-bold shrink-0" style={{ backgroundColor: `${currentTheme.main}15`, color: currentTheme.main }}>{taipei?.badge}</div>
            <p className="text-[14px] font-bold truncate" style={{ color: currentTheme.text }}>{taipei?.title}</p>
          </div>
          <div className="space-y-2 text-[14px]">
            <div className="flex items-center justify-between font-medium">
              <a href={telHref(taipei?.officePhone)} className="font-bold underline" style={{ color: currentTheme.text }}>{taipei?.officePhone}</a>
              <span className="text-[14px]" style={{ color: currentTheme.text }}>{taipei?.officeNote}</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <a href={telHref(taipei?.emergencyPhone)} className="font-bold text-[#B43737] underline">{taipei?.emergencyPhone}</a>
              <span className="text-[14px] text-[#B43737]">{taipei?.emergencyNote}</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Modals --- */}
      {(editingFlight || editingHotel || linkModalOpen || emergencyModalOpen) && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-6 overflow-y-auto">
          <div className="w-full max-w-lg rounded-[2.5rem] border shadow-2xl overflow-hidden mb-10 transition-all mx-auto bg-white" style={{ borderColor: currentTheme.border }}>
            <div className="px-6 py-4 flex items-center justify-between border-b bg-white/50" style={{ borderColor: `${currentTheme.border}40` }}>
              <h2 className="text-base font-bold truncate" style={{ color: currentTheme.text }}>
                {editingFlight ? "編輯航班資訊" : editingHotel ? "編輯住宿資訊" : linkModalOpen ? "編輯入境相關連結" : "編輯緊急聯絡資訊"}
              </h2>
              <button onClick={() => { setEditingFlight(null); setEditingHotel(null); setLinkModalOpen(false); setEmergencyModalOpen(false); }} className="w-8 h-8 rounded-full border flex items-center justify-center bg-white active:scale-95 transition-all" style={{ borderColor: currentTheme.border }}><X className="w-4 h-4" style={{ color: currentTheme.main }} /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {editingFlight && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>航空公司</label><input type="text" placeholder="例：聯合航空" value={editingFlight.airline} onChange={(e) => setEditingFlight({...editingFlight, airline: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>英文名稱</label><input type="text" placeholder="例：UNITED" value={editingFlight.airlineEn} onChange={(e) => setEditingFlight({...editingFlight, airlineEn: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>航班號</label><input type="text" placeholder="例：UA838" value={editingFlight.flightNo} onChange={(e) => setEditingFlight({...editingFlight, flightNo: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  </div>
                  <hr style={{ borderColor: `${currentTheme.border}40` }} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold" style={{ color: currentTheme.main }}>出發資訊</p>
                      <input type="text" placeholder="簡稱 (例：高雄)" value={editingFlight.from} onChange={(e) => setEditingFlight({...editingFlight, from: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} />
                      <input type="text" placeholder="全稱" value={editingFlight.fromEn} onChange={(e) => setEditingFlight({...editingFlight, fromEn: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} />
                      <input type="text" placeholder="航廈" value={editingFlight.terminalFrom} onChange={(e) => setEditingFlight({...editingFlight, terminalFrom: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} />
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold" style={{ color: currentTheme.main }}>抵達資訊</p>
                      <input type="text" placeholder="簡稱 (例：成田)" value={editingFlight.to} onChange={(e) => setEditingFlight({...editingFlight, to: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} />
                      <input type="text" placeholder="全稱" value={editingFlight.toEn} onChange={(e) => setEditingFlight({...editingFlight, toEn: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} />
                      <input type="text" placeholder="航廈" value={editingFlight.terminalTo} onChange={(e) => setEditingFlight({...editingFlight, terminalTo: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} />
                    </div>
                  </div>
                  <hr style={{ borderColor: `${currentTheme.border}40` }} />
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>起飛時間</label><input type="text" value={editingFlight.timeStart} onChange={(e) => setEditingFlight({...editingFlight, timeStart: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>抵達時間</label><input type="text" value={editingFlight.timeEnd} onChange={(e) => setEditingFlight({...editingFlight, timeEnd: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  </div>
                  <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>行李限制</label><input type="text" value={editingFlight.baggage} onChange={(e) => setEditingFlight({...editingFlight, baggage: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  <div className="pt-2 flex gap-3"><button onClick={() => setEditingFlight(null)} className="flex-1 py-3 rounded-2xl border text-sm font-bold bg-white active:scale-95 transition-all" style={{ borderColor: currentTheme.border, color: currentTheme.text }}>取消</button><button onClick={saveFlight} className="flex-1 py-3 rounded-2xl text-white text-sm font-bold shadow-md active:scale-95 transition-all" style={{ backgroundColor: currentTheme.main }}>儲存</button></div>
                </>
              )}
              {editingHotel && (
                <>
                  <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>名稱</label><input type="text" value={editingHotel.name} onChange={(e) => setEditingHotel({...editingHotel, name: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none bg-white shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>日期範圍</label><input type="text" value={editingHotel.dateRange} onChange={(e) => setEditingHotel({...editingHotel, dateRange: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>地址</label><input type="text" value={editingHotel.addressLine1} onChange={(e) => setEditingHotel({...editingHotel, addressLine1: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none mb-2 shadow-inner" style={{ borderColor: currentTheme.border }} /><input type="text" value={editingHotel.addressLine2} onChange={(e) => setEditingHotel({...editingHotel, addressLine2: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>電話</label><input type="text" value={editingHotel.phone} onChange={(e) => setEditingHotel({...editingHotel, phone: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  <div className="pt-2 flex gap-3"><button onClick={() => setEditingHotel(null)} className="flex-1 py-3 rounded-2xl border text-sm font-bold bg-white active:scale-95 transition-all" style={{ borderColor: currentTheme.border, color: currentTheme.text }}>取消</button><button onClick={saveHotel} className="flex-1 py-3 rounded-2xl text-white text-sm font-bold shadow-md active:scale-95 transition-all" style={{ backgroundColor: currentTheme.main }}>儲存</button></div>
                </>
              )}
              {linkModalOpen && (
                <>
                  <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>標籤 (例: Must Have)</label><input type="text" value={linkDraft.badge} onChange={(e) => setLinkDraft({...linkDraft, badge: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none bg-white shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>標題</label><input type="text" value={linkDraft.title} onChange={(e) => setLinkDraft({...linkDraft, title: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>說明</label><input type="text" value={linkDraft.subtitle} onChange={(e) => setLinkDraft({...linkDraft, subtitle: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  <div><label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: currentTheme.main }}>網址 (URL)</label><input type="text" value={linkDraft.url} onChange={(e) => setLinkDraft({...linkDraft, url: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  <div className="pt-2 flex gap-3"><button onClick={() => setLinkModalOpen(false)} className="flex-1 py-3 rounded-2xl border text-sm font-bold bg-white active:scale-95 transition-all" style={{ borderColor: currentTheme.border, color: currentTheme.text }}>取消</button><button onClick={saveLink} className="flex-1 py-3 rounded-2xl text-white text-sm font-bold shadow-md active:scale-95 transition-all" style={{ backgroundColor: currentTheme.main }}>儲存</button></div>
                </>
              )}
              {emergencyModalOpen && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: currentTheme.main }}>警察標籤</label><input type="text" value={emDraft.label110} onChange={(e) => setEmDraft({...emDraft, label110: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    <div><label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: currentTheme.main }}>號碼</label><input type="text" value={emDraft.number110} onChange={(e) => setEmDraft({...emDraft, number110: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: currentTheme.main }}>救護標籤</label><input type="text" value={emDraft.label119} onChange={(e) => setEmDraft({...emDraft, label119: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    <div><label className="block text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: currentTheme.main }}>號碼</label><input type="text" value={emDraft.number119} onChange={(e) => setEmDraft({...emDraft, number119: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  </div>
                  <hr style={{ borderColor: `${currentTheme.border}40` }} />
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: currentTheme.main }}>醫療支援</p>
                    <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>主標題</label><input type="text" value={emDraft.jntoTitle} onChange={(e) => setEmDraft({...emDraft, jntoTitle: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>副標題</label><input type="text" value={emDraft.jntoSubtitle} onChange={(e) => setEmDraft({...emDraft, jntoSubtitle: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>電話</label><input type="text" value={emDraft.jntoPhone} onChange={(e) => setEmDraft({...emDraft, jntoPhone: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>備註</label><input type="text" value={emDraft.jntoNote} onChange={(e) => setEmDraft({...emDraft, jntoNote: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                  </div>
                  <hr style={{ borderColor: `${currentTheme.border}40` }} />
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: currentTheme.main }}>駐外代表處</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>標籤 (例: 外交部)</label><input type="text" value={emDraft.taipeiBadge} onChange={(e) => setEmDraft({...emDraft, taipeiBadge: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                      <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>機構全名</label><input type="text" value={emDraft.taipeiTitle} onChange={(e) => setEmDraft({...emDraft, taipeiTitle: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>上班電話</label><input type="text" value={emDraft.taipeiOfficePhone} onChange={(e) => setEmDraft({...emDraft, taipeiOfficePhone: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                      <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>上班備註</label><input type="text" value={emDraft.taipeiOfficeNote} onChange={(e) => setEmDraft({...emDraft, taipeiOfficeNote: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>急難電話</label><input type="text" value={emDraft.taipeiEmergencyPhone} onChange={(e) => setEmDraft({...emDraft, taipeiEmergencyPhone: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                      <div><label className="block text-[10px] mb-1" style={{ color: currentTheme.main }}>急難備註</label><input type="text" value={emDraft.taipeiEmergencyNote} onChange={(e) => setEmDraft({...emDraft, taipeiEmergencyNote: e.target.value})} className="w-full border rounded-xl px-3 py-1.5 text-[13px] outline-none shadow-inner" style={{ borderColor: currentTheme.border }} /></div>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3"><button onClick={() => setEmergencyModalOpen(false)} className="flex-1 py-3 rounded-2xl border text-sm font-bold bg-white active:scale-95 transition-all" style={{ borderColor: currentTheme.border, color: currentTheme.text }}>取消</button><button onClick={saveEmergency} className="flex-1 py-3 rounded-2xl text-white text-sm font-bold shadow-md active:scale-95 transition-all" style={{ backgroundColor: currentTheme.main }}>儲存</button></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}