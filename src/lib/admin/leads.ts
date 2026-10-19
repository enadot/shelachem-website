import type { BaramFeedback, BaramLead, BaramSetup, LeadSearch } from "@/lib/baram-api";

/** הלידים בלוח מגיעים מ-BARAM Leads (src/lib/baram-api.ts); כאן רק עזרי תצוגה וסינון. */

export const PAGE_SIZE = 25;

type Search = Record<string, string | undefined>;

/** פרמטרי ה-URL של מסך הלידים → חיפוש ב-API. */
export function searchFrom(sp: Search): LeadSearch {
  const day = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
  const id = (v?: string) => (v && /^\d+$/.test(v) ? v : undefined);
  return {
    q: sp.q?.trim().slice(0, 100) || undefined,
    feedback: sp.feedback === "none" ? "none" : id(sp.feedback),
    channel: id(sp.channel),
    utmSource: sp.source?.trim().slice(0, 200) || undefined,
    from: day(sp.from),
    to: day(sp.to),
    page: Math.min(10_000, Math.max(1, Number(sp.page) || 1)),
  };
}

/** החיפוש בחזרה לפרמטרי URL (לקישורי דפדוף וייצוא). */
export function searchQuery(s: LeadSearch, extra: Record<string, string | number> = {}) {
  const p = new URLSearchParams();
  const map: Record<string, unknown> = {
    q: s.q,
    feedback: s.feedback,
    channel: s.channel,
    source: s.utmSource,
    from: s.from,
    to: s.to,
    page: s.page && s.page > 1 ? s.page : undefined,
    ...extra,
  };
  for (const [k, v] of Object.entries(map)) if (v) p.set(k, String(v));
  return p.toString();
}

/** האתר שולח את הנושא והטופס בהערות הליד ("נושא: …\nטופס: …"). */
function noteLine(lead: BaramLead, label: string) {
  const line = lead.notes?.split("\n").find((l) => l.startsWith(`${label}:`));
  return line ? line.slice(label.length + 1).trim() : null;
}
export const topicOf = (lead: BaramLead) =>
  noteLine(lead, "נושא") ?? (typeof lead.fields?.topic === "string" ? lead.fields.topic : null);
export const formOf = (lead: BaramLead) => noteLine(lead, "טופס");

/** מקור קריא: utm_source · medium · campaign / Google Ads / Meta / referrer. */
export function sourceOf(lead: BaramLead) {
  const u = lead.utm;
  if (u?.source) return [u.source, u.medium, u.campaign].filter(Boolean).join(" · ");
  if (lead.gclid) return "Google Ads";
  if (lead.fbclid) return "Meta";
  if (lead.referrer) {
    try {
      return new URL(lead.referrer).host.replace(/^www\./, "");
    } catch {
      return lead.referrer;
    }
  }
  return "—";
}

/** סטטוסי משוב שאפשר לבחור (בלי ארכיון), לפי הסדר של BARAM. */
export const activeFeedbacks = (setup: BaramSetup | null): BaramFeedback[] =>
  setup?.feedbacks.filter((f) => !f.archived) ?? [];

/** ערוצים פעילים קודם, אחר כך הישנים — לבחירה במסנן. */
export function channelsOf(setup: BaramSetup | null) {
  const all = setup?.campaigns.flatMap((c) => c.channels) ?? [];
  return [...all.filter((c) => c.active), ...all.filter((c) => !c.active)];
}

export const SYSTEM_STATUS: Record<BaramLead["status"], string | null> = {
  new: null,
  invalid_details: "פרטים לא תקינים",
  duplicate: "כפול",
  spam: "ספאם",
  test: "בדיקה",
};
