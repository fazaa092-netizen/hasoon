export interface StudioSlide {
  id: string;
  src: string;
  titleAr: string;
  titleEn: string;
}

export const STUDIO_SLIDES: StudioSlide[] = [
  { id: "back-to-school", src: "/manus-storage/studio-slide-01_9fd4d78e.webp", titleAr: "العودة للمدارس", titleEn: "Back to School" },
  { id: "emirati-womens-day", src: "/manus-storage/studio-slide-02_71874557.webp", titleAr: "يوم المرأة الإماراتية 2026", titleEn: "Emirati Women's Day 2026" },
  { id: "thailand", src: "/manus-storage/studio-slide-03_7f84a6a7.webp", titleAr: "عروض السفر إلى تايلاند", titleEn: "Thailand Travel Offers" },
  { id: "latest-offers", src: "/manus-storage/studio-slide-04_45901e83.webp", titleAr: "أحدث عروض فزعة", titleEn: "Latest Fazaa Offers" },
  { id: "entertainment-vouchers", src: "/manus-storage/studio-slide-05_4866cbcf.webp", titleAr: "القسائم الترفيهية", titleEn: "Entertainment Vouchers" },
  { id: "people-of-determination", src: "/manus-storage/studio-slide-06_a4a890f3.webp", titleAr: "عضوية أصحاب الهمم", titleEn: "People of Determination Membership" },
  { id: "proud-of-uae", src: "/manus-storage/studio-slide-07_6718ccb5.webp", titleAr: "فخورون بالإمارات", titleEn: "Proud of UAE" },
  { id: "du-benefits", src: "/manus-storage/studio-slide-08_1849f282.webp", titleAr: "عرض عضوية du", titleEn: "du Membership Offer" },
  { id: "fazaa-amakin", src: "/manus-storage/studio-slide-09_d1388114.webp", titleAr: "فزعة أماكن", titleEn: "Fazaa Amakin" },
  { id: "long-term-car-lease", src: "/manus-storage/studio-slide-10_b91a7322.webp", titleAr: "إيجار السيارات طويل الأمد", titleEn: "Long-term Car Lease" },
  { id: "used-cars", src: "/manus-storage/studio-slide-11_bce11d08.webp", titleAr: "فزعة للسيارات المستعملة", titleEn: "Fazaa Used Cars" },
  { id: "daily-rent", src: "/manus-storage/studio-slide-12_e978ade7.webp", titleAr: "خدمة تأجير السيارات اليومية", titleEn: "Daily Car Rental" },
  { id: "fazaa-stores", src: "/manus-storage/studio-slide-13_3bf460d3.webp", titleAr: "متاجر فزعة", titleEn: "Fazaa Stores" },
];

export function wrapStudioIndex(index: number, length = STUDIO_SLIDES.length) {
  return ((index % length) + length) % length;
}
