import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Bike,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  Home,
  Salad,
  Shirt,
  ShoppingBasket,
  Sofa,
  Sparkles,
  Stethoscope,
  Store,
  Sun,
  Ticket,
  Users,
  UsersRound,
  Utensils,
  Waves,
} from "lucide-react";
import { useLang, type TransKey } from "@/contexts/LanguageContext";

export const CATEGORY_ITEMS: { key: TransKey; icon: LucideIcon }[] = [
  { key: "cat.food", icon: ShoppingBasket },
  { key: "cat.medical", icon: Stethoscope },
  { key: "cat.education", icon: GraduationCap },
  { key: "cat.laundry", icon: Shirt },
  { key: "cat.realestate", icon: Home },
  { key: "cat.sports", icon: Bike },
  { key: "cat.beauty", icon: Sparkles },
  { key: "cat.fazaahealth", icon: HeartPulse },
  { key: "cat.healthyfood", icon: Salad },
  { key: "cat.proud", icon: Users },
  { key: "cat.furniture", icon: Sofa },
  { key: "cat.restaurants", icon: Utensils },
  { key: "cat.entertainment", icon: Ticket },
  { key: "cat.store", icon: Store },
  { key: "cat.madeem", icon: Waves },
  { key: "cat.newoffers", icon: BadgePercent },
  { key: "cat.familyyear", icon: UsersRound },
  { key: "cat.summeroffers", icon: Sun },
];

export function chunkCategories<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }
  return groups;
}

function useCategoriesPerPage() {
  const [perPage, setPerPage] = useState(6);

  useEffect(() => {
    const calculate = () => setPerPage(window.innerWidth < 640 ? 3 : 6);
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  return perPage;
}

export default function CategoryIcons() {
  const { t, dir, lang } = useLang();
  const perPage = useCategoriesPerPage();
  const pages = chunkCategories(CATEGORY_ITEMS, perPage);
  const [activePage, setActivePage] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const totalPages = pages.length;

  useEffect(() => {
    setActivePage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  const go = useCallback(
    (offset: number) => setActivePage((current) => (current + offset + totalPages) % totalPages),
    [totalPages],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      dir === "rtl" ? go(1) : go(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      dir === "rtl" ? go(-1) : go(1);
    }
  };

  return (
    <section className="category-rail" aria-label={lang === "ar" ? "فئات مزايا فزعة" : "Fazaa benefit categories"} onKeyDown={onKeyDown}>
      <div className="container category-shell">
        <div
          className="category-viewport"
          onPointerDown={(event) => {
            pointerStart.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) return;
            const delta = event.clientX - pointerStart.current;
            pointerStart.current = null;
            if (Math.abs(delta) < 45) return;
            if (delta > 0) {
              dir === "rtl" ? go(1) : go(-1);
            } else {
              dir === "rtl" ? go(-1) : go(1);
            }
          }}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
        >
          <div
            className="category-track"
            style={{ transform: `translateX(${(dir === "rtl" ? 1 : -1) * activePage * 100}%)` }}
          >
            {pages.map((page, pageIndex) => (
              <div className="category-page" key={pageIndex} aria-hidden={pageIndex !== activePage}>
                {page.map((category) => (
                  <Link
                    href={`/benefits?category=${encodeURIComponent(category.key)}`}
                    className="category-link"
                    tabIndex={pageIndex === activePage ? 0 : -1}
                    key={category.key}
                  >
                    <span className="category-icon-wrap">
                      <category.icon aria-hidden="true" strokeWidth={1.65} />
                    </span>
                    <span className="category-label">{t(category.key)}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <>
            <button className="category-arrow category-arrow-previous" type="button" onClick={() => go(-1)} aria-label={t("nav.prev")}>
              {dir === "rtl" ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
            </button>
            <button className="category-arrow category-arrow-next" type="button" onClick={() => go(1)} aria-label={t("nav.next")}>
              {dir === "rtl" ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            </button>
          </>
        )}

        <div className="category-pagination" role="tablist" aria-label={lang === "ar" ? "مجموعات الفئات" : "Category groups"}>
          {pages.map((_, pageIndex) => (
            <button
              type="button"
              role="tab"
              aria-selected={pageIndex === activePage}
              aria-label={`${t("nav.group")} ${pageIndex + 1}`}
              className={pageIndex === activePage ? "is-active" : ""}
              onClick={() => setActivePage(pageIndex)}
              key={pageIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
