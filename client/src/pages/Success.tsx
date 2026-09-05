/* صفحة نجاح الطلب */
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import { useOrder } from "@/contexts/OrderContext";
import { tierLabel } from "@/lib/data";
import { CheckCircle2, Truck, Phone, Home } from "lucide-react";

export default function Success() {
  const { order } = useOrder();
  const orderNumber = order.orderNumber || "FZ-000000";

  return (
    <SiteLayout>
      <section className="container py-16 max-w-xl">
        <div className="card-soft p-8 text-center fazaa-fade-up">
          <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">تم استلام طلبك بنجاح!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            شكراً لانضمامك إلى عائلة فزعة. سيتم مراجعة طلبك وتجهيز بطاقتك.
          </p>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#15120c] to-[#221d12] p-6 text-white">
            <p className="text-xs text-white/60 mb-1">رقم الطلب</p>
            <p className="text-2xl font-extrabold fazaa-gold-text tracking-wider">{orderNumber}</p>
            <p className="mt-2 text-xs text-white/70">{tierLabel(order.tier)}</p>
          </div>

          <div className="mt-6 text-right space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 h-8 w-8 rounded-lg bg-[#C9A227]/15 flex items-center justify-center flex-shrink-0">
                <Truck className="h-4 w-4 text-[#B8881F]" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">طريقة التوصيل</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  سيتم توصيل بطاقتك إلى العنوان الذي أدخلته في الموعد المحدد ({order.deliveryDate || "حسب الجدول"}) خلال أيام العمل.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 h-8 w-8 rounded-lg bg-[#C9A227]/15 flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-[#B8881F]" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">تواصل مندوب التوصيل</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  سيتواصل معك مندوب توصيل أرامكس عبر رقم هاتفك المسجّل لتنسيق وقت ومكان التسليم قبل وصوله.
                </p>
              </div>
            </div>
          </div>

          <Link href="/" className="mt-7 inline-flex items-center justify-center gap-2 btn-gold rounded-full px-7 py-3 text-sm font-bold w-full">
            <Home className="h-4 w-4" /> العودة للرئيسية
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
