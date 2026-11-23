import { redactUrls } from "@/lib/forms-backup";

/**
 * תשובת ingest של BARAM Leads, כפי שהנתיב מחזיר היום
 * (`src/app/api/ingest/[token]/route.ts` ב-baram-leads):
 *
 * הצלחה:
 * - 200 `{ ok: true }` — honeypot, בלי ליד
 * - 201 `{ ok: true, leadId, status }` — new / invalid_details / test, וגם spam שמדווח כ-new
 * - 201 `{ ok: true, leadId, status: "duplicate", duplicateOf }`
 *
 * כישלון: לא-2xx, או גוף עם `ok: false` / שדה `error` כש-`ok` אינו true.
 * קודי השגיאה: unknown_channel, rate_limited, too_large, invalid_body,
 * empty_payload, tenant_paused, channel_inactive, internal.
 */

const SNIPPET_MAX = 180;

export type IngestVerdict = { ok: true; leadId?: number } | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function errorField(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  const record = asRecord(value);
  if (!record) return undefined;
  if (typeof record.message === "string" && record.message.trim()) return record.message.trim();
  if (typeof record.error === "string" && record.error.trim()) return record.error.trim();
  return undefined;
}

function snippet(body: string): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (!flat) return "";
  return flat.length > SNIPPET_MAX ? `${flat.slice(0, SNIPPET_MAX)}…` : flat;
}

/** טקסט בטוח למייל: סטטוס, שדה error, או קטע קצר מהגוף. בלי כתובות. */
export function ingestFailureText(status: number, body: string, explicit?: string): string {
  const detail = explicit || snippet(body);
  const text = redactUrls([`HTTP ${status}`, detail].filter(Boolean).join(" ")).trim();
  return text || `HTTP ${status}`;
}

export function interpretIngestResponse(status: number, body: string): IngestVerdict {
  const trimmed = body.replace(/^\uFEFF/, "").trim();
  let parsed: unknown;
  try {
    parsed = trimmed ? JSON.parse(trimmed) : undefined;
  } catch {
    parsed = undefined;
  }
  const json = asRecord(parsed);
  const leadId = typeof json?.leadId === "number" && Number.isFinite(json.leadId) ? json.leadId : undefined;
  const flag = json?.ok;
  const okTrue = flag === true || flag === "true";
  const okFalse = flag === false || flag === "false";
  const explicit = errorField(json?.error);
  const httpOk = status >= 200 && status < 300;
  if (httpOk && !okFalse && !(explicit && !okTrue)) return { ok: true, ...(leadId !== undefined ? { leadId } : {}) };
  return { ok: false, error: ingestFailureText(status, trimmed, explicit) };
}

/** הודעת חריגה בלי כתובת ה-webhook. timeout בלי הודעה לא נשאר ריק. */
export function describeForwardError(err: unknown): string {
  const name = err instanceof Error ? err.name : "";
  const message = err instanceof Error ? err.message.trim() : "";
  const timedOut = name === "TimeoutError" || name === "AbortError";
  const redacted = redactUrls(message).trim();
  if (redacted && redacted !== "[redacted]") return redacted;
  return timedOut ? "timeout" : "network error";
}
