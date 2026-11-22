import "server-only";
import { site } from "@/lib/config";

/**
 * עותק גיבוי ל-Make, נפרד מ-Baram Leads ומהגיבוי ב-Neon.
 * הכתובת נקראת ממשתנה סביבה בשרת בלבד. הקריאה לא זורקת, עם timeout קצר,
 * כדי שתקלה ב-Make לא תפגע בטופס, בשמירה למסד, או בהעברה ל-Baram Leads.
 * בלי המשתנה — לא נשלח כלום.
 */

const TIMEOUT_MS = 2000;
const WEBHOOK_ENV = "MAKE_FORMS_BACKUP_WEBHOOK_URL";

export type FormsBackupEvent = "lead_backup" | "lead_forward_failed";
export type FormsBackupStatus = "received" | "forward_failed";

export type FormsBackupPayload = {
  client: "שלכם";
  event: FormsBackupEvent;
  status: FormsBackupStatus;
  form?: string;
  source_page?: string;
  name: string;
  full_name: string;
  phone: string;
  email: string;
  topic: string;
  marketing_consent: boolean;
  landing_page_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  gclid: string;
  fbclid: string;
  referrer: string;
  bl_ok?: boolean;
  bl_error?: string;
  notes?: string;
};

type BackupLead = {
  full_name: string;
  phone: string;
  email?: string | null;
  topic?: string;
  source_page?: string;
  marketing_consent?: boolean;
  attribution?: Record<string, unknown>;
};

type Touch = { params?: Record<string, string>; landing?: string; referrer?: string };

export type FormsBackupExtra = {
  event: FormsBackupEvent;
  status: FormsBackupStatus;
  bl_ok?: boolean;
  bl_error?: string;
};

/** מסיר כתובות מהטקסט כדי שטוקן של webhook לא ייכתב ללוג או למייל ההתראה. */
export function redactUrls(value: string): string {
  return value.replace(/https?:\/\/\S+/gi, "[redacted]").slice(0, 500);
}

function landingUrl(path: string | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.domain}${path.startsWith("/") ? path : `/${path}`}`;
}

export function shelachemBackupPayload(lead: BackupLead, extra: FormsBackupExtra): FormsBackupPayload {
  const attr = (lead.attribution ?? {}) as { last?: Touch; first?: Touch; page?: string };
  const touch = attr.last ?? attr.first;
  const params = touch?.params ?? {};
  const form = lead.source_page?.split("|")[0];
  const notes = [lead.topic && `נושא: ${lead.topic}`, form && `טופס: ${form}`].filter(Boolean).join("\n");
  const blError = extra.bl_error ? redactUrls(extra.bl_error) : "";
  return {
    client: "שלכם",
    event: extra.event,
    status: extra.status,
    ...(form ? { form } : {}),
    ...(lead.source_page ? { source_page: lead.source_page } : {}),
    name: lead.full_name,
    full_name: lead.full_name,
    phone: lead.phone,
    email: lead.email ?? "",
    topic: lead.topic ?? "",
    marketing_consent: lead.marketing_consent === true,
    landing_page_url: landingUrl(touch?.landing ?? attr.page),
    utm_source: params.utm_source ?? "",
    utm_medium: params.utm_medium ?? "",
    utm_campaign: params.utm_campaign ?? "",
    utm_term: params.utm_term ?? "",
    utm_content: params.utm_content ?? "",
    gclid: params.gclid ?? "",
    fbclid: params.fbclid ?? "",
    referrer: touch?.referrer ?? "",
    ...(extra.bl_ok !== undefined ? { bl_ok: extra.bl_ok } : {}),
    ...(blError ? { bl_error: blError } : {}),
    ...(notes ? { notes } : {}),
  };
}

/**
 * כתובת https בלבד. ערך חסר או לא תקין — דילוג שקט.
 * קריאה דינמית כדי שהכתובת לא תיצרב ל-bundle בזמן build.
 */
function webhookUrl(): string | null {
  const url = process.env[WEBHOOK_ENV]?.trim();
  if (!url) return null;
  try {
    if (new URL(url).protocol !== "https:") return null;
  } catch {
    return null;
  }
  return url;
}

function logFailure(err: unknown) {
  const raw = err instanceof Error ? err.message : "";
  console.error("[forms-backup] webhook failed", redactUrls(raw) || "unknown");
}

/** לא זורק. בלי משתנה סביבה — לא עושה כלום. */
export function sendFormsBackup(payload: FormsBackupPayload): Promise<void> {
  try {
    const url = webhookUrl();
    if (!url) return Promise.resolve();
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
      .then((res) => {
        if (!res.ok) console.error("[forms-backup] webhook responded", res.status);
      })
      .catch((err) => {
        logFailure(err);
      });
  } catch (err) {
    logFailure(err);
    return Promise.resolve();
  }
}
