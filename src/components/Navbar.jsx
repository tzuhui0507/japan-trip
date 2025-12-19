// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="w-full bg-[#F7F1EB]/95 border-b border-[#E5D5C5] backdrop-blur-md fixed top-0 left-0 z-50">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Brand */}
        <h1 className="text-[18px] font-semibold text-[#5A4636] tracking-[0.15em]">
          JAPAN TRIP
        </h1>

        {/* 只留 Overview（首頁） */}
        <div className="flex items-center gap-3 text-sm font-medium text-[#5A4636]">

          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1 rounded-md transition ${
                isActive
                  ? "bg-[#8C6A4F] text-white"
                  : "hover:bg-[#E5D5C5] hover:text-[#5A4636]"
              }`
            }
          >
            行程總覽
          </NavLink>

        </div>
      </nav>
    </header>
  );
};

export default Navbar;