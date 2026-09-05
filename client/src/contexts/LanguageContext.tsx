/* سياق اللغة لموقع فزعة — يتحكم باللغة (ar/en) والاتجاه (rtl/ltr) ويحفظ الاختيار */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Lang = "ar" | "en";

/* قاموس الترجمة للنصوص الرئيسية في الواجهة */
const DICT = {
  // الهيدر
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.memberships": { ar: "العضويات", en: "Memberships" },
  "nav.benefits": { ar: "مزايا العضوية", en: "Benefits" },
  "cta.requestCard": { ar: "اطلب بطاقتك", en: "Request Card" },
  "menu.label": { ar: "القائمة", en: "Menu" },

  // الصفحة الرئيسية — قسم العضويات
  "home.chooseTitle": { ar: "اختر عضويتك المناسبة", en: "Choose Your Membership" },
  "home.chooseDesc": {
    ar: "أربع باقاتٍ مصمَّمة لتناسب كل أسرة، لكلٍّ منها مجموعةٌ من المزايا والخصومات الحصرية.",
    en: "Four plans designed to fit every family, each with its own set of exclusive benefits and discounts.",
  },
  "common.requestNow": { ar: "أطلب الآن", en: "Request Now" },
  "common.showMore": { ar: "عرض المزيد", en: "Show More" },
  "badge.mostPopular": { ar: "الأكثر طلباً", en: "Most Popular" },

  // أسماء وأوصاف العضويات (المعروضة في الصفحة الرئيسية)
  "tier.platinum.title": { ar: "البلاتينية", en: "Platinum" },
  "tier.platinum.desc": { ar: "أوسع مزايا وعروض حصرية.", en: "Widest range of exclusive benefits and offers." },
  "tier.gold.title": { ar: "الذهبية", en: "Gold" },
  "tier.gold.desc": { ar: "عروض وخصومات مميزة.", en: "Premium offers and discounts." },
  "tier.silver.title": { ar: "الفضية", en: "Silver" },
  "tier.silver.desc": { ar: "خصومات وخدمات أساسية.", en: "Essential discounts and services." },
  "tier.family.title": { ar: "بطاقة الأسرة", en: "Family Card" },
  "tier.family.desc": { ar: "مزايا شاملة لجميع أفراد الأسرة.", en: "Comprehensive benefits for the whole family." },

  // فئات الأقسام (CategoryIcons)
  "cat.food": { ar: "المنتجات الغذائية", en: "Groceries" },
  "cat.medical": { ar: "الطب", en: "Medical" },
  "cat.education": { ar: "التعليم", en: "Education" },
  "cat.laundry": { ar: "مصبغة", en: "Laundry" },
  "cat.realestate": { ar: "العقارات", en: "Real Estate" },
  "cat.sports": { ar: "الرياضة", en: "Sports" },
  "cat.beauty": { ar: "الجمال", en: "Beauty" },
  "cat.fazaahealth": { ar: "فزعة هيلث", en: "Fazaa Health" },
  "cat.healthyfood": { ar: "مطاعم صحية", en: "Healthy Dining" },
  "cat.proud": { ar: "فخر الوطن", en: "National Pride" },
  "cat.furniture": { ar: "المنازل والأثاث", en: "Home & Furniture" },
  "cat.restaurants": { ar: "المطاعم", en: "Restaurants" },
  "cat.entertainment": { ar: "الترفيه", en: "Entertainment" },
  "cat.store": { ar: "المتجر", en: "Store" },
  "cat.madeem": { ar: "مديم", en: "Madeem" },
  "cat.newoffers": { ar: "العروض الجديدة", en: "New Offers" },
  "cat.familyyear": { ar: "مبادرة فزعة لعام الأسرة 2026", en: "Fazaa Family Year 2026" },
  "cat.summeroffers": { ar: "العروض الصيفية", en: "Summer Offers" },

  // أزرار التنقل العامة
  "nav.prev": { ar: "السابق", en: "Previous" },
  "nav.next": { ar: "التالي", en: "Next" },
  "nav.group": { ar: "المجموعة", en: "Group" },

  // الفوتر
  "footer.tagline": {
    ar: "بطاقةُ عضوية فاخرة تفتح لأسرتك عالماً من الامتيازات والخصومات الحصرية لدى آلاف الشركاء.",
    en: "A premium membership card that opens a world of privileges and exclusive discounts at thousands of partners for your family.",
  },
  "footer.quickLinks": { ar: "روابط سريعة", en: "Quick Links" },
  "footer.requestMembership": { ar: "طلب عضوية", en: "Request Membership" },
  "footer.rights": {
    ar: "© 2026 بطاقةُ فزعة — جميع الحقوق محفوظة.",
    en: "© 2026 Fazaa Card — All rights reserved.",
  },
  "footer.security": {
    ar: "جميع المعلومات المالية محمية ومشفرة. لن يتم حفظ بيانات البطاقة على خوادمنا.",
    en: "All financial information is protected and encrypted. Card data is never stored on our servers.",
  },
} as const;

export type TransKey = keyof typeof DICT;

interface LanguageContextType {
  lang: Lang;
  dir: "rtl" | "ltr";
  toggleLang: () => void;
  setLang: (l: Lang) => void;
  t: (key: TransKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "fazaa-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "ar" || stored === "en") return stored;
    } catch {
      /* localStorage غير متاح */
    }
    return "ar";
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* تجاهل */
    }
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(
    () => setLangState((l) => (l === "ar" ? "en" : "ar")),
    []
  );

  const t = useCallback(
    (key: TransKey) => {
      const entry = DICT[key];
      if (!entry) return key;
      return entry[lang] ?? entry.ar;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, dir, toggleLang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang must be used within LanguageProvider");
  }
  return ctx;
}
