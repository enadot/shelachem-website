import { requireSession } from "@/lib/admin/session";
import { allLeads, formPlace, sourceOf, statusLabel } from "@/lib/admin/leads";
import { formatDate } from "@/lib/admin/format";

/** ייצוא CSV לפי הסינון הנוכחי. BOM בתחילת הקובץ — כדי שאקסל יזהה עברית (UTF-8). */
export async function GET(request: Request) {
  const { client } = await requireSession();
  const sp = new URL(request.url).searchParams;
  let leads: Awaited<ReturnType<typeof allLeads>>;
  try {
    leads = await allLeads(client, {
      q: sp.get("q") || undefined,
      status: sp.get("status") || undefined,
      source: sp.get("source") || undefined,
      from: sp.get("from") || undefined,
      to: sp.get("to") || undefined,
    });
  } catch {
    // טוקן שנדחה ע״י Directus (פג/בוטל) — חזרה להתחברות במקום שגיאת שרת.
    return Response.redirect(new URL("/admin/login?expired=1", request.url), 303);
  }

  const params = (l: (typeof leads)[number]) => l.attribution?.last?.params ?? {};
  const header = [
    "תאריך", "שם", "טלפון", "דוא״ל", "נושא", "סטטוס", "הערות", "מקור", "טופס",
    "utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid", "דיוור שיווקי",
  ];
  const rows = leads.map((l) => [
    formatDate(l.submitted_at),
    l.full_name,
    l.phone,
    l.email ?? "",
    l.topic ?? "",
    statusLabel(l.status),
    l.notes ?? "",
    sourceOf(l),
    formPlace(l),
    params(l).utm_source ?? "",
    params(l).utm_medium ?? "",
    params(l).utm_campaign ?? "",
    params(l).gclid ?? "",
    params(l).fbclid ?? "",
    l.marketing_consent ? "כן" : "לא",
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
