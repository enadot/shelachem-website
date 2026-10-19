import { boolean, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * מסד הנתונים של האתר (Neon Postgres). מחליף את Directus.
 *
 * תוכן נשמר כ-JSON לפי collection — הטפסים כבר מוגדרים ב-`src/lib/admin/collections.ts`,
 * והאתר קורא אותו באותה צורה שהייתה ב-CMS ובתוכן המקומי (`src/lib/content/types.ts`).
 */

/** כתבות, שאלות, המלצות, רופאים, צוות, מוסדות ושירותים — שורה לכל פריט. */
export const contentItems = pgTable(
  "content_items",
  {
    collection: text("collection").notNull(),
    id: text("id").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    /** סדר הצגה בתוך ה-collection (כמו הסדר בקבצים המקומיים). */
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (t) => [primaryKey({ columns: [t.collection, t.id] })],
);

/** עותק של פריט לפני כל שמירה/מחיקה — "גרסאות קודמות" בעורך. */
export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: serial("id").primaryKey(),
    collection: text("collection").notNull(),
    itemId: text("item_id").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
    savedBy: text("saved_by"),
  },
  (t) => [index("content_revisions_item_idx").on(t.collection, t.itemId, t.savedAt)],
);

/** הגדרות האתר — שורה אחת (id = 1). אותו מבנה כמו `globals` ב-Directus. */
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  /** admin = הכול כולל משתמשים; editor = תוכן, לידים והגדרות. */
  role: text("role").$type<"admin" | "editor">().notNull().default("editor"),
  active: boolean("active").notNull().default(true),
  /** סיסמה זמנית (נוצרה ע״י מנהל) — מחייבת החלפה בכניסה הבאה. */
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

/** sessions בשרת — אפשר לנתק משתמש מיד (השבתה / החלפת סיסמה). */
export const adminSessions = pgTable(
  "admin_sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("admin_sessions_user_idx").on(t.userId)],
);

/** ניסיונות התחברות כושלים — הגבלת קצב לפי אימייל. */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_attempts_email_idx").on(t.email, t.at)],
);

/**
 * גיבוי של כל ליד שנשלח מהאתר, לפני ההעברה ל-BARAM Leads (המערכת הראשית).
 * אם ההעברה נכשלה — הליד כאן, ואפשר לשלוח שוב מהלוח.
 */
export const leadBackups = pgTable(
  "lead_backups",
  {
    id: serial("id").primaryKey(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    forwardedAt: timestamp("forwarded_at", { withTimezone: true }),
    baramLeadId: integer("baram_lead_id"),
    forwardError: text("forward_error"),
  },
  (t) => [index("lead_backups_pending_idx").on(t.forwardedAt, t.receivedAt)],
);
