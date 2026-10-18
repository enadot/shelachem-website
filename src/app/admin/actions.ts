"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { changeOwnPassword, login, logout, requireSession } from "@/lib/admin/session";
import { verifyPassword, PASSWORD_MIN } from "@/lib/admin/password";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export interface LoginState {
  error?: string;
  /** מוחזר לטופס — React מאפס טופס אחרי action, ואחרי סיסמה שגויה אסור שהמייל ייעלם. */
  email?: string;
}

const loginSchema = z.object({
  email: z.string().trim().email("נא להזין כתובת דוא״ל תקינה"),
  password: z.string().min(1, "נא להזין סיסמה"),
});

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { email, error: parsed.error.issues[0]?.message };
  const result = await login(parsed.data.email, parsed.data.password);
  if (result === "no_db") return { email, error: "מסד הנתונים לא מחובר לאתר (DATABASE_URL)." };
  if (result === "locked") return { email, error: "יותר מדי ניסיונות. נסו שוב בעוד 15 דקות." };
  if (result === "invalid") return { email, error: "הדוא״ל או הסיסמה שגויים." };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

export interface PasswordState {
  error?: string;
}

/** החלפת סיסמה — חובה אחרי סיסמה זמנית, ואפשרית תמיד מהלוח. */
export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const { user } = await requireSession({ allowTempPassword: true });
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next.length < PASSWORD_MIN) return { error: `סיסמה של ${PASSWORD_MIN} תווים לפחות` };
  if (next !== confirm) return { error: "שתי הסיסמאות החדשות לא זהות" };
  const [row] = await db()!.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, user.id));
  if (!row || !(await verifyPassword(current, row.passwordHash))) return { error: "הסיסמה הנוכחית שגויה" };
  if (current === next) return { error: "הסיסמה החדשה צריכה להיות שונה מהנוכחית" };
  await changeOwnPassword(user.id, next);
  redirect("/admin");
}
