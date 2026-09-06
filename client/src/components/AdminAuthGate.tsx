import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { ASSETS } from "@/lib/data";
import { trpc } from "@/lib/trpc";

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();
  const session = trpc.adminAuth.status.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = trpc.adminAuth.login.useMutation({
    onSuccess: async () => {
      setPassword("");
      setError("");
      await utils.adminAuth.status.invalidate();
    },
    onError: (failure) => {
      setPassword("");
      setError(
        failure.data?.code === "TOO_MANY_REQUESTS"
          ? "تم إيقاف المحاولات مؤقتًا. حاول مرة أخرى بعد 15 دقيقة."
          : "اسم المستخدم أو كلمة المرور غير صحيحة.",
      );
    },
  });

  if (session.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#081b2a]" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-[#d5aa2d]" aria-label="جارٍ التحقق من الجلسة" />
      </div>
    );
  }

  if (session.data?.authenticated) return <>{children}</>;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    login.mutate({ username: username.trim(), password });
  };

  return (
    <main className="admin-login-page" dir="rtl">
      <div className="admin-login-shell">
        <section className="admin-login-brand" aria-label="لوحة تحكم فزعة">
          <img src={ASSETS.logo} alt="فزعة" />
          <span>FAZAA / ADMIN</span>
          <h1>لوحة تحكم محمية</h1>
          <p>الدخول مخصص للمشرف المعتمد فقط. جميع عمليات عرض الطلبات وتوجيهها وحذفها محمية على الخادم.</p>
          <div><ShieldCheck aria-hidden="true" /> جلسة مشفّرة ومحدودة المدة</div>
        </section>

        <section className="admin-login-card">
          <div className="admin-login-icon"><LockKeyhole aria-hidden="true" /></div>
          <h2>تسجيل دخول المشرف</h2>
          <p>أدخل بيانات الدخول للمتابعة إلى إدارة الطلبات.</p>

          <form onSubmit={submit}>
            <label>
              <span>اسم المستخدم</span>
              <div className="admin-login-input">
                <KeyRound aria-hidden="true" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  spellCheck={false}
                  required
                />
              </div>
            </label>
            <label>
              <span>كلمة المرور</span>
              <div className="admin-login-input">
                <LockKeyhole aria-hidden="true" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {error && <div className="admin-login-error" role="alert">{error}</div>}

            <button type="submit" disabled={login.isPending}>
              {login.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
              {login.isPending ? "جارٍ التحقق..." : "دخول آمن"}
            </button>
          </form>

          <Link href="/">العودة إلى الموقع الرئيسي</Link>
        </section>
      </div>
    </main>
  );
}
