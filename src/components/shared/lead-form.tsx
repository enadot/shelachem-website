"use client";

import { useSite } from "@/components/settings-provider";
import { useState, useSyncExternalStore, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { newEventId, trackEvent, trackLeadConversion } from "@/lib/analytics";
import { getAttribution, utmSummary } from "@/lib/attribution";
import { leadResponseAccepted, runLeadTracking, SUBMIT_TIMEOUT_MS } from "@/lib/lead-client";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import { CheckCircle, ChevronForward } from "@/components/shared/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** מקבל כל פורמט נפוץ — רווחים, מקפים, +972 — ומנרמל לספרות עם 0 מוביל. */
export const normalizePhone = (v: string) =>
  v.trim().replace(/[\s-]/g, "").replace(/^(\+972|972)/, "0");

const schema = z.object({
  full_name: z.string().trim().min(2, "נא להזין שם מלא").max(100, "השם ארוך מדי"),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((v) => /^0\d{8,9}$/.test(v), "נא להזין טלפון ישראלי תקין, לדוגמה: 054-1234567"),
  email: z.union([z.string().trim().email("כתובת דוא״ל לא תקינה"), z.literal("")]),
  topic: z.string().optional(),
  data_consent: z.boolean().refine((v) => v, "יש לאשר את שמירת הפרטים"),
  marketing_consent: z.boolean(),
  company: z.string().max(0).optional(),
});

type FormValues = z.infer<typeof schema>;

export interface LeadFormProps {
  /** Visual context: white card (hero/sidebar) or on a dark navy/blue background. */
  variant?: "light" | "dark";
  /** Submit button label. */
  submitLabel?: string;
  /** Optional topic select options (e.g. institution form). */
  topicOptions?: string[];
  topicLabel?: string;
  /**
   * נושא שנקבע מראש (למשל לחיצה על כרטיס "קצבת ניידות"). נשמר על הליד ומוצג
   * למשתמש, כדי שלא ייאלץ לזכור מה קרא ולבחור אותו מחדש מרשימה.
   */
  presetTopic?: string;
  /** Recorded on the lead for attribution. */
  sourcePage: string;
  /** Show the email field (optional field). Short forms (quiz, final CTA) hide it. */
  withEmail?: boolean;
  /** Show the two consent checkboxes (hero form). Default true for data consent only. */
  withMarketingConsent?: boolean;
  /**
   * "hero" — name+phone row, email+submit row.
   * "inline" — v3 hero card: on desktop name/phone/email/submit in one row, consents below.
   */
  layout?: "stacked" | "hero" | "inline";
  className?: string;
}

/**
 * טופס ליד. עם JS: fetch לאותו דומיין (`/api/leads`) ובדיקה שהתשובה היא JSON
 * עם ok:true. בלי JS: הטופס נשלח כ-POST רגיל לאותה כתובת. BARAM לא נקרא מהדפדפן.
 */
export function LeadForm({
  variant = "light",
  submitLabel = "אני רוצה לבדוק",
  topicOptions,
  topicLabel = "בחרו נושא",
  presetTopic,
  sourcePage,
  withMarketingConsent = true,
  withEmail = true,
  layout = "stacked",
  className,
}: LeadFormProps) {
  const { contact } = useSite();
  // אחרי הידרציה הוולידציה שלנו (עברית). לפניה — בדיקת הדפדפן, כדי ש-POST בלי JS לא יישלח ריק.
  const clientReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sentPhone, setSentPhone] = useState("");
  const [started, setStarted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      topic: presetTopic ?? "",
      data_consent: false,
      marketing_consent: false,
      company: "",
    },
  });

  const dark = variant === "dark";
  const rowSubmit = layout === "hero" || layout === "inline";

  const inputClass = cn(
    dark && "border-transparent bg-white focus:border-gold",
  );

  const onSubmit = handleSubmit(async (values) => {
    setStatus("sending");
    // Attribution: ה-UTM של הקמפיין האחרון (נלכד בכניסה לאתר, גם אם מאז עברו עמודים)
    // מצורף ל-source_page (מוגבל ל-200 תווים בשרת); הפירוט המלא נשלח ב-attribution.
    const attribution = getAttribution();
    const utm = utmSummary(attribution);
    const source = (utm ? `${sourcePage}|${utm}` : sourcePage).slice(0, 200);
    // אותו מזהה על הליד ועל אירוע ההמרה — מאפשר dedup מול המרות שיישלחו מהשרת.
    const eventId = newEventId();
    // סינון ישראלי עלול להחזיר דף חסימה HTML בסטטוס 200, או להשאיר את הבקשה תלויה.
    // timeout + אימות JSON. לא שולחים שוב ב-POST אחרי fetch — הבקשה אולי כבר נשמרה.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
    let accepted = false;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          full_name: values.full_name,
          phone: values.phone,
          email: values.email,
          topic: values.topic || undefined,
          source_page: source,
          data_consent: values.data_consent,
          marketing_consent: values.marketing_consent,
          company: values.company,
          attribution: { ...attribution, event_id: eventId, page: window.location.pathname },
        }),
      });
      const contentType = res.headers.get("content-type");
      const data = contentType?.toLowerCase().includes("application/json")
        ? await res.json().catch(() => null)
        : null;
      accepted = leadResponseAccepted(res.status, contentType, data);
    } catch {
      accepted = false;
    } finally {
      clearTimeout(timer);
    }
    if (!accepted) {
      setStatus("error");
      return;
    }
    setSentPhone(values.phone);
    setStatus("sent");
    void runLeadTracking(() =>
      trackLeadConversion({
        source,
        topic: values.topic || undefined,
        eventId,
        phone: values.phone,
        email: values.email || undefined,
      }),
    );
  });

  if (status === "sent") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-2 rounded-card p-6 text-center",
          dark ? "text-white" : "text-ink",
          className,
        )}
        role="status"
      >
        <CheckCircle size={34} className="text-brand" />
        <div className="font-display text-2xl font-bold">הפרטים התקבלו!</div>
        <p className={cn("m-0 text-base", dark ? "text-white/80" : "text-ink-secondary")}>
          נחזור אליכם {sentPhone ? <b className="tnum">ל-{sentPhone}</b> : "בהקדם"} — בדרך כלל
          תוך יום עסקים אחד.
        </p>
      </div>
    );
  }

  const errorClass = cn("m-0 mt-1 text-[13px]", dark ? "text-red-200" : "text-danger");
  const errorId = (name: string) => `${sourcePage}-${name}-error`;

  // תוויות קבועות מעל השדות, בלי placeholders — התווית היא ההסבר היחיד, והשדה נקי.
  const fieldLabelClass = cn(
    "mb-1 block text-[13px] font-bold",
    dark ? "text-white/90" : "text-ink-secondary",
  );
  const id = (name: string) => `${sourcePage}-${name}`;

  const nameField = (
    <div>
      <Label htmlFor={id("full_name")} className={fieldLabelClass}>
        שם מלא *
      </Label>
      <Input
        {...register("full_name")}
        id={id("full_name")}
        required
        autoComplete="name"
        className={inputClass}
        aria-invalid={Boolean(errors.full_name)}
        aria-describedby={errors.full_name ? errorId("full_name") : undefined}
      />
      {/* role=alert — בלי זה שגיאת ולידציה שקופה לחלוטין לקורא מסך */}
      {errors.full_name && (
        <p id={errorId("full_name")} role="alert" className={errorClass}>
          {errors.full_name.message}
        </p>
      )}
    </div>
  );
  const phoneField = (
    <div>
      <Label htmlFor={id("phone")} className={fieldLabelClass}>
        טלפון *
      </Label>
      <Input
        {...register("phone")}
        id={id("phone")}
        required
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel"
        className={cn(inputClass, "tnum text-right")}
        aria-invalid={Boolean(errors.phone)}
        aria-describedby={errors.phone ? errorId("phone") : undefined}
      />
      {/* role=alert — בלי זה שגיאת ולידציה שקופה לחלוטין לקורא מסך */}
      {errors.phone && (
        <p id={errorId("phone")} role="alert" className={errorClass}>
          {errors.phone.message}
        </p>
      )}
    </div>
  );
  const emailField = (
    <div>
      <Label htmlFor={id("email")} className={fieldLabelClass}>
        דואר אלקטרוני
      </Label>
      <Input
        {...register("email")}
        id={id("email")}
        type="email"
        autoComplete="email"
        className={inputClass}
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? errorId("email") : undefined}
      />
      {/* role=alert — בלי זה שגיאת ולידציה שקופה לחלוטין לקורא מסך */}
      {errors.email && (
        <p id={errorId("email")} role="alert" className={errorClass}>
          {errors.email.message}
        </p>
      )}
    </div>
  );
  const submitButton = (
    <Button
      type="submit"
      variant={dark ? "accent" : "brand"}
      size="lg"
      disabled={status === "sending"}
      className={rowSubmit ? "w-full sm:w-auto" : "w-full"}
    >
      {status === "sending" ? (
        "שולחים…"
      ) : (
        <>
          {submitLabel}
          <ChevronForward size={16} className="nudge" />
        </>
      )}
    </Button>
  );

  return (
    <form
      method="post"
      action="/api/leads"
      noValidate={clientReady}
      onSubmit={onSubmit}
      onFocus={() => {
        // מדידת נטישה: כמה התחילו למלא לעומת כמה שלחו (form_start → generate_lead).
        if (started) return;
        setStarted(true);
        trackEvent("form_start", { lead_source: sourcePage, lead_topic: presetTopic });
      }}
      className={cn("flex flex-col gap-3", className)}
    >
      {layout === "hero" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {nameField}
            {phoneField}
          </div>
          {withEmail ? (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              {emailField}
              {submitButton}
            </div>
          ) : (
            submitButton
          )}
        </>
      ) : layout === "inline" ? (
        <div
          className={cn(
            "grid gap-3 md:items-end",
            withEmail ? "md:grid-cols-[1fr_1fr_1fr_auto]" : "md:grid-cols-[1fr_1fr_auto]",
          )}
        >
          {nameField}
          {phoneField}
          {withEmail && emailField}
          {submitButton}
        </div>
      ) : (
        <>
          {nameField}
          {phoneField}
          {withEmail && emailField}
        </>
      )}
      {presetTopic && (
        <p
          className={cn(
            "m-0 rounded-[10px] px-3.5 py-2.5 text-[14.5px]",
            dark ? "bg-white/10 text-white/85" : "bg-surface-blue text-ink-secondary",
          )}
        >
          הנושא: <b className={dark ? "text-white" : "text-ink"}>{presetTopic}</b>
        </p>
      )}
      {topicOptions && topicOptions.length > 0 && (
        <div>
          <Label htmlFor={id("topic")} className={fieldLabelClass}>
            {topicLabel}
          </Label>
          <select
            {...register("topic")}
            id={id("topic")}
            className={cn(
              "min-h-[50px] w-full rounded-[10px] border-[1.5px] border-hairline bg-field px-4 py-3 text-[17px] text-ink",
              inputClass,
            )}
          >
            <option value="">{topicLabel}</option>
            {topicOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      )}

      <input type="hidden" name="source_page" value={sourcePage} />
      {presetTopic && !topicOptions?.length ? <input type="hidden" name="topic" value={presetTopic} /> : null}

      {/* Honeypot — hidden from humans, catches naive bots. */}
      <input
        {...register("company")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute h-0 w-0 overflow-hidden opacity-0"
      />

      <Label
        className={cn(
          "flex cursor-pointer items-start gap-2.5 text-[12.5px]",
          dark ? "text-white/75" : "text-ink-muted",
        )}
      >
        <ConsentCheck
          {...register("data_consent")}
          id={id("data_consent")}
          required
          aria-invalid={Boolean(errors.data_consent)}
          aria-describedby={errors.data_consent ? errorId("data_consent") : undefined}
        />
        <span>
          הפרטים יישמרו במאגרי החברה בהתאם ל
          <a
            href="/privacy"
            target="_blank"
            className={cn(
              "whitespace-nowrap underline underline-offset-2",
              dark ? "text-white" : "text-brand",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            מדיניות הפרטיות
          </a>
        </span>
      </Label>
      {errors.data_consent && (
        <p id={errorId("data_consent")} role="alert" className={cn(errorClass, "-mt-1")}>
          {errors.data_consent.message}
        </p>
      )}
      {withMarketingConsent && (
        <Label
          className={cn(
            "flex cursor-pointer items-start gap-2.5 text-[12.5px]",
            dark ? "text-white/75" : "text-ink-muted",
          )}
        >
          <ConsentCheck {...register("marketing_consent")} id={id("marketing_consent")} />
          <span>אשמח לקבל עדכונים ותוכן שיווקי (אפשר להסיר בכל עת)</span>
        </Label>
      )}

      {!rowSubmit && submitButton}
      {status === "error" && (
        <p className={cn("m-0 text-center text-[13px]", dark ? "text-red-200" : "text-danger")} role="alert">
          משהו השתבש בשליחה. נסו שוב או התקשרו אלינו:{" "}
          <a href={contact.phoneHref} className="tnum font-bold underline underline-offset-2">
            {contact.phone}
          </a>{" "}
          או{" "}
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2"
          >
            בוואטסאפ
          </a>
        </p>
      )}
      <div className={cn("text-center text-[13.5px]", dark ? "text-white/70" : "text-ink-faint")}>
        <Lock size={13} aria-hidden className="me-1.5 inline-block align-[-2px]" />
        הפרטים שלכם נשמרים בדיסקרטיות מלאה · שכר טרחה בהצלחה בלבד
      </div>
    </form>
  );
}

/** צ'קבוקס אמיתי — נשלח גם בלי JS. הריבוע 18px, יעד המגע 44px בלי להזיז את השורה. */
function ConsentCheck({ className, ...props }: ComponentProps<"input">) {
  return (
    <span className="relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0">
      <input
        type="checkbox"
        className={cn(
          "peer absolute left-1/2 top-1/2 z-[1] m-0 h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0",
          className,
        )}
        {...props}
      />
      <span
        aria-hidden
        className="pointer-events-none flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#cbd5e1] bg-white text-transparent peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </span>
  );
}
