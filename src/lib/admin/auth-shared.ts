/**
 * קבועים ופונקציות התחברות שמשותפים ל-proxy.ts ול-session.ts.
 * ההתחברות היא מול Directus עצמו (משתמש Directus רגיל): הלוח לא מחזיק
 * מערכת משתמשים משלו, וההרשאות נקבעות לפי ה-role של המשתמש ב-Directus.
 */

export const COOKIE = {
  access: "sh_admin_at",
  refresh: "sh_admin_rt",
  expires: "sh_admin_exp",
} as const;

/** העוגיות נשלחות רק לנתיבי הלוח, לא לאתר הציבורי. */
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/admin",
};

/** תוקף עוגיית ה-refresh (ברירת המחדל של Directus היא 7 ימים). */
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export interface Tokens {
  access_token: string;
  refresh_token: string;
  /** תוקף ה-access token במילישניות. */
  expires: number;
}

export const directusUrl = () => process.env.DIRECTUS_URL?.replace(/\/$/, "") || null;

async function authCall(path: string, body: Record<string, unknown>): Promise<Tokens | null> {
  const base = directusUrl();
  if (!base) return null;
  const res = await fetch(`${base}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, mode: "json" }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: Tokens };
  return json.data?.access_token ? json.data : null;
}

export const directusLogin = (email: string, password: string) =>
  authCall("login", { email, password });

export const directusRefresh = (refresh_token: string) => authCall("refresh", { refresh_token });

/** רענון מעט לפני שהטוקן פג, כדי שבקשה באמצע לא תיכשל. */
export const needsRefresh = (expiresAt: number) => Date.now() > expiresAt - 60_000;
