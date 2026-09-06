import { describe, expect, it } from "vitest";
import { toOrderPrefill, validateFamilyApplication } from "../client/src/components/FamilyApplication";

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
});
