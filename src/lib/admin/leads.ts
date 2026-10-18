import "server-only";
import { aggregate, readItem, readItems } from "@directus/sdk";
import type { AdminClient } from "@/lib/admin/session";
import { LEAD_STATUSES } from "@/lib/admin/migrate";
import type { Attribution } from "@/lib/attribution";

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  topic: string | null;
  source_page: string | null;
  marketing_consent: boolean | null;
  submitted_at: string | null;
  status: string | null;
  notes: string | null;
  attribution: (Attribution & { event_id?: string; page?: string }) | null;
}

export interface LeadFilters {
  q?: string;
  status?: string;
  source?: string;
  from?: string;
  to?: string;
  page?: number;
}

export const PAGE_SIZE = 25;
export const statusLabel = (v: string | null) =>
  LEAD_STATUSES.find((s) => s.value === (v || "new"))?.label ?? "חדש";

/** מסנן Directus מתוך פרמטרי ה-URL של הטבלה. */
export function buildFilter(f: LeadFilters) {
  const and: Record<string, unknown>[] = [];
  if (f.status === "new") and.push({ _or: [{ status: { _eq: "new" } }, { status: { _null: true } }] });
  else if (f.status) and.push({ status: { _eq: f.status } });
  if (f.source) and.push({ source_page: { _icontains: f.source } });
  if (f.from) and.push({ submitted_at: { _gte: `${f.from}T00:00:00` } });
  if (f.to) and.push({ submitted_at: { _lte: `${f.to}T23:59:59` } });
  return and.length ? { _and: and } : {};
}

/**
 * כל השדות שהאתר שומר. `status`/`notes`/`attribution` מתווספים בעדכון המבנה —
 * לפניו מבקשים "*" כדי לא להיכשל על שדה שלא קיים.
 */
const FIELDS = ["*"];

export async function listLeads(client: AdminClient, f: LeadFilters) {
  const filter = buildFilter(f);
  const page = Math.max(1, f.page ?? 1);
  const query = {
    fields: FIELDS,
    filter,
    sort: ["-submitted_at"],
    limit: PAGE_SIZE,
    page,
    ...(f.q ? { search: f.q } : {}),
  };
  const [rows, count] = await Promise.all([
    client.request(readItems("leads" as never, query as never)),
    client.request(
      aggregate("leads" as never, {
        aggregate: { count: "*" },
        query: { filter, ...(f.q ? { search: f.q } : {}) },
      } as never),
    ),
  ]);
  const total = Number((count as { count: number | string }[])[0]?.count ?? 0);
  return { leads: rows as unknown as Lead[], total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** לייצוא — כל השורות לפי הסינון (בלי דפדוף). */
export async function allLeads(client: AdminClient, f: LeadFilters) {
  return (await client.request(
    readItems("leads" as never, {
      fields: FIELDS,
      filter: buildFilter(f),
      sort: ["-submitted_at"],
      limit: -1,
      ...(f.q ? { search: f.q } : {}),
    } as never),
  )) as unknown as Lead[];
}

export async function getLead(client: AdminClient, id: string) {
  return (await client.request(readItem("leads" as never, id, { fields: FIELDS } as never))) as unknown as Lead;
}

/** ספירה לסקירה: היום / 7 ימים / 30 ימים + כמה עדיין "חדש". */
export async function leadStats(client: AdminClient) {
  const since = (days: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };
  const count = async (filter: Record<string, unknown>) => {
    const r = (await client.request(
      aggregate("leads" as never, { aggregate: { count: "*" }, query: { filter } } as never),
    )) as { count: number | string }[];
    return Number(r[0]?.count ?? 0);
  };
  const [today, week, month, open] = await Promise.all([
    count({ submitted_at: { _gte: since(0) } }),
    count({ submitted_at: { _gte: since(6) } }),
    count({ submitted_at: { _gte: since(29) } }),
    count({ _or: [{ status: { _eq: "new" } }, { status: { _null: true } }] }).catch(() => null),
  ]);
  return { today, week, month, open };
}

/** מקור קריא: utm_source / referrer / ישיר. */
export function sourceOf(lead: Lead) {
  const params = lead.attribution?.last?.params ?? lead.attribution?.first?.params;
  if (params?.utm_source) {
    return [params.utm_source, params.utm_medium, params.utm_campaign].filter(Boolean).join(" · ");
  }
  if (params?.gclid || params?.gbraid || params?.wbraid) return "Google Ads";
  if (params?.fbclid) return "Meta";
  const ref = lead.attribution?.last?.referrer ?? lead.attribution?.first?.referrer;
  if (ref) {
    try {
      return new URL(ref).host.replace(/^www\./, "");
    } catch {
      return ref;
    }
  }
  const utm = lead.source_page?.split("|")[1];
  if (utm) return new URLSearchParams(utm).get("utm_source") ?? "קמפיין";
  return lead.attribution ? "ישיר" : "—";
}

export const formPlace = (lead: Lead) => lead.source_page?.split("|")[0] ?? "—";
