import { z } from "zod";
import { site } from "@/lib/config";

/**
 * קבלת ליד מ-/api/leads.
 *
 * הדפדפן לא פונה ל-BARAM. יש שני ערוצים לאותו אימות:
 * - JSON מ-fetch (כשה-JS רץ) — תשובת JSON.
 * - POST רגיל של הטופס (בלי JS, או לפני הידרציה) — הפניה לעמוד תודה,
 *   כדי שרענון לא ישלח את הליד שוב.
 *
 * המודול לא מייבא את ההעברה ל-BARAM ולא את המסד. מי שקורא לו מחליט אם לשמור.
 */

export { SUBMIT_TIMEOUT_MS, leadResponseAccepted, runLeadTracking } from "@/lib/lead-client";

export interface SubmittedLead {
  full_name: string;
  phone: string;
  email: string | null;
  topic?: string;
  source_page?: string;
  marketing_consent: boolean;
  attribution?: Record<string, unknown>;
}

export type LeadBodyMode = "json" | "form";

const truthy = (v: unknown) => v === true || v === "true" || v === "on" || v === "yes" || v === "1";

const leadSchema = z.object({
  full_name: z.string().trim().min(2, "נא להזין שם מלא").max(100),
  phone: z
    .string()
    .transform((v) => v.trim().replace(/[\s-]/g, "").replace(/^(\+972|972)/, "0"))
    .refine((v) => /^0\d{8,9}$/.test(v), "נא להזין מספר טלפון ישראלי תקין"),
  email: z.union([z.string().trim().email("כתובת דוא״ל לא תקינה"), z.literal("")]).optional(),
  topic: z.string().trim().max(200).optional(),
  source_page: z.string().trim().max(200).optional(),
  marketing_consent: z.boolean().optional(),
  attribution: z
    .record(z.string(), z.unknown())
    .refine((v) => JSON.stringify(v).length <= 4000, "attribution too large")
    .optional(),
  /** Honeypot — humans never fill this hidden field. */
  company: z.string().max(0).optional(),
});

export type LeadParseResult =
  | { ok: true; lead: SubmittedLead }
  | { ok: false; status: number; error: string };

/**
 * בקשת POST חוצת-אתר (טופס באתר אחר) נדחית. בלי Origin — מתירים, כדי שדפדפן
 * שמסנן כותרות לא ייחסם. `Sec-Fetch-Site: cross-site` תמיד נדחה.
 */
export function leadPostAllowed(input: {
  origin: string | null;
  host: string | null;
  fetchSite: string | null;
}): boolean {
  if (input.fetchSite === "cross-site") return false;
  if (!input.origin) return true;
  if (input.origin === "null") return false;
  let originHost: string;
  try {
    originHost = new URL(input.origin).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (!input.host) return false;
  const hostName = input.host.split(",")[0]?.trim().toLowerCase().replace(/:\d+$/, "");
  return hostName === originHost;
}

function asRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

/** מפרש גוף שכבר פוענח (אובייקט JSON או שדות טופס). לא נוגע ברשת. */
export function parseLeadBody(raw: unknown, mode: LeadBodyMode): LeadParseResult {
  const record = asRecord(raw);
  if (!record) return { ok: false, status: 400, error: "בקשה לא תקינה" };

  const consent = record.data_consent;
  if (mode === "form" && !truthy(consent)) {
    return { ok: false, status: 400, error: "יש לאשר את שמירת הפרטים" };
  }
  if (consent !== undefined && !truthy(consent)) {
    return { ok: false, status: 400, error: "יש לאשר את שמירת הפרטים" };
  }

  const payload: Record<string, unknown> = { ...record };
  delete payload.data_consent;
  if (mode === "form") delete payload.attribution;
  if ("marketing_consent" in payload) payload.marketing_consent = truthy(payload.marketing_consent);

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? "נא לבדוק את הפרטים" };
  }

  const { company: _honeypot, email, attribution, topic, source_page, marketing_consent, ...lead } = parsed.data;
  return {
    ok: true,
    lead: {
      ...lead,
      email: email || null,
      marketing_consent: marketing_consent === true,
      ...(topic ? { topic } : {}),
      ...(source_page ? { source_page } : {}),
      ...(attribution ? { attribution } : {}),
    },
  };
}

export function formDataToObject(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function htmlPage(title: string, message: string, status: number) {
  const phone = escapeHtml(site.phone);
  const phoneHref = escapeHtml(site.phoneHref);
  const whatsapp = escapeHtml(site.whatsappHref);
  const body = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;font-family:system-ui,Arial,sans-serif;background:#f6f7fb;color:#14182b">
<main style="max-width:32rem;margin:12vh auto;padding:2rem 1.25rem;text-align:center">
<h1 style="font-size:1.75rem;margin:0 0 .75rem">${escapeHtml(title)}</h1>
<p style="font-size:1.05rem;line-height:1.6;margin:0">${escapeHtml(message)}</p>
<p style="margin:1.25rem 0 0">אפשר גם <a href="${phoneHref}">${phone}</a> או <a href="${whatsapp}">בוואטסאפ</a>.</p>
<p style="margin:1.5rem 0 0"><a href="/#lead-form">חזרה לטופס</a></p>
</main>
</body>
</html>`;
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function jsonError(error: string, status: number) {
  return Response.json(
    { ok: false, error },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export async function handleLeadPost(
  request: Request,
  deps: { save: (lead: SubmittedLead) => Promise<void> },
): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  const mode: LeadBodyMode | null = contentType.includes("application/json")
    ? "json"
    : contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")
      ? "form"
      : null;

  if (!mode) return jsonError("בקשה לא תקינה", 415);

  const allowed = leadPostAllowed({
    origin: request.headers.get("origin"),
    host: request.headers.get("host"),
    fetchSite: request.headers.get("sec-fetch-site"),
  });
  if (!allowed) {
    return mode === "json" ? jsonError("לא ניתן לשלוח את הטופס מכאן", 403) : htmlPage("לא ניתן לשלוח", "לא ניתן לשלוח את הטופס מכאן.", 403);
  }

  let raw: unknown;
  try {
    raw = mode === "json" ? await request.json() : formDataToObject(await request.formData());
  } catch {
    return mode === "json" ? jsonError("בקשה לא תקינה", 400) : htmlPage("הפרטים לא נשמרו", "בקשה לא תקינה.", 400);
  }

  const parsed = parseLeadBody(raw, mode);
  if (!parsed.ok) {
    return mode === "json" ? jsonError(parsed.error, parsed.status) : htmlPage("הפרטים לא נשמרו", parsed.error, parsed.status);
  }

  try {
    await deps.save(parsed.lead);
  } catch (err) {
    console.error("[leads] save failed:", err instanceof Error ? err.message : "unknown");
    const error = "משהו השתבש בשליחה. נסו שוב או התקשרו אלינו.";
    return mode === "json" ? jsonError(error, 500) : htmlPage("הפרטים לא נשמרו", error, 500);
  }

  if (mode === "form") {
    return Response.redirect(new URL("/lead-received", request.url), 303);
  }
  return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
