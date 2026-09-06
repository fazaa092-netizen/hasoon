import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_MS,
  createAdminSessionToken,
  verifyAdminCredentials,
  verifyAdminSessionToken,
} from "./adminAuth";

function createContext(cookie?: string) {
  const cookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const cleared: Array<{ name: string; options: Record<string, unknown> }> = [];
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: cookie ? { cookie } : {},
      socket: { remoteAddress: "127.0.0.42" },
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }),
      clearCookie: (name: string, options: Record<string, unknown>) => cleared.push({ name, options }),
    } as unknown as TrpcContext["res"],
  };
  return { ctx, cookies, cleared };
}

describe("admin authentication", () => {
  it("rejects incorrect credentials", () => {
    expect(verifyAdminCredentials("visitor", "incorrect-password")).toBe(false);
    expect(verifyAdminCredentials("hasoon", "incorrect-password")).toBe(false);
  });

  it("signs an expiring session token", () => {
    const now = 1_800_000_000_000;
    const token = createAdminSessionToken(now);
    expect(verifyAdminSessionToken(token, now + 1_000)).toBe(true);
    expect(verifyAdminSessionToken(token, now + ADMIN_SESSION_MAX_AGE_MS + 1)).toBe(false);
    expect(verifyAdminSessionToken(`${token}tampered`, now + 1_000)).toBe(false);
  });

  it("reports session status and blocks anonymous order administration", async () => {
    const anonymous = appRouter.createCaller(createContext().ctx);
    await expect(anonymous.adminAuth.status()).resolves.toEqual({ authenticated: false });
    await expect(anonymous.adminAuth.login({ username: "visitor", password: "incorrect-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(anonymous.orders.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(anonymous.orders.direct({ publicId: "TEST-LOCKED", directive: "otp" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(anonymous.orders.remove({ publicId: "TEST-LOCKED" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(anonymous.orders.upsert({ publicId: "TEST-LOCKED", directive: "success" as "wait" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts a valid signed cookie and clears it on logout", async () => {
    const token = createAdminSessionToken();
    const { ctx, cleared } = createContext(`${ADMIN_COOKIE_NAME}=${token}`);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.adminAuth.status()).resolves.toEqual({ authenticated: true });
    await expect(caller.adminAuth.logout()).resolves.toEqual({ success: true });
    expect(cleared[0]?.name).toBe(ADMIN_COOKIE_NAME);
    expect(cleared[0]?.options).toMatchObject({ httpOnly: true, secure: true, maxAge: -1 });
  });
});
