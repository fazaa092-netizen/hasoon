import { describe, expect, it } from "vitest";
import { CATEGORY_ITEMS, chunkCategories } from "../client/src/components/CategoryIcons";

describe("Fazaa category rail", () => {
  it("contains the eighteen referenced categories without duplicates", () => {
    expect(CATEGORY_ITEMS).toHaveLength(18);
    expect(new Set(CATEGORY_ITEMS.map((category) => category.key)).size).toBe(18);
  });

  it("creates exactly three six-item groups for desktop", () => {
    const groups = chunkCategories(CATEGORY_ITEMS, 6);
    expect(groups).toHaveLength(3);
    expect(groups.every((group) => group.length === 6)).toBe(true);
  });

  it("creates six touch-friendly three-item groups for mobile", () => {
    const groups = chunkCategories(CATEGORY_ITEMS, 3);
    expect(groups).toHaveLength(6);
    expect(groups.every((group) => group.length === 3)).toBe(true);
  });
});
