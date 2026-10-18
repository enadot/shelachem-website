import "server-only";
import { directusUrl } from "@/lib/admin/auth-shared";
import { LEAD_STATUS_OPTIONS } from "@/lib/admin/lead-status";

/**
 * עדכון מבנה ה-CMS שלוח הבקרה צריך — רץ מתוך הלוח בלחיצת כפתור (משתמש admin),
 * כך שלא צריך גישה לשרת. אידמפוטנטי: בודק כל שדה/הרשאה לפני יצירה.
 * (אותו דפוס כמו directus/seed/setup-media.mjs.)
 */

interface FieldDef {
  field: string;
  type: "string" | "text" | "boolean" | "json" | "timestamp" | "file";
  note: string;
  default?: unknown;
  interface?: string;
  options?: Record<string, unknown>;
}

const str = (field: string, note: string): FieldDef => ({ field, type: "string", note });
const bool = (field: string, note: string): FieldDef => ({
  field,
  type: "boolean",
  note,
  default: false,
  interface: "boolean",
});
const file = (field: string, note: string): FieldDef => ({ field, type: "file", note });
const json = (field: string, note: string): FieldDef => ({
  field,
  type: "json",
  note,
  interface: "input-code",
  options: { language: "JSON" },
});

export { LEAD_STATUS_OPTIONS as LEAD_STATUSES } from "@/lib/admin/lead-status";

export const SCHEMA: Record<string, FieldDef[]> = {
  globals: [
    str("gtm_id", "Google Tag Manager — GTM-XXXXXXX"),
    str("ga4_id", "GA4 בטעינה ישירה — G-XXXXXXXXXX"),
    str("google_ads_id", "Google Ads — AW-XXXXXXXXX"),
    str("google_ads_lead_label", "תווית המרת ליד ב-Google Ads"),
    str("meta_pixel_id", "Meta Pixel ID"),
    str("tiktok_pixel_id", "TikTok Pixel ID"),
    str("linkedin_partner_id", "LinkedIn Partner ID"),
    str("linkedin_lead_conversion_id", "LinkedIn Conversion ID"),
    str("clarity_id", "Microsoft Clarity Project ID"),
    bool("consent_required", "באנר עוגיות + Consent Mode במצב denied עד אישור"),
    bool("enhanced_conversions", "טלפון/מייל מגובבים באירוע הליד"),
    str("google_site_verification", "Search Console — ערך תג האימות"),
    str("bing_site_verification", "Bing Webmaster — ערך תג האימות"),
    str("facebook_domain_verification", "Meta — ערך אימות הדומיין"),
    str("phone", "טלפון ראשי של האתר"),
    str("whatsapp_number", "מספר וואטסאפ"),
    str("email", "דוא״ל ליצירת קשר"),
    json("socials", "פרופילים ברשתות — {facebook, instagram, ...}"),
    json("branches", "סניפים — נערך בלוח הבקרה"),
    json("opening_hours", "שעות פעילות — נערך בלוח הבקרה"),
  ],
  leads: [
    {
      field: "status",
      type: "string",
      note: "סטטוס טיפול",
      default: "new",
      interface: "select-dropdown",
      options: { choices: LEAD_STATUS_OPTIONS.map((s) => ({ value: s.value, text: s.label })) },
    },
    { field: "notes", type: "text", note: "הערות פנימיות", interface: "input-multiline" },
    json("attribution", "מקור הליד — נכתב אוטומטית מהאתר (UTM, gclid/fbclid, עוגיות פיקסלים)"),
  ],
  // שדות תוכן שהאתר כבר יודע להציג, אבל לא הוגדרו ב-CMS עד עכשיו:
  faqs: [str("group", "קבוצה בעמוד השאלות: start / process / cost / rights / tax")],
  articles: [
    json("keyPoints", "בשורה התחתונה — 2–4 עובדות בראש הכתבה"),
    str("image_alt", "תיאור התמונה לקוראי מסך"),
    { field: "updatedAt", type: "timestamp", note: "עודכן לאחרונה (נקבע אוטומטית מהלוח)", interface: "datetime" },
  ],
  testimonials: [str("image_alt", "תיאור התמונה לקוראי מסך")],
  doctors: [str("image_alt", "תיאור התמונה לקוראי מסך")],
  team_members: [str("image_alt", "תיאור התמונה לקוראי מסך")],
  institutions: [file("image_file", "צילום רחב בכותרת העמוד"), str("image_alt", "תיאור התמונה")],
  services: [file("image_file", "צילום רחב בכותרת העמוד"), str("image_alt", "תיאור התמונה")],
};

/** collections התוכן שהעורך מנהל מהלוח. */
export const CONTENT_COLLECTIONS = [
  "articles",
  "faqs",
  "testimonials",
  "doctors",
  "team_members",
  "institutions",
  "services",
];

const EDITOR_POLICY = "עורך אתר — לוח בקרה";

class DirectusError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function api(token: string) {
  return async <T = unknown>(method: string, path: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${directusUrl()}${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const text = await res.text();
    const parsed = text ? JSON.parse(text) : {};
    if (!res.ok) {
      throw new DirectusError(parsed?.errors?.[0]?.message ?? `${res.status} ${path}`, res.status);
    }
    return parsed.data as T;
  };
}

/** שדות שחסרים ב-CMS. רשימה ריקה = המבנה מעודכן. */
export async function missingFields(token: string) {
  const call = api(token);
  const missing: string[] = [];
  for (const [collection, defs] of Object.entries(SCHEMA)) {
    let existing: string[] = [];
    try {
      existing = (await call<{ field: string }[]>("GET", `/fields/${collection}`)).map((f) => f.field);
    } catch {
      existing = [];
    }
    for (const d of defs) if (!existing.includes(d.field)) missing.push(`${collection}.${d.field}`);
  }
  return missing;
}

/** מריץ את העדכון. מחזיר יומן קצר של מה שנעשה. דורש משתמש admin. */
export async function runMigration(token: string) {
  const call = api(token);
  const log: string[] = [];

  for (const [collection, defs] of Object.entries(SCHEMA)) {
    const existing = (await call<{ field: string }[]>("GET", `/fields/${collection}`)).map(
      (f) => f.field,
    );
    for (const d of defs) {
      if (existing.includes(d.field)) continue;
      if (d.type === "file") {
        // קובץ = uuid + relation ל-directus_files (כמו ש-Directus עצמו יוצר).
        await call("POST", `/fields/${collection}`, {
          field: d.field,
          type: "uuid",
          meta: { interface: "file-image", special: ["file"], note: d.note },
          schema: {},
        });
        await call("POST", "/relations", {
          collection,
          field: d.field,
          related_collection: "directus_files",
          schema: { on_delete: "SET NULL" },
        }).catch(() => undefined);
      } else {
        await call("POST", `/fields/${collection}`, {
          field: d.field,
          type: d.type,
          meta: { interface: d.interface ?? "input", note: d.note, options: d.options ?? null },
          schema: d.default !== undefined ? { default_value: d.default } : {},
        });
      }
      log.push(`נוסף שדה ${collection}.${d.field}`);
    }
  }

  // policy ל"עורך אתר": תוכן מלא, globals, לידים (קריאה + סטטוס/הערות), העלאת קבצים.
  const policies = await call<{ id: string; name: string }[]>(
    "GET",
    "/policies?fields=id,name&limit=-1",
  );
  let policy = policies.find((p) => p.name === EDITOR_POLICY);
  if (!policy) {
    policy = await call<{ id: string; name: string }>("POST", "/policies", {
      name: EDITOR_POLICY,
      icon: "edit",
      admin_access: false,
      app_access: true,
      description: "הרשאות למשתמשי לוח הבקרה של האתר (/admin)",
    });
    log.push(`נוצר policy "${EDITOR_POLICY}"`);
  }
  const perms: { collection: string; action: string; fields: string[] }[] = [
    ...CONTENT_COLLECTIONS.flatMap((collection) =>
      ["create", "read", "update", "delete"].map((action) => ({ collection, action, fields: ["*"] })),
    ),
    { collection: "globals", action: "read", fields: ["*"] },
    { collection: "globals", action: "update", fields: ["*"] },
    { collection: "leads", action: "read", fields: ["*"] },
    { collection: "leads", action: "update", fields: ["status", "notes"] },
    { collection: "directus_files", action: "create", fields: ["*"] },
    { collection: "directus_files", action: "read", fields: ["*"] },
    { collection: "directus_files", action: "update", fields: ["*"] },
  ];
  const existingPerms = await call<{ collection: string; action: string }[]>(
    "GET",
    `/permissions?filter[policy][_eq]=${policy.id}&fields=collection,action&limit=-1`,
  );
  for (const p of perms) {
    if (existingPerms.some((e) => e.collection === p.collection && e.action === p.action)) continue;
    await call("POST", "/permissions", { policy: policy.id, ...p });
  }

  // האתר שולח attribution עם כל ליד — ההרשאה הציבורית ליצירת לידים צריכה לכלול אותו.
  const leadCreate = await call<{ id: string; fields: string[] | null }[]>(
    "GET",
    "/permissions?filter[collection][_eq]=leads&filter[action][_eq]=create&fields=id,fields&limit=-1",
  );
  for (const p of leadCreate) {
    const f = p.fields ?? [];
    if (f.includes("*") || f.includes("attribution")) continue;
    await call("PATCH", `/permissions/${p.id}`, { fields: [...f, "attribution"] });
    log.push("הרשאת יצירת לידים הורחבה לשדה attribution");
  }

  // role עם ה-policy — אליו משייכים את משתמשי הלקוח.
  const roles = await call<{ id: string; name: string }[]>("GET", "/roles?fields=id,name&limit=-1");
  let role = roles.find((r) => r.name === "עורך אתר");
  if (!role) {
    role = await call<{ id: string; name: string }>("POST", "/roles", {
      name: "עורך אתר",
      icon: "edit",
      description: "משתמשי לוח הבקרה של האתר",
    });
    log.push('נוצר role "עורך אתר"');
  }
  const access = await call<{ id: string }[]>(
    "GET",
    `/access?filter[role][_eq]=${role.id}&filter[policy][_eq]=${policy.id}&limit=1`,
  );
  if (!access.length) await call("POST", "/access", { role: role.id, policy: policy.id });

  if (!log.length) log.push("המבנה כבר מעודכן — לא נדרש שינוי");
  return { log, editorRoleId: role.id };
}

/** יצירת משתמש לוח בקרה (role "עורך אתר"). דורש admin. */
export async function createEditorUser(
  token: string,
  user: { email: string; password: string; first_name: string },
) {
  const call = api(token);
  const roles = await call<{ id: string; name: string }[]>("GET", "/roles?fields=id,name&limit=-1");
  const role = roles.find((r) => r.name === "עורך אתר");
  if (!role) throw new DirectusError("יש להריץ קודם את עדכון המבנה", 400);
  await call("POST", "/users", { ...user, role: role.id, status: "active" });
}

export { DirectusError };
