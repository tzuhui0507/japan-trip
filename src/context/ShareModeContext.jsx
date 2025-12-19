// src/context/ShareModeContext.jsx
import { createContext, useContext } from "react";

const ShareModeContext = createContext({
  mode: "owner", // "owner" | "share"
});

export function ShareModeProvider({ mode = "owner", children }) {
  return (
    <ShareModeContext.Provider value={{ mode }}>
      {children}
    </ShareModeContext.Provider>
  );
}

export function useShareMode() {
  return useContext(ShareModeContext);
}
