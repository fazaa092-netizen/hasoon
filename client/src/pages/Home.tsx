import { Link } from "wouter";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CarFront,
  HeartPulse,
  HomeIcon,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import StudioSlider from "@/components/StudioSlider";
import CategoryIcons from "@/components/CategoryIcons";
import FamilyApplication from "@/components/FamilyApplication";
import { useLang } from "@/contexts/LanguageContext";

const COPY = {
  ar: {
    badge: "مبادرة فزعة لعام الأسرة 2026",
    titleTop: "لكل أسرةٍ سند.",
    titleBottom: "ولكل يومٍ مزايا.",
    lead:
      "منظومة عضوية تدعم جودة حياة الأسرة الإماراتية والمقيمة، وتقرّب إليها مزايا التعليم والصحة والسكن والنقل والترفيه.",
    primary: "اكتشف عضويتك",
    secondary: "تعرّف إلى المزايا",
    collaboration: "بالتعاون مع وزارة الأسرة",
    support: "دعم يمتد إلى جميع إمارات الدولة",
    free: "العضوية ضمن المبادرة مجانية",
    pathLabel: "رحلة واضحة",
    pathTitle: "من اختيار الفئة إلى تفعيل المزايا",
    path: [
      ["01", "حدّد فئتك", "اختر العضوية التي تطابق تكوين أسرتك."],
      ["02", "أكمل الطلب", "أدخل بياناتك وعنوان التوصيل بخطوات قصيرة."],
      ["03", "ابدأ الاستفادة", "فعّل عضويتك واستكشف المزايا المتاحة لأسرتك."],
    ],
    memberKicker: "عضوية تناسب تكوين أسرتك",
    memberTitle: "اختيار واضح، بلا تعقيد.",
    memberLead:
      "تختلف فئة العضوية بحسب تكوين الأسرة. اختر فئتك للاطلاع على الأهلية والمزايا الرئيسية.",
    eligible: "الفئة المناسبة",
    included: "ما الذي يميزها؟",
    request: "ابدأ طلب هذه العضوية",
    details: "عرض جميع التفاصيل",
    freeLabel: "مجانية ضمن المبادرة",
    sectorsTitle: "مزايا تمس تفاصيل الحياة اليومية.",
    sectorsLead:
      "تجمع المبادرة حزمة متكاملة من الخدمات المدعومة عبر شراكات استراتيجية في القطاعات الأكثر أثرًا على استقرار الأسرة وجودة حياتها.",
    initiativeTitle: "الأسرة في قلب المجتمع.",
    initiativeBody:
      "تأتي المبادرة انسجامًا مع الأجندة الوطنية لنمو الأسرة 2031، لتقوية التماسك الأسري ودعم استدامة الحياة العائلية في دولة الإمارات.",
    initiativeLink: "اقرأ مزايا العضويات",
    closingTitle: "اختر ما يناسب أسرتك، ونحن نسهّل الباقي.",
    closingBody: "ابدأ بطلب واضح وآمن، وانتقل بين الخطوات دون فقدان بياناتك.",
    closingCta: "ابدأ طلب العضوية",
  },
  en: {
    badge: "Fazaa Family Year Initiative 2026",
    titleTop: "A stronger family.",
    titleBottom: "A better everyday.",
    lead:
      "A membership ecosystem supporting Emirati and resident families with meaningful benefits across education, health, housing, mobility and entertainment.",
    primary: "Find your membership",
    secondary: "Explore benefits",
    collaboration: "In collaboration with the Ministry of Family",
    support: "Support across all seven Emirates",
    free: "Membership under the initiative is free",
    pathLabel: "A clear journey",
    pathTitle: "From eligibility to active benefits",
    path: [
      ["01", "Choose your tier", "Match the membership to your family profile."],
      ["02", "Complete the request", "Add your details and delivery address in a few steps."],
      ["03", "Unlock benefits", "Activate your membership and discover what is available."],
    ],
    memberKicker: "A membership for every family profile",
    memberTitle: "A clearer way to choose.",
    memberLead:
      "Your membership tier is based on your family profile. Select a tier to review eligibility and core benefits.",
    eligible: "Best suited for",
    included: "What stands out",
    request: "Request this membership",
    details: "View full details",
    freeLabel: "Free under the initiative",
    sectorsTitle: "Benefits for everyday family life.",
    sectorsLead:
      "The initiative brings together subsidized services through strategic partnerships across the sectors that matter most to family wellbeing and stability.",
    initiativeTitle: "Family at the heart of community.",
    initiativeBody:
      "Aligned with the National Family Growth Agenda 2031, the initiative strengthens family cohesion and supports sustainable family life across the UAE.",
    initiativeLink: "Explore membership benefits",
    closingTitle: "Choose what fits your family. We simplify the rest.",
    closingBody: "Start with a clear, secure request and move through every step without losing your information.",
    closingCta: "Start membership request",
  },
};

const SECTORS = [
  { icon: HomeIcon, ar: "السكن", en: "Housing" },
  { icon: BookOpen, ar: "التعليم", en: "Education" },
  { icon: HeartPulse, ar: "الصحة", en: "Healthcare" },
  { icon: ShieldCheck, ar: "التأمين", en: "Insurance" },
  { icon: CarFront, ar: "النقل", en: "Mobility" },
  { icon: Ticket, ar: "الترفيه", en: "Entertainment" },
];

export default function Home() {
  const { lang } = useLang();
  const copy = COPY[lang];

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

      <section className="sectors-section" aria-labelledby="sectors-title">
        <div className="container sectors-layout">
          <div className="sectors-copy">
            <span className="section-kicker section-kicker-light">FAZAA × FAMILY</span>
            <h2 id="sectors-title">{copy.sectorsTitle}</h2>
            <p>{copy.sectorsLead}</p>
          </div>
          <div className="sectors-grid">
            {SECTORS.map((sector) => (
              <div className="sector-item" key={sector.en}>
                <sector.icon aria-hidden="true" />
                <span>{sector[lang]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="initiative-section" id="initiative" aria-labelledby="initiative-title">
        <div className="container initiative-layout">
          <div className="initiative-image">
            <img
              src="/manus-storage/fazaa-card-lineup_9046a5b7.webp"
              alt={lang === "ar" ? "مجموعة بطاقات فزعة الرسمية" : "Official Fazaa membership card collection"}
              loading="eager"
            />
          </div>
          <div className="initiative-copy">
            <Building2 aria-hidden="true" />
            <h2 id="initiative-title">{copy.initiativeTitle}</h2>
            <p>{copy.initiativeBody}</p>
            <Link href="/benefits" className="text-link text-link-blue">
              {copy.initiativeLink}
              <ArrowLeft className="h-4 w-4 rtl-icon" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="closing-section">
        <div className="container closing-panel">
          <div>
            <h2>{copy.closingTitle}</h2>
            <p>{copy.closingBody}</p>
          </div>
          <Link href="/register" className="button button-gold">
            {copy.closingCta}
            <ArrowLeft className="h-4 w-4 rtl-icon" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
