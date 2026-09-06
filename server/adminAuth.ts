import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { parse as parseCookie } from "cookie";
import { ENV } from "./_core/env";

export const ADMIN_COOKIE_NAME = "fazaa_admin_session";
export const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

const ADMIN_USERNAME = "hasoon";
const PASSWORD_SALT = "c1c27ff7cedf93df869fe736d73ea279";
const PASSWORD_HASH = "f5bd5d5199cf02aa597776398e026d3272d328daccce355da82ae5687fd48dc2f5c68b8d3b801520dba74d45cd19a0e55bc75f1fea84ebe8b8bd040b461e44f9";
const MAX_FAILURES = 5;
const BLOCK_MS = 15 * 60 * 1000;

type LoginAttempt = { failures: number; blockedUntil: number };
const loginAttempts = new Map<string, LoginAttempt>();

function equalBuffers(left: Buffer, right: Buffer) {
  return left.length === right.length && timingSafeEqual(left, right);
}

function equalStrings(left: string, right: string) {
  return equalBuffers(Buffer.from(left), Buffer.from(right));
}

function sessionSecret() {
  const secret = ENV.cookieSecret || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required for admin sessions");
  return secret;
}

function signSessionPayload(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export function verifyAdminCredentials(username: string, password: string) {
  const usernameMatches = equalStrings(username, ADMIN_USERNAME);
  const derived = scryptSync(password, PASSWORD_SALT, 64);
  const passwordMatches = equalBuffers(derived, Buffer.from(PASSWORD_HASH, "hex"));
  return usernameMatches && passwordMatches;
}

export function createAdminSessionToken(now = Date.now()) {
  const expiresAt = now + ADMIN_SESSION_MAX_AGE_MS;
  const nonce = randomBytes(18).toString("base64url");
  const payload = `${expiresAt}.${nonce}`;
  return `${payload}.${signSessionPayload(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const [expiresRaw, nonce, signature, ...extra] = token.split(".");
  if (!expiresRaw || !nonce || !signature || extra.length > 0) return false;
  const expiresAt = Number(expiresRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  const expected = signSessionPayload(`${expiresRaw}.${nonce}`);
  return equalStrings(signature, expected);
}

export function getAdminSessionToken(req: Request) {
  const header = req.headers.cookie;
  if (!header) return undefined;
  try {
    return parseCookie(header)[ADMIN_COOKIE_NAME];
  } catch {
    return undefined;
  }
}

export function isAdminRequest(req: Request) {
  return verifyAdminSessionToken(getAdminSessionToken(req));
}

export function getClientAddress(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.socket?.remoteAddress || "unknown";
}

export function isLoginBlocked(address: string, now = Date.now()) {
  const attempt = loginAttempts.get(address);
  if (!attempt) return false;
  if (attempt.blockedUntil > now) return true;
  if (attempt.blockedUntil > 0) loginAttempts.delete(address);
  return false;
}

export function recordLoginFailure(address: string, now = Date.now()) {
  const previous = loginAttempts.get(address);
  const failures = (previous?.failures ?? 0) + 1;
  loginAttempts.set(address, {
    failures,
    blockedUntil: failures >= MAX_FAILURES ? now + BLOCK_MS : 0,
  });
}

export function clearLoginFailures(address: string) {
  loginAttempts.delete(address);
}
