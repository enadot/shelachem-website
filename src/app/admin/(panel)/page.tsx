import Link from "next/link";
import { getAdminUser, requireSession } from "@/lib/admin/session";
import { leadStats, listLeads, sourceOf, statusLabel } from "@/lib/admin/leads";
import { readGlobals } from "@/lib/admin/globals";
import { buildMarketingConfig } from "@/lib/marketing";
import { Badge, Panel, PageTitle } from "@/components/admin/ui";
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
  const { client } = await requireSession();
  const user = await getAdminUser();
  const [stats, recent, globals] = await Promise.all([
    leadStats(client).catch(() => null),
    listLeads(client, { page: 1 }).catch(() => null),
    readGlobals(client),
  ]);
  const marketing = buildMarketingConfig(globals);

  const tiles = [
    { label: "לידים היום", value: stats?.today },
    { label: "7 ימים אחרונים", value: stats?.week },
    { label: "30 ימים אחרונים", value: stats?.month },
    { label: "ממתינים לטיפול", value: stats?.open, href: "/admin/leads?status=new" },
  ];

  return (
    <>
      <PageTitle title={`שלום${user.name ? ` ${user.name}` : ""},`} strong="הנה מה שקורה באתר" />

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
              {recent.leads.slice(0, 7).map((l) => (
                <li key={l.id} className="border-b border-hairline-soft last:border-none">
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="flex items-center justify-between gap-4 py-3 text-ink no-underline hover:text-brand"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{l.full_name}</span>
                      <span className="block truncate text-[13.5px] text-ink-muted">
                        {l.topic || "—"} · {sourceOf(l)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <Badge tone={(l.status ?? "new") === "new" ? "gold" : "muted"}>
                        {statusLabel(l.status)}
                      </Badge>
                      <span className="tnum text-[12.5px] text-ink-faint">{formatDate(l.submitted_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-ink-muted">עדיין אין לידים.</p>
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
