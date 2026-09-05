import { Lock } from "lucide-react";

export default function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-300 px-3 py-1.5 text-[11px] font-semibold text-green-800 ${className}`}
    >
      <Lock className="h-3.5 w-3.5" />
      جميع المعلومات المالية محمية ومشفرة
    </div>
  );
}
