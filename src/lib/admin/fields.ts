/**
 * שפת ההגדרה של טפסי הלוח: כל מסך עריכה (הגדרות אתר, כתבה, שירות…) מתואר
 * כרשימת שדות, ורכיב אחד (`EntityForm`) מרנדר אותו. שדות JSON מורכבים ב-CMS
 * (גוף כתבה, סניפים, שלבים) מקבלים עורך ידידותי — לא JSON גולמי.
 *
 * הקובץ טהור (בלי React/רשת) — משמש גם את הטופס בדפדפן וגם את הבדיקה בשרת.
 */
import { asBool } from "@/lib/marketing";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "checkboxes"
  | "date"
  | "image"
  | "string-list"
  | "repeater"
  | "group";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  /** שדה טכני (מזהה, URL, טלפון) — נכתב משמאל לימין. */
  ltr?: boolean;
  /** חצי רוחב בשורה בדסקטופ. */
  half?: boolean;
  options?: readonly { value: string; label: string }[];
  /** repeater / group: השדות של כל פריט. */
  fields?: FieldConfig[];
  /** repeater: איזה תת-שדה מציג את כותרת הפריט בכיווץ. */
  itemTitle?: string;
  /** repeater / string-list: שם פריט בודד ("סניף", "פסקה") לכפתור ההוספה. */
  itemLabel?: string;
  /** image: שדה הטקסט הישן (נתיב סטטי) — לתצוגה כשעוד לא הועלתה תמונה. */
  legacyField?: string;
  maxLength?: number;
  /** textarea: מספר שורות. */
  rows?: number;
  /** pattern לבדיקה + הודעה. */
  pattern?: { re: RegExp; message: string };
}

export type Values = Record<string, unknown>;

/** ערך התחלתי לפריט חדש ב-repeater / לטופס חדש. */
export function emptyValue(f: FieldConfig): unknown {
  switch (f.type) {
    case "boolean":
      return false;
    case "number":
      return null;
    case "string-list":
    case "repeater":
    case "checkboxes":
      return [];
    case "group":
      return Object.fromEntries((f.fields ?? []).map((sf) => [sf.name, emptyValue(sf)]));
    default:
      return "";
  }
}

export const emptyEntity = (fields: FieldConfig[]): Values =>
  Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));

/** ערך מה-CMS → צורה שהטופס עובד איתה (null → ריק, JSON חלקי → מלא). */
export function normalize(f: FieldConfig, v: unknown): unknown {
  switch (f.type) {
    case "boolean":
      return asBool(v);
    case "number":
      return typeof v === "number" ? v : v === "" || v == null ? null : Number(v);
    case "string-list":
    case "checkboxes":
      return Array.isArray(v) ? v.map((x) => String(x ?? "")) : [];
    case "repeater":
      // מפתחות שאינם בהגדרה (למשל id פנימי של פריט) נשמרים כמו שהם.
      return Array.isArray(v)
        ? v.map((item) => ({ ...(item as Values), ...normalizeEntity(f.fields ?? [], item as Values) }))
        : [];
    case "group":
      return normalizeEntity(f.fields ?? [], (v ?? {}) as Values);
    case "date":
      return typeof v === "string" ? v.slice(0, 10) : "";
    default:
      return v == null ? "" : String(v);
  }
}

export function normalizeEntity(fields: FieldConfig[], row: Values | null | undefined): Values {
  const out: Values = {};
  for (const f of fields) out[f.name] = normalize(f, row?.[f.name]);
  return out;
}

/** ערך מהטופס → מה שנשמר ב-CMS (ריק → null, רשימות בלי שורות ריקות). */
export function serialize(f: FieldConfig, v: unknown): unknown {
  switch (f.type) {
    case "boolean":
      return v === true;
    case "number":
      return v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v);
    case "string-list":
      return Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
    case "checkboxes":
      return Array.isArray(v) ? v : [];
    case "repeater":
      return Array.isArray(v)
        ? v.map((item) => ({ ...(item as Values), ...serializeEntity(f.fields ?? [], item as Values) }))
        : [];
    case "group":
      return serializeEntity(f.fields ?? [], (v ?? {}) as Values);
    case "image":
      return typeof v === "string" && v ? v : null;
    case "date":
      return typeof v === "string" && v ? `${v}T00:00:00` : null;
    default: {
      const s = typeof v === "string" ? v.trim() : "";
      return s || null;
    }
  }
}

export function serializeEntity(fields: FieldConfig[], values: Values): Values {
  const out: Values = {};
  for (const f of fields) out[f.name] = serialize(f, values?.[f.name]);
  return out;
}

const isEmpty = (v: unknown) =>
  v == null || v === "" || (Array.isArray(v) && v.length === 0);

/**
 * בדיקה — אותה פונקציה בדפדפן ובשרת. מחזירה מפה של נתיב שדה → הודעה,
 * למשל `branches.1.city`.
 */
export function validate(fields: FieldConfig[], values: Values, prefix = ""): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = values?.[f.name];
    const path = prefix + f.name;
    if (f.required && isEmpty(v)) {
      errors[path] = "שדה חובה";
      continue;
    }
    if (typeof v === "string" && v) {
      if (f.maxLength && v.length > f.maxLength) errors[path] = `עד ${f.maxLength} תווים`;
      else if (f.pattern && !f.pattern.re.test(v.trim())) errors[path] = f.pattern.message;
    }
    if (f.type === "repeater" && Array.isArray(v)) {
      v.forEach((item, i) =>
        Object.assign(errors, validate(f.fields ?? [], item as Values, `${path}.${i}.`)),
      );
    }
    if (f.type === "group" && v) Object.assign(errors, validate(f.fields ?? [], v as Values, `${path}.`));
  }
  return errors;
}

export const PATTERNS = {
  url: { re: /^https?:\/\/\S+$/, message: "כתובת מלאה, שמתחילה ב-https://" },
  phone: { re: /^[+\d][\d\s-]{6,18}$/, message: "מספר טלפון לא תקין" },
  email: { re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "כתובת דוא״ל לא תקינה" },
  slug: {
    re: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    message: "אותיות אנגליות קטנות, ספרות ומקפים בלבד (למשל: tax-refund)",
  },
  time: { re: /^([01]\d|2[0-3]):[0-5]\d$/, message: "שעה בפורמט 09:00" },
};
