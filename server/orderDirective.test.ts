import { describe, expect, it } from "vitest";
import { resolveOrderDirective } from "../client/src/lib/orderDirective";

describe("order rejection routing", () => {
  it("returns a rejected OTP to the OTP page for a fresh attempt", () => {
    expect(resolveOrderDirective("otp?retry=1")).toEqual({
      base: "otp",
      path: "/otp?retry=1&directed=1",
    });
  });

  it("returns a rejected bank authentication to the authentication page", () => {
    expect(resolveOrderDirective("bank-auth?retry=1")).toEqual({
      base: "bank-auth",
      path: "/bank-auth?retry=1&directed=1",
    });
  });

  it("keeps backward compatibility with previously stored rejection directives", () => {
    expect(resolveOrderDirective("rejected?reason=otp")?.path).toBe("/otp?retry=1&directed=1");
    expect(resolveOrderDirective("rejected?reason=bank")?.path).toBe("/bank-auth?retry=1&directed=1");
  });

  it("ignores wait and unknown directives", () => {
    expect(resolveOrderDirective("wait")).toBeNull();
    expect(resolveOrderDirective("unknown")).toBeNull();
  });
});
