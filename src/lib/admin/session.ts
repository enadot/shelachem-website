import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, cookieOptions } from "@/lib/admin/auth-shared";
import { hashPassword, verifyPassword } from "@/lib/admin/password";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  /** מנהל — רואה ומנהל משתמשים. */
  isAdmin: boolean;
  mustChangePassword: boolean;
}

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** 5 ניסיונות כושלים לאימייל ב-15 דקות. */
const MAX_FAILS = 5;
const FAIL_WINDOW_MS = 15 * 60 * 1000;

export type LoginResult = "ok" | "invalid" | "locked" | "no_db";

export async function login(emailRaw: string, password: string): Promise<LoginResult> {
  const client = db();
  if (!client) return "no_db";
  const email = emailRaw.trim().toLowerCase();
  const since = new Date(Date.now() - FAIL_WINDOW_MS);
  const [{ fails }] = await client
    .select({ fails: count() })
    .from(schema.loginAttempts)
    .where(and(eq(schema.loginAttempts.email, email), gt(schema.loginAttempts.at, since)));
  if (fails >= MAX_FAILS) return "locked";

  const [user] = await client.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  // גם כשהמשתמש לא קיים מריצים גיבוב — שזמן התגובה לא יסגיר אילו אימיילים רשומים.
  const ok = user?.active
    ? await verifyPassword(password, user.passwordHash)
    : (await hashPassword(password), false);
  if (!user || !ok) {
    await client.insert(schema.loginAttempts).values({ email });
    return "invalid";
  }

  await client.delete(schema.loginAttempts).where(eq(schema.loginAttempts.email, email));
  await client.delete(schema.adminSessions).where(lt(schema.adminSessions.expiresAt, new Date()));
  await createSession(user.id);
  await client.update(schema.adminUsers).set({ lastLoginAt: new Date() }).where(eq(schema.adminUsers.id, user.id));
  return "ok";
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await db()!
    .insert(schema.adminSessions)
    .values({ tokenHash: sha256(token), userId, expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000) });
  (await cookies()).set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_MAX_AGE });
}

export async function logout() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db()?.delete(schema.adminSessions).where(eq(schema.adminSessions.tokenHash, sha256(token)));
  store.delete({ name: SESSION_COOKIE, path: cookieOptions.path });
}

/** המשתמש המחובר, או null. נקרא פעם אחת לבקשה. */
export const currentUser = cache(async (): Promise<AdminUser | null> => {
  const client = db();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!client || !token) return null;
  const [row] = await client
    .select({ user: schema.adminUsers, expiresAt: schema.adminSessions.expiresAt })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminUsers.id, schema.adminSessions.userId))
    .where(eq(schema.adminSessions.tokenHash, sha256(token)));
  if (!row || !row.user.active || row.expiresAt < new Date()) return null;
  const u = row.user;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isAdmin: u.role === "admin",
    mustChangePassword: u.mustChangePassword,
  };
});

/**
 * חובה בראש כל עמוד, Server Action ו-Route Handler של הלוח.
 * אין session תקף → מסך ההתחברות. סיסמה זמנית → מסך החלפת סיסמה.
 */
export async function requireSession(opts: { allowTempPassword?: boolean } = {}) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword && !opts.allowTempPassword) redirect("/admin/change-password");
  return { user };
}

/** פעולות ניהול משתמשים — מנהל בלבד. */
export async function requireAdmin() {
  const { user } = await requireSession();
  if (!user.isAdmin) redirect("/admin");
  return { user };
}

export const getAdminUser = async () => (await requireSession()).user;

/** החלפת סיסמה של המשתמש המחובר; מנתק את שאר ה-sessions שלו ופותח חדש. */
export async function changeOwnPassword(userId: string, newPassword: string) {
  const client = db()!;
  await client
    .update(schema.adminUsers)
    .set({ passwordHash: await hashPassword(newPassword), mustChangePassword: false })
    .where(eq(schema.adminUsers.id, userId));
  await client.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, userId));
  await createSession(userId);
}

export const newUserId = () => randomUUID();
