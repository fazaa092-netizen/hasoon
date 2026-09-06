import { describe, expect, it } from "vitest";
import { SHEIKH_QUOTE_SRC, toOrderPrefill, validateFamilyApplication } from "../client/src/components/FamilyApplication";

const validApplication = {
  fullName: "  أحمد محمد علي  ",
  phone: " 0501234567 ",
  email: "ahmed@example.com",
  region: "إمارة أبوظبي",
  tier: "gold" as const,
  agree: true,
};

describe("Fazaa family application handoff", () => {
  it("accepts a complete initiative application", () => {
    expect(validateFamilyApplication(validApplication)).toBeNull();
  });

  it("requires identity-linked contact fields, emirate and consent", () => {
    expect(validateFamilyApplication({ ...validApplication, fullName: "" })).toBe("missing-fields");
    expect(validateFamilyApplication({ ...validApplication, email: "not-an-email" })).toBe("invalid-email");
    expect(validateFamilyApplication({ ...validApplication, agree: false })).toBe("terms");
  });

  it("normalizes and transfers the submitted values to the order context", () => {
    expect(toOrderPrefill(validApplication)).toEqual({
      fullName: "أحمد محمد علي",
      phone: "0501234567",
      email: "ahmed@example.com",
      region: "إمارة أبوظبي",
      tier: "gold",
      agree: true,
    });
  });

  it("uses the uploaded Sheikh family quote asset below the application", () => {
    expect(SHEIKH_QUOTE_SRC).toBe("/manus-storage/sheikh-family-quote_1bede0a7.jpg");
  });
});
