/**
 * Attribution — מאיפה הגיע הליד.
 *
 * פרמטרי UTM ומזהי קליק (gclid/fbclid/...) מופיעים רק בעמוד הנחיתה, ואובדים
 * ברגע שהגולש עובר עמוד. לכן לוכדים אותם בכניסה ושומרים ב-localStorage:
 * - first touch — המקור הראשון אי-פעם (נשמר פעם אחת, ל-90 יום);
 * - last touch — הקמפיין האחרון שהביא את הגולש (מתעדכן בכל כניסה עם פרמטרים).
 * בשליחת ליד שני המקורות מצורפים אליו, יחד עם עוגיות הפיקסלים (_fbp/_fbc/_ga)
 * שנדרשות לשליחת המרות מהשרת בעתיד (Conversions API / Offline Conversions).
 */

const PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "ttclid",
  "msclkid",
  "li_fat_id",
] as const;

export interface Touch {
  params: Partial<Record<(typeof PARAMS)[number], string>>;
  landing: string;
  referrer?: string;
  at: string;
}

export interface Attribution {
  first?: Touch;
  last?: Touch;
  cookies: Record<string, string>;
}

const FIRST_KEY = "shelachem-attr-first";
const LAST_KEY = "shelachem-attr-last";
const FIRST_TTL_MS = 90 * 24 * 60 * 60 * 1000;

function load(key: string): Touch | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Touch) : undefined;
  } catch {
    return undefined;
  }
}

function save(key: string, touch: Touch) {
  try {
    localStorage.setItem(key, JSON.stringify(touch));
  } catch {
    // אחסון חסום — ה-attribution יילקח מה-URL הנוכחי בלבד.
  }
}

function currentTouch(): Touch {
  const url = new URL(window.location.href);
  const params: Touch["params"] = {};
  for (const p of PARAMS) {
    const v = url.searchParams.get(p);
    if (v) params[p] = v.slice(0, 200);
  }
  let external: string | undefined;
  try {
    const ref = document.referrer;
    if (ref && new URL(ref).host !== url.host) external = ref.slice(0, 300);
  } catch {
    external = undefined;
  }
  return { params, landing: url.pathname, referrer: external, at: new Date().toISOString() };
}

/** נקרא פעם אחת בטעינת האתר (ב-MarketingTracker). */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  const touch = currentTouch();
  const hasCampaign = Object.keys(touch.params).length > 0;

  const first = load(FIRST_KEY);
  if (!first || Date.now() - Date.parse(first.at) > FIRST_TTL_MS) save(FIRST_KEY, touch);
  // ניווט פנימי (בלי פרמטרים ובלי מפנה חיצוני) לא דורס את המקור האחרון.
  if (hasCampaign || touch.referrer) save(LAST_KEY, touch);
}

function readCookies(names: string[]) {
  const out: Record<string, string> = {};
  for (const part of document.cookie.split("; ")) {
    const [k, ...v] = part.split("=");
    if (names.includes(k)) out[k] = decodeURIComponent(v.join("="));
  }
  return out;
}

export function getAttribution(): Attribution {
  const last = load(LAST_KEY);
  const first = load(FIRST_KEY);
  const cookies = readCookies(["_fbp", "_fbc", "_ga", "_gcl_aw", "_ttp"]);
  // אין עדיין _fbc (הפיקסל לא נטען/נחסם) אבל הגענו מקליק בפייסבוק — בונים אותו בפורמט של Meta.
  const fbclid = last?.params.fbclid;
  if (!cookies._fbc && fbclid) cookies._fbc = `fb.1.${Date.parse(last.at)}.${fbclid}`;
  return { first, last, cookies };
}

/** תקציר UTM קצר ל-`source_page` (השדה מוגבל ל-200 תווים). */
export function utmSummary(attr: Attribution) {
  const params = attr.last?.params ?? {};
  return new URLSearchParams(
    Object.entries(params).filter(([k]) => k.startsWith("utm_")) as [string, string][],
  ).toString();
}
