// src/components/ShareModeBanner.jsx
import { Eye, Info } from "lucide-react";

export default function ShareModeBanner({ mode }) {
  if (mode !== "viewer") return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-3 mt-2 rounded-2xl border border-[#E5D5C5] bg-[#FFF4E6] px-4 py-2 flex items-start gap-3 shadow-sm">
        <Eye className="w-4 h-4 mt-[2px] text-[#8C6A4F]" />

        <div className="text-xs text-[#5A4636] leading-relaxed">
          <p className="font-semibold mb-[2px]">
            你目前是「共用檢視模式」
          </p>
          <p className="text-[#8C6A4F]">
            可編輯記帳、行李、匯率，但變更只會儲存在你自己的裝置，不會影響原行程。
          </p>
        </div>

        <Info className="w-4 h-4 text-[#C6A087] ml-auto shrink-0" />
      </div>
    </div>
  );
}