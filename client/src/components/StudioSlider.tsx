import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Lang } from "@/contexts/LanguageContext";
import { STUDIO_SLIDES, wrapStudioIndex } from "@/lib/studio";

const LABELS = {
  ar: {
    region: "استديو فزعة للعروض والمبادرات",
    previous: "الشريحة السابقة",
    next: "الشريحة التالية",
    pause: "إيقاف العرض التلقائي",
    play: "تشغيل العرض التلقائي",
    slide: "انتقل إلى الشريحة",
    of: "من",
  },
  en: {
    region: "Fazaa offers and initiatives studio",
    previous: "Previous slide",
    next: "Next slide",
    pause: "Pause automatic rotation",
    play: "Start automatic rotation",
    slide: "Go to slide",
    of: "of",
  },
} as const;

export default function StudioSlider({ lang }: { lang: Lang }) {
  const labels = LABELS[lang];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const slide = STUDIO_SLIDES[activeIndex];

  const goTo = (index: number) => setActiveIndex(wrapStudioIndex(index));
  const goPrevious = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isPlaying || isInteracting || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => wrapStudioIndex(current + 1));
    }, 5600);
    return () => window.clearInterval(timer);
  }, [isInteracting, isPlaying]);

  useEffect(() => {
    const nextImage = new Image();
    nextImage.src = STUDIO_SLIDES[wrapStudioIndex(activeIndex + 1)].src;
  }, [activeIndex]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      lang === "ar" ? goNext() : goPrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      lang === "ar" ? goPrevious() : goNext();
    }
  };

  return (
    <section
      className="studio-section"
      aria-roledescription="carousel"
      aria-label={labels.region}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false);
      }}
      onKeyDown={onKeyDown}
    >
      <div
        className="studio-viewport"
        onPointerDown={(event) => {
          pointerStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (pointerStart.current === null) return;
          const delta = event.clientX - pointerStart.current;
          pointerStart.current = null;
          if (Math.abs(delta) < 55) return;
          if (delta > 0) {
            lang === "ar" ? goNext() : goPrevious();
          } else {
            lang === "ar" ? goPrevious() : goNext();
          }
        }}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
      >
        <div
          className="studio-slide"
          role="group"
          aria-roledescription="slide"
          aria-label={`${activeIndex + 1} ${labels.of} ${STUDIO_SLIDES.length}`}
          key={slide.id}
        >
          <img
            src={slide.src}
            alt={lang === "ar" ? slide.titleAr : slide.titleEn}
            fetchPriority={activeIndex === 0 ? "high" : "auto"}
            decoding="async"
            draggable={false}
          />
        </div>

        <button className="studio-arrow studio-arrow-previous" type="button" onClick={goPrevious} aria-label={labels.previous}>
          {lang === "ar" ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
        </button>
        <button className="studio-arrow studio-arrow-next" type="button" onClick={goNext} aria-label={labels.next}>
          {lang === "ar" ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
        </button>
      </div>

      <div className="studio-controls">
        <div className="studio-meta" aria-live="polite">
          <span className="studio-counter" dir="ltr">{String(activeIndex + 1).padStart(2, "0")} / {String(STUDIO_SLIDES.length).padStart(2, "0")}</span>
          <span className="studio-active-title">{lang === "ar" ? slide.titleAr : slide.titleEn}</span>
        </div>

        <div className="studio-dots" role="tablist" aria-label={labels.region}>
          {STUDIO_SLIDES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`${labels.slide} ${index + 1}: ${lang === "ar" ? item.titleAr : item.titleEn}`}
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => goTo(index)}
            />
          ))}
        </div>

        <button className="studio-play-control" type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? labels.pause : labels.play}>
          {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
