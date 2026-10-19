import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CirclePlus,
  ExternalLink,
  Mail,
  MessageCircle,
  MessageSquareText,
  MousePointerClick,
  Phone,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { requireSession } from "@/lib/admin/session";
import { BaramError, baramLeadUrl, clientSetup, getLead, type BaramTimelineEvent } from "@/lib/baram-api";
import { SYSTEM_STATUS, activeFeedbacks, formOf, sourceOf, topicOf } from "@/lib/admin/leads";
import { formatDate } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/globals";
import { Badge, Panel, initials } from "@/components/admin/ui";
import { FeedbackForm, NoteForm } from "@/components/admin/lead-feedback";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";

export const metadata = { title: "פרטי ליד" };

const EVENTS: Record<string, { label: string; icon: typeof Phone }> = {
  created: { label: "הליד התקבל", icon: CirclePlus },
  feedback_changed: { label: "משוב עודכן", icon: RefreshCw },
  fields_changed: { label: "פרטים עודכנו", icon: RefreshCw },
  status_changed: { label: "סטטוס עודכן", icon: RefreshCw },
  assigned: { label: "שיוך לנציג", icon: UserRound },
  note: { label: "הערה", icon: MessageSquareText },
  call_click: { label: "חיוג", icon: Phone },
  whatsapp_click: { label: "וואטסאפ", icon: MessageCircle },
  email_click: { label: "מייל", icon: Mail },
  task_created: { label: "נוצרה משימה", icon: CalendarClock },
  task_done: { label: "משימה הושלמה", icon: CalendarClock },
  exported: { label: "יוצא", icon: MousePointerClick },
  conversion: { label: "המרה", icon: MousePointerClick },
};

const UNMAPPED_LABELS: Record<string, string> = { topic: "נושא", form: "טופס", event_id: "מזהה אירוע" };

function EventBody({ e, feedbackName }: { e: BaramTimelineEvent; feedbackName: (id: unknown) => string }) {
  const d = e.data ?? {};
  if (e.type === "note" && typeof d.text === "string") {
    return <p className="m-0 mt-1.5 whitespace-pre-line rounded-lg bg-muted p-3 text-[14px]">{d.text}</p>;
  }
  if (e.type === "feedback_changed") {
    return (
      <p className="m-0 mt-1 text-[14px]">
        {d.from ? `${feedbackName(d.from)} ← ` : ""}
        <b>{d.to ? feedbackName(d.to) : "ללא משוב"}</b>
        {typeof d.reason === "string" && d.reason ? ` · ${d.reason}` : ""}
      </p>
    );
  }
  if (e.type === "created" && d.unmapped && typeof d.unmapped === "object") {
    return (
      <dl className="m-0 mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px] text-muted-foreground">
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

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-32 shrink-0 text-[13.5px] text-muted-foreground">{label}</dt>
      <dd className="m-0 min-w-0 break-words text-[14.5px]">{children}</dd>
    </div>
  );
}

const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "972")}`;

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
      <Alert variant="destructive">
        <AlertDescription>לא ניתן לטעון את הליד: {res.error}</AlertDescription>
      </Alert>
    );
  }
  const { lead, timeline } = res;
  const feedbacks = activeFeedbacks(setup).map(({ id, name, action }) => ({ id, name, action }));
  const feedbackName = (fid: unknown) => setup?.feedbacks.find((f) => f.id === fid)?.name ?? `#${fid}`;
  const topic = topicOf(lead);
  const form = formOf(lead);
  const source = [
    { label: "מקור", value: sourceOf(lead) },
    { label: "utm_source", value: lead.utm?.source },
    { label: "utm_medium", value: lead.utm?.medium },
    { label: "utm_campaign", value: lead.utm?.campaign },
    { label: "utm_term", value: lead.utm?.term },
    { label: "utm_content", value: lead.utm?.content },
    { label: "Google Ads click", value: lead.gclid },
    { label: "Meta click", value: lead.fbclid },
    { label: "עמוד נחיתה", value: lead.landingPageUrl },
    { label: "הגיע מ", value: lead.referrer },
  ].filter((r) => r.value);
  // ההערות שהאתר עצמו שולח (נושא/טופס) כבר מוצגות בפרטים.
  const extraNotes = lead.notes
    ?.split("\n")
    .filter((l) => !/^(נושא|טופס):/.test(l))
    .join("\n")
    .trim();

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="-ms-2 mb-3 text-muted-foreground">
        <Link href="/admin/leads">
          <ArrowRight aria-hidden />
          חזרה ללידים
        </Link>
      </Button>

      <Card className="mb-4 gap-0 py-0 shadow-none">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary text-[18px] font-bold text-white">{initials(lead.name || "?")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="m-0 flex flex-wrap items-center gap-2 font-display text-[24px] font-black leading-tight md:text-[28px]">
                {lead.name || "ללא שם"}
                {SYSTEM_STATUS[lead.status] && <Badge tone="muted">{SYSTEM_STATUS[lead.status]}</Badge>}
              </h1>
              <p className="m-0 mt-1 text-[14px] text-muted-foreground">
                {[topic, lead.channel?.name, formatDate(lead.createdAt)].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {lead.phone && (
              <>
                <Button asChild>
                  <a href={`tel:${lead.phone}`}>
                    <Phone aria-hidden />
                    חיוג
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={waLink(lead.phone)} target="_blank" rel="noreferrer">
                    <MessageCircle aria-hidden />
                    וואטסאפ
                  </a>
                </Button>
              </>
            )}
            {lead.email && (
              <Button variant="outline" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail aria-hidden />
                  מייל
                </a>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <a href={baramLeadUrl(lead.id)} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden />
                BARAM Leads
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel title="פרטי הפנייה" contentClassName="py-2">
            <dl className="m-0 divide-y">
              <Detail label="טלפון">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} dir="ltr" className="tnum font-bold text-primary no-underline">
                    {lead.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Detail>
              <Detail label="דוא״ל">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} dir="ltr" className="text-primary">
                    {lead.email}
                  </a>
                ) : (
                  "—"
                )}
              </Detail>
              <Detail label="נושא">{topic || "—"}</Detail>
              <Detail label="טופס">{form || "—"}</Detail>
              <Detail label="ערוץ">{lead.channel?.name ?? "—"}</Detail>
              <Detail label="התקבל">
                <span className="tnum">{formatDate(lead.createdAt)}</span>
              </Detail>
              <Detail label="דיוור שיווקי">
                {lead.marketingConsent ? <Badge tone="ok">אישר/ה</Badge> : <Badge tone="muted">לא אישר/ה</Badge>}
              </Detail>
            </dl>
            {extraNotes && (
              <p className="m-0 mb-3 mt-1 whitespace-pre-line rounded-lg bg-muted p-3 text-[14px]">{extraNotes}</p>
            )}
          </Panel>

          <Panel title="מאיפה הגיע הליד" contentClassName="py-2">
            {source.length > 1 ? (
              <dl className="m-0 divide-y">
                {source.map((r) => (
                  <Detail key={r.label} label={r.label}>
                    <span className="break-all" dir="auto">
                      {r.value}
                    </span>
                  </Detail>
                ))}
              </dl>
            ) : (
              <p className="m-0 py-3 text-muted-foreground">אין נתוני מקור לליד הזה.</p>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Panel title="משוב" description="נשמר ב-BARAM Leads — הצוות רואה אותו גם שם.">
            <FeedbackForm id={lead.id} value={lead.feedback?.id ?? null} options={feedbacks} />
          </Panel>
          <Panel title="הוספת הערה">
            <NoteForm id={lead.id} />
          </Panel>
          <Panel title="ציר זמן">
            <ol className="relative m-0 list-none p-0">
              {timeline.map((e, i) => {
                const meta = EVENTS[e.type] ?? { label: e.type, icon: RefreshCw };
                const Icon = meta.icon;
                return (
                  <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < timeline.length - 1 && (
                      <span className="absolute start-[15px] top-8 bottom-0 w-px bg-border" aria-hidden />
                    )}
                    <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full border bg-white text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="text-[14px] font-bold">{meta.label}</span>
                        <span className="tnum text-[12px] text-muted-foreground">
                          {formatDate(e.at)}
                          {e.by ? ` · ${e.by}` : ""}
                        </span>
                      </div>
                      <EventBody e={e} feedbackName={feedbackName} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}
