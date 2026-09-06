import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Globe2, Menu, X } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { lang, toggleLang, t } = useLang();

  useEffect(() => setOpen(false), [location]);

  const navigation = [
    { href: "/", label: t("nav.home") },
    { href: "/memberships", label: t("nav.memberships") },
    { href: "/benefits", label: t("nav.benefits") },
  ];

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">{lang === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}</a>
      <div className="site-header-accent" />
      <div className="container site-header-inner">
        <Link href="/" className="brand-link" aria-label={lang === "ar" ? "فزعة — الرئيسية" : "Fazaa — Home"}>
          <img src="/manus-storage/fazaa-logo_36ff9cbd.png" alt="فزعة" />
          <span>
            <strong>{lang === "ar" ? "فزعة" : "FAZAA"}</strong>
            <small>{lang === "ar" ? "معًا لجودة حياة أفضل" : "Together for better living"}</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label={lang === "ar" ? "التنقل الرئيسي" : "Primary navigation"}>
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={location === item.href ? "is-active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="language-button" onClick={toggleLang} aria-label={lang === "ar" ? "Switch to English" : "التحويل إلى العربية"}>
            <Globe2 aria-hidden="true" />
            <span>{lang === "ar" ? "EN" : "عربي"}</span>
          </button>
          <Link href="/register" className="button button-primary header-cta">
            {t("cta.requestCard")}
            <ArrowLeft className="h-4 w-4 rtl-icon" aria-hidden="true" />
          </Link>
          <button
            className="menu-button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={t("menu.label")}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div id="mobile-navigation" className={`mobile-nav ${open ? "is-open" : ""}`}>
        <nav className="container" aria-label={lang === "ar" ? "التنقل للجوال" : "Mobile navigation"}>
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={location === item.href ? "is-active" : ""}>
              <span>{item.label}</span>
              <ArrowLeft className="h-4 w-4 rtl-icon" aria-hidden="true" />
            </Link>
          ))}
          <Link href="/register" className="button button-primary mobile-cta">{t("cta.requestCard")}</Link>
        </nav>
      </div>
    </header>
  );
}
