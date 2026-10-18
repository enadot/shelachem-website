import { createDirectus, rest, staticToken } from "@directus/sdk";

/**
 * כמה זמן מחכים ל-CMS לפני שמוותרים ונופלים לתוכן המקומי. בלי גבול, CMS שלא
 * עונה (למשל 522 מ-Cloudflare, כ-20 שניות לבקשה) מעכב כל עמוד, מפיל את ה-build
 * על מגבלת 60 השניות לעמוד, ומשהה את שמירת הלידים.
 */
const CMS_TIMEOUT_MS = 8000;

/**
 * מפסק: אחרי כשל (timeout, שגיאת רשת או 5xx של שער כמו 502/522) לא פונים ל-CMS
 * דקה — עמוד שעושה כמה בקשות לא מחכה לכל אחת, אלא נופל מיד לתוכן המקומי.
 */
const CMS_COOLDOWN_MS = 60_000;
let cmsDownUntil = 0;

const timedFetch: typeof fetch = async (input, init) => {
  if (Date.now() < cmsDownUntil) throw new Error("CMS unavailable (cooling down after a failure)");
  try {
    const res = await fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(CMS_TIMEOUT_MS) });
    if (res.status >= 502 && res.status <= 599) cmsDownUntil = Date.now() + CMS_COOLDOWN_MS;
    return res;
  } catch (err) {
    cmsDownUntil = Date.now() + CMS_COOLDOWN_MS;
    throw err;
  }
};

/**
 * Directus client — active only when DIRECTUS_URL is configured.
 * The content layer (src/lib/content) falls back to local content otherwise.
 */
export function getDirectusClient() {
  const url = process.env.DIRECTUS_URL;
  if (!url) return null;
  const token = process.env.DIRECTUS_STATIC_TOKEN;
  const client = createDirectus(url, { globals: { fetch: timedFetch } }).with(rest());
  return token ? client.with(staticToken(token)) : client;
}

export const directusEnabled = () => Boolean(process.env.DIRECTUS_URL);
