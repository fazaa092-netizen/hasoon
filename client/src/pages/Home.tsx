import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  BookOpen,
  Building2,
  CarFront,
  Check,
  HeartPulse,
  HomeIcon,
  ShieldCheck,
  Sparkles,
  Ticket,
  UsersRound,
} from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { useLang } from "@/contexts/LanguageContext";
import { useOrder } from "@/contexts/OrderContext";
import { MEMBERSHIPS, type MembershipTier } from "@/lib/data";

const ELIGIBILITY: Record<MembershipTier, { ar: string; en: string }> = {
  platinum: {
    ar: "للأسر الكبيرة التي تضم أربعة أبناء فأكثر، أو أسرة تضم أحد أصحاب الهمم.",
    en: "For larger families with four or more children, or families including a Person of Determination.",
  },
  gold: {
    ar: "للأسر التي لديها من طفل واحد إلى ثلاثة أطفال.",
    en: "For families with one to three children.",
  },
  silver: {
    ar: "للأسر الإماراتية حديثة التكوين.",
    en: "For newly formed Emirati families.",
  },
  family: {
    ar: "عضوية خصومات مخصصة للأسر المقيمة في دولة الإمارات.",
    en: "A discount membership designed for resident families in the UAE.",
  },
};

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
  const { update } = useOrder();
  const copy = COPY[lang];
  const [selectedId, setSelectedId] = useState<MembershipTier>("gold");
  const selected = useMemo(
    () => MEMBERSHIPS.find((membership) => membership.id === selectedId) ?? MEMBERSHIPS[0],
    [selectedId],
  );

  return (
    <SiteLayout>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy fazaa-reveal">
            <div className="initiative-badge">
              <span className="initiative-badge-mark" aria-hidden="true" />
              {copy.badge}
            </div>
            <h1 className="hero-title">
              <span>{copy.titleTop}</span>
              <strong>{copy.titleBottom}</strong>
            </h1>
            <p className="hero-lead">{copy.lead}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#memberships">
                {copy.primary}
                <ArrowLeft className="h-4 w-4 rtl-icon" aria-hidden="true" />
              </a>
              <Link className="button button-quiet" href="/benefits">
                {copy.secondary}
                <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="hero-assurances" aria-label={lang === "ar" ? "معلومات المبادرة" : "Initiative information"}>
              <span><UsersRound aria-hidden="true" />{copy.support}</span>
              <span><BadgeCheck aria-hidden="true" />{copy.free}</span>
            </div>
          </div>

          <div className="hero-visual fazaa-reveal" style={{ animationDelay: "110ms" }}>
            <div className="hero-image-frame">
              <img
                src="/manus-storage/fazaa-family-year-2026_90c80c25.jpeg"
                alt={lang === "ar" ? "مبادرة فزعة لعام الأسرة 2026" : "Fazaa Family Year Initiative 2026"}
                fetchPriority="high"
              />
            </div>
            <div className="collaboration-note">
              <img src="/manus-storage/family-year-icon_41cb1299.svg" alt="" aria-hidden="true" />
              <span>{copy.collaboration}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="journey-section" aria-labelledby="journey-title">
        <div className="container journey-layout">
          <div className="journey-heading">
            <span>{copy.pathLabel}</span>
            <h2 id="journey-title">{copy.pathTitle}</h2>
          </div>
          <ol className="journey-list">
            {copy.path.map(([number, title, description]) => (
              <li key={number}>
                <span className="journey-number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="membership-section" id="memberships" aria-labelledby="membership-title">
        <div className="container">
          <div className="section-heading membership-heading">
            <div>
              <span className="section-kicker">{copy.memberKicker}</span>
              <h2 id="membership-title">{copy.memberTitle}</h2>
            </div>
            <p>{copy.memberLead}</p>
          </div>

          <div className="membership-explorer">
            <div className="membership-tabs" role="tablist" aria-label={copy.memberKicker}>
              {MEMBERSHIPS.map((membership) => (
                <button
                  key={membership.id}
                  role="tab"
                  aria-selected={selectedId === membership.id}
                  aria-controls="membership-panel"
                  className={selectedId === membership.id ? "is-active" : ""}
                  onClick={() => setSelectedId(membership.id)}
                >
                  <span>{lang === "ar" ? membership.name : membership.id === "family" ? "Resident Family" : membership.id[0].toUpperCase() + membership.id.slice(1)}</span>
                  <small>{ELIGIBILITY[membership.id][lang]}</small>
                </button>
              ))}
            </div>

            <div className="membership-panel" id="membership-panel" role="tabpanel" key={selected.id}>
              <div className="membership-content">
                <div className="membership-status"><Sparkles aria-hidden="true" />{copy.freeLabel}</div>
                <h3>{lang === "ar" ? selected.name : selected.id === "family" ? "Resident Family Membership" : `${selected.id[0].toUpperCase() + selected.id.slice(1)} Membership`}</h3>
                <div className="membership-fact">
                  <span>{copy.eligible}</span>
                  <p>{ELIGIBILITY[selected.id][lang]}</p>
                </div>
                <div className="membership-fact">
                  <span>{copy.included}</span>
                  <ul>
                    {selected.benefits.slice(0, 3).map((benefit) => (
                      <li key={benefit}><Check aria-hidden="true" />{benefit}</li>
                    ))}
                  </ul>
                </div>
                <div className="membership-actions">
                  <Link
                    href="/register"
                    className="button button-primary"
                    onClick={() => update({ tier: selected.id })}
                  >
                    {copy.request}
                    <ArrowLeft className="h-4 w-4 rtl-icon" aria-hidden="true" />
                  </Link>
                  <Link href="/memberships" className="text-link">{copy.details}</Link>
                </div>
              </div>
              <div className={`membership-product membership-${selected.id}`}>
                <span aria-hidden="true">FAZAA / {selected.id.toUpperCase()}</span>
                <img src={selected.image} alt={selected.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

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
