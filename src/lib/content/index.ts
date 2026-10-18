import { cache } from "react";
import { buildSiteSettings } from "../site-settings";
import { DEFAULT_LEAD_WEBHOOKS, type LeadWebhooks } from "../lead-forwarding";
import { readCollection, readSettingsRow } from "./store";
import type {
  Article,
  Doctor,
  FaqItem,
  Globals,
  Institution,
  Service,
  TeamMember,
  Testimonial,
} from "./types";
import { faqs as localFaqs } from "./local/faqs";
import { testimonials as localTestimonials } from "./local/testimonials";
import { articles as localArticles } from "./local/articles";
import { doctors as localDoctors } from "./local/doctors";
import { team as localTeam } from "./local/team";
import { institutions as localInstitutions } from "./local/institutions";
import { services as localServices } from "./local/services";

/**
 * Content access layer.
 * When DATABASE_URL is set, content is read from the site database (managed in /admin);
 * otherwise — or when the database is empty or unavailable — the typed local content
 * (mirroring the approved designs) is used, so the site never breaks.
 */
async function fromDb<T>(
  collection: string,
  fallback: T,
  map?: (rows: Record<string, unknown>[]) => T,
): Promise<T> {
  const rows = await readCollection(collection);
  if (!rows) return fallback;
  return map ? map(rows) : (rows as unknown as T);
}

/** URL של תמונה (Vercel Blob) או נתיב מקומי (/images/...). כל ערך אחר — אין תמונה. */
function assetUrl(v: unknown): string | null {
  if (typeof v !== "string" || !v) return null;
  return /^(https?:\/\/|\/)/.test(v) ? v : null;
}

/** מעדיפים את שדה ההעלאה image_file (תמונה שהועלתה בלוח) על שדה הנתיב הישן image. */
function withImage<T>(rows: Record<string, unknown>[]): T {
  return rows.map((r) => ({
    ...r,
    image: assetUrl(r.image_file) ?? assetUrl(r.image),
    // תמונות תוכן הוצגו עם alt="" קבוע; השדה הזה נותן להן תיאור אמיתי מהלוח.
    imageAlt: typeof r.image_alt === "string" ? r.image_alt : null,
  })) as unknown as T;
}

export const getFaqs = () => fromDb<FaqItem[]>("faqs", localFaqs);
export const getTestimonials = () =>
  fromDb<Testimonial[]>("testimonials", localTestimonials, withImage);

/**
 * כתבה נחשבת מפורסמת רק אם יש לה גוף עם תוכן.
 *
 * למה: 9 מ-10 הכתבות הוגדרו עם `excerpt`, תמונה ו-"12 דק׳ קריאה" אבל בלי `body`,
 * ולכן העמוד רונדר כותרת, שתי שורות ו-CTA — והצהיר שזה "המדריך המלא, שלב אחר
 * שלב". זה גרוע מ-404 (404 לפחות כן): מבקר שהגיע מחיפוש אורגני לעמוד על הזכות
 * שלו מקבל הבטחה שלא נמסרת, בקטגוריה שכולה אמון. בנוסף, עמודים דלילים פוגעים
 * בדירוג של כל שאר האתר.
 *
 * הכתבות עצמן נשארות בתוכן — ברגע שיתווסף להן `body` (מקומית או ב-CMS) הן
 * חוזרות לאתר, ל-sitemap ולניווט בלי שינוי קוד.
 */
export const isPublished = (a: Article) =>
  Boolean(a.body?.some((s) => s.paragraphs?.length || s.bullets?.length));

export const getArticles = async () =>
  (await fromDb<Article[]>("articles", localArticles, withImage)).filter(isPublished);
export const getDoctors = () => fromDb<Doctor[]>("doctors", localDoctors, withImage);
export const getTeam = () => fromDb<TeamMember[]>("team_members", localTeam, withImage);
export const getInstitutions = () =>
  fromDb<Institution[]>("institutions", localInstitutions, withImage);
export const getServices = () => fromDb<Service[]>("services", localServices, withImage);

/** שורת הגדרות האתר (לוח הבקרה ▸ הגדרות / שיווק). null כשאין מסד או שעוד לא נשמר כלום. */
const getGlobalsRaw = cache(async (): Promise<Record<string, unknown> | null> => readSettingsRow());

/** תמונת ההירו. null כשאין מסד או שעוד לא הוגדרה. */
export async function getGlobals(): Promise<Globals | null> {
  const g = await getGlobalsRaw();
  if (!g) return null;
  return {
    hero_image: assetUrl(g.hero_image),
    hero_image_alt: typeof g.hero_image_alt === "string" ? g.hero_image_alt : null,
  };
}

/**
 * כתובות ה-webhook של BARAM Leads (לוח הבקרה ▸ הגדרות אתר). בשרת בלבד — לא עובר
 * ל-SettingsProvider ולא מגיע לדפדפן.
 */
export async function getLeadWebhooks(): Promise<LeadWebhooks> {
  const g = await getGlobalsRaw();
  const pick = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v.trim() : fallback);
  return {
    site: pick(g?.leads_webhook_url, DEFAULT_LEAD_WEBHOOKS.site),
    quiz: pick(g?.leads_quiz_webhook_url, DEFAULT_LEAD_WEBHOOKS.quiz),
  };
}

/** פרטי קשר, סניפים ותגי שיווק — מהמסד, עם נפילה חזרה ל-config.ts (ראו site-settings.ts). */
export const getSiteSettings = cache(async () => buildSiteSettings(await getGlobalsRaw()));

export async function getArticle(slug: string) {
  const all = await getArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getInstitution(slug: string) {
  const all = await getInstitutions();
  return all.find((i) => i.slug === slug) ?? null;
}

export async function getService(slug: string) {
  const all = await getServices();
  return all.find((s) => s.slug === slug) ?? null;
}
