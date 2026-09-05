/* صفحة معلومات العنوان — المنطقة، المدينة، الحي، الشارع، موعد التسليم */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import SiteLayout, { OrderSteps } from "@/components/SiteLayout";
import { REGIONS, CITIES, DISTRICTS, STREETS } from "@/lib/data";
import { useOrder } from "@/contexts/OrderContext";
import { MapPin } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Address() {
  const { order, update } = useOrder();
  const [, navigate] = useLocation();

  // التحقق من اكتمال بيانات التسجيل قبل السماح بدخول صفحة العنوان
  const { user } = useAuth();
  useEffect(() => {
    // تطبيق الحماية فقط في النسخة المنشورة (manus.space) للزوار؛
    // تعطيلها في المعاينة ولمالك الموقع (admin) لتسهيل الاختبار
    const params = new URLSearchParams(window.location.search);
    const isPreview = !window.location.hostname.endsWith("manus.space");
    const isTestMode = params.get("test") === "1";
    const isDirected = params.get("directed") === "1";
    if (user?.role === "admin" || isTestMode || isPreview || isDirected) return;
    
    if (!order.fullName || !order.phone || !order.email || !order.nationalId || !order.tier) {
      toast.error("يرجى إكمال بيانات التسجيل أولاً");
      navigate("/register");
    }
  }, [order, navigate, user]);
  const [form, setForm] = useState({
    region: order.region,
    city: order.city,
    district: order.district,
    street: order.street,
    deliveryDate: order.deliveryDate,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.region || !form.city || !form.district || !form.street || !form.deliveryDate) {
      toast.error("يرجى تعبئة جميع حقول العنوان وموعد التسليم");
      return;
    }
    update(form);
    navigate("/review");
  };

  const input =
    "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 transition";
  const labelCls = "block text-sm font-semibold text-foreground mb-1.5";

  return (
    <SiteLayout>
      <OrderSteps active={1} />
      <section className="container pb-16 max-w-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#15120c] to-[#221d12] flex items-center justify-center">
            <MapPin className="h-6 w-6 text-[#E6C766]" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">معلومات عنوان التوصيل</h1>
          <p className="mt-2 text-sm text-muted-foreground">سنرسل بطاقتك إلى هذا العنوان.</p>
        </div>

        <form onSubmit={submit} className="card-soft p-7 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>الإمارة *</label>
              <select className={input} value={form.region} onChange={(e) => set("region", e.target.value)} required>
                <option value="">اختر الإمارة</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>المدينة *</label>
              <select className={input} value={form.city} onChange={(e) => set("city", e.target.value)} required>
                <option value="">اختر المدينة</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>الحي *</label>
              <input
                className={input}
                list="districts-list"
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                placeholder="اختر أو اكتب اسم الحي"
                required
              />
              <datalist id="districts-list">
                {DISTRICTS.map((d) => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div>
              <label className={labelCls}>الشارع *</label>
              <input
                className={input}
                list="streets-list"
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
                placeholder="اختر أو اكتب اسم الشارع"
                required
              />
              <datalist id="streets-list">
                {STREETS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>
          <div>
            <label className={labelCls}>موعد التسليم *</label>
            <input
              className={`${input} text-base font-medium text-foreground [color-scheme:light]`}
              dir="ltr"
              style={{ textAlign: "right" }}
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.deliveryDate}
              onChange={(e) => set("deliveryDate", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">اختر التاريخ بصيغة يوم / شهر / سنة</p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/register")} className="flex-1 btn-ink rounded-full py-3.5 text-sm font-bold">
              رجوع
            </button>
            <button type="submit" className="flex-1 btn-gold rounded-full py-3.5 text-sm font-bold">
              متابعة إلى المراجعة
            </button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
