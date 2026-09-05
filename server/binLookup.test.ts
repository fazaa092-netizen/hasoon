import { describe, it, expect } from "vitest";
import { lookupIssuer, normalizeIssuerName, UAE_LOCAL_BINS } from "./binLookup";

describe("كشف البنك المُصدِر", () => {
  it("يكشف بنك أبوظبي الأول من القاعدة المحلية", async () => {
    const r = await lookupIssuer("4893510000000000");
    expect(r.bankName).toContain("أبوظبي الأول");
    expect(r.source).toBe("local");
  });

  it("يكشف بنك الإمارات دبي الوطني من القاعدة المحلية", async () => {
    const r = await lookupIssuer("4188890000000000");
    expect(r.bankName).toContain("الإمارات دبي الوطني");
  });

  it("يكشف الشبكة (Mastercard) للبطاقات التي تبدأ بـ5", async () => {
    const r = await lookupIssuer("5210460000000000");
    expect(r.scheme).toBe("MASTERCARD");
  });

  it("يرفض الأرقام الأقصر من 6 خانات", async () => {
    const r = await lookupIssuer("4893");
    expect(r.source).toBe("insufficient");
    expect(r.bankName).toBeNull();
  });

  it("يطبّع أسماء البنوك الأجنبية ويُنظّف الأحرف المشوّهة", () => {
    expect(normalizeIssuerName("FIRST ABU DHABI BANK")).toContain("أبوظبي الأول");
    expect(normalizeIssuerName("QNB BANK A.\u00bf")).toBe("بنك QNB");
    expect(normalizeIssuerName("   ")).toBeNull();
  });

  it("القاعدة المحلية تحتوي بادئات لأبرز البنوك", () => {
    expect(Object.keys(UAE_LOCAL_BINS).length).toBeGreaterThan(20);
  });
});
