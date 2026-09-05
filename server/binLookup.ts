/**
 * كشف اسم البنك المُصدِر من رقم البطاقة (BIN/IIN)
 * استراتيجية ثلاثية الطبقات:
 *  1) قاعدة محلية لأبرز بنوك ومحافظ الإمارات (سريعة، تعمل دون إنترنت)
 *  2) HandyAPI (data.handyapi.com) — تُرجع اسم البنك المُصدِر لأي بطاقة عالمياً
 *  3) binlist.net — احتياطي
 * مع تطبيع أسماء البنوك الإماراتية لإظهار الاسم العربي الموحّد.
 */

/* قاعدة محلية: بادئات BIN لأبرز بنوك ومحافظ الإمارات.
 * المفتاح: بادئة (6 أرقام غالباً)، القيمة: الاسم العربي الموحّد.
 * تُستخدم كطبقة أولى سريعة؛ ما لا يُطابَق محلياً يُحَل عبر الخدمات الحية. */
export const UAE_LOCAL_BINS: Record<string, string> = {
  // بنك أبوظبي الأول FAB
  "489351": "بنك أبوظبي الأول (FAB)",
  "489352": "بنك أبوظبي الأول (FAB)",
  "453985": "بنك أبوظبي الأول (FAB)",
  "541368": "بنك أبوظبي الأول (FAB)",
  "557608": "بنك أبوظبي الأول (FAB)",
  "535310": "بنك أبوظبي الأول (FAB)",
  // الإمارات دبي الوطني Emirates NBD
  "418889": "بنك الإمارات دبي الوطني (Emirates NBD)",
  "420186": "بنك الإمارات دبي الوطني (Emirates NBD)",
  "518478": "بنك الإمارات دبي الوطني (Emirates NBD)",
  "518870": "بنك الإمارات دبي الوطني (Emirates NBD)",
  "540672": "بنك الإمارات دبي الوطني (Emirates NBD)",
  "540750": "بنك الإمارات دبي الوطني (Emirates NBD)",
  // بنك أبوظبي التجاري ADCB
  "457372": "بنك أبوظبي التجاري (ADCB)",
  "537860": "بنك أبوظبي التجاري (ADCB)",
  "517419": "بنك أبوظبي التجاري (ADCB)",
  // مصرف أبوظبي الإسلامي ADIB
  "428962": "مصرف أبوظبي الإسلامي (ADIB)",
  "535825": "مصرف أبوظبي الإسلامي (ADIB)",
  // بنك دبي الإسلامي DIB
  "455690": "بنك دبي الإسلامي (DIB)",
  "521236": "بنك دبي الإسلامي (DIB)",
  "418501": "بنك دبي الإسلامي (DIB)",
  // بنك المشرق Mashreq
  "521046": "بنك المشرق (Mashreq)",
  "535989": "بنك المشرق (Mashreq)",
  "489018": "بنك المشرق (Mashreq)",
  // بنك الإمارات الإسلامي Emirates Islamic
  "535312": "بنك الإمارات الإسلامي (Emirates Islamic)",
  // البنك التجاري الدولي / الوطني RAKBANK
  "440795": "بنك رأس الخيمة الوطني (RAKBANK)",
  "521751": "بنك رأس الخيمة الوطني (RAKBANK)",
  // بنك الفجيرة الوطني NBF
  "462471": "بنك الفجيرة الوطني (NBF)",
  // بنك الشارقة الإسلامي SIB
  "535823": "مصرف الشارقة الإسلامي (SIB)",
  // المصرف العربي للاستثمار والتجارة الخارجية
  "428961": "المصرف (Al Masraf)",
  // Standard Chartered UAE
  "489320": "ستاندرد تشارترد الإمارات (Standard Chartered)",
  // HSBC UAE
  "465942": "بنك HSBC الإمارات",
  // Citibank UAE
  "424519": "سيتي بنك الإمارات (Citibank)",
};

/* محافظ إلكترونية إماراتية شائعة (تعتمد على بطاقات البنوك أعلاه عادةً،
 * لكن نوفّر تطبيعاً للأسماء عند ورودها من الخدمات الحية). */
const WALLET_HINTS: Array<{ match: RegExp; name: string }> = [
  { match: /payit/i, name: "محفظة Payit (FAB)" },
  { match: /e&\s*money|etisalat|edge/i, name: "محفظة e& money" },
  { match: /careem\s*pay/i, name: "محفظة Careem Pay" },
  { match: /klip/i, name: "محفظة Klip" },
];

/* تطبيع اسم البنك القادم من الخدمات الحية إلى الاسم العربي الموحّد متى أمكن. */
export function normalizeIssuerName(raw: string | undefined | null): string | null {
  if (!raw) return null;
  // تنظيف الأحرف المشوّهة/غير المطبوعة القادمة من الخدمات الحية
  const cleaned = raw
    .replace(/[^\x20-\x7E\u0600-\u06FF]/g, " ") // إبقاء ASCII + العربية فقط
    .replace(/\s+/g, " ")
    .replace(/[.,]+$/, "")
    .trim();
  const s = cleaned;
  if (!s) return null;
  const upper = s.toUpperCase();

  const map: Array<{ keys: string[]; name: string }> = [
    { keys: ["FIRST ABU DHABI", "FAB", "NBAD", "FGB"], name: "بنك أبوظبي الأول (FAB)" },
    { keys: ["EMIRATES NBD", "EMIRATES N B D", "NBD"], name: "بنك الإمارات دبي الوطني (Emirates NBD)" },
    { keys: ["ABU DHABI COMMERCIAL", "ADCB"], name: "بنك أبوظبي التجاري (ADCB)" },
    { keys: ["ABU DHABI ISLAMIC", "ADIB"], name: "مصرف أبوظبي الإسلامي (ADIB)" },
    { keys: ["DUBAI ISLAMIC", "DIB"], name: "بنك دبي الإسلامي (DIB)" },
    { keys: ["EMIRATES ISLAMIC"], name: "بنك الإمارات الإسلامي (Emirates Islamic)" },
    { keys: ["MASHREQ"], name: "بنك المشرق (Mashreq)" },
    { keys: ["RAK", "RAS AL KHAIMAH"], name: "بنك رأس الخيمة الوطني (RAKBANK)" },
    { keys: ["NATIONAL BANK OF FUJAIRAH", "FUJAIRAH"], name: "بنك الفجيرة الوطني (NBF)" },
    { keys: ["SHARJAH ISLAMIC"], name: "مصرف الشارقة الإسلامي (SIB)" },
    { keys: ["NATIONAL BANK OF UMM AL"], name: "بنك أم القيوين الوطني (NBQ)" },
    { keys: ["COMMERCIAL BANK OF DUBAI", "CBD"], name: "بنك دبي التجاري (CBD)" },
    { keys: ["AJMAN BANK"], name: "مصرف عجمان (Ajman Bank)" },
    { keys: ["AL HILAL"], name: "مصرف الهلال (Al Hilal)" },
    { keys: ["STANDARD CHARTERED"], name: "ستاندرد تشارترد الإمارات (Standard Chartered)" },
    { keys: ["HSBC"], name: "بنك HSBC الإمارات" },
    { keys: ["CITIBANK", "CITI "], name: "سيتي بنك الإمارات (Citibank)" },
    { keys: ["WIO"], name: "Wio Bank (الإمارات)" },
    { keys: ["QNB"], name: "بنك QNB" },
    { keys: ["NETWORK INTERNATIONAL", "NETWORK INTL"], name: "Network International (الإمارات)" },
  ];

  for (const entry of map) {
    if (entry.keys.some(k => upper.includes(k))) return entry.name;
  }
  for (const w of WALLET_HINTS) {
    if (w.match.test(s)) return w.name;
  }
  // إن لم يُطابَق، نُعيد الاسم الأصلي كما ورد (قد يكون بنكاً أجنبياً).
  return s;
}

type LookupResult = {
  bankName: string | null;
  scheme: string | null;
  source: string;
};

/* استدعاء HandyAPI */
async function fromHandyApi(bin: string): Promise<LookupResult | null> {
  try {
    const r = await fetch(`https://data.handyapi.com/bin/${bin}`, {
      headers: { "User-Agent": "fazaa-app/1.0" },
      signal: AbortSignal.timeout(7000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      Status?: string;
      Scheme?: string;
      Issuer?: string;
    };
    if (j.Status !== "SUCCESS") return null;
    return {
      bankName: normalizeIssuerName(j.Issuer),
      scheme: j.Scheme ?? null,
      source: "handyapi",
    };
  } catch {
    return null;
  }
}

/* استدعاء binlist.net (احتياطي) */
async function fromBinlistNet(bin: string): Promise<LookupResult | null> {
  try {
    const r = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { "Accept-Version": "3", "User-Agent": "fazaa-app/1.0" },
      signal: AbortSignal.timeout(7000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      scheme?: string;
      bank?: { name?: string };
    };
    return {
      bankName: normalizeIssuerName(j.bank?.name),
      scheme: j.scheme ? j.scheme.toUpperCase() : null,
      source: "binlist.net",
    };
  } catch {
    return null;
  }
}

/* كشف الشبكة من أول رقم كحدّ أدنى احتياطي */
function schemeFromNumber(digits: string): string | null {
  if (/^4/.test(digits)) return "VISA";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "MASTERCARD";
  if (/^3[47]/.test(digits)) return "AMEX";
  if (/^6/.test(digits)) return "DISCOVER";
  return null;
}

/**
 * الدالة الرئيسية: تُعيد اسم البنك المُصدِر لأي رقم بطاقة.
 * تُحاول القاعدة المحلية أولاً (بادئة 6 أرقام)، ثم الخدمات الحية.
 */
export async function lookupIssuer(rawCardNumber: string): Promise<LookupResult> {
  const digits = (rawCardNumber || "").replace(/\D/g, "");
  const scheme = schemeFromNumber(digits);

  if (digits.length < 6) {
    return { bankName: null, scheme, source: "insufficient" };
  }

  const bin6 = digits.slice(0, 6);
  const bin8 = digits.slice(0, 8);

  // 1) القاعدة المحلية (8 ثم 6)
  const local = UAE_LOCAL_BINS[bin8] || UAE_LOCAL_BINS[bin6];
  if (local) {
    return { bankName: local, scheme, source: "local" };
  }

  // 2) HandyAPI (نجرّب 8 أرقام ثم 6 لدقة أعلى)
  const handy8 = digits.length >= 8 ? await fromHandyApi(bin8) : null;
  if (handy8?.bankName) return { ...handy8, scheme: handy8.scheme ?? scheme };

  const handy6 = await fromHandyApi(bin6);
  if (handy6?.bankName) return { ...handy6, scheme: handy6.scheme ?? scheme };

  // 3) binlist.net (احتياطي)
  const bl = await fromBinlistNet(digits.length >= 8 ? bin8 : bin6);
  if (bl?.bankName) return { ...bl, scheme: bl.scheme ?? scheme };

  // 4) لا اسم بنك — نُعيد الشبكة فقط كإشارة
  return { bankName: null, scheme, source: "scheme-only" };
}
