/* صفحة العضويات — عرض جميع الأنواع + جدول مقارنة + زر طلب */
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import MembershipCard from "@/components/MembershipCard";
import { MEMBERSHIPS } from "@/lib/data";
import { useOrder } from "@/contexts/OrderContext";
import { Check, Minus } from "lucide-react";

const COMPARE = [
  { label: "خصومات في أكثر من 30,000 منفذ", silver: true, gold: true, platinum: true },
  { label: "خصم التذاكر الترفيهية", silver: "حتى 60%", gold: "حتى 70%", platinum: "شامل" },
  { label: "برامج إيجار السيارات", silver: true, gold: "موسّعة", platinum: "أولوية" },
  { label: "خصومات الفنادق والسفر", silver: true, gold: true, platinum: "راقية" },
  { label: "مزايا للأسر الكبيرة", silver: false, gold: false, platinum: true },
  { label: "دعم مخصّص وأولوية الخدمة", silver: false, gold: true, platinum: true },
  { label: "بطاقة رقمية فورية", silver: true, gold: true, platinum: true },
];

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="h-4 w-4 text-[#B8881F] mx-auto" />;
  if (v === false) return <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-semibold text-foreground">{v}</span>;
}

export default function Memberships() {
  const { update } = useOrder();
  return (
    <SiteLayout>
      <section className="fazaa-header-bg py-14 relative overflow-hidden">
        <div className="container relative z-10 text-center">
          <span className="inline-block text-xs font-bold tracking-[0.3em] text-[#E6C766] mb-3">FAZAA MEMBERSHIPS</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">عضويات بطاقة فزعة</h1>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto">
            اختر الباقة التي تناسب أسرتك، وقارن المزايا للحصول على أفضل قيمة.
          </p>
        </div>
      </section>

      <section className="container py-14">
        <div className="grid md:grid-cols-3 gap-6">
          {MEMBERSHIPS.map((m, i) => (
            <MembershipCard key={m.id} m={m} index={i} />
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-14">
        <div className="container">
          <h2 className="fazaa-section-title center text-2xl block text-center mb-12">مقارنة المزايا</h2>
          <div className="card-soft overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-center min-w-[420px] sm:min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 sm:p-4 text-right font-bold text-foreground">الميزة</th>
                  {MEMBERSHIPS.map((m) => (
                    <th key={m.id} className="p-2 sm:p-4">
                      <span className="font-extrabold text-foreground">{m.name.replace("العضوية ", "")}</span>
                      <div className="text-[10px] sm:text-xs text-[#B8881F] font-semibold mt-0.5">مجانية</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="p-2 sm:p-4 text-right text-foreground/80">{row.label}</td>
                    <td className="p-2 sm:p-4"><Cell v={row.silver} /></td>
                    <td className="p-2 sm:p-4 bg-[#C9A227]/5"><Cell v={row.gold} /></td>
                    <td className="p-2 sm:p-4"><Cell v={row.platinum} /></td>
                  </tr>
                ))}
                <tr>
                  <td className="p-2 sm:p-4"></td>
                  {MEMBERSHIPS.map((m) => (
                    <td key={m.id} className="p-2 sm:p-4">
                      <Link
                        href="/register"
                        onClick={() => update({ tier: m.id })}
                        className={`inline-block rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold ${m.popular ? "btn-gold" : "btn-ink"}`}
                      >
                        اطلب
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
