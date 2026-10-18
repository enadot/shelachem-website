import "server-only";
import { site } from "@/lib/config";

/**
 * העברת לידים ל-BARAM Leads (מערכת ניהול הלידים של המשרד).
 *
 * כל ערוץ ב-BARAM Leads מקבל לידים בכתובת webhook משלו
 * (`https://leads.baram.digital/api/ingest/<token>`). שאלון הזכאות בדף הבית
 * נשלח לערוץ "שאלון", וכל שאר הטפסים לערוץ "לידים מהאתר". אם ערוץ השאלון כבוי
 * או נכשל — הליד נשלח לערוץ האתר, כדי שלא ילך לאיבוד.
 *
 * הכתובות נערכות בלוח הבקרה (הגדרות אתר ▸ חיבור למערכת הלידים). אלה כאן הן
 * ברירת המחדל עד שממלאים שם. הטוקן בכתובת אינו סוד חזק — BARAM מאפשר לשלוח
 * אליו גם מהדפדפן — אבל האתר שולח רק מהשרת.
 */

export const DEFAULT_LEAD_WEBHOOKS = {
  site: "https://leads.baram.digital/api/ingest/xHcCdleE93tBCTUDmHoUGycJ",
  quiz: "https://leads.baram.digital/api/ingest/6AMTFktghGQmayymdAXLW0i2",
};

export interface LeadWebhooks {
  site?: string;
  quiz?: string;
}

const TIMEOUT_MS = 8000;

/** רק כתובות ingest של BARAM — כתובת אחרת שהוזנה בטעות לא תקבל לידים. */
export const isLeadWebhook = (v: unknown): v is string =>
  typeof v === "string" && /^https:\/\/leads\.baram\.digital\/api\/ingest\/[A-Za-z0-9_-]{16,64}$/.test(v.trim());

/** סביבת פיתוח / preview — הלידים מסומנים "test" ב-BARAM (בלי התראות ובלי חיוב). */
const isTestEnv = () => process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

interface Touch {
  params?: Record<string, string>;
  landing?: string;
  referrer?: string;
}

export interface ForwardableLead {
  full_name: string;
  phone: string;
  email?: string | null;
  topic?: string;
  source_page?: string;
  marketing_consent?: boolean;
  attribution?: Record<string, unknown>;
}

/** הליד בפורמט ש-BARAM Leads ממפה אוטומטית (שמות שדות סטנדרטיים). */
function payloadFor(lead: ForwardableLead) {
  const attr = (lead.attribution ?? {}) as { last?: Touch; first?: Touch; event_id?: string; page?: string };
  const touch = attr.last ?? attr.first;
  const params = touch?.params ?? {};
  const form = lead.source_page?.split("|")[0];
  const landing = touch?.landing ?? attr.page;
  return {
    name: lead.full_name,
    phone: lead.phone,
    email: lead.email || undefined,
    notes: [lead.topic && `נושא: ${lead.topic}`, form && `טופס: ${form}`].filter(Boolean).join("\n") || undefined,
    marketing_consent: lead.marketing_consent === true,
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    utm_term: params.utm_term,
    utm_content: params.utm_content,
    gclid: params.gclid,
    fbclid: params.fbclid,
    landing_page_url: landing ? `${site.domain}${landing}` : undefined,
    referrer: touch?.referrer,
    // שדות נוספים — נשמרים ב-BARAM על ציר הזמן של הליד
    topic: lead.topic,
    form,
    event_id: attr.event_id,
    ...(isTestEnv() ? { test: true } : {}),
  };
}

async function post(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; leadId?: number };
  return { ok: res.ok && json.ok !== false, status: res.status, error: json.error, leadId: json.leadId };
}

export type ForwardResult =
  | { ok: true; channel: "quiz" | "site"; leadId?: number }
  | { ok: false; error: string };

/**
 * שולח ליד ל-BARAM Leads. לא זורק — הליד כבר שמור בגיבוי (`lead_backups`),
 * והתוצאה נרשמת שם; ליד שלא הועבר אפשר לשלוח שוב מהלוח.
 */
export async function forwardLead(lead: ForwardableLead, hooks: LeadWebhooks): Promise<ForwardResult> {
  const siteUrl = isLeadWebhook(hooks.site) ? hooks.site : undefined;
  const quizUrl = isLeadWebhook(hooks.quiz) ? hooks.quiz : undefined;
  const fromQuiz = lead.source_page?.startsWith("home-quiz") ?? false;
  const targets = [...new Set([fromQuiz ? quizUrl : undefined, siteUrl].filter((u): u is string => Boolean(u)))];
  if (!targets.length) return { ok: false, error: "לא הוגדרה כתובת webhook תקינה" };

  const body = payloadFor(lead);
  const errors: string[] = [];
  for (const url of targets) {
    const which = url === quizUrl ? "quiz" : "site";
    try {
      const res = await post(url, body);
      if (res.ok) return { ok: true, channel: which, leadId: res.leadId };
      console.error("[leads] BARAM Leads rejected the lead:", res.status, res.error, `(${which})`);
      errors.push(`${which}: ${res.status} ${res.error ?? ""}`.trim());
    } catch (err) {
      console.error("[leads] BARAM Leads unreachable:", err);
      errors.push(`${which}: ${err instanceof Error ? err.message : "unreachable"}`);
    }
  }
  console.error("[leads] lead NOT forwarded to BARAM Leads:", { ...lead, attribution: undefined });
  return { ok: false, error: errors.join("; ").slice(0, 500) };
}
