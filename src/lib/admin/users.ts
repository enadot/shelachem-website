import "server-only";
import { and, asc, count, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { hashPassword, temporaryPassword } from "@/lib/admin/password";
import { newUserId } from "@/lib/admin/session";

export type Role = "admin" | "editor";

export async function listUsers() {
  return db()!
    .select({
      id: schema.adminUsers.id,
      name: schema.adminUsers.name,
      email: schema.adminUsers.email,
      role: schema.adminUsers.role,
      active: schema.adminUsers.active,
      mustChangePassword: schema.adminUsers.mustChangePassword,
      lastLoginAt: schema.adminUsers.lastLoginAt,
    })
    .from(schema.adminUsers)
    .orderBy(asc(schema.adminUsers.createdAt));
}

/** משתמש חדש עם סיסמה זמנית (מוחלפת בכניסה הראשונה). מחזיר את הסיסמה — מוצגת פעם אחת. */
export async function createUser(input: { name: string; email: string; role: Role }) {
  const password = temporaryPassword();
  await db()!.insert(schema.adminUsers).values({
    id: newUserId(),
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    passwordHash: await hashPassword(password),
    mustChangePassword: true,
  });
  return password;
}

/** סיסמה זמנית חדשה + ניתוק מכל המכשירים. */
export async function resetPassword(id: string) {
  const password = temporaryPassword();
  const client = db()!;
  await client
    .update(schema.adminUsers)
    .set({ passwordHash: await hashPassword(password), mustChangePassword: true })
    .where(eq(schema.adminUsers.id, id));
  await client.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, id));
  return password;
}

/** תמיד נשאר לפחות מנהל פעיל אחד — אחרת אף אחד לא יוכל לנהל משתמשים. */
async function otherActiveAdmins(id: string) {
  const [{ n }] = await db()!
    .select({ n: count() })
    .from(schema.adminUsers)
    .where(and(eq(schema.adminUsers.role, "admin"), eq(schema.adminUsers.active, true), ne(schema.adminUsers.id, id)));
  return n;
}

export async function updateUser(id: string, patch: { role?: Role; active?: boolean }) {
  if ((patch.role === "editor" || patch.active === false) && (await otherActiveAdmins(id)) === 0) {
    throw new Error("חייב להישאר לפחות מנהל פעיל אחד");
  }
  const client = db()!;
  await client.update(schema.adminUsers).set(patch).where(eq(schema.adminUsers.id, id));
  if (patch.active === false) await client.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, id));
}
