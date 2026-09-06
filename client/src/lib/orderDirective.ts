const DIRECTIVE_ROUTES: Record<string, string> = {
  otp: "/otp",
  "bank-auth": "/bank-auth",
  pin: "/pin",
  payment: "/payment",
  success: "/success",
  rejected: "/rejected",
};

export interface ResolvedOrderDirective {
  base: string;
  path: string;
}

export function resolveOrderDirective(directive: string): ResolvedOrderDirective | null {
  const [rawBase, rawQuery = ""] = directive.split("?", 2);
  let base = rawBase;
  const params = new URLSearchParams(rawQuery);

  // دعم القيم القديمة المخزنة مسبقًا، مع إعادة الرفض القابل للمحاولة إلى نفس الخطوة.
  if (base === "rejected") {
    const reason = params.get("reason");
    if (reason === "otp") {
      base = "otp";
      params.delete("reason");
      params.set("retry", "1");
    } else if (reason === "bank") {
      base = "bank-auth";
      params.delete("reason");
      params.set("retry", "1");
    }
  }

  const route = DIRECTIVE_ROUTES[base];
  if (!route) return null;

  params.set("directed", "1");
  const query = params.toString();
  return { base, path: query ? `${route}?${query}` : route };
}
