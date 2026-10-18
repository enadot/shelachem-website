import { cache } from "react";
import { getDirectusClient } from "../directus";
import { readItems, readSingleton } from "@directus/sdk";
import { buildSiteSettings } from "../site-settings";
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
 * When DIRECTUS_URL is set, content is fetched from Directus collections;
 * otherwise the typed local content (mirroring the approved designs) is used.
 * Any Directus failure falls back to local content so the site never breaks.
 */
async function fromDirectus<T>(
  collection: string,
  fallback: T,
  map?: (rows: Record<string, unknown>[]) => T,
): Promise<T> {
  const client = getDirectusClient();
  if (!client) return fallback;
  try {
    const rows = (await client.request(
      readItems(collection as never, { limit: -1 } as never),
    )) as Record<string, unknown>[];
    if (!rows?.length) return fallback;
    return map ? map(rows) : (rows as unknown as T);
  } catch {
    return fallback;
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Directus file id → כתובת /assets מלאה; כל ערך אחר (נתיב מקומי/URL) נשאר כמו שהוא. */
function assetUrl(v: unknown): string | null {
  if (typeof v !== "string" || !v) return null;
  const base = process.env.DIRECTUS_URL?.replace(/\/$/, "");
  if (UUID_RE.test(v)) return base ? `${base}/assets/${v}` : null;
  // נכסים שנשמרו כ-URL מלא (media-setup כותב כתובת מוחלטת) — ממופים מחדש
  // ל-host שמוגדר ב-DIRECTUS_URL, כדי שהחלפת דומיין/מעבר ל-HTTPS לא תשבור אותם.
  const assetPath = v.match(/\/assets\/.+$/)?.[0];
  return assetPath && base ? `${base}${assetPath}` : v;
}

/** מעדיפים את שדה ההעלאה image_file (קובץ שהועלה ב-CMS) על שדה הנתיב הישן image. */
function withImage<T>(rows: Record<string, unknown>[]): T {
  return rows.map((r) => ({
    ...r,
    image: assetUrl(r.image_file) ?? assetUrl(r.image),
    // תמונות תוכן הוצגו עם alt="" קבוע; השדה הזה נותן להן תיאור אמיתי מה-CMS.
    imageAlt: typeof r.image_alt === "string" ? r.image_alt : null,
  })) as unknown as T;
}

export const getFaqs = () => fromDirectus<FaqItem[]>("faqs", localFaqs);
export const getTestimonials = () =>
  fromDirectus<Testimonial[]>("testimonials", localTestimonials, withImage);

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
  (await fromDirectus<Article[]>("articles", localArticles, withImage)).filter(isPublished);
export const getDoctors = () => fromDirectus<Doctor[]>("doctors", localDoctors, withImage);
export const getTeam = () => fromDirectus<TeamMember[]>("team_members", localTeam, withImage);
export const getInstitutions = () =>
  fromDirectus<Institution[]>("institutions", localInstitutions, withImage);
export const getServices = () => fromDirectus<Service[]>("services", localServices, withImage);

/**
 * שורת ה-globals הגולמית (singleton). null כשאין CMS, שגיאה או שעוד לא נוצרה.
 * קורא כ-singleton, ובנפילה גם כ-collection רגיל (אם globals נוצר ידנית ב-Directus
 * בלי סימון singleton). עטוף ב-cache — כמה רכיבים באותו רינדור = בקשה אחת.
 */
const getGlobalsRaw = cache(async (): Promise<Record<string, unknown> | null> => {
  const client = getDirectusClient();
  if (!client) return null;
  try {
    return (await client.request(readSingleton("globals" as never))) as Record<string, unknown>;
  } catch {
    try {
      const rows = (await client.request(
        readItems("globals" as never, { limit: 1 } as never),
      )) as Record<string, unknown>[];
      return rows?.[0] ?? null;
    } catch {
      return null;
    }
  }
});

/** תמונת ההירו. null כשאין CMS או שעוד לא הוגדרה. */
export async function getGlobals(): Promise<Globals | null> {
  const g = await getGlobalsRaw();
  if (!g) return null;
  return {
    hero_image: assetUrl(g.hero_image),
    hero_image_alt: typeof g.hero_image_alt === "string" ? g.hero_image_alt : null,
  };
}

/** פרטי קשר, סניפים ותגי שיווק — מה-CMS, עם נפילה חזרה ל-config.ts (ראו site-settings.ts). */
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
