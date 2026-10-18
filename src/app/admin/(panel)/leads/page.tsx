import Link from "next/link";
import { requireSession } from "@/lib/admin/session";
import { formPlace, listLeads, sourceOf, type LeadFilters } from "@/lib/admin/leads";
import { LEAD_STATUS_OPTIONS } from "@/lib/admin/lead-status";
import { formatDate } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/globals";
import { EmptyState, PageTitle } from "@/components/admin/ui";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";

export const metadata = { title: "לידים" };

type Search = Record<string, string | undefined>;

const filtersFrom = (sp: Search): LeadFilters => ({
  q: sp.q?.trim() || undefined,
  status: sp.status || undefined,
  source: sp.source?.trim() || undefined,
  from: sp.from || undefined,
  to: sp.to || undefined,
  page: Number(sp.page) || 1,
});

const qs = (f: LeadFilters, extra: Record<string, string | number> = {}) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...extra })) if (v) p.set(k, String(v));
  return p.toString();
};

const selectClass =
  "min-h-[50px] w-full cursor-pointer rounded-[10px] border-[1.5px] border-hairline bg-field px-3 text-[16px] text-ink focus:border-brand focus:bg-white";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { client } = await requireSession();
  const filters = filtersFrom(await searchParams);
  let result: Awaited<ReturnType<typeof listLeads>> | null = null;
  let error: string | null = null;
  try {
    result = await listLeads(client, filters);
  } catch (err) {
    error = errorMessage(err);
  }
  const { page: _page, ...withoutPage } = filters;

  return (
    <>
      <PageTitle
        title="לידים"
        strong={result ? `(${result.total.toLocaleString("he-IL")})` : undefined}
        description="כל הפניות מהאתר, מהחדשה לישנה. לחיצה על שם פותחת את פרטי הליד ומקור ההגעה המלא."
        actions={
          <a
            href={`/admin/leads/export?${qs(withoutPage)}`}
            className={buttonVariants({ variant: "outline-accent", size: "sm" })}
          >
            ייצוא לאקסל (CSV)
          </a>
        }
      />

      <form
        method="get"
        className="mb-6 grid gap-3 rounded-card border border-hairline bg-white p-4 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-end"
      >
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          חיפוש
          <Input name="q" defaultValue={filters.q} placeholder="שם, טלפון, נושא…" />
        </label>
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          סטטוס
          <select name="status" defaultValue={filters.status ?? ""} className={selectClass}>
            <option value="">הכול</option>
            {LEAD_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          מקור / קמפיין
          <Input name="source" defaultValue={filters.source} placeholder="google, facebook…" />
        </label>
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          מתאריך
          <Input type="date" name="from" defaultValue={filters.from} />
        </label>
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          עד תאריך
          <Input type="date" name="to" defaultValue={filters.to} />
        </label>
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="min-h-[50px]">
            סינון
          </Button>
          <Link href="/admin/leads" className={buttonVariants({ variant: "ghost", size: "sm", className: "min-h-[50px]" })}>
            ניקוי
          </Link>
        </div>
      </form>

      {error && (
        <p role="alert" className="mb-6 rounded-[10px] bg-[#fbe6e6] px-4 py-3 text-danger">
          לא ניתן לטעון את הלידים: {error}
        </p>
      )}

      {result && result.leads.length === 0 && (
        <EmptyState title="אין לידים שמתאימים לסינון">נסו להרחיב את טווח התאריכים או לנקות את החיפוש.</EmptyState>
      )}

      {result && result.leads.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-hairline bg-white">
          <table className="w-full min-w-[860px] border-collapse text-start text-[15px]">
            <thead>
              <tr className="border-b border-hairline bg-surface text-[13px] text-ink-muted">
                {["תאריך", "שם", "טלפון", "נושא", "מקור", "טופס", "סטטוס"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-start font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.leads.map((l) => (
                <tr key={l.id} className="border-b border-hairline-soft last:border-none hover:bg-surface/60">
                  <td className="tnum whitespace-nowrap px-4 py-3 text-ink-muted">{formatDate(l.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${l.id}`} className="font-bold text-ink no-underline hover:text-brand">
                      {l.full_name}
                    </Link>
                  </td>
                  <td className="tnum whitespace-nowrap px-4 py-3" dir="ltr">
                    <a href={`tel:${l.phone}`} className="text-ink no-underline hover:text-brand">
                      {l.phone}
                    </a>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink-secondary">{l.topic || "—"}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink-secondary">{sourceOf(l)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13.5px] text-ink-muted">{formPlace(l)}</td>
                  <td className="px-4 py-2">
                    <LeadStatusSelect id={l.id} status={l.status} label={`סטטוס — ${l.full_name}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && result.pages > 1 && (
        <nav aria-label="דפדוף" className="mt-6 flex items-center justify-center gap-3 text-[15px]">
          {result.page > 1 && (
            <Link href={`/admin/leads?${qs(filters, { page: result.page - 1 })}`} className="font-bold text-brand no-underline">
              → הקודם
            </Link>
          )}
          <span className="tnum text-ink-muted">
            עמוד {result.page} מתוך {result.pages}
          </span>
          {result.page < result.pages && (
            <Link href={`/admin/leads?${qs(filters, { page: result.page + 1 })}`} className="font-bold text-brand no-underline">
              הבא ←
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
