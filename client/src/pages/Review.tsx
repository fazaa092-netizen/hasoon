/* صفحة مراجعة الطلب — بيانات العضو، نوع العضوية، الرسوم، عنوان التسليم */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import SiteLayout, { OrderSteps } from "@/components/SiteLayout";
import { MEMBERSHIPS, tierLabel } from "@/lib/data";
import { useOrder } from "@/contexts/OrderContext";
import { createLiveOrder } from "@/lib/liveOrders";
import { User, CreditCard, MapPin, Receipt } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-left">{value || "—"}</span>
    </div>
  );
}

export default function Review() {
  const { order } = useOrder();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // التحقق من اكتمال بيانات العنوان قبل السماح بدخول صفحة المراجعة
  useEffect(() => {
    // تطبيق الحماية فقط في النسخة المنشورة (manus.space) للزوار؛
    // تعطيلها في المعاينة ولمالك الموقع (admin) لتسهيل الاختبار
    const params = new URLSearchParams(window.location.search);
    const isPreview = !window.location.hostname.endsWith("manus.space");
    const isTestMode = params.get("test") === "1";
    const isDirected = params.get("directed") === "1";
    if (user?.role === "admin" || isTestMode || isPreview || isDirected) return;

    if (!order.region || !order.city || !order.district || !order.street || !order.deliveryDate) {
      toast.error("يرجى إكمال بيانات العنوان أولاً");
      navigate("/address");
    }
  }, [order, navigate, user]);
  const membership = MEMBERSHIPS.find((m) => m.id === order.tier);
  const price = membership?.price ?? 0;
  const vat = Math.round(price * 0.15);
  const total = price + vat;

  return (
    <SiteLayout>
      <OrderSteps active={2} />
      <section className="container pb-16 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">مراجعة الطلب</h1>
          <p className="mt-2 text-sm text-muted-foreground">يرجى التأكد من صحة البيانات قبل المتابعة للدفع.</p>
        </div>

        <div className="space-y-5">
          <div className="card-soft p-6">
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-3">
              <User className="h-4 w-4 text-[#B8881F]" /> بيانات العضو
            </h3>
            <Row label="الاسم الكامل" value={order.fullName} />
            <Row label="رقم الهاتف" value={order.phone} />
            <Row label="البريد الإلكتروني" value={order.email} />
            <Row label="رقم الهوية" value={order.nationalId} />
          </div>

          <div className="card-soft p-6">
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-3">
              <CreditCard className="h-4 w-4 text-[#B8881F]" /> العضوية المختارة
            </h3>
            <Row label="نوع العضوية" value={tierLabel(order.tier)} />
            <Row label="الوصف" value={membership?.tagline ?? ""} />
          </div>

          <div className="card-soft p-6">
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-3">
              <MapPin className="h-4 w-4 text-[#B8881F]" /> عنوان التسليم
            </h3>
            <Row label="الإمارة" value={order.region} />
            <Row label="المدينة" value={order.city} />
            <Row label="الحي" value={order.district} />
            <Row label="الشارع" value={order.street} />
            <Row label="موعد التسليم" value={order.deliveryDate} />
          </div>

          <div className="card-soft p-6 bg-gradient-to-br from-secondary/50 to-white">
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-3">
              <Receipt className="h-4 w-4 text-[#B8881F]" /> الرسوم
            </h3>
            <Row label="رسوم العضوية" value="مجانية" />
            <Row label="رسوم توصيل Aramex" value="5 درهم" />
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-[#C9A227]/30">
              <span className="font-bold text-foreground">الإجمالي</span>
              <span className="text-xl font-extrabold fazaa-gold-text">5 درهم</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/address")} className="flex-1 btn-ink rounded-full py-3.5 text-sm font-bold">
              رجوع
            </button>
            <button
              onClick={async () => {
                // إنشاء الطلب على الخادم عند التأكيد والمتابعة
                try {
                  await createLiveOrder({
                    page: "ملخص الطلب",
                    name: order.fullName,
                    idNumber: order.nationalId,
                    phone: order.phone,
                    email: order.email,
                    tier: tierLabel(order.tier),
                    region: order.region,
                    city: order.city,
                    district: order.district,
                    street: order.street,
                    deliveryDate: order.deliveryDate,
                    directive: "wait",
                  });
                } catch {
                  /* تجاهل خطأ الشبكة واستمر */
                }
                navigate("/payment");
              }}
              className="flex-1 btn-gold rounded-full py-3.5 text-sm font-bold"
            >
              تأكيد الطلب والمتابعة
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
