import { describe, expect, it } from "vitest";
import { STUDIO_SLIDES, wrapStudioIndex } from "../client/src/lib/studio";

describe("Fazaa studio slider", () => {
  it("contains all thirteen uploaded banners in a stable order", () => {
    expect(STUDIO_SLIDES).toHaveLength(13);
    expect(new Set(STUDIO_SLIDES.map((slide) => slide.id)).size).toBe(13);
    expect(STUDIO_SLIDES[0]?.id).toBe("back-to-school");
    expect(STUDIO_SLIDES.at(-1)?.id).toBe("fazaa-stores");
  });

  it("uses WebDev storage assets and bilingual accessible titles", () => {
    for (const slide of STUDIO_SLIDES) {
      expect(slide.src).toMatch(/^\/manus-storage\/studio-slide-\d{2}_[a-f0-9]+\.webp$/);
      expect(slide.titleAr.trim().length).toBeGreaterThan(0);
      expect(slide.titleEn.trim().length).toBeGreaterThan(0);
    }
  });

  it("wraps next and previous navigation without leaving the slide range", () => {
    expect(wrapStudioIndex(13)).toBe(0);
    expect(wrapStudioIndex(-1)).toBe(12);
    expect(wrapStudioIndex(27)).toBe(1);
  });
});
