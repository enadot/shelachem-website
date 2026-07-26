import { getDirectusClient } from "../directus";
import { readItems, readSingleton } from "@directus/sdk";
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
  })) as unknown as T;
}

export const getFaqs = () => fromDirectus<FaqItem[]>("faqs", localFaqs);
export const getTestimonials = () =>
  fromDirectus<Testimonial[]>("testimonials", localTestimonials, withImage);
export const getArticles = () => fromDirectus<Article[]>("articles", localArticles, withImage);
export const getDoctors = () => fromDirectus<Doctor[]>("doctors", localDoctors, withImage);
export const getTeam = () => fromDirectus<TeamMember[]>("team_members", localTeam, withImage);
export const getInstitutions = () =>
  fromDirectus<Institution[]>("institutions", localInstitutions);
export const getServices = () => fromDirectus<Service[]>("services", localServices);

/**
 * הגדרות אתר — תמונת ההירו ועוד. null כשאין CMS או שעוד לא הוגדר.
 * קורא כ-singleton, ובנפילה גם כ-collection רגיל (אם globals נוצר ידנית ב-Directus
 * בלי סימון singleton) — כך שהעלאת תמונה עובדת בשני המקרים.
 */
export async function getGlobals(): Promise<Globals | null> {
  const client = getDirectusClient();
  if (!client) return null;
  const read = async () => {
    try {
      return (await client.request(readSingleton("globals" as never))) as Record<string, unknown>;
    } catch {
      const rows = (await client.request(
        readItems("globals" as never, { limit: 1 } as never),
      )) as Record<string, unknown>[];
      return rows?.[0];
    }
  };
  try {
    const g = await read();
    if (!g) return null;
    return {
      hero_image: assetUrl(g.hero_image),
      hero_image_alt: typeof g.hero_image_alt === "string" ? g.hero_image_alt : null,
    };
  } catch {
    return null;
  }
}

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
