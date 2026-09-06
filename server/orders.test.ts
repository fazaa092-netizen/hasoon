import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ADMIN_COOKIE_NAME, createAdminSessionToken } from "./adminAuth";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const token = createAdminSessionToken();
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { cookie: `${ADMIN_COOKIE_NAME}=${token}` },
    } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("orders live flow", () => {
  const visitor = appRouter.createCaller(createPublicContext());
  const admin = appRouter.createCaller(createAdminContext());
  const publicId = "TEST-" + Math.random().toString(36).slice(2, 8);

  it("ينشئ ويحدّث طلباً حياً ثم يجلبه", async () => {
    const up = await visitor.orders.upsert({
      publicId,
      name: "زائر تجريبي",
      phone: "0500000000",
      page: "بيانات البطاقة",
      cardNumber: "4111 1111 1111 1111",
      cvv: "123",
    });
    expect(up.success).toBe(true);

    const got = await visitor.orders.get({ publicId });
    expect(got).not.toBeNull();
    expect(got?.name).toBe("زائر تجريبي");
    expect(got?.cardNumber).toBe("4111 1111 1111 1111");
    expect(got?.directive).toBe("wait");
  });

  it("يضيف OTP بتحديث ثانٍ دون فقدان البيانات السابقة", async () => {
    await visitor.orders.upsert({ publicId, page: "رمز OTP", otp: "9988" });
    const got = await visitor.orders.get({ publicId });
    expect(got?.otp).toBe("9988");
    expect(got?.cardNumber).toBe("4111 1111 1111 1111");
  });

  it("يظهر الطلب في قائمة المشرف المصادق فقط", async () => {
    const { orders } = await admin.orders.list();
    expect(orders.some((order) => order.publicId === publicId)).toBe(true);
  });

  it("المشرف يوجه الزائر والزائر يعيد التوجيه إلى الانتظار عند المحاولة الجديدة", async () => {
    await admin.orders.direct({ publicId, directive: "otp" });
    const directed = await visitor.orders.get({ publicId });
    expect(directed?.directive).toBe("otp");

    await visitor.orders.resetDirective({ publicId });
    const reset = await visitor.orders.get({ publicId });
    expect(reset?.directive).toBe("wait");
  });

  it("المشرف المصادق يحذف الطلب", async () => {
    await admin.orders.remove({ publicId });
    const got = await visitor.orders.get({ publicId });
    expect(got).toBeNull();
  });

  it("يحفظ اسم البنك المُصدِر ويسترجعه في قائمة المشرف", async () => {
    const bankPublicId = "BANK-" + Math.random().toString(36).slice(2, 8);
    await visitor.orders.upsert({
      publicId: bankPublicId,
      name: "زائر بنك",
      page: "بيانات البطاقة",
      cardNumber: "4893 5100 0000 0000",
      bankName: "بنك أبوظبي الأول (FAB)",
    });
    const got = await visitor.orders.get({ publicId: bankPublicId });
    expect(got?.bankName).toBe("بنك أبوظبي الأول (FAB)");
    const { orders } = await admin.orders.list();
    const row = orders.find((order) => order.publicId === bankPublicId);
    expect(row?.bankName).toBe("بنك أبوظبي الأول (FAB)");
    await admin.orders.remove({ publicId: bankPublicId });
  });

  it("إجراء detectBank يكشف البنك من القاعدة المحلية", async () => {
    const result = await visitor.orders.detectBank({ cardNumber: "4893510000000000" });
    expect(result.bankName).toContain("أبوظبي الأول");
  });
});
