import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const STEPS = ["التسجيل", "العنوان", "المراجعة", "الدفع", "التأكيد"];

export function OrderSteps({ active }: { active: number }) {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-center gap-1 sm:gap-2 max-w-2xl mx-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  i <= active
                    ? "bg-gradient-to-br from-[#E6C766] to-[#C9A227] text-[#15120c] border-[#B8881F]"
                    : "bg-white text-muted-foreground border-border"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-[10px] sm:text-xs ${i <= active ? "text-[#B8881F] font-semibold" : "text-muted-foreground"}`}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 sm:w-12 -mt-5 ${i < active ? "bg-[#C9A227]" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
