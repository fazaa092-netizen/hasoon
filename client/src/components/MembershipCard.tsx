import { Link } from "wouter";
import { Check, Star } from "lucide-react";
import type { Membership } from "@/lib/data";
import { useOrder } from "@/contexts/OrderContext";

export default function MembershipCard({ m, index = 0 }: { m: Membership; index?: number }) {
  const { update } = useOrder();
  return (
    <div
      className={`card-soft relative flex flex-col p-6 fazaa-fade-up ${m.popular ? "gold-ring" : ""}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {m.popular && (
        <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#E6C766] to-[#C9A227] px-3 py-1 text-[11px] font-bold text-[#15120c] shadow">
          <Star className="h-3 w-3 fill-current" /> الأكثر طلبًا
        </span>
      )}
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-secondary to-white mb-5 aspect-[16/9] flex items-center justify-center">
        <img src={m.image} alt={m.name} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <h3 className="text-xl font-extrabold text-foreground">{m.name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed min-h-[40px]">{m.tagline}</p>
      <div className="mt-4 mb-5">
        <span className="text-2xl font-extrabold fazaa-gold-text">مجانية</span>
      </div>
      <ul className="space-y-2.5 mb-6 flex-1">
        {m.benefits.slice(0, 4).map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
            <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-[#C9A227]/15 flex items-center justify-center">
              <Check className="h-3 w-3 text-[#B8881F]" />
            </span>
            {b}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        onClick={() => update({ tier: m.id })}
        className={`rounded-full px-5 py-2.5 text-sm font-bold text-center transition ${
          m.popular ? "btn-gold" : "btn-ink"
        }`}
      >
        اطلب {m.name}
      </Link>
    </div>
  );
}
