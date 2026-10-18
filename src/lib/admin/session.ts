import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createDirectus, readMe, rest, staticToken } from "@directus/sdk";
import {
  COOKIE,
  REFRESH_MAX_AGE,
  cookieOptions,
  directusLogin,
  directusUrl,
  type Tokens,
} from "@/lib/admin/auth-shared";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  /** משתמש admin ב-Directus — רק הוא רואה את כפתור עדכון המבנה. */
  isAdmin: boolean;
}

/** כותב את הטוקנים לעוגיות. אפשרי רק ב-Server Action / Route Handler. */
export async function writeSession(tokens: Tokens) {
  const store = await cookies();
  const opts = { ...cookieOptions, maxAge: REFRESH_MAX_AGE };
  store.set(COOKIE.access, tokens.access_token, opts);
  store.set(COOKIE.refresh, tokens.refresh_token, opts);
  store.set(COOKIE.expires, String(Date.now() + tokens.expires), opts);
}

export async function clearSession() {
  const store = await cookies();
  for (const name of Object.values(COOKIE)) store.delete({ name, path: cookieOptions.path });
}

export async function login(email: string, password: string) {
  const tokens = await directusLogin(email, password);
  if (!tokens) return false;
  await writeSession(tokens);
  return true;
}

export async function logout() {
  const store = await cookies();
  const refresh = store.get(COOKIE.refresh)?.value;
  const base = directusUrl();
  if (refresh && base) {
    await fetch(`${base}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh, mode: "json" }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  await clearSession();
}

async function accessToken() {
  return (await cookies()).get(COOKIE.access)?.value ?? null;
}

/** Directus client עם הטוקן של המשתמש המחובר — כל פעולה בהרשאות שלו. */
function clientFor(token: string) {
  const base = directusUrl();
  if (!base) throw new Error("DIRECTUS_URL is not configured");
  return createDirectus(base).with(rest()).with(staticToken(token));
}

export type AdminClient = ReturnType<typeof clientFor>;

/**
 * חובה בראש כל עמוד, Server Action ו-Route Handler של הלוח.
 * אין session תקף → הפניה למסך ההתחברות.
 */
export async function requireSession() {
  const token = await accessToken();
  if (!token || !directusUrl()) redirect("/admin/login");
  return { client: clientFor(token), token };
}

/** פרטי המשתמש המחובר (לכותרת הלוח ולהרשאות תצוגה). */
export const getAdminUser = cache(async (): Promise<AdminUser> => {
  const { client, token } = await requireSession();
  try {
    const me = (await client.request(
      readMe({ fields: ["id", "first_name", "last_name", "email"] } as never),
    )) as Record<string, string | null>;
    const globals = await fetch(`${directusUrl()}/policies/me/globals`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    return {
      id: me.id ?? "",
      name: [me.first_name, me.last_name].filter(Boolean).join(" ") || me.email || "",
      email: me.email ?? "",
      isAdmin: Boolean(globals?.data?.admin_access),
    };
  } catch {
    // טוקן שנדחה (משתמש שהושבת, סיסמה שהוחלפה) — מתחברים מחדש.
    redirect("/admin/login?expired=1");
  }
});
