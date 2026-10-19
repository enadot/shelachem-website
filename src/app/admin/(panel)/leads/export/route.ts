import { requireSession } from "@/lib/admin/session";
import { searchLeads, type BaramLead } from "@/lib/baram-api";
import { formOf, searchFrom, sourceOf, topicOf } from "@/lib/admin/leads";
import { formatDate } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/globals";

/** ה-API מחזיר עד 100 לידים לבקשה; מעבר ל-5,000 מבקשים לצמצם את הסינון. */
const API_PAGE = 100;
const MAX_ROWS = 5000;

const fail = (message: string, status = 400) =>
  new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

/** ייצוא CSV לפי הסינון הנוכחי. BOM בתחילת הקובץ — כדי שאקסל יזהה עברית (UTF-8). */
export async function GET(request: Request) {
  await requireSession();
  const search = searchFrom(Object.fromEntries(new URL(request.url).searchParams));
  let leads: BaramLead[];
  try {
    const first = await searchLeads({ ...search, page: 1, pageSize: API_PAGE });
    if (first.total > MAX_ROWS) {
      return fail(`נמצאו ${first.total.toLocaleString("he-IL")} לידים — אפשר לייצא עד ${MAX_ROWS.toLocaleString("he-IL")} בבת אחת. נא לצמצם את טווח התאריכים.`);
    }
    leads = [...first.leads];
    const pages = Math.ceil(first.total / API_PAGE);
    // כמה עמודים במקביל — מהר, בלי להציף את ה-API.
    for (let p = 2; p <= pages; p += 5) {
      const batch = await Promise.all(
        Array.from({ length: Math.min(5, pages - p + 1) }, (_, i) => searchLeads({ ...search, page: p + i, pageSize: API_PAGE })),
      );
      for (const r of batch) leads.push(...r.leads);
    }
  } catch (err) {
    return fail(`הייצוא נכשל: ${errorMessage(err)}`, 502);
  }

  const header = [
    "מזהה", "תאריך", "שם", "טלפון", "דוא״ל", "נושא", "טופס", "ערוץ", "משוב", "מקור",
    "utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid", "דיוור שיווקי",
  ];
  const rows = leads.map((l) => [
    l.id,
    formatDate(l.createdAt),
    l.name,
    l.phone ?? "",
    l.email ?? "",
    topicOf(l) ?? "",
    formOf(l) ?? "",
    l.channel?.name ?? "",
    l.feedback?.name ?? "",
    sourceOf(l),
    l.utm?.source ?? "",
    l.utm?.medium ?? "",
    l.utm?.campaign ?? "",
    l.gclid ?? "",
    l.fbclid ?? "",
    l.marketingConsent ? "כן" : "לא",
  ]);

  // ציטוט כל תא; תא שמתחיל ב-=+-@ מקבל גרש — מונע הזרקת נוסחאות באקסל.
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  const csv = "﻿" + [header, ...rows].map((r) => r.map((v) => cell(String(v))).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
