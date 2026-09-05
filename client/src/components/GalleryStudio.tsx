/* معرض صور (استوديو) بعرض الصفحة الكامل — تنقل تلقائي بدون أسهم
   النمط: العاج الذهبي — صورة بمقاس الشاشة، عدّاد صور، نقاط مؤشر */
import { useState, useCallback, useEffect, useRef } from "react";

const IMAGES = [
  "/manus-storage/gallery_1_1d4f71be.jpeg",
  "/manus-storage/gallery_2_cbfdcb8a.jpeg",
  "/manus-storage/gallery_3_95258f56.jpeg",
  "/manus-storage/gallery_4_82af8b31.png",
  "/manus-storage/gallery_5_09f87e9c.jpeg",
  "/manus-storage/gallery_6_93f4829e.png",
  "/manus-storage/gallery_7_3e051429.jpg",
  "/manus-storage/gallery_8_703327ad.jpeg",
  "/manus-storage/gallery_9_ab6f9efb.jpeg",
  "/manus-storage/gallery_10_a4846921.jpeg",
  "/manus-storage/gallery_11_aa922185.jpeg",
];

const AUTO_INTERVAL = 4000; // مدة عرض كل صورة بالملي ثانية

export default function GalleryStudio() {
  const [index, setIndex] = useState(0);
  const total = IMAGES.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  // التنقل التلقائي
  useEffect(() => {
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  // عند اختيار صورة يدوياً عبر النقاط، نعيد ضبط المؤقّت
  const goTo = useCallback(
    (i: number) => {
      setIndex(i);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(next, AUTO_INTERVAL);
    },
    [next]
  );

  return (
    <section className="relative w-full bg-[#0d0b07]">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1920 / 480" }}>
        {IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`صورة ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding={i === 0 ? "auto" : "async"}
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}

        {/* تدرّج خفيف للحواف */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />

        {/* نقاط مؤشر سفلية */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`الصورة ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-[#C9A227]" : "w-2 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
