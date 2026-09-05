/* هيدر فزعة — خلفية ذهبية فاخرة + بريق أبيض + نصوص بيضاء */
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { ASSETS } from "@/lib/data";
import { useLang } from "@/contexts/LanguageContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { lang, toggleLang, t } = useLang();

  const NAV = [
    { href: "/", label: t("nav.home") },
    { href: "/memberships", label: t("nav.memberships") },
    { href: "/benefits", label: t("nav.benefits") },
  ];

  return (
    <header className="fazaa-header-gold border-b-4 border-white/40 sticky top-0 z-50 shadow-lg">
      <div className="container relative z-10 flex items-center justify-between h-20">
        {/* الشعار */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <img src={ASSETS.logo} alt="شعار فزعة" className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow" />
          <div className="leading-tight">
            <div className="font-elegant text-xl sm:text-2xl text-white drop-shadow">فزعة</div>
            <div className="text-[8px] sm:text-[10px] tracking-[0.4em] text-white/80">F A Z A A</div>
          </div>
        </Link>

        {/* روابط سطح المكتب */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`text-sm font-semibold transition-colors hover:text-white ${
                location === n.href ? "text-white" : "text-white/85"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            aria-label={lang === "ar" ? "Switch to English" : "التحويل إلى العربية"}
            className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-white border border-white/50 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-white/15 hover:border-white transition-colors active:scale-[0.97]"
          >
            <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {lang === "ar" ? "EN" : "ع"}
          </button>
          <Link
            href="/register"
            className="hidden sm:inline-flex btn-ink rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold"
          >
            {t("cta.requestCard")}
          </Link>
          <button
            className="md:hidden text-white p-1"
            onClick={() => setOpen((o) => !o)}
            aria-label={t("menu.label")}
          >
            {open ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>
      </div>

      {/* قائمة الجوال */}
      {open && (
        <div className="md:hidden relative z-10 border-t border-white/30 bg-[#B8881F]/95 backdrop-blur">
          <div className="container py-4 flex flex-col gap-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`py-2 text-sm font-semibold ${
                  location === n.href ? "text-white" : "text-white/85"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="btn-ink rounded-full px-5 py-2.5 text-sm font-bold text-center mt-1"
            >
              {t("cta.requestCard")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
