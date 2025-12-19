// src/share/ShareModeContext.jsx
import { createContext, useContext } from "react";

const ShareModeContext = createContext({
  mode: "owner", // owner | share
  canEdit: () => true,
});

export function ShareModeProvider({ mode = "owner", children }) {
  const canEdit = (section) => {
    if (mode === "owner") return true;

    // share 模式允許編輯的區塊
    const editableSections = [
      "expenses",
      "packing",
      "currency",
    ];

    return editableSections.includes(section);
  };

  return (
    <ShareModeContext.Provider value={{ mode, canEdit }}>
      {children}
    </ShareModeContext.Provider>
  );
}

export function useShareMode() {
  return useContext(ShareModeContext);
}
