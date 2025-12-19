// src/components/ReadOnlyGuard.jsx
import { Lock } from "lucide-react";

export default function ReadOnlyGuard({
  isReadOnly,
  reason = "此功能在共用檢視模式中無法編輯",
  children,
}) {
  if (!isReadOnly) return children;

  return (
    <div className="relative group inline-block opacity-50 cursor-not-allowed">
      <div className="pointer-events-none">{children}</div>

      <div className="
        absolute z-50 hidden group-hover:block
        left-1/2 -translate-x-1/2 top-full mt-2
        bg-[#5A4636] text-white text-[11px]
        px-3 py-1.5 rounded-full whitespace-nowrap
      ">
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          {reason}
        </div>
      </div>
    </div>
  );
}
