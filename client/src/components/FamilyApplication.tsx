import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ChevronDown, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/contexts/LanguageContext";
import { useOrder, type OrderData } from "@/contexts/OrderContext";
import { MEMBERSHIPS, REGIONS, type MembershipTier } from "@/lib/data";

type InitiativeTier = Exclude<MembershipTier, "family">;

const INITIATIVE_TIERS: InitiativeTier[] = ["platinum", "gold", "silver"];

function isInitiativeTier(tier: MembershipTier): tier is InitiativeTier {
  return tier !== "family";
}

const TIER_ELIGIBILITY: Record<Exclude<MembershipTier, "family">, { ar: string; en: string }> = {
  platinum: {
    ar: "للأسر الكبيرة (4 أطفال فأكثر) والأسر الراعية لأصحاب الهمم",
    en: "For larger families with 4+ children and families caring for People of Determination",
  },
  gold: {
    ar: "للأسر الصغيرة (1–3 أطفال)",
    en: "For smaller families with 1–3 children",
  },
  silver: {
    ar: "للأسرة الإماراتية الجديدة حديثة الزواج",
    en: "For newly married Emirati families",
  },
};

export interface FamilyApplicationData {
  fullName: string;
  phone: string;
  email: string;
  region: string;
  tier: InitiativeTier;
  agree: boolean;
}

export function validateFamilyApplication(data: FamilyApplicationData) {
  if (!data.fullName.trim() || !data.phone.trim() || !data.email.trim() || !data.region) {
    return "missing-fields" as const;
  }
  if (!/^\S+@\S+\.\S+$/.test(data.email)) return "invalid-email" as const;
  if (!data.agree) return "terms" as const;
  return null;
}

export function toOrderPrefill(data: FamilyApplicationData): Partial<OrderData> {
  return {
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    region: data.region,
    tier: data.tier,
    agree: data.agree,
  };
}

export default function FamilyApplication() {
  const { lang } = useLang();
  const { order, update } = useOrder();
  const [, navigate] = useLocation();
  const initialTier: InitiativeTier = isInitiativeTier(order.tier) ? order.tier : "gold";
  const [form, setForm] = useState<FamilyApplicationData>({
    fullName: order.fullName,
    phone: order.phone,
    email: order.email,
    region: order.region,
    tier: initialTier,
    agree: order.agree,
  });

  const copy = lang === "ar"
    ? {
        eyebrow: "AL USRA × FAZAA",
        title: "مبادرة فزعة لعام الأسرة 2026",
        intro: "بالتعاون مع وزارة الأسرة، تقدم فزعة باقات حصرية لدعم جودة حياة الأسرة الإماراتية.",
        introStrong: "مبادرة مخصصة للأسر الإماراتية",
        instructions: "تعليمات التسجيل",
        instructionItems: [
          "اكتب الاسم كما هو مسجل في نظام الهوية الإماراتية.",
          "استخدم رقم الهاتف المرتبط بملف الهوية.",
          "اختر فئة العضوية المطابقة لتكوين أسرتك.",
        ],
        name: "الاسم الكامل: (يرجى كتابة الاسم كما هو في الهوية)",
        phone: "رقم الهاتف المتحرك: (المسجل في نظام الهوية)",
        email: "البريد الإلكتروني",
        emirate: "الإمارة",
        chooseEmirate: "اختر الإمارة",
        categories: "فئات العضوية المؤهلة",
        choose: "اختر",
        chosen: "تم الاختيار",
        benefitsTitle: "المزايا",
        benefits: "حزمة عروض ومزايا حصرية تشمل السكن، التعليم، الصحة، التأمين، المستلزمات الأساسية، النقل والترفيه بأسعار مدعومة وبأقل من التكلفة.",
        consent: "أقر بأن البيانات المقدمة صحيحة وأوافق على الشروط والأحكام",
        submit: "تقديم الطلب",
        errors: {
          missing: "يرجى تعبئة بيانات التسجيل المطلوبة",
          email: "يرجى إدخال بريد إلكتروني صحيح",
          tier: "يرجى اختيار فئة العضوية",
          terms: "يجب الإقرار بصحة البيانات والموافقة على الشروط",
        },
      }
    : {
        eyebrow: "AL USRA × FAZAA",
        title: "Fazaa Family Year Initiative 2026",
        intro: "In collaboration with the Ministry of Family, Fazaa offers exclusive packages supporting Emirati family wellbeing.",
        introStrong: "An initiative for Emirati families",
        instructions: "Registration instructions",
        instructionItems: [
          "Enter the name exactly as registered in the UAE identity system.",
          "Use the mobile number connected to your identity profile.",
          "Choose the membership tier matching your family profile.",
        ],
        name: "Full name (as shown on your Emirates ID)",
        phone: "Mobile number (registered in the identity system)",
        email: "Email address",
        emirate: "Emirate",
        chooseEmirate: "Choose an Emirate",
        categories: "Eligible membership tiers",
        choose: "Choose",
        chosen: "Selected",
        benefitsTitle: "Benefits",
        benefits: "Exclusive benefits across housing, education, healthcare, insurance, essential supplies, mobility and entertainment at subsidized rates.",
        consent: "I confirm that the information is accurate and agree to the terms and conditions",
        submit: "Submit application",
        errors: {
          missing: "Complete the required registration details",
          email: "Enter a valid email address",
          tier: "Choose a membership tier",
          terms: "Confirm the information and accept the terms",
        },
      };

  const set = <K extends keyof FamilyApplicationData>(key: K, value: FamilyApplicationData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const error = validateFamilyApplication(form);
    if (error === "missing-fields") return toast.error(copy.errors.missing);
    if (error === "invalid-email") return toast.error(copy.errors.email);
    if (error === "terms") return toast.error(copy.errors.terms);
    update(toOrderPrefill(form));
    navigate("/register?from=family");
  };

  return (
    <section className="family-application-section" aria-labelledby="family-application-title">
      <div className="container family-application-shell">
        <div className="family-application-heading">
          <span>{copy.eyebrow}</span>
          <h2 id="family-application-title">{copy.title}</h2>
          <p>{copy.intro}</p>
          <strong>{copy.introStrong}</strong>
        </div>

        <form className="family-application-form" onSubmit={submit}>
          <details className="registration-instructions">
            <summary>
              <span>{copy.instructions}</span>
              <ChevronDown aria-hidden="true" />
            </summary>
            <ul>
              {copy.instructionItems.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}
            </ul>
          </details>

          <div className="family-field-grid">
            <label>
              <span>{copy.name}</span>
              <input value={form.fullName} onChange={(event) => set("fullName", event.target.value)} autoComplete="name" required />
            </label>
            <label>
              <span>{copy.phone}</span>
              <input value={form.phone} onChange={(event) => set("phone", event.target.value)} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required />
            </label>
            <label>
              <span>{copy.email}</span>
              <input value={form.email} onChange={(event) => set("email", event.target.value)} type="email" autoComplete="email" dir="ltr" required />
            </label>
            <label>
              <span>{copy.emirate}</span>
              <select value={form.region} onChange={(event) => set("region", event.target.value)} required>
                <option value="">{copy.chooseEmirate}</option>
                {REGIONS.map((region) => <option value={region} key={region}>{region}</option>)}
              </select>
            </label>
          </div>

          <fieldset className="family-tier-fieldset">
            <legend>{copy.categories}</legend>
            <div className="family-tier-grid">
              {INITIATIVE_TIERS.map((tier) => {
                const membership = MEMBERSHIPS.find((item) => item.id === tier)!;
                const selected = form.tier === tier;
                return (
                  <label className={`family-tier-card ${selected ? "is-selected" : ""}`} key={tier}>
                    <input type="radio" name="family-tier" value={tier} checked={selected} onChange={() => set("tier", tier)} />
                    <span className="family-tier-eligibility">{TIER_ELIGIBILITY[tier][lang]}</span>
                    <img src={membership.image} alt={membership.name} />
                    <span className="family-tier-footer">
                      <strong>{membership.name.replace("العضوية ", "")}</strong>
                      <span>{selected ? copy.chosen : copy.choose}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="family-benefits-note">
            <ShieldCheck aria-hidden="true" />
            <div>
              <strong>{copy.benefitsTitle}</strong>
              <p>{copy.benefits}</p>
            </div>
          </div>

          <label className="family-consent">
            <input type="checkbox" checked={form.agree} onChange={(event) => set("agree", event.target.checked)} />
            <span>{copy.consent}</span>
          </label>

          <button type="submit" className="button button-primary family-submit">{copy.submit}</button>
        </form>
      </div>
    </section>
  );
}
