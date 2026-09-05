// بيانات موقع فزعة (تجريبية للعرض)

export const ASSETS = {
  heroFamily: "/manus-storage/hero_family_d6e6e8cb.png",
  logo: "/manus-storage/fazaa_logo_4b2062d9.jpg",
  cardSilver: "/manus-storage/card_silver_new_e8f0bca9.jpg",
  cardGold: "/manus-storage/card_gold_new_b57ef8f5.jpg",
  cardPlatinum: "/manus-storage/card_platinum_new_3fd6f17f.jpg",
  cardFamily: "/manus-storage/card_family_new_fabb1717.jpg",
  pattern: "/manus-storage/pattern_gold_1cebd42b.jpg",
};

export type MembershipTier = "silver" | "gold" | "platinum" | "family";

export interface Membership {
  id: MembershipTier;
  name: string;
  tagline: string;
  price: number;
  priceLabel: string;
  image: string;
  accent: string;
  popular?: boolean;
  benefits: string[];
}

export const MEMBERSHIPS: Membership[] = [
  {
    id: "silver",
    name: "العضوية الفضية",
    tagline: "للأسر الجديدة وحديثي الزواج من دون أبناء",
    price: 150,
    priceLabel: "150 ر.س / سنويًا",
    image: ASSETS.cardSilver,
    accent: "#9CA3AF",
    benefits: [
      "خصوماتٌ حصرية في أكثر من 30,000 منفذٍ تجاري.",
      "خصوماتٌ تصل إلى 60% على التذاكر الترفيهية المختارة.",
      "المشاركة في برامج إيجار السيارات طوال العام.",
      "خصوماتٌ إضافية على الفنادق ووجهات السفر.",
      "عروضٌ حصرية ومتجدّدة في منافذ فزعة المعتمدة.",
      "امتيازاتٌ خاصة على المنتجات والخدمات الرقمية.",
    ],
  },
  {
    id: "gold",
    name: "العضوية الذهبية",
    tagline: "للأسر التي لديها من طفلٍ واحد إلى ثلاثة أطفال",
    price: 300,
    priceLabel: "300 ر.س / سنويًا",
    image: ASSETS.cardGold,
    accent: "#C9A227",
    popular: true,
    benefits: [
      "خصوماتٌ في أكثر من 30,000 منفذٍ تجاري معتمَد.",
      "خصوماتٌ تصل إلى 70% على التذاكر المختارة.",
      "امتيازاتٌ موسّعة في برامج إيجار السيارات.",
      "عروضٌ مميّزة على الفنادق والمعالم السياحية.",
      "خصوماتٌ مضاعفة في منافذ فزعة الحصرية.",
      "باقاتٌ خاصة للمنتجات والخدمات العائلية.",
    ],
  },
  {
    id: "platinum",
    name: "العضوية البلاتينية",
    tagline: "للأسر التي تضمّ 4 أبناء فأكثر أو أحد أفرادها من أصحاب الهمم",
    price: 500,
    priceLabel: "500 ر.س / سنويًا",
    image: ASSETS.cardPlatinum,
    accent: "#71717A",
    benefits: [
      "أعلى نسبة خصوماتٍ في أكثر من 30,000 منفذٍ تجاري.",
      "امتيازاتٌ شاملة على جميع التذاكر الترفيهية.",
      "مزايا إضافية مُصمَّمة للأسر الكبيرة.",
      "عروضٌ حصرية في الفنادق ووجهات السفر الراقية.",
      "أولويةٌ في الخدمات والدعم المخصَّص للعضوية.",
      "بطاقةٌ رقمية فورية فور قبول الطلب.",
    ],
  },
  {
    id: "family",
    name: "بطاقة الأسرة",
    tagline: "مزايا شاملة لجميع أفراد الأسرة",
    price: 400,
    priceLabel: "400 ر.س / سنوياً",
    image: ASSETS.cardFamily,
    accent: "#B8881F",
    benefits: [
      "مزايا شاملة تغطّي جميع أفراد الأسرة.",
      "خصوماتٌ عائلية في أكثر من 30,000 منفذٍ تجاري.",
      "باقاتٌ ترفيهية وتعليمية للأبناء.",
      "عروضٌ خاصة على السفر والفنادق للعائلات.",
      "خدماتٌ صحية وتأمينية بأسعار تفضيلية.",
      "بطاقاتٌ إضافية لأفراد الأسرة.",
    ],
  },
];

export const FEATURES = [
  {
    icon: "Gift",
    title: "عروضٌ حصرية لأعضاء فزعة",
    desc: "استمتع بمزايا وخصومات متجدّدة طَوال العام لدى شركائنا.",
  },
  {
    icon: "Sparkles",
    title: "مفاجآتُ الموسم",
    desc: "عروضٌ موسمية مفاجئة تُضاف باستمرار لأعضاء البطاقة.",
  },
  {
    icon: "Smartphone",
    title: "بطاقةُ فزعة الرقمية",
    desc: "تطبيقٌ واحد يجمع كلّ مزايا عضويتك بين يديك.",
  },
  {
    icon: "ShieldCheck",
    title: "موثوقية وأمان",
    desc: "تجربة عضوية آمنة وخدمة دعم مخصّصة على مدار العام.",
  },
];

export interface Partner {
  name: string;
  short: string;
  category: string;
  discount: string;
  color: string;
}

export const CATEGORIES = [
  "جميع الفئات",
  "التسوق",
  "المطاعم",
  "السفر والفنادق",
  "الترفيه",
  "الصحة",
  "التعليم",
  "السيارات",
  "الاتصالات",
];

export const PARTNERS: Partner[] = [
  { name: "كارفور", short: "كا", category: "التسوق", discount: "خصم حتى 25%", color: "#1e4fa3" },
  { name: "لولو هايبرماركت", short: "لو", category: "التسوق", discount: "خصم 20%", color: "#d4a017" },
  { name: "شرف دي جي", short: "شر", category: "التسوق", discount: "عروض حصرية", color: "#111111" },
  { name: "إكسترا", short: "إك", category: "التسوق", discount: "خصم 15%", color: "#1565c0" },
  { name: "سنتر بوينت", short: "سن", category: "التسوق", discount: "خصم 20%", color: "#102a43" },
  { name: "مطاعم عرمة", short: "مط", category: "المطاعم", discount: "خصم 30%", color: "#5c3a1e" },
  { name: "مطعم الصفدي", short: "مط", category: "المطاعم", discount: "خصم 25%", color: "#3f5c1e" },
  { name: "ستاربكس", short: "ست", category: "المطاعم", discount: "خصم 15%", color: "#0b3d2e" },
  { name: "كنتاكي", short: "كن", category: "المطاعم", discount: "خصم 20%", color: "#b3132b" },
  { name: "بيتزا هت", short: "بي", category: "المطاعم", discount: "خصم 25%", color: "#c0102b" },
  { name: "طيران الإمارات", short: "طي", category: "السفر والفنادق", discount: "خصم 15%", color: "#7a0c12" },
  { name: "الاتحاد للطيران", short: "ال", category: "السفر والفنادق", discount: "خصم 12%", color: "#1a1a1a" },
  { name: "فنادق روتانا", short: "فن", category: "السفر والفنادق", discount: "خصم 30%", color: "#102a43" },
  { name: "فنادق جميرا", short: "فن", category: "السفر والفنادق", discount: "خصم 25%", color: "#1f3a5f" },
  { name: "Booking.com", short: "Bo", category: "السفر والفنادق", discount: "خصم 20%", color: "#003580" },
  { name: "دبي لاند", short: "دب", category: "الترفيه", discount: "تذاكر مخفضة 40%", color: "#1565c0" },
  { name: "فيراري وورلد", short: "في", category: "الترفيه", discount: "خصم 25%", color: "#c0102b" },
  { name: "ياس ووتروورلد", short: "يا", category: "الترفيه", discount: "خصم 30%", color: "#2196c4" },
  { name: "سكي دبي", short: "سك", category: "الترفيه", discount: "خصم 20%", color: "#4aa3df" },
  { name: "فوكس سينما", short: "فو", category: "الترفيه", discount: "خصم 25%", color: "#d35400" },
  { name: "مستشفى ميدكلينك", short: "مس", category: "الصحة", discount: "خصم 20%", color: "#0b7a6b" },
  { name: "مستشفى NMC", short: "مس", category: "الصحة", discount: "خصم 15%", color: "#10456e" },
  { name: "صيدليات بوتس", short: "صي", category: "الصحة", discount: "خصم 10%", color: "#1565c0" },
  { name: "فيتنس فيرست", short: "في", category: "الصحة", discount: "خصم 30%", color: "#c0102b" },
  { name: "جامعة الإمارات", short: "جا", category: "التعليم", discount: "منح وخصومات", color: "#7a0c12" },
  { name: "معهد كامبردج", short: "مع", category: "التعليم", discount: "خصم 25%", color: "#6e1023" },
  { name: "مدارس جيمس", short: "مد", category: "التعليم", discount: "خصم 15%", color: "#102a43" },
  { name: "العربية للسيارات", short: "ال", category: "السيارات", discount: "خصم 5%", color: "#10325e" },
  { name: "الفطيم", short: "Al", category: "السيارات", discount: "عروض مميزة", color: "#b3132b" },
  { name: "شركة الإطارات المتحدة", short: "شر", category: "السيارات", discount: "خصم 20%", color: "#111111" },
  { name: "اتصالات", short: "ات", category: "الاتصالات", discount: "باقات مخفضة", color: "#c0102b" },
  { name: "دو", short: "دو", category: "الاتصالات", discount: "باقات حصرية", color: "#10153e" },
];

export const REGIONS = ["إمارة أبوظبي", "إمارة دبي", "إمارة الشارقة", "إمارة عجمان", "إمارة أم القيوين", "إمارة رأس الخيمة", "إمارة الفجيرة"];
export const CITIES = ["أبوظبي", "العين", "الظفرة", "دبي", "الشارقة", "خورفكان", "كلباء", "عجمان", "أم القيوين", "رأس الخيمة", "الفجيرة", "دبا الفجيرة"];

export function tierLabel(t: MembershipTier) {
  return MEMBERSHIPS.find((m) => m.id === t)?.name ?? "";
}

// أحياء وشوارع شائعة في الإمارات (لقوائم اختيار العنوان)
export const DISTRICTS = [
  "الخالدية", "الكورنيش", "المرور", "النادي السياحي", "المشرف", "الباھية",
  "الريف", "محمد بن زايد", "الشامخة", "الوثبة", "المصفح",
  "الجميرا", "ديرة", "بر دبي", "القصيص", "المنخول", "الراشدية",
  "النهدة", "القرھود", "المويلح", "الناصرية", "أبو شغارة", "الرولة",
  "الراشدية", "الحميدية", "النعيمية", "الرميلة", "الجرف",
];

export const STREETS = [
  "شارع الشيخ زايد", "شارع الكورنيش", "شارع المطار", "شارع حمدان",
  "شارع خليفة", "شارع المرور", "شارع السلام", "شارع الفلاح",
  "شارع النصر", "شارع الوحدة", "شارع المينا", "شارع الإستقلال",
  "شارع الدفاع", "شارع بني ياس", "شارع الميناء", "شارع الإتحاد",
];
