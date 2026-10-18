/**
 * הגדרות האתר שהלקוח עורך בלוח הבקרה (`/admin/settings`, `/admin/marketing`):
 * פרטי קשר, רשתות חברתיות, סניפים, שעות פעילות ותגי שיווק.
 *
 * נשמרות ב-singleton `globals` ב-Directus. כל שדה ריק/חסר נופל חזרה לערך הקבוע
 * ב-`src/lib/config.ts` — כך שהאתר עובד גם בלי CMS וגם לפני שמילאו משהו.
 * קובץ טהור (בלי גישה לרשת) — משמש גם את השרת וגם את רכיבי הלקוח.
 */
import { branchGeo, branches as defaultBranches, openingHours as defaultHours, site } from "@/lib/config";
import { buildMarketingConfig, type MarketingConfig } from "@/lib/marketing";

export interface BranchInfo {
  id: string;
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  googleMapsUrl: string;
  wazeUrl: string;
  arrival: string[];
  accessibility: string[];
  lat?: number;
  lng?: number;
}

export interface OpeningHours {
  days: string[];
  opens: string;
  closes: string;
}

export interface ContactInfo {
  phone: string;
  phoneHref: string;
  /** בפורמט בינלאומי, ספרות בלבד (972…). */
  whatsappNumber: string;
  whatsappHref: string;
  email: string;
}

export const SOCIAL_KEYS = ["facebook", "instagram", "youtube", "tiktok", "linkedin"] as const;
export type Socials = Partial<Record<(typeof SOCIAL_KEYS)[number], string>>;

export interface SiteSettings {
  contact: ContactInfo;
  socials: Socials;
  branches: BranchInfo[];
  openingHours: OpeningHours[] | null;
  marketing: MarketingConfig;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const strList = (v: unknown) =>
  Array.isArray(v) ? v.map(str).filter((s): s is string => Boolean(s)) : [];
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const httpUrl = (v: unknown) => {
  const s = str(v);
  return s && /^https?:\/\//.test(s) ? s : undefined;
};

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** 076-8017778 / ‎+972768017778 / 972768017778 → 972768017778 */
export const toWhatsappNumber = (v: string) => {
  const digits = v.replace(/\D/g, "");
  return digits.startsWith("0") ? `972${digits.slice(1)}` : digits;
};

const DEFAULT_BRANCHES: BranchInfo[] = defaultBranches.map((b) => ({
  id: b.id,
  city: b.city,
  address: b.address,
  phone: b.phone,
  phoneHref: b.phoneHref,
  googleMapsUrl: b.googleMapsUrl,
  wazeUrl: b.wazeUrl,
  arrival: [...b.arrival],
  accessibility: [...b.accessibility],
  ...branchGeo[b.id],
}));

function parseBranches(v: unknown): BranchInfo[] | undefined {
  if (!Array.isArray(v) || !v.length) return undefined;
  const list = v
    .map((raw, i): BranchInfo | null => {
      const b = (raw ?? {}) as Record<string, unknown>;
      const city = str(b.city);
      const address = str(b.address);
      if (!city || !address) return null;
      const phone = str(b.phone) ?? site.phone;
      const q = encodeURIComponent(address);
      return {
        id: str(b.id) ?? `branch-${i + 1}`,
        city,
        address,
        phone,
        phoneHref: telHref(phone),
        googleMapsUrl: httpUrl(b.googleMapsUrl) ?? `https://maps.google.com/?q=${q}`,
        wazeUrl: httpUrl(b.wazeUrl) ?? `https://waze.com/ul?q=${q}&navigate=yes`,
        arrival: strList(b.arrival),
        accessibility: strList(b.accessibility),
        lat: num(b.lat),
        lng: num(b.lng),
      };
    })
    .filter((b): b is BranchInfo => b !== null);
  return list.length ? list : undefined;
}

function parseHours(v: unknown): OpeningHours[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const list = v
    .map((raw) => {
      const h = (raw ?? {}) as Record<string, unknown>;
      const days = strList(h.days);
      const opens = str(h.opens);
      const closes = str(h.closes);
      return days.length && opens && closes ? { days, opens, closes } : null;
    })
    .filter((h): h is OpeningHours => h !== null);
  return list.length ? list : undefined;
}

/** כתובת שהיא רק שורש הרשת (facebook.com/) היא placeholder — לא נחשבת. */
const realProfile = (u: string | undefined) => {
  if (!u) return undefined;
  try {
    return new URL(u).pathname.replace(/\/$/, "") ? u : undefined;
  } catch {
    return undefined;
  }
};

export function buildSiteSettings(g: Record<string, unknown> | null | undefined): SiteSettings {
  const phone = str(g?.phone) ?? site.phone;
  const whatsappNumber = toWhatsappNumber(str(g?.whatsapp_number) ?? site.whatsappHref);
  const cmsSocials = (g?.socials ?? {}) as Record<string, unknown>;
  const socials: Socials = {};
  for (const k of SOCIAL_KEYS) {
    const url = realProfile(httpUrl(cmsSocials[k]) ?? site.socials[k]);
    if (url) socials[k] = url;
  }
  return {
    contact: {
      phone,
      phoneHref: telHref(phone),
      whatsappNumber,
      whatsappHref: `https://wa.me/${whatsappNumber}`,
      email: str(g?.email) ?? site.email,
    },
    socials,
    branches: parseBranches(g?.branches) ?? DEFAULT_BRANCHES,
    openingHours: parseHours(g?.opening_hours) ?? defaultHours,
    marketing: buildMarketingConfig(g),
  };
}
