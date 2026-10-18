import Link from "next/link";
import { requireSession } from "@/lib/admin/session";
import { clientSetup, searchLeads, type LeadPage } from "@/lib/baram-api";
import {
  PAGE_SIZE,
  SYSTEM_STATUS,
  activeFeedbacks,
  channelsOf,
  searchFrom,
  searchQuery,
  sourceOf,
  topicOf,
} from "@/lib/admin/leads";
import { formatDate } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/globals";
import { Badge, EmptyState, PageTitle } from "@/components/admin/ui";
import { FeedbackSelect } from "@/components/admin/lead-feedback";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";

export const metadata = { title: "לידים" };

const selectClass =
  "min-h-[50px] w-full cursor-pointer rounded-[10px] border-[1.5px] border-hairline bg-field px-3 text-[16px] text-ink focus:border-brand focus:bg-white";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSession();
  const search = searchFrom(await searchParams);
  const [result, setup] = await Promise.all([
    searchLeads({ ...search, pageSize: PAGE_SIZE }).then(
      (r): LeadPage | { error: string } => r,
      (err) => ({ error: errorMessage(err) }),
    ),
    clientSetup().catch(() => null),
  ]);
  const ok = "leads" in result ? result : null;
  const feedbacks = activeFeedbacks(setup).map(({ id, name, action }) => ({ id, name, action }));
  const pages = ok ? Math.max(1, Math.ceil(ok.total / PAGE_SIZE)) : 1;
  const page = search.page ?? 1;

  return (
    <>
      <PageTitle
        title="לידים"
        strong={ok ? `(${ok.total.toLocaleString("he-IL")})` : undefined}
        description="כל הפניות של שלכם מ-BARAM Leads, מהחדשה לישנה. המשוב וההערות נשמרים שם ישירות."
        actions={
          <>
            <a
              href={`/admin/leads/export?${searchQuery({ ...search, page: 1 })}`}
              className={buttonVariants({ variant: "outline-accent", size: "sm" })}
            >
              ייצוא לאקסל (CSV)
            </a>
            <a
              href="https://leads.baram.digital/leads"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              פתיחה ב-BARAM Leads ↗
            </a>
          </>
        }
      />

      <form
        method="get"
        className="mb-6 grid gap-3 rounded-card border border-hairline bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          חיפוש
          <Input name="q" defaultValue={search.q} placeholder="שם, טלפון, דוא״ל, הערות…" />
        </label>
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          משוב
          <select name="feedback" defaultValue={search.feedback ?? ""} className={selectClass}>
            <option value="">הכול</option>
            <option value="none">ללא משוב</option>
            {feedbacks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          ערוץ
          <select name="channel" defaultValue={search.channel ?? ""} className={selectClass}>
            <option value="">הכול</option>
            {channelsOf(setup).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          utm_source
          <Input name="source" defaultValue={search.utmSource} placeholder="google, facebook…" dir="ltr" />
        </label>
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          מתאריך
          <Input type="date" name="from" defaultValue={search.from} />
        </label>
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          עד תאריך
          <Input type="date" name="to" defaultValue={search.to} />
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

      {"error" in result && (
        <p role="alert" className="mb-6 rounded-[10px] bg-[#fbe6e6] px-4 py-3 text-danger">
          לא ניתן לטעון את הלידים: {result.error}
        </p>
      )}

      {ok && ok.leads.length === 0 && (
        <EmptyState title="אין לידים שמתאימים לסינון">נסו להרחיב את טווח התאריכים או לנקות את החיפוש.</EmptyState>
      )}

      {ok && ok.leads.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-hairline bg-white">
          <table className="w-full min-w-[900px] border-collapse text-start text-[15px]">
            <thead>
              <tr className="border-b border-hairline bg-surface text-[13px] text-ink-muted">
                {["תאריך", "שם", "טלפון", "נושא", "ערוץ", "מקור", "משוב"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-start font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ok.leads.map((l) => (
                <tr key={l.id} className="border-b border-hairline-soft last:border-none hover:bg-surface/60">
                  <td className="tnum whitespace-nowrap px-4 py-3 text-ink-muted">{formatDate(l.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${l.id}`} className="font-bold text-ink no-underline hover:text-brand">
                      {l.name || "ללא שם"}
                    </Link>
                    {SYSTEM_STATUS[l.status] && (
                      <Badge tone="muted" className="ms-2">
                        {SYSTEM_STATUS[l.status]}
                      </Badge>
                    )}
                  </td>
                  <td className="tnum whitespace-nowrap px-4 py-3" dir="ltr">
                    {l.phone ? (
                      <a href={`tel:${l.phone}`} className="text-ink no-underline hover:text-brand">
                        {l.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink-secondary">{topicOf(l) || "—"}</td>
                  <td className="max-w-[160px] truncate whitespace-nowrap px-4 py-3 text-[13.5px] text-ink-muted">
                    {l.channel?.name ?? "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink-secondary">{sourceOf(l)}</td>
                  <td className="px-4 py-2">
                    <FeedbackSelect
                      id={l.id}
                      value={l.feedback?.id ?? null}
                      options={feedbacks}
                      label={`משוב — ${l.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ok && pages > 1 && (
        <nav aria-label="דפדוף" className="mt-6 flex items-center justify-center gap-3 text-[15px]">
          {page > 1 && (
            <Link href={`/admin/leads?${searchQuery({ ...search, page: page - 1 })}`} className="font-bold text-brand no-underline">
              → הקודם
            </Link>
          )}
          <span className="tnum text-ink-muted">
            עמוד {page} מתוך {pages.toLocaleString("he-IL")}
          </span>
          {ok.hasMore && (
            <Link href={`/admin/leads?${searchQuery({ ...search, page: page + 1 })}`} className="font-bold text-brand no-underline">
              הבא ←
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
