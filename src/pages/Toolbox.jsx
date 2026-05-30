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
  Link as LinkIcon, // 🛠️ 導入：Link 圖示
  MoreHorizontal // 🛠️ 導入方案 B 需要的三個點點圖示
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

  const currentTheme = THEMES[themeId] || THEMES.mochaClassic;
  const branchIndex = trip.activeDayIndex ?? 0; 

  const defaultApps = [
    { id: "app-1", name: "NAVER Map", desc: "韓國找路封神，千萬別用 Google Map", appleUrl: "https://apps.apple.com/tw/app/naver-map-navigation/id311867728", androidUrl: "https://play.google.com/store/apps/details?id=com.nhn.android.nmap", icon: "Map", imgUrl: "https://play-lh.googleusercontent.com/URf_NsdR_zz2jAQFWHQf2ArOPdAa7n0Exolkm0h4ydFvmUMxG4puOam19EahHIge16Ojl0_jNRnoH1LRVad_SQ" },
    { id: "app-2", name: "Kakao T", desc: "綁定信用卡即可在韓國直接叫計程車", appleUrl: "https://apps.apple.com/tw/app/카카오-t-택西-се차-주車-바イク-항공-퀵/id981110422", androidUrl: "https://play.google.com/store/apps/details?id=com.kakao.taxi", icon: "Taxi", imgUrl: "https://play-lh.googleusercontent.com/5X2OLNovx1Bf1NndZyPq6m0U2lPoopybo2vO56zjB_6fpNAzHWY0Sw0qjB28_G9Eb8rX0AMJbuE2aQEd5O1O7A" }
  ];

  const defaultTodos = [
    { id: "todo-1", completed: false, text: "確認護照效期是否在 6 個月以上" },
    { id: "todo-2", completed: false, text: "準備好網卡、換好少額當地貨幣現鈔" },
    { id: "todo-3", completed: false, text: "確認各國入境表格填寫完畢" }
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
  
  // 🛠️ 管理查看 APP 詳情 Modal 的狀態
  const [selectedAppDetails, setSelectedAppDetails] = useState(null);
  // 🛠️ 新增：管理三個點點下拉功能選單的顯示狀態
  const [showMenuId, setShowMenuId] = useState(false);

  const parseBranchText = (text) => {
    if (!text) return "";
    const parts = text.split("---").map(p => p.trim());
    return (parts[branchIndex] !== undefined && parts[branchIndex] !== "") ? parts[branchIndex] : parts[0];
  };

  const saveToolboxData = (updatedToolbox) => {
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
    if (!newTodoText.trim()) return;
    let updatedTodos = editingTodoId 
      ? todos.map(t => t.id === editingTodoId ? { ...t, text: newTodoText.trim() } : t)
      : [...todos, { id: `todo-${Date.now()}`, completed: false, text: newTodoText.trim() }];
    saveToolboxData({ updatedTodos: updatedTodos });
    setNewTodoText("");
    setEditingTodoId(null);
    setIsOpenModal(false);
  };

  const deleteTodo = (todoId) => {
    saveToolboxData({ todos: todos.filter(t => t.id !== todoId) });
  };

  const openEditModal = (app) => {
    setModalType("APP");
    setEditingAppId(app.id);
    setNewAppName(app.name);
    setNewAppDesc(app.desc);
    setNewAppAppleUrl(app.appleUrl || "");
    setNewAppAndroidUrl(app.androidUrl || "");
    setSelectedIconName(app.icon || "Smartphone");
    setNewAppImgUrl(app.imgUrl || ""); // 🛠️ 讀取圖片網址
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
    setNewAppImgUrl(""); // 🛠️ 清空圖片網址
    setIsOpenModal(true);
  };

  const openTodoModal = () => {
    setModalType("TODO");
    setEditingTodoId(null);
    setNewTodoText("");
    setIsOpenModal(true);
  };

  const openEditTodoModal = (todo) => {
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
  const [newAppImgUrl, setNewAppImgUrl] = useState(""); // 🛠️ 圖片狀態

  const handleSubmitApp = (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    const formatUrl = (u) => u.trim() ? (u.trim().startsWith("http") ? u.trim() : `https://${u.trim()}`) : "";
    
    const updatedApps = editingAppId 
      ? apps.map(a => a.id === editingAppId ? { ...a, name: newAppName.trim(), desc: newAppDesc.trim() || "旅人專屬必備應用軟體", appleUrl: formatUrl(newAppAppleUrl), androidUrl: formatUrl(newAppAndroidUrl), icon: selectedIconName, imgUrl: newAppImgUrl.trim() } : a)
      : [...apps, { id: `app-${Date.now()}`, name: newAppName.trim(), desc: newAppDesc.trim() || "旅人專屬必備應用軟體", appleUrl: formatUrl(newAppAppleUrl), androidUrl: formatUrl(newAppAndroidUrl), icon: selectedIconName, imgUrl: newAppImgUrl.trim() }];
    
    saveToolboxData({ apps: updatedApps });
    setIsOpenModal(false);
    setShowIconPicker(false);
    setSelectedAppDetails(null); // 關閉詳情
    setShowMenuId(false); // 關閉三個點選單
  };

  const deleteApp = (appId) => {
    saveToolboxData({ apps: apps.filter(a => a.id !== appId) });
    setSelectedAppDetails(null); // 關閉詳情
    setShowMenuId(false); // 關閉三個點選單
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

  const networkGroups = [
    { label: "eSIM", list: esimList, color: currentTheme.main + "12", text: currentTheme.main },
    { label: "SIM 卡", list: simList, color: "#f3f4f6", text: "#6b7280" }
  ];

  const activeNetworkGroups = networkGroups.filter(group => group.list.length > 0);

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
              推薦的 SIM卡 與 eSIM 網路方案
            </h4>
          </div>
          <button onClick={() => setIsEditingNet(!isEditingNet)} className="text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95" style={{ color: currentTheme.main }}>
            {isEditingNet ? <><Check className="w-3.5 h-3.5" />完成</> : <><Edit3 className="w-3.5 h-3.5" />修改</>}
          </button>
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
                {activeNetworkGroups.length > 0 ? (
                  activeNetworkGroups.map((group, idx) => (
                    <div key={idx} className={`flex flex-col gap-2 ${idx > 0 ? "pt-3 border-t border-dashed border-gray-100" : ""}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-md" style={{ backgroundColor: group.color, color: group.text }}>
                          {group.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 pl-0.5">
                        {group.list.map((item, i) => (
                          <div key={i} className="flex items-center gap-1 text-[13px] font-bold">
                            {item.url ? (
                              <button onClick={() => window.open(item.url, "_blank")} className="hover:underline flex items-center gap-1 text-left transition-all" style={{ color: currentTheme.main }}>
                                <LinkIcon className="w-3 h-3" /><span>{item.name}</span>
                              </button>
                            ) : <span style={{ color: currentTheme.text }}>{item.name}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] italic opacity-20 py-1">未設定建議方案</p>
                )}
              </div>
              
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
          <button onClick={openTodoModal} className="text-[11px] font-black flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed transition-all active:scale-95" style={{ borderColor: `${currentTheme.main}40`, color: currentTheme.main }}><Plus className="w-3 h-3" /> 新增</button>
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
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex items-center gap-1">
                    <button onClick={() => openEditTodoModal(todo)} className="p-1 text-gray-400 hover:text-gray-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteTodo(todo.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
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
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex items-center gap-1">
                        <button onClick={() => openEditTodoModal(todo)} className="p-1 text-gray-400 hover:text-gray-600"><Edit3 className="w-3 h-3" /></button>
                        <button onClick={() => deleteTodo(todo.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
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
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" style={{ color: currentTheme.main }} />
            <h4 className="text-[12px] font-black uppercase tracking-widest" style={{ color: currentTheme.text }}>推薦下載的 APP</h4>
          </div>
          <button onClick={openAddModal} className="text-[11px] font-black flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed transition-all active:scale-95" style={{ borderColor: `${currentTheme.main}40`, color: currentTheme.main }}><Plus className="w-3 h-3" /> 新增</button>
        </div>
        
        {/* 精緻四格九宮格手機桌面牆 */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 px-1">
          {apps.map((app) => {
            const RenderedIcon = AVAILABLE_ICONS[app.icon] || Smartphone;
            return (
              <button
                key={app.id}
                onClick={() => { setSelectedAppDetails(app); setShowMenuId(false); }}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group text-center outline-none"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm overflow-hidden transition-all bg-white group-hover:brightness-95"
                  style={{ borderColor: `${currentTheme.main}15`, color: currentTheme.main }}
                >
                  {app.imgUrl ? (
                    <img src={app.imgUrl} alt={app.name} className="w-full h-full object-cover" />
                  ) : (
                    <RenderedIcon className="w-6 h-6 stroke-[2.2]" />
                  )}
                </div>
                <span className="text-[11px] font-bold truncate w-full px-0.5" style={{ color: currentTheme.text }}>
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          🎈 APP 詳細資料檢視視窗 (Modal) —— 🛠️ 完美修復右上角定位與選單點擊邏輯
         ======================================================== */}
      {selectedAppDetails && (
        <div 
          onClick={() => { setSelectedAppDetails(null); setShowMenuId(false); }} 
          className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => { e.stopPropagation(); setShowMenuId(false); }} // 點擊卡片其他地方時自動把下拉選單收起來
            className="w-full max-w-sm rounded-[2rem] border shadow-2xl animate-in zoom-in-95 duration-300 bg-white relative p-6" 
            style={{ borderColor: currentTheme.border }}
          >
            
            {/* 右上角定位及功能徹底隔離修復，防止冒泡事件干擾，且按鈕顏色隨主題色變色 */}
            <div 
              className="absolute top-5 right-5 z-30"
              onClick={(e) => e.stopPropagation()} // 強制阻斷，防止點選單時卡片關閉
            >
              <button 
                onClick={() => setShowMenuId(!showMenuId)}
                className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all active:scale-90 shadow-sm"
                style={{ color: currentTheme.main }} // 右上角三個點點隨主題色變色
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {/* 下拉彈出的功能選單 */}
              {showMenuId && (
                <div className="absolute right-0 top-8 bg-white border rounded-xl shadow-xl py-1 w-24 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150" style={{ borderColor: '#f3f4f6' }}>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openEditModal(selectedAppDetails); setShowMenuId(false); }} // 點擊編輯
                    className="w-full px-3 py-1.5 text-[11px] font-bold text-left hover:bg-gray-50 flex items-center gap-1.5"
                    style={{ color: currentTheme.text }}
                  >
                    <Edit3 className="w-3.5 h-3.5" />編輯
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteApp(selectedAppDetails.id); }} // 點擊刪除
                    className="w-full px-3 py-1.5 text-[11px] font-bold text-left hover:bg-red-50 flex items-center gap-1.5 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />刪除
                  </button>
                </div>
              )}
            </div>

            {/* APP 主圖展示區 —— 完美的垂直居中正方形 APP 樣式（100% 呈現，絕不裁切） */}
            <div className="w-full flex justify-center mt-6 mb-5">
              {selectedAppDetails.imgUrl ? (
                <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gray-50/60 shadow-md border border-gray-100/80 flex items-center justify-center">
                  <img src={selectedAppDetails.imgUrl} alt={selectedAppDetails.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div 
                  className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-md border" 
                  style={{ 
                    background: `linear-gradient(135deg, ${currentTheme.main}15 0%, ${currentTheme.main}05 100%)`,
                    borderColor: `${currentTheme.main}15`
                  }}
                >
                  {React.createElement(AVAILABLE_ICONS[selectedAppDetails.icon] || Smartphone, { className: "w-10 h-10", style: { color: currentTheme.main } })}
                </div>
              )}
            </div>

            {/* 詳細內容 */}
            <div className="text-center px-1">
              <div className="flex items-center justify-center gap-1.5 mb-2.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-gray-50" style={{ color: currentTheme.main }}>
                  {React.createElement(AVAILABLE_ICONS[selectedAppDetails.icon] || Smartphone, { className: "w-4 h-4" })}
                </div>
                <h3 className="font-black text-base" style={{ color: currentTheme.text }}>{selectedAppDetails.name}</h3>
              </div>
              
              {/* 介紹欄位套用主題色背景與文字置中排版 */}
              <p 
                className="text-[12px] leading-relaxed font-medium mb-6 whitespace-pre-line text-center rounded-2xl border p-4 shadow-sm"
                style={{ 
                  backgroundColor: `${currentTheme.main}09`, // 淺淺的主題色底色
                  borderColor: `${currentTheme.main}18`, // 搭配微量主題色邊框
                  color: currentTheme.text // 維持原本的字體顏色
                }}
              >
                {selectedAppDetails.desc}
              </p>
              
              {/* 底部分流下載連結按鈕 —— 🛠️ 升級：將原本的 border-gray-50 分隔線改為明顯的主題色細邊線 */}
              <div 
                className="grid grid-cols-2 gap-2 text-[11px] font-black border-t pt-4" 
                style={{ borderColor: `${currentTheme.main}30` }} // 🛠️ 明顯的主題色分隔線
              >
                {selectedAppDetails.appleUrl ? (
                  <button onClick={() => window.open(selectedAppDetails.appleUrl, "_blank")} className="py-2.5 rounded-xl border flex items-center justify-center gap-1.5 hover:bg-gray-50 active:scale-95 transition-all" style={{ borderColor: `${currentTheme.main}25`, color: currentTheme.main }}>
                    <Apple className="w-4 h-4 shrink-0" stroke={currentTheme.main} />
                    <span>App Store</span>
                  </button>
                ) : <div className="text-[10px] opacity-30 flex items-center justify-center italic bg-gray-50 rounded-xl py-2.5">無 iOS 版本</div>}

                {selectedAppDetails.androidUrl ? (
                  <button onClick={() => window.open(selectedAppDetails.androidUrl, "_blank")} className="py-2.5 rounded-xl border flex items-center justify-center gap-1.5 hover:bg-gray-50 active:scale-95 transition-all" style={{ borderColor: `${currentTheme.main}25`, color: currentTheme.main }}>
                    <Bot className="w-4 h-4 shrink-0" stroke={currentTheme.main} />
                    <span>Google Play</span>
                  </button>
                ) : <div className="text-[10px] opacity-30 flex items-center justify-center italic bg-gray-50 rounded-xl py-2.5">無 Android 版本</div>}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🎈 Modal —— 新增與修改彈窗 */}
      {isOpenModal && (
        <div className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[2rem] border p-5 shadow-2xl animate-in zoom-in-95 duration-300 relative bg-white" style={{ borderColor: currentTheme.border }}>
            <button type="button" onClick={() => { setIsOpenModal(false); setShowIconPicker(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50"><X className="w-5 h-5" /></button>
            {modalType === "APP" ? (
              <>
                <h3 className="text-xs font-black tracking-widest uppercase opacity-60 mb-4 px-1" style={{ color: currentTheme.text }}>{editingAppId ? "修改 APP 資訊" : "新增推薦 APP"}</h3>
                <form onSubmit={handleSubmitApp} className="space-y-3.5">
                  <div className="grid grid-cols-3 gap-2 relative">
                    <div className="col-span-1 relative"><label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">備用圖示</label>
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
                  <div><label className="text-[9px] font-black opacity-40 mb-1 block uppercase px-1">App 封面圖片網址</label><input type="text" placeholder="可貼上介紹截圖或封面 URL，可選填" value={newAppImgUrl} onChange={(e) => setNewAppImgUrl(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none" style={{ borderColor: `${currentTheme.main}20`, color: currentTheme.text }} /></div>
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