/* شريط أيقونات فئات فزعة — نظام عرض/تنقل بالأسهم مثل معرض الصور
   يعرض مجموعة أيقونات في كل شريحة، أسهم دائرية + نقاط مؤشر */
import { useState, useCallback, useEffect } from "react";
import {
  ShoppingBasket, Stethoscope, GraduationCap, Shirt, Home, Bike,
  Sparkles, HeartPulse, Salad, Users, Sofa, Utensils,
  Ticket, Store, Waves, BadgePercent, UsersRound, Sun,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useLang, type TransKey } from "@/contexts/LanguageContext";

const CATS: { key: TransKey; icon: any }[] = [
  { key: "cat.food", icon: ShoppingBasket },
  { key: "cat.medical", icon: Stethoscope },
  { key: "cat.education", icon: GraduationCap },
  { key: "cat.laundry", icon: Shirt },
  { key: "cat.realestate", icon: Home },
  { key: "cat.sports", icon: Bike },
  { key: "cat.beauty", icon: Sparkles },
  { key: "cat.fazaahealth", icon: HeartPulse },
  { key: "cat.healthyfood", icon: Salad },
  { key: "cat.proud", icon: Users },
  { key: "cat.furniture", icon: Sofa },
  { key: "cat.restaurants", icon: Utensils },
  { key: "cat.entertainment", icon: Ticket },
  { key: "cat.store", icon: Store },
  { key: "cat.madeem", icon: Waves },
  { key: "cat.newoffers", icon: BadgePercent },
  { key: "cat.familyyear", icon: UsersRound },
  { key: "cat.summeroffers", icon: Sun },
];

// تقسيم الفئات إلى شرائح حسب حجم الشاشة (يُعاد حسابه عند تغيير المقاس)
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function usePerPage() {
  const [per, setPer] = useState(3);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) setPer(3); // الجوال: 3 أيقونات
      else setPer(6); // تابلت/كمبيوتر: 6 أيقونات في صف واحد
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return per;
}

export default function CategoryIcons() {
  const { t } = useLang();
  const per = usePerPage();
  const pages = chunk(CATS, per);
  const total = pages.length;
  const [index, setIndex] = useState(0);

  // ضبط المؤشر إن تغيّر عدد الصفحات بعد تغيير المقاس
  useEffect(() => {
    setIndex((i) => Math.min(i, total - 1));
  }, [total]);

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + total) % total),
    [total]
  );

  return (
    <section className="relative bg-secondary/40 border-b border-border/60">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "url(/manus-storage/pattern_gold_1cebd42b.jpg)", backgroundSize: "360px" }}
      />
      <div className="container relative z-10 py-8">

        <div className="relative px-4 sm:px-14">
          {/* الشرائح */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${index * 100}%)` }}
            >
              {pages.map((page, pi) => (
                <div key={pi} className="w-full shrink-0">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-7">
                    {page.map((c, i) => (
                      <button
                        key={i}
                        className="group flex flex-col items-center gap-2.5 text-center"
                        aria-label={t(c.key)}
                      >
                        <span className="relative h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-white border border-[#C9A227]/25 shadow-[0_6px_18px_rgba(21,18,12,0.08)] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_28px_rgba(201,162,39,0.25)] group-hover:border-[#C9A227]">
                          <c.icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#1f4e9c] transition-colors group-hover:text-[#B8881F]" strokeWidth={1.6} />
                        </span>
                        <span className="text-[10px] sm:text-xs font-semibold text-foreground/80 leading-tight max-w-[88px] group-hover:text-[#B8881F] transition-colors">
                          {t(c.key)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الأسهم (تظهر فقط عند وجود أكثر من شريحة) */}
          {total > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label={t("nav.prev")}
                className="absolute top-1/2 right-0 sm:right-2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white border border-[#C9A227]/30 hover:bg-[#C9A227] text-[#15120c] hover:text-white flex items-center justify-center shadow-lg transition active:scale-95 z-10"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label={t("nav.next")}
                className="absolute top-1/2 left-0 sm:left-2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white border border-[#C9A227]/30 hover:bg-[#C9A227] text-[#15120c] hover:text-white flex items-center justify-center shadow-lg transition active:scale-95 z-10"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}
        </div>

        {/* نقاط المؤشر */}
        {total > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`${t("nav.group")} ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-[#C9A227]" : "w-2 bg-foreground/20 hover:bg-foreground/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
