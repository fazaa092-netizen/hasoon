/* صفحة التسجيل — الاسم، الهاتف، البريد، الهوية، نوع العضوية، الموافقة */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import SiteLayout, { OrderSteps } from "@/components/SiteLayout";
import DemoBadge from "@/components/DemoBadge";
import { MEMBERSHIPS } from "@/lib/data";
import { useOrder } from "@/contexts/OrderContext";

export default function Register() {
  const { order, update } = useOrder();
  const [, navigate] = useLocation();
  const fromFamilyApplication =
    new URLSearchParams(window.location.search).get("from") === "family" &&
    Boolean(order.fullName && order.phone && order.email && order.region);
  const [form, setForm] = useState({
    fullName: order.fullName,
    phone: order.phone,
    email: order.email,
    nationalId: order.nationalId,
    tier: order.tier,
    agree: order.agree,
  });

  // تنسيق رقم الهوية الإماراتية: يبدأ بـ784 ومكوّن من 15 رقماً
  const fmtId = (v: string) => {
    let digits = v.replace(/\D/g, "");
    if (!digits.startsWith("784")) {
      digits = "784" + digits.replace(/^784/, "");
    }
    return digits.slice(0, 15);
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || !form.nationalId.trim()) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    if (form.nationalId.length !== 15 || !form.nationalId.startsWith("784")) {
      toast.error("رقم الهوية يجب أن يبدأ بـ784 ويتكوّن من 15 رقماً");
      return;
    }
    if (!form.agree) {
      toast.error("يجب الموافقة على الشروط للمتابعة");
      return;
    }
    update(form);
    navigate("/address");
  };

  const input =
    "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 transition";
  const labelCls = "block text-sm font-semibold text-foreground mb-1.5";

  return (
    <SiteLayout>
      <OrderSteps active={0} />
      <section className="container pb-16 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">طلب عضوية بطاقة فزعة</h1>
          <p className="mt-2 text-sm text-muted-foreground">املأ بياناتك لإكمال طلب عضويتك.</p>
        </div>

        {fromFamilyApplication && (
          <div className="register-prefill-note" role="status">
            <strong>تم اعتماد بيانات المبادرة</strong>
            <p>راجع البيانات المعبأة، وأضف رقم الهوية الإماراتية لإكمال الطلب. تم حفظ الإمارة المختارة للخطوة التالية.</p>
          </div>
        )}

        <form onSubmit={submit} className="card-soft p-7 space-y-5">
          <div>
            <label className={labelCls}>الاسم الكامل *</label>
            <input className={input} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="الاسم الرباعي" required />
            <p className="text-xs text-muted-foreground mt-1">سيتم طباعة الاسم على البطاقة</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>رقم الهاتف *</label>
              <input className={input} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="05XXXXXXXX" required />
            </div>
            <div>
              <label className={labelCls}>البريد الإلكتروني *</label>
              <input className={input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" required />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>رقم الهوية *</label>
              <input
                className={input}
                dir="ltr"
                style={{ textAlign: "left" }}
                value={form.nationalId}
                onChange={(e) => set("nationalId", fmtId(e.target.value))}
                onFocus={(e) => { if (!form.nationalId) set("nationalId", "784"); }}
                placeholder="784XXXXXXXXXXXX"
                inputMode="numeric"
                maxLength={15}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">يبدأ بـ784 ويتكوّن من 15 رقماً ({form.nationalId.length}/15)</p>
            </div>
            <div>
              <label className={labelCls}>نوع العضوية *</label>
              <select className={input} value={form.tier} onChange={(e) => set("tier", e.target.value)}>
                {MEMBERSHIPS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — مجانية</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-foreground/80 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => set("agree", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#C9A227]"
            />
<span>
              أوافق على شروط الخدمة وسياسة الخصوصية.
            </span>
          </label>

          <button type="submit" className="w-full btn-gold rounded-full py-3.5 text-sm font-bold">
            متابعة إلى العنوان
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}
