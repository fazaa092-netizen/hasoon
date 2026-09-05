/* الصفحة الرئيسية لفزعة — هيرو + عضويات + مزايا + عروض + شركاء */
import { useState } from "react";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import MembershipCard from "@/components/MembershipCard";
import GalleryStudio from "@/components/GalleryStudio";
import CategoryIcons from "@/components/CategoryIcons";
import { ASSETS, MEMBERSHIPS, FEATURES, PARTNERS, CATEGORIES } from "@/lib/data";
import { Gift, Sparkles, Smartphone, ShieldCheck, Search, ArrowLeft, Store, Percent } from "lucide-react";
import { useLang, type TransKey } from "@/contexts/LanguageContext";

const ICONS: Record<string, any> = { Gift, Sparkles, Smartphone, ShieldCheck };

// ترتيب وعرض العضويات كما في التصميم المرجعي
const byId = (id: string) => MEMBERSHIPS.find((x) => x.id === id)!;
const MEMBERSHIPS_ORDER = [
  { id: "platinum", titleKey: "tier.platinum.title", descKey: "tier.platinum.desc", image: byId("platinum").image },
  { id: "gold", titleKey: "tier.gold.title", descKey: "tier.gold.desc", image: byId("gold").image },
  { id: "silver", titleKey: "tier.silver.title", descKey: "tier.silver.desc", image: byId("silver").image },
  { id: "family", titleKey: "tier.family.title", descKey: "tier.family.desc", image: byId("family").image },
] as const;

export default function Home() {
  const { t } = useLang();
  const [cat, setCat] = useState("جميع الفئات");
  const [q, setQ] = useState("");

  const filtered = PARTNERS.filter(
    (p) => (cat === "جميع الفئات" || p.category === cat) && p.name.includes(q)
  );

  return (
    <SiteLayout>
      {/* استوديو الصور فوق قسم البطل */}
      <GalleryStudio />

      {/* شريط أيقونات الفئات */}
      <CategoryIcons />

      {/* أنواع العضويات */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="fazaa-section-title center text-3xl">{t("home.chooseTitle")}</h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            {t("home.chooseDesc")}
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-4">
          {MEMBERSHIPS_ORDER.map((m, i) => (
            <div
              key={m.id}
              className={`fazaa-fade-up rounded-2xl border p-3 sm:p-5 flex items-center gap-2 sm:gap-5 transition hover:shadow-md ${
                m.id === "gold"
                  ? "bg-[#FBF3DC] border-[#E6C766]/60"
                  : "bg-white border-border"
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {/* الأزرار يساراً */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0 w-20 sm:w-28">
                <Link
                  href="/register"
                  className={`w-full text-center rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold transition active:scale-[0.97] ${
                    m.id === "gold"
                      ? "bg-gradient-to-l from-[#E6C766] to-[#C9A227] text-[#15120c] shadow"
                      : "bg-gradient-to-l from-[#3a3a44] to-[#52525b] text-white shadow"
                  }`}
                >
                  {t("common.requestNow")}
                </Link>
                <Link
                  href="/memberships"
                  className="text-[10px] sm:text-xs font-semibold text-[#B8881F] hover:underline"
                >
                  {t("common.showMore")}
                </Link>
              </div>

              {/* الاسم والوصف وسطاً */}
              <div className="flex-1 text-right min-w-0">
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  {m.id === "platinum" && (
                    <span className="inline-block rounded-md bg-[#E11D48] text-white text-[10px] font-bold px-2 py-0.5">
                      {t("badge.mostPopular")}
                    </span>
                  )}
                  <h3 className="text-base sm:text-xl font-extrabold text-[#B8881F]">{t(m.titleKey as TransKey)}</h3>
                </div>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-sm text-muted-foreground">{t(m.descKey as TransKey)}</p>
              </div>

              {/* صورة البطاقة يميناً */}
              <div className="flex-shrink-0 w-20 sm:w-36">
                <img
                  src={m.image}
                  alt={t(m.titleKey as TransKey)}
                  loading="lazy"
                  className="w-full h-auto rounded-lg shadow-sm object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
