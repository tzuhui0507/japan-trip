// src/pages/Info.jsx
import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import {
  Plane,
  BedDouble,
  Shield,
  PhoneCall,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  MapPin,
  Info as InfoIcon,
} from "lucide-react";

/* =========================
   預設 Info 結構（只定義）
========================= */
const DEFAULT_INFO = {
  flights: [
    {
      id: "flight-out",
      direction: "去程",
      flightNo: "UA838",
      from: "KHH",
      to: "NRT",
      time: "11:30 - 15:55",
      baggage: "行李：23KG",
    },
    {
      id: "flight-back",
      direction: "回程",
      flightNo: "UA837",
      from: "NRT",
      to: "KHH",
      time: "17:50 - 21:20",
      baggage: "行李：23KG",
    },
  ],
  hotels: [
    {
      id: "hotel-1",
      name: "OMO3 東京赤坂 by 星野集團",
      dateRange: "3月11日 - 3月14日",
      addressLine1: "〒107-0052 東京都港区赤坂4丁目3-2",
      addressLine2:
        "4 Chome-3-2 Akasaka, Minato City, Tokyo 107-0052 日本",
      phone: "+81-50-3134-8895",
    },
  ],
  visitJapan: {
    title: "Visit Japan Web",
    subtitle: "入境審查 & 海關申報（請截圖 QR Code）",
    url: "https://vjw-lp.digital.go.jp/",
  },
  emergency110: {
    label: "警察 (POLICE)",
    number: "110",
  },
  emergency119: {
    label: "救護／火警",
    number: "119",
  },
  jnto: {
    title: "訪日外國人 醫療＆急難熱線",
    subtitle: "JAPAN VISITOR HOTLINE (JNTO)",
    phone: "050-3816-2787",
    note: "※ 24小時對應（英／中／韓）。",
  },
  taipei: {
    badge: "外交部",
    title: "台北駐日經濟文化代表處",
    officePhone: "03-3280-7811",
    officeNote: "（上班時間）",
    emergencyPhone: "080-1009-7179",
    emergencyNote: "（急難救助）",
  },
};

export default function Info({ trip, setTrip }) {
  if (!trip) return null;

  const isReadOnly = trip?.shareMode === "viewer";

  /* =========================
     初始化 info（只跑一次）
  ========================= */
  useEffect(() => {
    if (!trip.info) {
      
      if (isReadOnly) return;

      setTrip((prev) => ({
        ...prev,
        info: DEFAULT_INFO,
      }));
    }
  }, [trip, setTrip]);

  const info = trip.info || DEFAULT_INFO;

  const {
    flights,
    hotels,
    visitJapan,
    emergency110,
    emergency119,
    jnto,
    taipei,
  } = info;

  /* =========================
     寫回 trip.info 的工具
  ========================= */
  const updateInfo = (patch) => {
    if (isReadOnly) return;
    setTrip((prev) => ({
      ...prev,
      info: {
        ...prev.info,
        ...patch,
      },
    }));
  };

  /* =========================
     以下：全部是你原本的狀態與 UI
     👉 只有 setXXX 改成 updateInfo
  ========================= */

  const [openFlightId, setOpenFlightId] = useState(null);
  const [openHotelId, setOpenHotelId] = useState(null);

  const [editingFlight, setEditingFlight] = useState(null);
  const [editingHotel, setEditingHotel] = useState(null);
  const [visitModalOpen, setVisitModalOpen] = useState(false);

  // Visit Japan Modal 控制
  const [visitDraft, setVisitDraft] = useState(visitJapan);

  const openVisitModal = () => {
    setVisitDraft(visitJapan);
    if (isReadOnly) return;
    setVisitModalOpen(true);
  };

  const saveVisit = () => {
    updateInfo({ visitJapan: visitDraft });
    if (isReadOnly) return;
    setVisitModalOpen(false);
  };

  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Emergency Modal 控制
  const [emDraft, setEmDraft] = useState({
    emergency110: emergency110.number,
    emergency119: emergency119.number,
    jntoPhone: jnto.phone,
    taipeiOfficePhone: taipei.officePhone,
    taipeiEmergencyPhone: taipei.emergencyPhone,
  });

  const openEmergencyModal = () => {
    setEmDraft({
      emergency110: emergency110.number,
      emergency119: emergency119.number,
      jntoPhone: jnto.phone,
      taipeiOfficePhone: taipei.officePhone,
      taipeiEmergencyPhone: taipei.emergencyPhone,
    });
    if (isReadOnly) return;
    setEmergencyModalOpen(true);
  };

  const saveEmergency = () => {
    updateInfo({
      emergency110: { ...emergency110, number: emDraft.emergency110 },
      emergency119: { ...emergency119, number: emDraft.emergency119 },
      jnto: { ...jnto, phone: emDraft.jntoPhone },
      taipei: {
        ...taipei,
        officePhone: emDraft.taipeiOfficePhone,
        emergencyPhone: emDraft.taipeiEmergencyPhone,
      },
    });
    if (isReadOnly) return;
    setEmergencyModalOpen(false);
  };  

  /* ===== 開啟編輯 Modal ===== */
  const openEditFlight = (flight) => {
    if (isReadOnly) return;
    setEditingFlight(
      flight || {
        id: `flight-${Date.now()}`,
        direction: "去程",
        flightNo: "",
        from: "",
        to: "",
        time: "",
        baggage: "",
      }
    );
  };

  const openEditHotel = (hotel) => {
    if (isReadOnly) return;
    setEditingHotel(
      hotel || {
        id: `hotel-${Date.now()}`,
        name: "",
        dateRange: "",
        addressLine1: "",
        addressLine2: "",
        phone: "",
      }
    );
  };

  const toggleFlightSlide = (id) =>
    setOpenFlightId((p) => (p === id ? null : id));

  const toggleHotelSlide = (id) =>
    setOpenHotelId((p) => (p === id ? null : id));

  const saveFlight = () => {
    if (isReadOnly) return;
    updateInfo({
      flights: flights.some((f) => f.id === editingFlight.id)
        ? flights.map((f) =>
            f.id === editingFlight.id ? editingFlight : f
          )
        : [...flights, editingFlight],
    });
    setEditingFlight(null);
  };

  const deleteFlight = (id) => {
    if (isReadOnly) return;
    updateInfo({
      flights: flights.filter((f) => f.id !== id),
    });
    setOpenFlightId(null);
  };

  const saveHotel = () => {
    if (isReadOnly) return;
    updateInfo({
      hotels: hotels.some((h) => h.id === editingHotel.id)
        ? hotels.map((h) =>
            h.id === editingHotel.id ? editingHotel : h
          )
        : [...hotels, editingHotel],
    });
    setEditingHotel(null);
  };

  const deleteHotel = (id) => {
    if (isReadOnly) return;
    updateInfo({
      hotels: hotels.filter((h) => h.id !== id),
    });
    setOpenHotelId(null);
  };

  const telHref = (phone) =>
    `tel:${phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "")}`;

// -------------------------------------------------------
// UI
// -------------------------------------------------------

return (
<div className="pb-24 space-y-10">

<PageHeader
  icon={InfoIcon}
  title="行程資訊"
  subtitle="TRIP INFORMATION"
/>

{/* 航班資訊 */}
<section>
<div className="flex items-center justify-between mb-3 px-4">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-[#F7F1EB] flex items-center justify-center">
<Plane className="w-4 h-4 text-[#8C6A4F]" />
</div>
<h2 className="text-base font-semibold text-[#5A4636]">
航班資訊
</h2>
</div>
</div>

<div className="space-y-3 px-4">
{flights.map((f) => {
const isOpen = openFlightId === f.id;
return (
<div key={f.id} className="relative">

{/* 右側編輯按鈕 */}
{!isReadOnly && (
<div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
<button
  type="button"
  onClick={(e) => {
    if (isReadOnly) return;
    e.stopPropagation();
    openEditFlight(f);
  }}
className="w-9 h-9 rounded-full bg-[#F7C85C] flex items-center justify-center shadow"
>
<Pencil className="w-4 h-4 text-[#5A4636]" />
</button>
<button
  type="button"
  onClick={(e) => {
    if (isReadOnly) return;
    e.stopPropagation();
    deleteFlight(f.id);
  }}
className="w-9 h-9 rounded-full bg-[#E35B5B] flex items-center justify-center shadow"
>
<Trash2 className="w-4 h-4 text-white" />
</button>
</div>
)}

{/* 卡片 */}
<div
onClick={() => toggleFlightSlide(f.id)}
style={{
transform: isOpen ? "translateX(-100px)" : "translateX(0)",
transition: "transform 0.3s ease",
}}
className="bg-white rounded-2xl shadow-sm border border-[#F0E3D5] px-4 py-3 relative overflow-hidden"
>
{/* 左側橘色條 */}
<div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D88B4A] rounded-l-2xl" />

<div className="flex items-center justify-between mb-3 pl-3">
<div className="inline-flex items-center px-3 py-1 rounded-full bg-[#F7F1EB] text-xs text-[#8C6A4F]">
{f.direction}
</div>
<span className="text-xs text-[#8C6A4F]">{f.flightNo}</span>
</div>

<div className="flex items-center justify-between pl-3 mb-2">
<span className="text-2xl font-semibold text-[#5A4636]">
{f.from}
</span>
<Plane className="w-4 h-4 text-[#C6A087]" />
<span className="text-2xl font-semibold text-[#5A4636]">
{f.to}
</span>
</div>

<div className="flex items-center justify-between pl-3 text-xs text-[#8C6A4F]">
<span>{f.time}</span>
<span>{f.baggage}</span>
</div>
</div>
</div>
);
})}
</div>
</section>

{/* ------------------ 住宿資訊 ------------------ */}
<section>
<div className="flex items-center justify-between mb-3 px-4">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-[#F7F1EB] flex items-center justify-center">
<BedDouble className="w-4 h-4 text-[#8C6A4F]" />
</div>
<h2 className="text-base font-semibold text-[#5A4636]">
住宿資訊
</h2>
</div>

{!isReadOnly && (
<button
type="button"
onClick={() => openEditHotel(null)}
className="px-3 py-1.5 rounded-full text-xs bg-white border border-[#C6A087] text-[#5A4636] hover:bg-[#F7F1EB]"
>
＋ 新增住宿
</button>
)}
</div>

<div className="space-y-3 px-4">
{hotels.map((h) => {
const isOpen = openHotelId === h.id;
return (
<div key={h.id} className="relative">

{/* 右側按鈕 */}
{!isReadOnly && (
<div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
<button
  type="button"
  onClick={(e) => {
    if (isReadOnly) return;
    e.stopPropagation();
    openEditHotel(h);
  }}
className="w-9 h-9 rounded-full bg-[#F7C85C] flex items-center justify-center shadow"
>
<Pencil className="w-4 h-4 text-[#5A4636]" />
</button>
<button
  type="button"
  onClick={(e) => {
    if (isReadOnly) return;
    e.stopPropagation();
    deleteHotel(h.id);
  }}
className="w-9 h-9 rounded-full bg-[#E35B5B] flex items-center justify-center shadow"
>
<Trash2 className="w-4 h-4 text-white" />
</button>
</div>
)}

{/* 卡片 */}
<div
onClick={() => toggleHotelSlide(h.id)}
style={{
transform: isOpen ? "translateX(-100px)" : "translateX(0)",
transition: "transform 0.3s ease",
}}
className="bg-white rounded-2xl shadow-sm border border-[#F0E3D5] px-5 py-4 relative overflow-hidden"
>
<div className="flex items-center justify-between mb-3">
<div className="inline-flex items-center px-4 py-1 rounded-full bg-[#F7F1EB] text-xs text-[#8C6A4F] font-semibold">
HOTEL
</div>

<div className="flex items-center gap-1 text-xs text-[#8C6A4F]">
<CalendarDays className="w-3 h-3" />
<span>{h.dateRange}</span>
</div>
</div>

<h3 className="text-xl font-semibold text-[#5A4636] mb-3 leading-snug">
{h.name}
</h3>

<div className="border-t border-[#F0E3D5] pt-3 mt-1 space-y-1 text-sm text-[#5A4636]">
<div className="flex items-start gap-2">
<MapPin className="w-4 h-4 mt-0.5 text-[#C6A087]" />
<div>
<p>{h.addressLine1}</p>
<p>{h.addressLine2}</p>
</div>
</div>

<div className="flex items-center gap-2 text-sm">
<span className="text-[#8C6A4F]">電話：</span>
<a
href={telHref(h.phone)}
className="font-semibold text-[#5A4636] underline underline-offset-2"
>
{h.phone}
</a>
</div>
</div>
</div>
</div>
);
})}
</div>
</section>

{/* ------------------ Visit Japan Web ------------------ */}
<section className="space-y-3 px-4">
<div className="flex items-center justify-between">
<h2 className="text-base font-semibold text-[#5A4636]">
Visit Japan Web
</h2>

{!isReadOnly && (
<button
type="button"
onClick={openVisitModal}
className="flex items-center gap-1 text-xs text-[#8C6A4F] px-2 py-1 rounded-full border border-[#E5D5C5] bg-white hover:bg-[#F7F1EB]"
>
<Pencil className="w-3 h-3" />
編輯
</button>
)}
</div>

<button
type="button"
onClick={() => window.open(visitJapan.url, "_blank")}
className="w-full text-left"
>
<div className="bg-[#EFE2D4] rounded-2xl px-4 py-4 flex items-center justify-between">
<div>
<div className="inline-flex px-3 py-1 rounded-full bg-[#C96C4E] text-[10px] tracking-[0.15em] text-white mb-3">
MUST HAVE
</div>

<h3 className="text-lg font-semibold text-[#5A4636]">
{visitJapan.title}
</h3>

<p className="text-xs text-[#8C6A4F] mt-1">
{visitJapan.subtitle}
</p>
</div>

<ExternalLink className="w-5 h-5 text-[#5A4636]" />
</div>
</button>
</section>

{/* ------------------ Emergency ------------------ */}
<section className="space-y-4 px-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-1">
<div className="w-8 h-8 flex items-center justify-center">
<Shield className="w-4 h-4 text-[#B43737]" />
</div>

<h2 className="text-base font-semibold text-[#B43737]">
緊急聯絡＆支援
</h2>
</div>

{!isReadOnly && (
<button
type="button"
onClick={openEmergencyModal}
className="flex items-center gap-1 text-xs text-[#B43737] px-2 py-1 rounded-full border border-[#F1C8C8] bg-white hover:bg-[#FDF2F2]"
>
<Pencil className="w-3 h-3" />
編輯
</button>
)}
</div>

{/* 110 / 119 */}
<div className="grid grid-cols-2 gap-3">
<div className="bg-white rounded-2xl shadow-sm border border-[#F0E3D5] px-4 py-3 flex flex-col items-center justify-center">
<p className="text-xs text-[#8C6A4F] mb-1">{emergency110.label}</p>
<p className="text-3xl font-semibold text-[#B43737]">
{emergency110.number}
</p>
</div>

<div className="bg-white rounded-2xl shadow-sm border border-[#F0E3D5] px-4 py-3 flex flex-col items-center justify-center">
<p className="text-xs text-[#8C6A4F] mb-1">{emergency119.label}</p>
<p className="text-3xl font-semibold text-[#B43737]">
{emergency119.number}
</p>
</div>
</div>

{/* JNTO */}
<div className="bg-white rounded-2xl shadow-sm border border-[#F0E3D5] px-4 py-4">
<p className="text-sm font-semibold text-[#5A4636]">{jnto.title}</p>

<p className="text-xs text-[#8C6A4F] mt-0.5">{jnto.subtitle}</p>

<a
href={telHref(jnto.phone)}
className="text-xl font-semibold text-[#5A4636] mt-3 underline underline-offset-2"
>
{jnto.phone}
</a>

<p className="text-[11px] text-[#8C6A4F] mt-2">{jnto.note}</p>
</div>

{/* Taipei Office */}
<div className="bg-white rounded-2xl shadow-sm border border-[#F0E3D5] px-4 py-4">
<div className="inline-flex px-3 py-1 rounded-full bg-[#F7F1EB] text-[11px] text-[#8C6A4F] mb-2">
{taipei.badge}
</div>

<p className="text-sm font-semibold text-[#5A4636] mb-2">
{taipei.title}
</p>

<div className="space-y-1 text-sm">
<p className="text-[#5A4636]">
<a
href={telHref(taipei.officePhone)}
className="font-semibold underline underline-offset-2"
>
{taipei.officePhone}
</a>
<span className="text-[#8C6A4F] ml-1">{taipei.officeNote}</span>
</p>

<p className="text-[#B43737]">
<a
href={telHref(taipei.emergencyPhone)}
className="font-semibold underline underline-offset-2"
>
{taipei.emergencyPhone}
</a>
<span className="ml-1">{taipei.emergencyNote}</span>
</p>
</div>
</div>
</section>

{/* ------------------ Flight Modal ------------------ */}
{editingFlight && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
<div className="w-full max-w-lg bg-[#FFF9F2] rounded-2xl shadow-2xl border border-[#F0E3D5]">
<div className="flex items-center justify-between px-4 py-3 border-b border-[#F0E3D5]">
<h2 className="text-sm font-semibold text-[#5A4636] tracking-[0.15em]">
編輯航班資訊
</h2>

<button
type="button"
onClick={() => setEditingFlight(null)}
className="p-1.5 rounded-full hover:bg-black/5"
>
<X className="w-4 h-4 text-[#8C6A4F]" />
</button>
</div>

<div className="px-4 py-4 space-y-3 text-sm">
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
去程 / 回程
</label>
<input
type="text"
value={editingFlight.direction}
onChange={(e) =>
setEditingFlight((prev) => ({
...prev,
direction: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div className="grid grid-cols-3 gap-3">
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
航班編號
</label>
<input
type="text"
value={editingFlight.flightNo}
onChange={(e) =>
setEditingFlight((prev) => ({
...prev,
flightNo: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
出發
</label>
<input
type="text"
value={editingFlight.from}
onChange={(e) =>
setEditingFlight((prev) => ({
...prev,
from: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
抵達
</label>
<input
type="text"
value={editingFlight.to}
onChange={(e) =>
setEditingFlight((prev) => ({
...prev,
to: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
時間（例如 11:30 - 15:55）
</label>
<input
type="text"
value={editingFlight.time}
onChange={(e) =>
setEditingFlight((prev) => ({
...prev,
time: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
行李資訊
</label>
<input
type="text"
value={editingFlight.baggage}
onChange={(e) =>
setEditingFlight((prev) => ({
...prev,
baggage: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>
</div>

<div className="flex justify-end gap-2 px-4 py-3 border-t border-[#F0E3D5] bg-[#FFF3E3] rounded-b-2xl">
<button
type="button"
onClick={() => setEditingFlight(null)}
className="px-3 py-1.5 rounded-full text-xs text-[#8C6A4F] border border-[#E5D5C5] bg-white"
>
取消
</button>

{!isReadOnly && (
<button
type="button"
onClick={saveFlight}
className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#C6A087]"
>
儲存
</button>
)}
</div>
</div>
</div>
)}

{/* ------------------ Hotel Modal ------------------ */}
{editingHotel && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
<div className="w-full max-w-lg bg-[#FFF9F2] rounded-2xl shadow-2xl border border-[#F0E3D5]">
<div className="flex items-center justify-between px-4 py-3 border-b border-[#F0E3D5]">
<h2 className="text-sm font-semibold text-[#5A4636] tracking-[0.15em]">
編輯住宿資訊
</h2>

<button
type="button"
onClick={() => setEditingHotel(null)}
className="p-1.5 rounded-full hover:bg-black/5"
>
<X className="w-4 h-4 text-[#8C6A4F]" />
</button>
</div>

<div className="px-4 py-4 space-y-3 text-sm">
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
住宿名稱
</label>
<input
type="text"
value={editingHotel.name}
onChange={(e) =>
setEditingHotel((prev) => ({
...prev,
name: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
住宿日期（例如：3月11日 - 3月14日）
</label>
<input
type="text"
value={editingHotel.dateRange}
onChange={(e) =>
setEditingHotel((prev) => ({
...prev,
dateRange: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
地址（第一行）
</label>
<input
type="text"
value={editingHotel.addressLine1}
onChange={(e) =>
setEditingHotel((prev) => ({
...prev,
addressLine1: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
地址（第二行）
</label>
<input
type="text"
value={editingHotel.addressLine2}
onChange={(e) =>
setEditingHotel((prev) => ({
...prev,
addressLine2: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
電話
</label>
<input
type="text"
value={editingHotel.phone}
onChange={(e) =>
setEditingHotel((prev) => ({
...prev,
phone: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>
</div>

<div className="flex justify-end gap-2 px-4 py-3 border-t border-[#F0E3D5] bg-[#FFF3E3] rounded-b-2xl">
<button
type="button"
onClick={() => setEditingHotel(null)}
className="px-3 py-1.5 rounded-full text-xs text-[#8C6A4F] border border-[#E5D5C5] bg-white"
>
取消
</button>

{!isReadOnly && (
<button
type="button"
onClick={saveHotel}
className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#C6A087]"
>
儲存
</button>
)}
</div>
</div>
</div>
)}

{/* ------------------ Visit Japan Modal ------------------ */}
{visitModalOpen && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
<div className="w-full max-w-lg bg-[#FFF9F2] rounded-2xl shadow-2xl border border-[#F0E3D5]">
<div className="flex items-center justify-between px-4 py-3 border-b border-[#F0E3D5]">
<h2 className="text-sm font-semibold text-[#5A4636] tracking-[0.15em]">
編輯 Visit Japan Web
</h2>

<button
type="button"
onClick={() => setVisitModalOpen(false)}
className="p-1.5 rounded-full hover:bg-black/5"
>
<X className="w-4 h-4 text-[#8C6A4F]" />
</button>
</div>

<div className="px-4 py-4 space-y-3 text-sm">
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
標題
</label>
<input
type="text"
value={visitDraft.title}
onChange={(e) =>
setVisitDraft((prev) => ({
...prev,
title: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
說明
</label>
<input
type="text"
value={visitDraft.subtitle}
onChange={(e) =>
setVisitDraft((prev) => ({
...prev,
subtitle: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
連結 URL
</label>
<input
type="text"
value={visitDraft.url}
onChange={(e) =>
setVisitDraft((prev) => ({
...prev,
url: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>
</div>

<div className="flex justify-end gap-2 px-4 py-3 border-t border-[#F0E3D5] bg-[#FFF3E3] rounded-b-2xl">
<button
type="button"
onClick={() => setVisitModalOpen(false)}
className="px-3 py-1.5 rounded-full text-xs text-[#8C6A4F] border border-[#E5D5C5] bg-white"
>
取消
</button>

{!isReadOnly && (
<button
type="button"
onClick={saveVisit}
className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#C6A087]"
>
儲存
</button>
)}
</div>
</div>
</div>
)}

{/* ------------------ Emergency Modal ------------------ */}
{emergencyModalOpen && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
<div className="w-full max-w-lg bg-[#FFF9F2] rounded-2xl shadow-2xl border border-[#F0E3D5]">
<div className="flex items-center justify-between px-4 py-3 border-b border-[#F0E3D5]">
<h2 className="text-sm font-semibold text-[#5A4636] tracking-[0.15em]">
編輯緊急聯絡資訊
</h2>

<button
type="button"
onClick={() => setEmergencyModalOpen(false)}
className="p-1.5 rounded-full hover:bg-black/5"
>
<X className="w-4 h-4 text-[#8C6A4F]" />
</button>
</div>

<div className="px-4 py-4 space-y-3 text-sm">
<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
110（警察）
</label>
<input
type="text"
value={emDraft.emergency110}
onChange={(e) =>
setEmDraft((prev) => ({
...prev,
emergency110: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
119（救護／火警）
</label>
<input
type="text"
value={emDraft.emergency119}
onChange={(e) =>
setEmDraft((prev) => ({
...prev,
emergency119: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
JNTO 熱線電話
</label>
<input
type="text"
value={emDraft.jntoPhone}
onChange={(e) =>
setEmDraft((prev) => ({
...prev,
jntoPhone: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
外交部代表處（上班時間）
</label>
<input
type="text"
value={emDraft.taipeiOfficePhone}
onChange={(e) =>
setEmDraft((prev) => ({
...prev,
taipeiOfficePhone: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>

<div>
<label className="block text-xs text-[#8C6A4F] mb-1">
外交部代表處（急難救助）
</label>
<input
type="text"
value={emDraft.taipeiEmergencyPhone}
onChange={(e) =>
setEmDraft((prev) => ({
...prev,
taipeiEmergencyPhone: e.target.value,
}))
}
className="w-full rounded-md border border-[#E5D5C5] bg-white px-3 py-2 text-sm outline-none"
/>
</div>
</div>

<div className="flex justify-end gap-2 px-4 py-3 border-t border-[#F0E3D5] bg-[#FFF3E3] rounded-b-2xl">
<button
type="button"
onClick={() => setEmergencyModalOpen(false)}
className="px-3 py-1.5 rounded-full text-xs text-[#8C6A4F] border border-[#E5D5C5] bg-white"
>
取消
</button>

{!isReadOnly && (
<button
type="button"
onClick={saveEmergency}
className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#C6A087]"
>
儲存
</button>
)}
</div>
</div>
</div>
)}

</div>
);
}