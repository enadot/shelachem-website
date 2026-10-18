import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/admin/session";
import { formPlace, getLead, sourceOf } from "@/lib/admin/leads";
import type { Touch } from "@/lib/attribution";
import { formatDate } from "@/lib/admin/format";
import { Badge, PageTitle, Panel } from "@/components/admin/ui";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { LeadNotes } from "@/components/admin/lead-notes";

export const metadata = { title: "פרטי ליד" };

const PARAM_LABELS: Record<string, string> = {
  utm_source: "מקור (utm_source)",
  utm_medium: "ערוץ (utm_medium)",
  utm_campaign: "קמפיין (utm_campaign)",
  utm_term: "מילת מפתח (utm_term)",
  utm_content: "מודעה (utm_content)",
  gclid: "Google Ads click id",
  gbraid: "Google Ads (iOS)",
  wbraid: "Google Ads (web→app)",
  fbclid: "Meta click id",
  ttclid: "TikTok click id",
  msclkid: "Microsoft Ads click id",
  li_fat_id: "LinkedIn click id",
};

function TouchView({ title, touch }: { title: string; touch?: Touch }) {
  return (
    <div>
      <h3 className="m-0 mb-3 text-[15px] font-bold text-ink">{title}</h3>
      {!touch ? (
        <p className="m-0 text-[14.5px] text-ink-muted">לא נרשם</p>
      ) : (
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14.5px]">
          <dt className="text-ink-muted">תאריך</dt>
          <dd className="tnum m-0">{formatDate(touch.at)}</dd>
          <dt className="text-ink-muted">עמוד נחיתה</dt>
          <dd className="m-0" dir="ltr">{touch.landing}</dd>
          {touch.referrer && (
            <>
              <dt className="text-ink-muted">הגיע מ</dt>
              <dd className="m-0 break-all" dir="ltr">{touch.referrer}</dd>
            </>
          )}
          {Object.entries(touch.params).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ink-muted">{PARAM_LABELS[k] ?? k}</dt>
              <dd className="m-0 break-all" dir="ltr">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { client } = await requireSession();
  const lead = await getLead(client, id).catch(() => null);
  if (!lead) notFound();

  const details = [
    { label: "טלפון", value: <a href={`tel:${lead.phone}`} dir="ltr" className="tnum font-bold text-brand no-underline">{lead.phone}</a> },
    { label: "דוא״ל", value: lead.email ? <a href={`mailto:${lead.email}`} className="text-brand">{lead.email}</a> : "—" },
    { label: "נושא", value: lead.topic || "—" },
    { label: "נשלח מ", value: formPlace(lead) },
    { label: "מקור", value: sourceOf(lead) },
    { label: "התקבל", value: <span className="tnum">{formatDate(lead.submitted_at)}</span> },
    {
      label: "דיוור שיווקי",
      value: lead.marketing_consent ? <Badge tone="ok">אישר/ה</Badge> : <Badge tone="muted">לא אישר/ה</Badge>,
    },
  ];

  return (
    <>
      <Link href="/admin/leads" className="mb-4 inline-block text-[14.5px] font-bold text-brand no-underline">
        → חזרה ללידים
      </Link>
      <PageTitle
        title="ליד:"
        strong={lead.full_name}
        actions={<LeadStatusSelect id={lead.id} status={lead.status} />}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Panel title="פרטי הפנייה">
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[15.5px]">
            {details.map((d) => (
              <div key={d.label} className="contents">
                <dt className="text-ink-muted">{d.label}</dt>
                <dd className="m-0">{d.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="הערות פנימיות" description="רק צוות המשרד רואה את ההערות.">
          <LeadNotes id={lead.id} initial={lead.notes ?? ""} />
        </Panel>

        <Panel
          title="מאיפה הגיע הליד"
          description="מקור ראשון = הפעם הראשונה שהגולש הגיע לאתר. מקור אחרון = הקמפיין שהביא אותו לפני הפנייה."
          className="lg:col-span-2"
        >
          {lead.attribution ? (
            <div className="grid gap-8 md:grid-cols-2">
              <TouchView title="מקור אחרון" touch={lead.attribution.last} />
              <TouchView title="מקור ראשון" touch={lead.attribution.first} />
            </div>
          ) : (
            <p className="m-0 text-ink-muted">אין נתוני מקור לליד הזה (נשלח לפני שהמעקב הופעל).</p>
          )}
        </Panel>
      </div>
    </>
  );
}
