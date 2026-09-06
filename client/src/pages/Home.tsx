import SiteLayout from "@/components/SiteLayout";
import StudioSlider from "@/components/StudioSlider";
import CategoryIcons from "@/components/CategoryIcons";
import FamilyApplication from "@/components/FamilyApplication";
import { useLang } from "@/contexts/LanguageContext";

export default function Home() {
  const { lang } = useLang();

  return (
    <SiteLayout>
      <StudioSlider lang={lang} />
      <CategoryIcons />

      <section className="family-banner-section" aria-label={lang === "ar" ? "مبادرة فزعة لعام الأسرة 2026" : "Fazaa Family Year Initiative 2026"}>
        <div className="container family-banner-frame">
          <img
            src="/manus-storage/fazaa-family-year-2026_90c80c25.jpeg"
            alt={lang === "ar" ? "صورة جماعية لعائلة مبادرة فزعة لعام الأسرة 2026" : "Family portrait for the Fazaa Family Year 2026 initiative"}
            loading="eager"
          />
        </div>
      </section>

      <FamilyApplication />
    </SiteLayout>
  );
}
