/* كشف اسم البنك المُصدِر للبطاقة (داخل الإمارات) من بادئة رقم البطاقة (BIN).
   ملاحظة: قاعدة BIN ليست شاملة 100%؛ تغطي أبرز البنوك الإماراتية الشائعة.
   تُطابق البادئات من الأطول إلى الأقصر للحصول على أدق نتيجة. */

interface BinRule {
  prefixes: string[]; // بادئات BIN (أرقام)
  bank: string; // اسم البنك بالعربية
}

/* البادئات مرتّبة منطقياً؛ يتم الفرز تلقائياً بالطول عند المطابقة */
const UAE_BIN_RULES: BinRule[] = [
  { bank: "بنك الإمارات دبي الوطني (Emirates NBD)", prefixes: ["455960", "457372", "521166", "529931", "552096", "557876", "428962", "440576"] },
  { bank: "بنك أبوظبي الأول (FAB)", prefixes: ["451756", "489351", "521003", "535989", "552533", "557958", "418934", "428757"] },
  { bank: "بنك أبوظبي التجاري (ADCB)", prefixes: ["402991", "457000", "521893", "529865", "549697", "557654"] },
  { bank: "بنك دبي الإسلامي (DIB)", prefixes: ["418123", "457264", "521156", "528740", "558264"] },
  { bank: "مصرف أبوظبي الإسلامي (ADIB)", prefixes: ["418936", "457261", "521751", "535310", "557943"] },
  { bank: "بنك المشرق (Mashreq)", prefixes: ["406476", "411837", "440795", "521164", "535420", "557345"] },
  { bank: "بنك دبي التجاري (CBD)", prefixes: ["402978", "457339", "521882", "545616"] },
  { bank: "بنك الإمارات الإسلامي (Emirates Islamic)", prefixes: ["427556", "457268", "521760"] },
  { bank: "بنك رأس الخيمة الوطني (RAKBANK)", prefixes: ["406929", "439891", "521880", "535419"] },
  { bank: "بنك الشارقة الإسلامي (SIB)", prefixes: ["428086", "521757"] },
  { bank: "بنك أم القيوين الوطني (NBQ)", prefixes: ["521758"] },
  { bank: "بنك الفجيرة الوطني (NBF)", prefixes: ["428044", "521759"] },
  { bank: "بنك الاستثمار (Invest Bank)", prefixes: ["521761"] },
  { bank: "بنك الخليج الأول (سابقاً)", prefixes: ["455708"] },
  { bank: "ستاندرد تشارترد الإمارات", prefixes: ["453211", "521162"] },
  { bank: "إتش إس بي سي الإمارات (HSBC)", prefixes: ["453943", "462347", "521353"] },
  { bank: "سيتي بنك الإمارات (Citibank)", prefixes: ["424631", "542418"] },
];

/* الشبكة العالمية (تُستخدم كاحتياطي عند تعذّر تحديد البنك المحلي) */
function networkName(digits: string): string {
  if (/^4/.test(digits)) return "بطاقة Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "بطاقة Mastercard";
  if (/^3[47]/.test(digits)) return "بطاقة American Express";
  if (/^6/.test(digits)) return "بطاقة Discover/UnionPay";
  return "بطاقة غير معروفة";
}

/**
 * يُعيد اسم البنك المُصدِر من رقم البطاقة.
 * @param cardNumber رقم البطاقة (قد يحتوي مسافات)
 * @returns اسم البنك الإماراتي إن عُرف، وإلا اسم الشبكة، و"-" إن كان فارغاً
 */
export function detectBank(cardNumber: string): string {
  const digits = (cardNumber || "").replace(/\D/g, "");
  if (digits.length < 6) return "-";

  // اجمع كل (بادئة، بنك) ثم رتّب بالطول تنازلياً لأدق مطابقة
  const flat: { prefix: string; bank: string }[] = [];
  for (const rule of UAE_BIN_RULES) {
    for (const p of rule.prefixes) flat.push({ prefix: p, bank: rule.bank });
  }
  flat.sort((a, b) => b.prefix.length - a.prefix.length);

  for (const { prefix, bank } of flat) {
    if (digits.startsWith(prefix)) return bank;
  }

  // لم نتعرّف على البنك المحلي — أعد اسم الشبكة كإشارة عامة
  return networkName(digits);
}
