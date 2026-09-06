import type { ReactNode } from "react";
import { Check } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const STEPS = ["التسجيل", "العنوان", "المراجعة", "الدفع", "التأكيد"];

export function OrderSteps({ active }: { active: number }) {
  return (
    <div className="order-progress-wrap">
      <div className="container">
        <ol className="order-progress" aria-label="خطوات طلب العضوية">
          {STEPS.map((step, index) => {
            const complete = index < active;
            const current = index === active;
            return (
              <li key={step} className={complete ? "is-complete" : current ? "is-current" : ""} aria-current={current ? "step" : undefined}>
                <span className="order-progress-dot">{complete ? <Check aria-hidden="true" /> : index + 1}</span>
                <span className="order-progress-label">{step}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
