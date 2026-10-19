import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/admin/session";
import { BaramError, baramLeadUrl, clientSetup, getLead, type BaramTimelineEvent } from "@/lib/baram-api";
import { SYSTEM_STATUS, activeFeedbacks, formOf, sourceOf, topicOf } from "@/lib/admin/leads";
import { formatDate } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/globals";
import { Badge, PageTitle, Panel } from "@/components/admin/ui";
import { FeedbackForm, NoteForm } from "@/components/admin/lead-feedback";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "פרטי ליד" };

const EVENT_LABELS: Record<string, string> = {
  created: "הליד התקבל",
  feedback_changed: "משוב עודכן",
  fields_changed: "פרטים עודכנו",
  status_changed: "סטטוס עודכן",
  assigned: "שיוך לנציג",
  note: "הערה",
  call_click: "חיוג",
  whatsapp_click: "וואטסאפ",
  email_click: "מייל",
  task_created: "נוצרה משימה",
  task_done: "משימה הושלמה",
  exported: "יוצא",
  conversion: "המרה",
};

const UNMAPPED_LABELS: Record<string, string> = { topic: "נושא", form: "טופס", event_id: "מזהה אירוע" };

function EventBody({ e, feedbackName }: { e: BaramTimelineEvent; feedbackName: (id: unknown) => string }) {
  const d = e.data ?? {};
  if (e.type === "note" && typeof d.text === "string") return <p className="m-0 whitespace-pre-line">{d.text}</p>;
  if (e.type === "feedback_changed") {
    return (
      <p className="m-0">
        {d.from ? `${feedbackName(d.from)} ← ` : ""}
        <b>{d.to ? feedbackName(d.to) : "ללא משוב"}</b>
        {typeof d.reason === "string" && d.reason ? ` · ${d.reason}` : ""}
      </p>
    );
  }
  if (e.type === "created" && d.unmapped && typeof d.unmapped === "object") {
    return (
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 text-[13.5px] text-ink-muted">
        {Object.entries(d.unmapped as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="contents">
            <dt>{UNMAPPED_LABELS[k] ?? k}</dt>
            <dd className="m-0 break-all">{String(v)}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return null;
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [res, setup] = await Promise.all([
    getLead(id).catch((err: unknown) => (err instanceof BaramError && err.status === 404 ? null : { error: errorMessage(err) })),
    clientSetup().catch(() => null),
  ]);
  if (!res) notFound();
  if ("error" in res) {
    return (
      <p role="alert" className="rounded-[10px] bg-[#fbe6e6] px-4 py-3 text-danger">
        לא ניתן לטעון את הליד: {res.error}
      </p>
    );
  }
  const { lead, timeline } = res;
  const feedbacks = activeFeedbacks(setup).map(({ id, name, action }) => ({ id, name, action }));
  const feedbackName = (fid: unknown) => setup?.feedbacks.find((f) => f.id === fid)?.name ?? `#${fid}`;
  const topic = topicOf(lead);
  const form = formOf(lead);

  const details = [
    {
      label: "טלפון",
      value: lead.phone ? (
        <a href={`tel:${lead.phone}`} dir="ltr" className="tnum font-bold text-brand no-underline">
          {lead.phone}
        </a>
      ) : (
        "—"
      ),
    },
    { label: "דוא״ל", value: lead.email ? <a href={`mailto:${lead.email}`} className="text-brand">{lead.email}</a> : "—" },
    { label: "נושא", value: topic || "—" },
    { label: "טופס", value: form || "—" },
    { label: "ערוץ", value: lead.channel?.name ?? "—" },
    { label: "התקבל", value: <span className="tnum">{formatDate(lead.createdAt)}</span> },
    {
      label: "דיוור שיווקי",
      value: lead.marketingConsent ? <Badge tone="ok">אישר/ה</Badge> : <Badge tone="muted">לא אישר/ה</Badge>,
    },
  ];
  const source = [
    { label: "מקור", value: sourceOf(lead) },
    { label: "utm_source", value: lead.utm?.source },
    { label: "utm_medium", value: lead.utm?.medium },
    { label: "utm_campaign", value: lead.utm?.campaign },
    { label: "utm_term", value: lead.utm?.term },
    { label: "utm_content", value: lead.utm?.content },
    { label: "Google Ads click id", value: lead.gclid },
    { label: "Meta click id", value: lead.fbclid },
    { label: "עמוד נחיתה", value: lead.landingPageUrl },
    { label: "הגיע מ", value: lead.referrer },
  ].filter((r) => r.value);
  // ההערות שהאתר עצמו שולח (נושא/טופס) כבר מוצגות למעלה.
  const extraNotes = lead.notes
    ?.split("\n")
    .filter((l) => !/^(נושא|טופס):/.test(l))
    .join("\n")
    .trim();

  return (
    <>
      <Link href="/admin/leads" className="mb-4 inline-block text-[14.5px] font-bold text-brand no-underline">
        → חזרה ללידים
      </Link>
      <PageTitle
        title="ליד:"
        strong={lead.name || "ללא שם"}
        description={SYSTEM_STATUS[lead.status] ? <Badge tone="muted">{SYSTEM_STATUS[lead.status]}</Badge> : undefined}
        actions={
          <a
            href={baramLeadUrl(lead.id)}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline-accent", size: "sm" })}
          >
            פתיחה ב-BARAM Leads ↗
          </a>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Panel title="פרטי הפנייה">
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[15.5px]">
            {details.map((d) => (
              <div key={d.label} className="contents">
                <dt className="text-ink-muted">{d.label}</dt>
                <dd className="m-0 min-w-0 break-words">{d.value}</dd>
              </div>
            ))}
          </dl>
          {extraNotes && <p className="m-0 mt-4 whitespace-pre-line rounded-[10px] bg-surface p-3 text-[14.5px]">{extraNotes}</p>}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="משוב" description="נשמר ב-BARAM Leads — הצוות רואה אותו גם שם.">
            <FeedbackForm id={lead.id} value={lead.feedback?.id ?? null} options={feedbacks} />
          </Panel>
          <Panel title="הוספת הערה" description="ההערה נכנסת לציר הזמן של הליד ב-BARAM Leads.">
            <NoteForm id={lead.id} />
          </Panel>
        </div>

        <Panel title="מאיפה הגיע הליד">
          {source.length > 1 ? (
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14.5px]">
              {source.map((r) => (
                <div key={r.label} className="contents">
                  <dt className="text-ink-muted">{r.label}</dt>
                  <dd className="m-0 min-w-0 break-all" dir="auto">
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="m-0 text-ink-muted">אין נתוני מקור לליד הזה.</p>
          )}
        </Panel>

        <Panel title="ציר זמן">
          <ol className="m-0 list-none p-0">
            {timeline.map((e) => (
              <li key={e.id} className="border-b border-hairline-soft py-3 text-[14.5px] last:border-none">
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold text-ink">{EVENT_LABELS[e.type] ?? e.type}</span>
                  <span className="tnum text-[12.5px] text-ink-faint">
                    {formatDate(e.at)}
                    {e.by ? ` · ${e.by}` : ""}
                  </span>
                </div>
                <EventBody e={e} feedbackName={feedbackName} />
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
