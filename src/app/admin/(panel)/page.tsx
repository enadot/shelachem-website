import Link from "next/link";
import { AlertTriangle, ArrowLeft, Inbox, TrendingDown, TrendingUp } from "lucide-react";
import { requireSession } from "@/lib/admin/session";
import { israelDay, leadStats, searchLeads } from "@/lib/baram-api";
import { sourceOf, topicOf } from "@/lib/admin/leads";
import { pendingBackups } from "@/lib/lead-backups";
import { readGlobals } from "@/lib/admin/globals";
import { buildMarketingConfig } from "@/lib/marketing";
import { Badge, EmptyState, Panel, PageTitle, initials } from "@/components/admin/ui";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Button } from "@/components/admin/ui/button";
import { RetryBackupsButton } from "@/components/admin/retry-backups";
import { LeadsChart } from "@/components/admin/leads-chart";
import { formatDate } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "סקירה" };

const TAGS = [
  { key: "gtmId", label: "Google Tag Manager" },
  { key: "ga4Id", label: "Google Analytics 4" },
  { key: "googleAdsId", label: "Google Ads" },
  { key: "metaPixelId", label: "Meta Pixel" },
  { key: "tiktokPixelId", label: "TikTok Pixel" },
  { key: "linkedinPartnerId", label: "LinkedIn" },
  { key: "clarityId", label: "Microsoft Clarity" },
] as const;

/** שינוי באחוזים מול התקופה הקודמת; null כשאין בסיס להשוואה. */
const delta = (now?: number, before?: number) =>
  now === undefined || before === undefined || before === 0 ? null : Math.round(((now - before) / before) * 100);

function Kpi({
  label,
  value,
  change,
  hint,
  href,
}: {
  label: string;
  value?: number;
  change?: number | null;
  hint?: string;
  href?: string;
}) {
  const body = (
    <CardContent className="flex flex-col gap-2 p-5">
      <span className="text-[13.5px] text-muted-foreground">{label}</span>
      <span className="tnum font-display text-[38px] font-light leading-none text-foreground">
        {value?.toLocaleString("he-IL") ?? "—"}
      </span>
      <span className="flex min-h-5 items-center gap-1.5 text-[12.5px] text-muted-foreground">
        {change != null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-bold",
              change >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
            )}
          >
            {change >= 0 ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
            <span dir="ltr">{change > 0 ? `+${change}` : change}%</span>
          </span>
        )}
        {hint}
      </span>
    </CardContent>
  );
  return (
    <Card className={cn("gap-0 py-0 shadow-none", href && "transition-colors hover:border-primary/40")}>
      {href ? (
        <Link href={href} className="text-inherit no-underline">
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  );
}

export default async function OverviewPage() {
  const { user } = await requireSession();
  const monthStart = israelDay(29);
  const [stats, recent, globals, pending] = await Promise.all([
    leadStats(monthStart, israelDay()).catch(() => null),
    searchLeads({ pageSize: 6 }).catch(() => null),
    readGlobals(),
    pendingBackups(5).catch(() => null),
  ]);
  // סטטוס "מה מוגדר" — בלי שער הסביבה, כדי שלוח הבקרה ב-preview יציג את ההגדרות האמיתיות.
  const marketing = buildMarketingConfig(globals, { ignoreEnv: true });

  // ספירה לפי ימים (שעון ישראל) מתוך נתוני 30 הימים — בקשה אחת ל-BARAM.
  const byDay = new Map(stats?.byDay.map((d) => [d.day, d.count]));
  const series = Array.from({ length: 30 }, (_, i) => {
    const day = israelDay(29 - i);
    return { day, count: byDay.get(day) ?? 0 };
  });
  const sum = (fromDaysAgo: number, toDaysAgo: number) =>
    stats ? series.slice(29 - fromDaysAgo, 30 - toDaysAgo).reduce((n, d) => n + d.count, 0) : undefined;
  const today = sum(0, 0);
  const week = sum(6, 0);
  const awaiting = stats ? stats.total - stats.withFeedback : undefined;
  const connected = TAGS.filter((t) => marketing[t.key]).length;

  return (
    <>
      <PageTitle
        title={`שלום${user.name ? ` ${user.name}` : ""},`}
        strong="הנה מה שקורה באתר"
        actions={
          <Button asChild>
            <Link href="/admin/leads">
              <Inbox aria-hidden />
              לכל הלידים
            </Link>
          </Button>
        }
      />

      {pending && pending.total > 0 && (
        <Alert variant="destructive" className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <AlertTitle className="font-bold">
                {pending.total === 1 ? "ליד אחד מהאתר לא הועבר" : `${pending.total} לידים מהאתר לא הועברו`} ל-BARAM Leads
              </AlertTitle>
              <AlertDescription className="text-[13.5px]">
                {pending.total === 1 ? "הוא שמור" : "הם שמורים"} בגיבוי.{" "}
                {pending.rows
                  .map((r) => `${String(r.payload.full_name ?? "")} (${formatDate(r.receivedAt.toISOString())})`)
                  .join(", ")}
                {pending.rows[0]?.forwardError ? ` · שגיאה אחרונה: ${pending.rows[0].forwardError}` : ""}
              </AlertDescription>
            </div>
          </div>
          <RetryBackupsButton />
        </Alert>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Kpi label="לידים היום" value={today} change={delta(today, sum(1, 1))} hint="מול אתמול" />
        <Kpi label="7 ימים אחרונים" value={week} change={delta(week, sum(13, 7))} hint="מול השבוע הקודם" />
        <Kpi
          label="30 ימים אחרונים"
          value={stats?.total}
          change={delta(stats?.total, stats?.previousPeriodTotal)}
          hint="מול 30 הימים הקודמים"
        />
        <Kpi
          label="ממתינים למשוב"
          value={awaiting}
          hint="ב-30 הימים האחרונים"
          href={`/admin/leads?feedback=none&from=${monthStart}`}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel title="לידים ליום" description="30 הימים האחרונים, לפי BARAM Leads">
            {stats ? (
              <LeadsChart data={series} />
            ) : (
              <p className="m-0 text-muted-foreground">לא ניתן לטעון נתונים מ-BARAM Leads כרגע.</p>
            )}
          </Panel>

          <Panel
            title="לידים אחרונים"
            contentClassName="px-0 py-0 md:px-0"
            action={
              <Button variant="ghost" size="sm" asChild className="text-primary">
                <Link href="/admin/leads">
                  לכל הלידים
                  <ArrowLeft aria-hidden />
                </Link>
              </Button>
            }
          >
            {recent?.leads.length ? (
              <ul className="m-0 list-none divide-y p-0">
                {recent.leads.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="flex items-center gap-3 px-5 py-3 text-inherit no-underline transition-colors hover:bg-muted/60 md:px-6"
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-secondary text-[13px] font-bold text-primary">
                          {initials(l.name || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-bold">{l.name || "ללא שם"}</span>
                        <span className="block truncate text-[13px] text-muted-foreground">
                          {topicOf(l) || l.channel?.name || "—"} · {sourceOf(l)}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <Badge tone={l.feedback ? "muted" : "gold"}>{l.feedback?.name ?? "ללא משוב"}</Badge>
                        <span className="tnum text-[12px] text-muted-foreground">{formatDate(l.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5">
                <EmptyState title={recent ? "עדיין אין לידים" : "לא ניתן לטעון לידים"} icon={<Inbox className="size-5" />}>
                  {recent ? "לידים מהאתר יופיעו כאן." : "BARAM Leads לא זמין כרגע — נסו לרענן בעוד רגע."}
                </EmptyState>
              </div>
            )}
          </Panel>
        </div>

        <Panel
          title="תגי מדידה"
          description={`${connected} מתוך ${TAGS.length} מחוברים באתר`}
          className="self-start"
          contentClassName="px-0 py-0 md:px-0"
        >
          <ul className="m-0 list-none divide-y p-0">
            {TAGS.map((t) => (
              <li key={t.key} className="flex items-center justify-between gap-3 px-5 py-3 md:px-6">
                <span className="flex items-center gap-2.5 text-[14.5px]">
                  <span
                    className={cn("size-2 rounded-full", marketing[t.key] ? "bg-emerald-500" : "bg-border")}
                    aria-hidden
                  />
                  {t.label}
                </span>
                {marketing[t.key] ? <Badge tone="ok">מחובר</Badge> : <Badge tone="muted">לא מוגדר</Badge>}
              </li>
            ))}
          </ul>
          <div className="border-t px-5 py-3 md:px-6">
            <Button variant="ghost" size="sm" asChild className="-ms-2 text-primary">
              <Link href="/admin/marketing">
                לניהול התגים
                <ArrowLeft aria-hidden />
              </Link>
            </Button>
          </div>
        </Panel>
      </div>
    </>
  );
}
