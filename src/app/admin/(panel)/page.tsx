import Link from "next/link";
import { requireSession } from "@/lib/admin/session";
import { israelDay, leadStats, searchLeads } from "@/lib/baram-api";
import { sourceOf, topicOf } from "@/lib/admin/leads";
import { pendingBackups } from "@/lib/lead-backups";
import { readGlobals } from "@/lib/admin/globals";
import { buildMarketingConfig } from "@/lib/marketing";
import { Badge, Panel, PageTitle } from "@/components/admin/ui";
import { RetryBackupsButton } from "@/components/admin/retry-backups";
import { formatDate } from "@/lib/admin/format";

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

export default async function OverviewPage() {
  const { user } = await requireSession();
  const monthStart = israelDay(29);
  const [stats, recent, globals, pending] = await Promise.all([
    leadStats(monthStart, israelDay()).catch(() => null),
    searchLeads({ pageSize: 7 }).catch(() => null),
    readGlobals(),
    pendingBackups(5).catch(() => null),
  ]);
  const marketing = buildMarketingConfig(globals);

  // ספירה לפי ימים (שעון ישראל) מתוך נתוני 30 הימים — בקשה אחת ל-BARAM.
  const since = (days: number) => {
    const from = israelDay(days);
    return stats?.byDay.filter((d) => d.day >= from).reduce((n, d) => n + d.count, 0);
  };
  const tiles = [
    { label: "לידים היום", value: since(0) },
    { label: "7 ימים אחרונים", value: since(6) },
    { label: "30 ימים אחרונים", value: stats?.total },
    {
      label: "ממתינים למשוב (30 יום)",
      value: stats ? stats.total - stats.withFeedback : undefined,
      href: `/admin/leads?feedback=none&from=${monthStart}`,
    },
  ];

  return (
    <>
      <PageTitle title={`שלום${user.name ? ` ${user.name}` : ""},`} strong="הנה מה שקורה באתר" />

      {pending && pending.total > 0 && (
        <div
          role="alert"
          className="mb-8 flex flex-col gap-3 rounded-card border border-danger/30 bg-[#fbe6e6] p-5 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="m-0 font-bold text-danger">
              {pending.total === 1 ? "ליד אחד מהאתר לא הועבר" : `${pending.total} לידים מהאתר לא הועברו`} ל-BARAM Leads
            </p>
            <p className="m-0 mt-1 text-[14px] text-ink-secondary">
              {pending.total === 1 ? "הוא שמור" : "הם שמורים"} בגיבוי.{" "}
              {pending.rows
                .map((r) => `${String(r.payload.full_name ?? "")} (${formatDate(r.receivedAt.toISOString())})`)
                .join(", ")}
              {pending.rows[0]?.forwardError ? ` · שגיאה אחרונה: ${pending.rows[0].forwardError}` : ""}
            </p>
          </div>
          <RetryBackupsButton />
        </div>
      )}

      <dl className="m-0 mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-hairline bg-hairline md:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white p-5 md:p-6">
            <dt className="text-[14px] text-ink-muted">{t.label}</dt>
            <dd className="tnum m-0 mt-2 font-display text-[44px] font-light leading-none text-ink">
              {t.href && t.value ? (
                <Link href={t.href} className="text-brand no-underline">
                  {t.value}
                </Link>
              ) : (
                (t.value ?? "—")
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="לידים אחרונים">
          {recent?.leads.length ? (
            <ul className="m-0 list-none p-0">
              {recent.leads.map((l) => (
                <li key={l.id} className="border-b border-hairline-soft last:border-none">
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="flex items-center justify-between gap-4 py-3 text-ink no-underline hover:text-brand"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{l.name || "ללא שם"}</span>
                      <span className="block truncate text-[13.5px] text-ink-muted">
                        {topicOf(l) || l.channel?.name || "—"} · {sourceOf(l)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <Badge tone={l.feedback ? "muted" : "gold"}>{l.feedback?.name ?? "ללא משוב"}</Badge>
                      <span className="tnum text-[12.5px] text-ink-faint">{formatDate(l.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-ink-muted">{recent ? "עדיין אין לידים." : "לא ניתן לטעון לידים מ-BARAM Leads כרגע."}</p>
          )}
          <Link href="/admin/leads" className="mt-4 inline-block font-bold text-brand no-underline">
            לכל הלידים ←
          </Link>
        </Panel>

        <Panel title="תגי מדידה" description="מה מחובר כרגע באתר.">
          <ul className="m-0 list-none p-0">
            {TAGS.map((t) => (
              <li
                key={t.key}
                className="flex items-center justify-between border-b border-hairline-soft py-2.5 last:border-none"
              >
                <span className="text-[15px]">{t.label}</span>
                {marketing[t.key] ? <Badge tone="ok">מחובר</Badge> : <Badge tone="muted">לא מוגדר</Badge>}
              </li>
            ))}
          </ul>
          <Link href="/admin/marketing" className="mt-4 inline-block font-bold text-brand no-underline">
            לניהול התגים ←
          </Link>
        </Panel>
      </div>
    </>
  );
}
