import "server-only";

/**
 * BARAM Leads REST API — מערכת הלידים הראשית של המשרד. מסכי הלידים בלוח קוראים
 * ומעדכנים דרכו (במקום טבלת לידים משלנו). המפתח (`BARAM_LEADS_API_KEY`) נוצר
 * ב-BARAM ▸ הגדרות ▸ "API ו-MCP", ללקוח "שלכם", עם קריאה + כתיבה.
 * תיעוד: https://leads.baram.digital/api/v1/docs
 */

/** ניתן להחלפה לבדיקות מקומיות מול שרת מדומה. */
const BASE = process.env.BARAM_LEADS_API_URL || "https://leads.baram.digital/api/v1";
/** הלקוח "שלכם" ב-BARAM Leads. */
export const BARAM_TENANT_ID = 4800;
const TIMEOUT_MS = 8000;

export const baramEnabled = () => Boolean(process.env.BARAM_LEADS_API_KEY);
export const baramLeadUrl = (id: number) => `https://leads.baram.digital/leads/${id}`;

export interface BaramFeedbackRef {
  id: number;
  name: string;
  updatedAt?: string;
}

export interface BaramLead {
  id: number;
  createdAt: string;
  status: "new" | "invalid_details" | "duplicate" | "spam" | "test";
  feedback: BaramFeedbackRef | null;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  marketingConsent: boolean;
  assignedTo: string | null;
  campaign: { id: number; name: string } | null;
  channel: { id: number; name: string } | null;
  fields: Record<string, unknown>;
  duplicateOf: number | null;
  utm: { source: string | null; medium: string | null; campaign: string | null; term: string | null; content: string | null } | null;
  gclid: string | null;
  fbclid: string | null;
  landingPageUrl: string | null;
  referrer: string | null;
}

export interface BaramTimelineEvent {
  id: number;
  type: string;
  at: string;
  by: string | null;
  data: Record<string, unknown> | null;
}

export interface BaramFeedback {
  id: number;
  name: string;
  category: "positive" | "negative" | "open";
  /** reason = דורש סיבה; reminder = דורש מועד חזרה. */
  action: "none" | "reason" | "reminder";
  archived: boolean;
}

export interface BaramSetup {
  campaigns: { id: number; name: string; active: boolean; channels: { id: number; name: string; active: boolean }[] }[];
  feedbacks: BaramFeedback[];
}

export interface BaramStats {
  total: number;
  previousPeriodTotal: number;
  withFeedback: number;
  positive: number;
  byFeedback: { id: number | null; name: string | null; count: number }[];
  byDay: { day: string; count: number }[];
}

export interface LeadSearch {
  q?: string;
  from?: string;
  to?: string;
  /** מזהה משוב, או "none" — לידים שעוד לא קיבלו משוב. */
  feedback?: string;
  channel?: string;
  utmSource?: string;
  page?: number;
  pageSize?: number;
}

export interface LeadPage {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  leads: BaramLead[];
}

export class BaramError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

const MESSAGES: Record<string, string> = {
  unauthorized: "מפתח ה-API של BARAM Leads לא תקין או בוטל",
  forbidden: "למפתח ה-API אין הרשאה לפעולה הזו ב-BARAM Leads",
  insufficient_scope: "מפתח ה-API של BARAM Leads הוא לקריאה בלבד",
  not_found: "הליד לא נמצא ב-BARAM Leads",
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.BARAM_LEADS_API_KEY;
  if (!key) throw new BaramError("לא הוגדר מפתח API של BARAM Leads (BARAM_LEADS_API_KEY)", 0, "no_key");
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new BaramError("BARAM Leads לא מגיב כרגע — נסו שוב בעוד רגע", 0, "unreachable");
  }
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: { code?: string; message?: string } };
  if (!res.ok || json.error) {
    const code = json.error?.code;
    throw new BaramError((code && MESSAGES[code]) || json.error?.message || `BARAM Leads: שגיאה ${res.status}`, res.status, code);
  }
  return json.data as T;
}

export function searchLeads(s: LeadSearch) {
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  if (s.from) p.set("from", s.from);
  if (s.to) p.set("to", s.to);
  if (s.feedback) p.set("feedback", s.feedback);
  if (s.channel) p.set("channel", s.channel);
  if (s.utmSource) p.set("utm_source", s.utmSource);
  p.set("page", String(Math.max(1, s.page ?? 1)));
  p.set("page_size", String(s.pageSize ?? 25));
  return request<LeadPage>(`/clients/${BARAM_TENANT_ID}/leads?${p}`);
}

export function getLead(id: number) {
  return request<{ lead: BaramLead; timeline: BaramTimelineEvent[] }>(`/leads/${id}`);
}

export function updateLead(
  id: number,
  patch: { feedbackId?: number | null; feedbackReason?: string; remindAt?: string },
) {
  return request<unknown>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function addLeadNote(id: number, text: string) {
  return request<unknown>(`/leads/${id}/notes`, { method: "POST", body: JSON.stringify({ text }) });
}

export function leadStats(from: string, to: string) {
  return request<BaramStats>(`/clients/${BARAM_TENANT_ID}/stats?from=${from}&to=${to}`);
}

/** קמפיינים, ערוצים וסטטוסי משוב — משתנים לעיתים רחוקות, נשמרים בזיכרון 10 דקות. */
let setupCache: { at: number; value: Promise<BaramSetup> } | null = null;
export function clientSetup(): Promise<BaramSetup> {
  if (setupCache && Date.now() - setupCache.at < 10 * 60_000) return setupCache.value;
  const value = request<BaramSetup>(`/clients/${BARAM_TENANT_ID}`);
  setupCache = { at: Date.now(), value };
  value.catch(() => (setupCache = null));
  return value;
}

/** תאריך היום (YYYY-MM-DD) בשעון ישראל, פחות `daysAgo` ימים — הפורמט של ה-API. */
export function israelDay(daysAgo = 0) {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(d);
}
