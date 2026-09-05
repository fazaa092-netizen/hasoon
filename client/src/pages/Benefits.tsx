/* صفحة مزايا العضوية — بطاقات تفصيلية لكل نوع */
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import { MEMBERSHIPS } from "@/lib/data";
import { Check, Star } from "lucide-react";

export default function Benefits() {
  return (
    <SiteLayout>
      <section className="fazaa-header-bg py-14 relative overflow-hidden">
        <div className="container relative z-10 text-center">
          <span className="inline-block text-xs font-bold tracking-[0.3em] text-[#E6C766] mb-3">FAZAA BENEFITS</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">مزايا عضويات بطاقة فزعة</h1>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto">
            عضوياتٌ مُصمَّمة لتناسب احتياجات كل أسرة، ولكلّ باقةٍ مجموعةٌ من المزايا الحصرية التي ترافقك طوال العام.
          </p>
        </div>
      </section>

      <section className="container py-14 space-y-6">
        {MEMBERSHIPS.map((m, idx) => (
          <div
            key={m.id}
            className="card-soft overflow-hidden grid md:grid-cols-5 fazaa-fade-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="md:col-span-2 bg-gradient-to-br from-secondary to-white p-8 flex flex-col items-center justify-center">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-widest text-[#B8881F] mb-3">
                <Star className="h-3 w-3 fill-current" /> FAZAA
              </span>
              <img src={m.image} alt={m.name} loading="lazy" decoding="async" className="w-full max-w-xs rounded-xl shadow-lg" />
            </div>
            <div className="md:col-span-3 p-8">
              <h3 className="text-2xl font-extrabold text-foreground">{m.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{m.tagline}</p>
              <div className="mt-3 mb-5 text-sm font-bold fazaa-gold-text inline-block">عضوية مجانية</div>
              <h4 className="text-sm font-bold text-[#B8881F] mb-3">المزايا</h4>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {m.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-[#C9A227]/15 flex items-center justify-center">
                      <Check className="h-3 w-3 text-[#B8881F]" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-6 inline-block btn-ink rounded-full px-6 py-2.5 text-sm font-bold">
                اطلب {m.name}
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="container pb-16 text-center">
        <Link href="/register" className="inline-block btn-gold rounded-full px-8 py-3 text-sm font-bold">
          ابدأ التسجيل الآن
        </Link>
      </section>
    </SiteLayout>
  );
}
