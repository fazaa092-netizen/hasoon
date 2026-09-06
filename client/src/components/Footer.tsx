import { Link } from "wouter";
import { ArrowUpLeft, Mail, MapPin, Phone } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export default function Footer() {
  const { lang, t } = useLang();
  const content = lang === "ar"
    ? {
        about: "مبادرة اجتماعية تسعى إلى تعزيز الترابط والتضامن وتقديم أفضل الخدمات والمزايا للأعضاء وعائلاتهم.",
        contact: "تواصل معنا",
        links: "روابط سريعة",
        locations: "أبوظبي · دبي · الشارقة",
        official: "الموقع الرسمي لفزعة",
        rights: "© 2026 فزعة. جميع الحقوق محفوظة.",
      }
    : {
        about: "A social initiative strengthening community solidarity while delivering meaningful services and benefits to members and their families.",
        contact: "Contact",
        links: "Quick links",
        locations: "Abu Dhabi · Dubai · Sharjah",
        official: "Official Fazaa website",
        rights: "© 2026 Fazaa. All rights reserved.",
      };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <img src="/manus-storage/fazaa-logo_36ff9cbd.png" alt="فزعة" />
            <strong>{lang === "ar" ? "فزعة" : "FAZAA"}</strong>
          </div>
          <p>{content.about}</p>
          <a className="footer-official" href="https://www.fazaa.ae/" target="_blank" rel="noreferrer">
            {content.official}<ArrowUpLeft aria-hidden="true" />
          </a>
        </div>

        <div className="footer-column">
          <h2>{content.links}</h2>
          <Link href="/">{t("nav.home")}</Link>
          <Link href="/memberships">{t("nav.memberships")}</Link>
          <Link href="/benefits">{t("nav.benefits")}</Link>
          <Link href="/register">{t("footer.requestMembership")}</Link>
        </div>

        <div className="footer-column footer-contact">
          <h2>{content.contact}</h2>
          <a href="tel:600520003"><Phone aria-hidden="true" /><span dir="ltr">600 520 003</span></a>
          <a href="mailto:info@fazaa.ae"><Mail aria-hidden="true" />info@fazaa.ae</a>
          <span><MapPin aria-hidden="true" />{content.locations}</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>{content.rights}</p>
        <div>
          <a href="https://www.fazaa.ae/page/privacy-policy" target="_blank" rel="noreferrer">{lang === "ar" ? "سياسة الخصوصية" : "Privacy"}</a>
          <a href="https://www.fazaa.ae/page/terms-and-conditions" target="_blank" rel="noreferrer">{lang === "ar" ? "الأحكام والشروط" : "Terms"}</a>
        </div>
      </div>
    </footer>
  );
}
