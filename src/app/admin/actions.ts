"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { login, logout, requireSession } from "@/lib/admin/session";
import { directusUrl } from "@/lib/admin/auth-shared";
import { runMigration } from "@/lib/admin/migrate";

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
  if (!directusUrl()) return { email, error: "ה-CMS לא מוגדר בשרת (DIRECTUS_URL)." };
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { email, error: parsed.error.issues[0]?.message };
  const ok = await login(parsed.data.email, parsed.data.password);
  if (!ok) return { email, error: "הדוא״ל או הסיסמה שגויים." };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

/** עדכון מבנה ה-CMS (שדות חדשים + role עורך). Directus עצמו בודק שהמשתמש admin. */
export async function migrateAction(): Promise<{ ok: boolean; log: string[]; error?: string }> {
  const { token } = await requireSession();
  try {
    const { log } = await runMigration(token);
    revalidatePath("/admin", "layout");
    return { ok: true, log };
  } catch (err) {
    return { ok: false, log: [], error: err instanceof Error ? err.message : "העדכון נכשל" };
  }
}
