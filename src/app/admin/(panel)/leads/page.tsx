import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Inbox, Phone, Search, X } from "lucide-react";
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
import { Badge, EmptyState, PageTitle, initials } from "@/components/admin/ui";
import { FeedbackSelect } from "@/components/admin/lead-feedback";
import { Card } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";

export const metadata = { title: "לידים" };

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
  const filtered = Boolean(search.q || search.feedback || search.channel || search.utmSource || search.from || search.to);
  const first = ok && ok.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const last = ok ? Math.min(page * PAGE_SIZE, ok.total) : 0;

  return (
    <>
      <PageTitle
        title="לידים"
        strong={ok ? ok.total.toLocaleString("he-IL") : undefined}
        description="כל הפניות של שלכם מ-BARAM Leads. המשוב וההערות נשמרים שם ישירות."
        actions={
          <>
            <Button variant="outline" asChild>
              <a href={`/admin/leads/export?${searchQuery({ ...search, page: 1 })}`}>
                <Download aria-hidden />
                ייצוא CSV
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="https://leads.baram.digital/leads" target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden />
                BARAM Leads
              </a>
            </Button>
          </>
        }
      />

      <Card className="mb-4 gap-0 p-3 shadow-none">
        <form method="get" className="grid grid-cols-2 gap-2 md:grid-cols-[minmax(200px,2fr)_repeat(5,minmax(0,1fr))_auto]">
          <div className="relative col-span-2 md:col-span-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              name="q"
              defaultValue={search.q}
              placeholder="חיפוש שם, טלפון, דוא״ל…"
              aria-label="חיפוש"
              className="h-10 bg-white ps-9"
            />
          </div>
          <Select name="feedback" defaultValue={search.feedback ?? "all"}>
            <SelectTrigger aria-label="משוב" className="h-10 w-full bg-white">
              <SelectValue placeholder="משוב" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המשובים</SelectItem>
              <SelectItem value="none">ללא משוב</SelectItem>
              {feedbacks.map((f) => (
                <SelectItem key={f.id} value={String(f.id)}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="channel" defaultValue={search.channel ?? "all"}>
            <SelectTrigger aria-label="ערוץ" className="h-10 w-full bg-white">
              <SelectValue placeholder="ערוץ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הערוצים</SelectItem>
              {channelsOf(setup).map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            name="source"
            defaultValue={search.utmSource}
            placeholder="utm_source"
            aria-label="utm_source"
            dir="ltr"
            className="h-10 bg-white"
          />
          <Input type="date" name="from" defaultValue={search.from} aria-label="מתאריך" className="h-10 bg-white" />
          <Input type="date" name="to" defaultValue={search.to} aria-label="עד תאריך" className="h-10 bg-white" />
          <div className="col-span-2 flex gap-2 md:col-span-1">
            <Button type="submit" className="h-10 flex-1 md:flex-none">
              סינון
            </Button>
            {filtered && (
              <Button variant="ghost" asChild className="h-10">
                <Link href="/admin/leads">
                  <X aria-hidden />
                  ניקוי
                </Link>
              </Button>
            )}
          </div>
        </form>
      </Card>

      {"error" in result && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>לא ניתן לטעון את הלידים: {result.error}</AlertDescription>
        </Alert>
      )}

      {ok && ok.leads.length === 0 && (
        <EmptyState title="אין לידים שמתאימים לסינון" icon={<Inbox className="size-5" />}>
          נסו להרחיב את טווח התאריכים או לנקות את החיפוש.
        </EmptyState>
      )}

      {ok && ok.leads.length > 0 && (
        <Card className="gap-0 overflow-hidden py-0 shadow-none">
          {/* דסקטופ — טבלה */}
          <Table className="hidden md:table">
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="ps-5">ליד</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>נושא</TableHead>
                <TableHead>ערוץ · מקור</TableHead>
                <TableHead>התקבל</TableHead>
                <TableHead className="pe-5">משוב</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ok.leads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="ps-5">
                    <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-3 text-inherit no-underline">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-secondary text-[12px] font-bold text-primary">
                          {initials(l.name || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-bold hover:text-primary">
                          {l.name || "ללא שם"}
                          {SYSTEM_STATUS[l.status] && <Badge tone="muted">{SYSTEM_STATUS[l.status]}</Badge>}
                        </span>
                        {l.email && (
                          <span className="block max-w-[220px] truncate text-[12.5px] text-muted-foreground" dir="ltr">
                            {l.email}
                          </span>
                        )}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="tnum" dir="ltr">
                    {l.phone ? (
                      <a href={`tel:${l.phone}`} className="text-inherit no-underline hover:text-primary">
                        {l.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{topicOf(l) || "—"}</TableCell>
                  <TableCell className="max-w-[220px]">
                    <span className="block truncate text-[13.5px]">{l.channel?.name ?? "—"}</span>
                    <span className="block truncate text-[12.5px] text-muted-foreground">{sourceOf(l)}</span>
                  </TableCell>
                  <TableCell className="tnum whitespace-nowrap text-muted-foreground">{formatDate(l.createdAt)}</TableCell>
                  <TableCell className="pe-5">
                    <FeedbackSelect id={l.id} value={l.feedback?.id ?? null} options={feedbacks} label={`משוב — ${l.name}`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* מובייל — כרטיסים */}
          <ul className="m-0 list-none divide-y p-0 md:hidden">
            {ok.leads.map((l) => (
              <li key={l.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-secondary text-[12px] font-bold text-primary">
                      {initials(l.name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <Link href={`/admin/leads/${l.id}`} className="min-w-0 flex-1 text-inherit no-underline">
                    <span className="block truncate font-bold">{l.name || "ללא שם"}</span>
                    <span className="block truncate text-[13px] text-muted-foreground">
                      {topicOf(l) || l.channel?.name || "—"} · {sourceOf(l)}
                    </span>
                    <span className="tnum block text-[12px] text-muted-foreground">{formatDate(l.createdAt)}</span>
                  </Link>
                  {l.phone && (
                    <Button variant="outline" size="icon" asChild aria-label={`חיוג ל${l.name}`}>
                      <a href={`tel:${l.phone}`}>
                        <Phone aria-hidden />
                      </a>
                    </Button>
                  )}
                </div>
                <FeedbackSelect id={l.id} value={l.feedback?.id ?? null} options={feedbacks} label={`משוב — ${l.name}`} />
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-[13.5px] text-muted-foreground md:px-5">
            <span className="tnum">
              {first.toLocaleString("he-IL")}–{last.toLocaleString("he-IL")} מתוך {ok.total.toLocaleString("he-IL")}
            </span>
            <nav aria-label="דפדוף" className="flex items-center gap-1">
              {page > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/leads?${searchQuery({ ...search, page: page - 1 })}`}>
                    <ChevronRight aria-hidden />
                    הקודם
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronRight aria-hidden />
                  הקודם
                </Button>
              )}
              <span className="tnum px-2">
                {page} / {pages.toLocaleString("he-IL")}
              </span>
              {ok.hasMore ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/leads?${searchQuery({ ...search, page: page + 1 })}`}>
                    הבא
                    <ChevronLeft aria-hidden />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  הבא
                  <ChevronLeft aria-hidden />
                </Button>
              )}
            </nav>
          </div>
        </Card>
      )}
    </>
  );
}
