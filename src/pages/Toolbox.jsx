// src/pages/Toolbox.jsx
import React, { useState } from "react";
import {
  Smartphone,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  X,
  Compass,
  Edit3,
  Check,
  Wifi,
  Apple, 
  Bot,   
  Car,
  Bus,
  Map,
  CreditCard,
  ShoppingBag,
  Hotel,
  Star,
  ChevronDown,
  UtensilsCrossed,
  PartyPopper,
  Signal,
  Copy,
  QrCode,
  Link as LinkIcon // 🛠️ 導入：Link 圖示
} from "lucide-react";
import { THEMES } from "../App";
import PageHeader from "../components/PageHeader"; // 🛠️ 確保有導入妳的 PageHeader 元件（請根據妳實際的資料夾路徑調整）

const AVAILABLE_ICONS = {
  Smartphone: Smartphone,
  Compass: Compass,
  Taxi: Car,
  Bus: Bus,
  Map: Map,
  CreditCard: CreditCard,
  ShoppingBag: ShoppingBag,
  Utensils: UtensilsCrossed,
  Hotel: Hotel,
  Star: Star,
};

export default function Toolbox({ trip, setTrip, themeId }) {
  if (!trip) return null;

  const isViewer = trip.shareMode === "viewer";
  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;
  const branchIndex = trip.activeDayIndex ?? 0; 

  const defaultApps = [
    { id: "app-1", name: "NAVER Map", desc: "韓國找路封神，千萬別用 Google Map 🗺️", appleUrl: "https://apps.apple.com/tw/app/naver-map-navigation/id311867728", androidUrl: "https://play.google.com/store/apps/details?id=com.nhn.android.nmap", icon: "Map" },
    { id: "app-2", name: "Kakao T", desc: "綁定信用卡即可在韓國直接叫計程車 🚕", appleUrl: "https://apps.apple.com/tw/app/카카오-t-택西-세차-주車-바イク-항공-퀵/id981110422", androidUrl: "https://play.google.com/store/apps/details?id=com.kakao.taxi", icon: "Taxi" }
  ];

  const defaultTodos = [
    { id: "todo-1", completed: false, text: "確認護照效期是否在 6 個月以上 ✈️" },
    { id: "todo-2", completed: false, text: "準備好網卡、換好少額當地貨幣現鈔" },
    { id: "todo-3", completed: false, text: "確認 Visit Japan Web 或各國入境表格填寫完畢" }
  ];

  const tData = trip.toolbox || {};
  const apps = tData.apps || defaultApps;
  const todos = tData.todos || defaultTodos;
  const network = tData.network || { type: "", provider: "", notes: "" };

  const [isEditingNet, setIsEditingNet] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalType, setModalType] = useState("APP"); 
  const [editingAppId, setEditingAppId] = useState(null); 
  const [editingTodoId, setEditingTodoId] = useState(null); 
  const [isDoneExpanded, setIsDoneExpanded] = useState(false);

  const parseBranchText = (text) => {
    if (!text) return "";
    const parts = text.split("---").map(p => p.trim());
    return (parts[branchIndex] !== undefined && parts[branchIndex] !== "") ? parts[branchIndex] : parts[0];
  };

  const saveToolboxData = (updatedToolbox) => {
    if (isViewer) return;
    setTrip(prev => {
      const next = structuredClone(prev);
      next.toolbox = { ...tData, ...updatedToolbox };
      return next;
    });
  };

  const toggleTodo = (todoId) => {
    const updated = todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t);
    saveToolboxData({ todos: updated });
  };

  const handleAddTodoSubmit = (e) => {
    e.preventDefault();
    if (!newTodoText.trim() || isViewer) return;
    let updatedTodos = editingTodoId 
      ? todos.map(t => t.id === editingTodoId ? { ...t, text: newTodoText.trim() } : t)
      : [...todos, { id: `todo-${Date.now()}`, completed: false, text: newTodoText.trim() }];
    saveToolboxData({ todos: updatedTodos });
    setNewTodoText("");
    setEditingTodoId(null);
    setIsOpenModal(false);
  };

  const deleteTodo = (todoId) => {
    if (isViewer) return;
    saveToolboxData({ todos: todos.filter(t => t.id !== todoId) });
  };

  const openEditModal = (app) => {
    if (isViewer) return;
    setModalType("APP");
    setEditingAppId(app.id);
    setNewAppName(app.name);
    setNewAppDesc(app.desc);
    setNewAppAppleUrl(app.appleUrl || "");
    setNewAppAndroidUrl(app.androidUrl || "");
    setSelectedIconName(app.icon || "Smartphone");
    setIsOpenModal(true);
  };

  const openAddModal = () => {
    setModalType("APP");
    setEditingAppId(null);
    setNewAppName("");
    setNewAppDesc("");
    setNewAppAppleUrl("");
    setNewAppAndroidUrl("");
    setSelectedIconName("Smartphone");
    setIsOpenModal(true);
  };

  const openTodoModal = () => {
    setModalType("TODO");
    setEditingTodoId(null);
    setNewTodoText("");
    setIsOpenModal(true);
  };

  const openEditTodoModal = (todo) => {
    if (isViewer) return;
    setModalType("TODO");
    setEditingTodoId(todo.id);
    setNewTodoText(todo.text);
    setIsOpenModal(true);
  };

  const [newAppName, setNewAppName] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");
  const [newAppAppleUrl, setNewAppAppleUrl] = useState(""); 
  const [newAppAndroidUrl, setNewAppAndroidUrl] = useState(""); 
  const [selectedIconName, setSelectedIconName] = useState("Smartphone");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSubmitApp = (e) => {
    e.preventDefault();
    if (!newAppName.trim() || isViewer) return;
    const formatUrl = (u) => u.trim() ? (u.trim().startsWith("http") ? u.trim() : `https://${u.trim()}`) : "";
    const updatedApps = editingAppId 
      ? apps.map(a => a.id === editingAppId ? { ...a, name: newAppName.trim(), desc: newAppDesc.trim() || "旅人專屬必備應用軟體", appleUrl: formatUrl(newAppAppleUrl), androidUrl: formatUrl(newAppAndroidUrl), icon: selectedIconName } : a)
      : [...apps, { id: `app-${Date.now()}`, name: newAppName.trim(), desc: newAppDesc.trim() || "旅人專屬必備應用軟體", appleUrl: formatUrl(newAppAppleUrl), androidUrl: formatUrl(newAppAndroidUrl), icon: selectedIconName }];
    saveToolboxData({ apps: updatedApps });
    setIsOpenModal(false);
    setShowIconPicker(false);
  };

  const deleteApp = (appId) => {
    if (isViewer) return;
    saveToolboxData({ apps: apps.filter(a => a.id !== appId) });
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);
  const activeTodosCount = activeTodos.length;

  const parseLinks = (rawText) => {
    const text = parseBranchText(rawText);
    if (!text) return [];
    return text.split(/\n/).filter(l => l.trim()).map(line => {
      const urlRegex = /(https?:\/\/[^\s]+)/;
      const match = line.match(urlRegex);
      return match ? { name: line.replace(match[0], "").trim() || "點擊前往", url: match[0] } : { name: line.trim(), url: null };
    });
  };

  const esimList = parseLinks(network.provider);
  const simList = parseLinks(network.notes);
  const guideUrls = parseLinks(network.type).filter(l => l.url);

  return (
    <div className="pt-2 pb-24 animate-in fade-in duration-500 max-w-full overflow-hidden">
      
      {/* 🛠️ 套用妳的模板標題 PageHeader 元件 */}
      <PageHeader
        icon={Smartphone}
        title="行前準備"
        subtitle="TRAVEL TOOLS"
        themeId={themeId}
      />

      {/* 📡 區塊一：網路連線模組 */}
      <section className="mb-8 px-2 mt-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" style={{ color: currentTheme.main }} />
            <h4 className="text-[12px] font-black uppercase tracking-widest" style={{ color: currentTheme.text }}>
              SIM卡 與 eSIM 網路方案
            </h4>
          </div>
          {!isViewer && (
            <button onClick={() => setIsEditingNet(!isEditingNet)} className="text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95" style={{ color: currentTheme.main }}>
              {isEditingNet ? <><Check className="w-3.5 h-3.5" />完成</> : <><Edit3 className="w-3.5 h-3.5" />修改</>}
            </button>
          )}
        </div>

        <div className="bg-white border rounded-[1.5rem] shadow-sm overflow-hidden transition-all" style={{ borderColor: currentTheme.border }}>
          {isEditingNet ? (
            <div className="space-y-4 p-5">
              <div>
                <label className="text-[9px] font-black opacity-40 mb-1 block uppercase">eSIM 推薦 (名字 https://網址)</label>
                <textarea rows={2} value={network.provider || ""} onChange={(e) => saveToolboxData({ network: { ...network, provider: e.target.value } })} className="w-full bg-white border rounded-xl px-3 py-2 text-[13px] font-bold outline-none resize-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} placeholder="Docomo eSIM https://..." />
              </div>
              <div>
                <label className="text-[9px] font-black opacity-40 mb-1 block uppercase">實體 SIM卡 推薦 (名字 https://網址)</label>
                <textarea rows={2} value={network.notes || ""} onChange={(e) => saveToolboxData({ network: { ...network, notes: e.target.value } })} className="w-full bg-white border rounded-xl px-3 py-2 text-[13px] font-bold outline-none resize-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} placeholder="Softbank 原生卡 https://..." />
              </div>
              <div>
                <label className="text-[9px] font-black opacity-40 mb-1 block uppercase">eSIM設定教學 (僅支援網址)</label>
                <textarea rows={2} value={network.type || ""} onChange={(e) => saveToolboxData({ network: { ...network, type: e.target.value } })} className="w-full bg-white border rounded-xl px-3 py-2 text-[13px] font-bold outline-none resize-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} placeholder="https://..." />
              </div>
            </div>
          ) : (
            <>
              <div className="p-5 flex flex-col gap-4 bg-white">
                {/* 雙軌呈現區 */}
                {[ { label: "eSIM", list: esimList, color: currentTheme.main + "12", text: currentTheme.main }, { label: "SIM 卡", list: simList, color: "#f3f4f6", text: "#6b7280" } ].map((group, idx) => (
                  <div key={idx} className={`flex flex-col gap-2 ${idx > 0 ? "pt-3 border-t border-dashed border-gray-100" : ""}`}>
                    <div className="flex items-center gap-1.5"><span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-md" style={{ backgroundColor: group.color, color: group.text }}>{group.label}</span></div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 pl-0.5">
                      {group.list.length > 0 ? group.list.map((item, i) => (
                        <div key={i} className="flex items-center gap-1 text-[13px] font-bold">
                          {item.url ? (
                            <button onClick={() => window.open(item.url, "_blank")} className="hover:underline flex items-center gap-1 text-left transition-all" style={{ color: currentTheme.main }}>
                              <LinkIcon className="w-3 h-3" /><span>{item.name}</span>
                            </button>
                          ) : <span style={{ color: currentTheme.text }}>{item.name}</span>}
                        </div>
                      )) : <p className="text-[12px] italic opacity-20">未設定建議方案</p>}
                    </div>
                  </div>
                ))}
              </div>
              {/* 教學指南區：自動隱藏邏輯 */}
              {guideUrls.length > 0 && (
                <div className="px-5 py-3 bg-gray-50/50 flex items-center gap-3">
                  <Compass className="w-3.5 h-3.5 opacity-80 shrink-0" style={{ color: currentTheme.main }} />
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {guideUrls.map((g, i) => (
                      <button key={i} onClick={() => window.open(g.url, "_blank")} className="text-[12px] font-bold hover:underline" style={{ color: currentTheme.main }}>
                        eSIM設定教學 {guideUrls.length > 1 ? `#${i+1}` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 📝 區塊二：待辦事項 */}
      <section className="mb-8 px-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" style={{ color: currentTheme.main }} />
            <h4 className="text-[12px] font-black uppercase tracking-widest" style={{ color: currentTheme.text }}>待辦事項</h4>
          </div>
          {!isViewer && (
            <button onClick={openTodoModal} className="text-[11px] font-black flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed transition-all active:scale-95" style={{ borderColor: `${currentTheme.main}40`, color: currentTheme.main }}><Plus className="w-3 h-3" /> 新增</button>
          )}
        </div>
        <div className="bg-white/80 border-2 border-dashed rounded-[1.5rem] py-2 px-4 shadow-sm relative transition-all" style={{ borderColor: `${currentTheme.main}25` }}>
          {todos.length > 0 && activeTodosCount === 0 && (
            <div className="mx-1 mt-2 mb-3 px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black tracking-wider animate-in fade-in zoom-in-95 duration-300 border border-dashed select-none" style={{ backgroundColor: `${currentTheme.main}10`, borderColor: `${currentTheme.main}30`, color: currentTheme.text }}>
              <PartyPopper className="w-4 h-4 shrink-0 animate-pulse" style={{ color: currentTheme.main }} /><span>所有待辦事項都完成了哦 ପ꒰⑅•ᴗ•｡꒱໊♡</span><Star className="w-4 h-4 shrink-0 animate-pulse" style={{ color: currentTheme.main }} />
            </div>
          )}
          {activeTodos.length > 0 ? (
            <div className="divide-y divide-dashed divide-gray-100">
              {activeTodos.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between py-3.5 group px-1">
                  <div onClick={() => toggleTodo(todo.id)} className="flex items-start gap-3 flex-1 cursor-pointer select-none">
                    <button className="shrink-0 mt-0.5" style={{ color: currentTheme.main }}><Square className="w-4 h-4 opacity-40" /></button>
                    <span className="text-[13px] font-semibold leading-relaxed transition-all break-words" style={{ color: currentTheme.text }}>{todo.text}</span>
                  </div>
                  {!isViewer && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex items-center gap-1">
                      <button onClick={() => openEditTodoModal(todo)} className="p-1 text-gray-400 hover:text-gray-600"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteTodo(todo.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : ( todos.length === 0 && <p className="text-center py-6 text-xs italic opacity-40" style={{ color: currentTheme.accent }}>清單空空如也，點擊右上角新增事情吧！</p> )}
          {completedTodos.length > 0 && (
            <div className="border-t border-dashed mt-1 pt-2 pb-1" style={{ borderColor: `${currentTheme.main}15` }}>
              <button onClick={() => setIsDoneExpanded(!isDoneExpanded)} className="w-full py-1.5 flex items-center justify-between text-[11px] font-black opacity-40 hover:opacity-70 transition-all px-1" style={{ color: currentTheme.text }}>
                <span>已完成事項 ({completedTodos.length})</span><ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDoneExpanded ? "rotate-180" : ""}`} />
              </button>
              {isDoneExpanded && (
                <div className="divide-y divide-dashed divide-gray-50 mt-1 animate-in fade-in duration-200">
                  {completedTodos.map((todo) => (
                    <div key={todo.id} className="flex items-center justify-between py-2.5 group opacity-40 hover:opacity-80 transition-opacity px-1">
                      <div onClick={() => toggleTodo(todo.id)} className="flex items-start gap-3 flex-1 cursor-pointer select-none">
                        <button className="shrink-0 mt-0.5" style={{ color: currentTheme.main }}><CheckSquare className="w-4 h-4" /></button>
                        <span className="text-[12px] font-medium leading-relaxed line-through break-words" style={{ color: currentTheme.text }}>{todo.text}</span>
                      </div>
                      {!isViewer && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex items-center gap-1">
                          <button onClick={() => openEditTodoModal(todo)} className="p-1 text-gray-400 hover:text-gray-600"><Edit3 className="w-3 h-3" /></button>
                          <button onClick={() => deleteTodo(todo.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 📱 區塊三：必備 APP 推薦 */}
      <section className="mb-4 px-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" style={{ color: currentTheme.main }} />
            <h4 className="text-[12px] font-black uppercase tracking-widest" style={{ color: currentTheme.text }}>推薦下載的 APP</h4>
          </div>
          {!isViewer && (
            <button onClick={openAddModal} className="text-[11px] font-black flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed transition-all active:scale-95" style={{ borderColor: `${currentTheme.main}40`, color: currentTheme.main }}><Plus className="w-3 h-3" /> 新增</button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 px-1 snap-x">
          {apps.map((app) => {
            const RenderedIcon = AVAILABLE_ICONS[app.icon] || Smartphone;
            return (
              <div key={app.id} className="snap-center shrink-0 w-[210px] bg-white border rounded-2xl p-4 shadow-sm relative group border-gray-100 flex flex-col justify-between">
                {!isViewer && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(app)} className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"><Edit3 className="w-2.5 h-2.5" /></button>
                    <button onClick={() => deleteApp(app.id)} className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"><X className="w-2.5 h-2.5" /></button>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1.5"><div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-50" style={{ color: currentTheme.main }}><RenderedIcon className="w-4 h-4" /></div><span className="font-black text-xs truncate max-w-[110px]" style={{ color: currentTheme.text }}>{app.name}</span></div>
                  <p className="text-[10px] leading-snug font-medium text-gray-400 line-clamp-2 pr-1 mb-3">{app.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-gray-50 text-[10px] font-black">
                  {app.appleUrl ? ( <button onClick={() => window.open(app.appleUrl, "_blank")} className="py-1 flex items-center justify-center gap-1 hover:brightness-95 active:scale-95 transition-all" style={{ color: currentTheme.main }}><Apple className="w-3.5 h-3.5 shrink-0 mt-0.5" stroke={currentTheme.main} /><span className="opacity-40 font-normal">｜</span><span>Store</span></button> ) : <div className="text-[9px] opacity-20 flex items-center justify-center italic">無 iOS</div>}
                  {app.androidUrl ? ( <button onClick={() => window.open(app.androidUrl, "_blank")} className="py-1 flex items-center justify-center gap-1 hover:brightness-95 active:scale-95 transition-all" style={{ color: currentTheme.main }}><Bot className="w-3.5 h-3.5 shrink-0 mt-0.5" stroke={currentTheme.main} /><span className="opacity-40 font-normal">｜</span><span>Play</span></button> ) : <div className="text-[9px] opacity-20 flex items-center justify-center italic">無 Android</div>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🎈 Modal */}
      {isOpenModal && !isViewer && (
        <div className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[2rem] border p-5 shadow-2xl animate-in zoom-in-95 duration-300 relative bg-white" style={{ borderColor: currentTheme.border }}>
            <button type="button" onClick={() => { setIsOpenModal(false); setShowIconPicker(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50"><X className="w-5 h-5" /></button>
            {modalType === "APP" ? (
              <>
                <h3 className="text-xs font-black tracking-widest uppercase opacity-60 mb-4 px-1" style={{ color: currentTheme.text }}>{editingAppId ? "修改 APP 資訊" : "新增推薦 APP"}</h3>
                <form onSubmit={handleSubmitApp} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 relative">
                    <div className="col-span-1 relative"><label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">圖示樣式</label>
                      <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className="w-full bg-white border rounded-xl px-2 py-2 flex items-center justify-between text-xs font-bold shadow-sm transition-all" style={{ borderColor: `${currentTheme.main}25`, color: currentTheme.text }}>
                        <div className="flex items-center gap-1.5">{React.createElement(AVAILABLE_ICONS[selectedIconName] || Smartphone, { className: "w-4 h-4", style: { color: currentTheme.main } })}</div><ChevronDown className={`w-3.5 h-3.5 opacity-40 transition-transform ${showIconPicker ? "rotate-180" : ""}`} />
                      </button>
                      {showIconPicker && (
                        <div className="absolute top-[52px] left-0 w-[240px] bg-white border rounded-2xl p-2.5 shadow-2xl z-50 grid grid-cols-5 gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                          {Object.keys(AVAILABLE_ICONS).map((iconKey) => { const PickerIcon = AVAILABLE_ICONS[iconKey]; const isTarget = selectedIconName === iconKey;
                            return ( <button key={iconKey} type="button" onClick={() => { setSelectedIconName(iconKey); setShowIconPicker(false); }} className="aspect-square rounded-lg border flex items-center justify-center transition-all active:scale-90" style={{ borderColor: isTarget ? currentTheme.main : "#f3f4f6", backgroundColor: isTarget ? `${currentTheme.main}10` : "white" }}><PickerIcon className="w-4 h-4" style={{ color: isTarget ? currentTheme.main : "#6b7280" }} /></button> ); })}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2"><label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">App 名字 (必填)</label><input type="text" required placeholder="例：Suica / NAVER" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} /></div>
                  </div>
                  <div><label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">App Store 下載網址</label><input type="text" placeholder="可貼上完整網址，慢或留空" value={newAppAppleUrl} onChange={(e) => setNewAppAppleUrl(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} /></div>
                  <div><label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">Play 商店 下載網址</label><input type="text" placeholder="可貼上完整網址，或留空" value={newAppAndroidUrl} onChange={(e) => setNewAppAndroidUrl(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} /></div>
                  <div><label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">備註</label><input type="text" placeholder="一句短提醒 (例：需先綁定台灣手機號碼)" value={newAppDesc} onChange={(e) => setNewAppDesc(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} /></div>
                  <div className="pt-2"><button type="submit" disabled={!newAppName.trim()} className="w-full py-3 rounded-xl text-xs font-black text-white shadow-sm hover:brightness-95 transition-all active:scale-[0.99] disabled:opacity-30" style={{ backgroundColor: currentTheme.main }}>{editingAppId ? "更新 APP 資訊" : "確認加入"}</button></div>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-xs font-black tracking-widest uppercase opacity-60 mb-4 px-1" style={{ color: currentTheme.text }}>{editingTodoId ? "修改待辦事項" : "新增待辦事項"}</h3>
                <form onSubmit={handleAddTodoSubmit} className="space-y-4">
                  <div><input type="text" required autoFocus placeholder="例：填寫入境 Visit Japan Web" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2.5 text-xs font-bold outline-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} /></div>
                  <div className="pt-2"><button type="submit" disabled={!newTodoText.trim()} className="w-full py-3 rounded-xl text-xs font-black text-white shadow-sm hover:brightness-95 transition-all active:scale-[0.99] disabled:opacity-30" style={{ backgroundColor: currentTheme.main }}>{editingTodoId ? "儲存修改" : "確認新增"}</button></div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}