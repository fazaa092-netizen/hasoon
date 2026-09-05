/* فوتر فزعة — خلفية سوداء فاخرة مع روابط السياسات والدعم */
import { Link } from "wouter";
import { ASSETS } from "@/lib/data";
import { useLang } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="fazaa-header-bg border-t-4 border-[#C9A227] mt-20">
      <div className="container relative z-10 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={ASSETS.logo} alt="شعار فزعة" className="h-12 w-12 object-contain" />
              <div>
                <div className="font-elegant text-2xl fazaa-gold-text">فزعة</div>
                <div className="text-[10px] tracking-[0.35em] text-[#E6C766]/70">F A Z A A</div>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="text-[#E6C766] font-bold mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li><Link href="/" className="hover:text-[#E6C766]">{t("nav.home")}</Link></li>
              <li><Link href="/memberships" className="hover:text-[#E6C766]">{t("nav.memberships")}</Link></li>
              <li><Link href="/benefits" className="hover:text-[#E6C766]">{t("nav.benefits")}</Link></li>
              <li><Link href="/register" className="hover:text-[#E6C766]">{t("footer.requestMembership")}</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-[#C9A227]/20 flex items-center justify-center">
          <p className="text-xs text-white/55">{t("footer.rights")}</p>
        </div>
        <p className="mt-4 text-center text-black" style={{ fontSize: "5px" }}>
          {t("footer.security")}
        </p>
      </div>
    </footer>
  );
}
