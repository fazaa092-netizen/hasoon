import { describe, expect, it } from "vitest";
import { ASSETS, MEMBERSHIPS } from "../client/src/lib/data";

describe("Fazaa membership catalog", () => {
  it("contains the four initiative tiers in a unique catalog", () => {
    expect(MEMBERSHIPS).toHaveLength(4);
    expect(new Set(MEMBERSHIPS.map((membership) => membership.id)).size).toBe(4);
    expect(MEMBERSHIPS.map((membership) => membership.id)).toEqual([
      "silver",
      "gold",
      "platinum",
      "family",
    ]);
  });

  it("maps every tier to a project storage asset and meaningful benefits", () => {
    for (const membership of MEMBERSHIPS) {
      expect(membership.image).toMatch(/^\/manus-storage\//);
      expect(membership.benefits.length).toBeGreaterThanOrEqual(3);
      expect(membership.name.trim().length).toBeGreaterThan(0);
      expect(membership.tagline.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses the uploaded official logo and family-year hero assets", () => {
    expect(ASSETS.logo).toBe("/manus-storage/fazaa-logo_36ff9cbd.png");
    expect(ASSETS.heroFamily).toBe("/manus-storage/fazaa-family-year-2026_90c80c25.jpeg");
  });
});
