"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { site } from "@/lib/config";
import { trackLeadConversion } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  /** Recorded on the lead for attribution. */
  sourcePage: string;
  /** Show the two consent checkboxes (hero form). Default true for data consent only. */
  withMarketingConsent?: boolean;
  /** "hero" lays the fields out in the hero-card grid (name+phone row, email+submit row). */
  layout?: "stacked" | "hero";
  className?: string;
}

/** טופס ליד — ה-CTA המרכזי של האתר. שולח ל-/api/leads. */
export function LeadForm({
  variant = "light",
  submitLabel = "אני רוצה לבדוק ›",
  topicOptions,
  topicLabel = "בחרו נושא",
  sourcePage,
  withMarketingConsent = true,
  layout = "stacked",
  className,
}: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sentPhone, setSentPhone] = useState("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      topic: "",
      data_consent: false,
      marketing_consent: false,
      company: "",
    },
  });

  const dark = variant === "dark";

  const inputClass = cn(
    dark && "border-white/25 bg-white/10 text-white placeholder:text-white/60",
  );

  const onSubmit = handleSubmit(async (values) => {
    setStatus("sending");
    // Attribution: פרמטרי utm_* מה-URL מצורפים ל-source_page (מוגבל ל-200 תווים בשרת).
    const utm = new URLSearchParams(
      [...new URLSearchParams(window.location.search)].filter(([k]) => k.startsWith("utm_")),
    ).toString();
    const source = (utm ? `${sourcePage}|${utm}` : sourcePage).slice(0, 200);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.full_name,
          phone: values.phone,
          email: values.email,
          topic: values.topic || undefined,
          source_page: source,
          marketing_consent: values.marketing_consent,
          company: values.company,
        }),
      });
      if (res.ok) {
        setSentPhone(values.phone);
        trackLeadConversion({ source, topic: values.topic || undefined });
      }
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
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
        <span className="text-3xl" aria-hidden>
          ✓
        </span>
        <div className="font-display text-2xl font-bold">הפרטים התקבלו!</div>
        <p className={cn("m-0 text-base", dark ? "text-white/80" : "text-ink-secondary")}>
          נחזור אליכם {sentPhone ? <b className="tnum">ל-{sentPhone}</b> : "בהקדם"} — בדרך כלל
          תוך יום עסקים אחד.
        </p>
      </div>
    );
  }

  const errorClass = cn("m-0 mt-1 text-[13px]", dark ? "text-red-200" : "text-accent-text");

  // תוויות קבועות מעל השדות — placeholder נעלם בהקלדה ומשאיר שדות אנונימיים.
  const fieldLabelClass = cn(
    "mb-1 block text-[13px] font-bold",
    dark ? "text-white/85" : "text-ink-secondary",
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
        placeholder="ישראל ישראלי"
        autoComplete="name"
        className={inputClass}
        aria-invalid={Boolean(errors.full_name)}
      />
      {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
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
        placeholder="050-1234567"
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel"
        className={cn(inputClass, "tnum text-right placeholder:text-right")}
        aria-invalid={Boolean(errors.phone)}
      />
      {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
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
        placeholder="name@example.com"
        type="email"
        autoComplete="email"
        className={inputClass}
        aria-invalid={Boolean(errors.email)}
      />
      {errors.email && <p className={errorClass}>{errors.email.message}</p>}
    </div>
  );
  const submitButton = (
    <Button
      type="submit"
      variant="accent"
      disabled={status === "sending"}
      className={layout === "hero" ? "w-full sm:w-auto" : "w-full"}
    >
      {status === "sending" ? "שולחים…" : submitLabel}
    </Button>
  );

  return (
    <form onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-3", className)}>
      {layout === "hero" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {nameField}
            {phoneField}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            {emailField}
            {submitButton}
          </div>
        </>
      ) : (
        <>
          {nameField}
          {phoneField}
          {emailField}
        </>
      )}
      {topicOptions && topicOptions.length > 0 && (
        <Controller
          control={control}
          name="topic"
          render={({ field }) => (
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger aria-label={topicLabel} className={inputClass}>
                <SelectValue placeholder={topicLabel} />
              </SelectTrigger>
              <SelectContent>
                {topicOptions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}

      {/* Honeypot — hidden from humans, catches naive bots. */}
      <input
        {...register("company")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute h-0 w-0 overflow-hidden opacity-0"
      />

      <Controller
        control={control}
        name="data_consent"
        render={({ field }) => (
          <Label
            className={cn(
              "flex cursor-pointer items-start gap-2.5 text-[12.5px]",
              dark ? "text-white/75" : "text-ink-muted",
            )}
          >
            <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
            <span>
              ידוע לי כי המידע שאמסור יישמר במאגרי המידע של החברה בהתאם למפורט ב
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
        )}
      />
      {errors.data_consent && (
        <p className={cn(errorClass, "-mt-1")}>{errors.data_consent.message}</p>
      )}
      {withMarketingConsent && (
        <Controller
          control={control}
          name="marketing_consent"
          render={({ field }) => (
            <Label
              className={cn(
                "flex cursor-pointer items-start gap-2.5 text-[12.5px]",
                dark ? "text-white/75" : "text-ink-muted",
              )}
            >
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
              <span>אני מאשר/ת קבלת עדכונים ותוכן שיווקי (ניתן להסרה בכל עת)</span>
            </Label>
          )}
        />
      )}

      {layout !== "hero" && submitButton}
      {status === "error" && (
        <p className={cn("m-0 text-center text-[13px]", dark ? "text-red-200" : "text-accent-text")} role="alert">
          משהו השתבש בשליחה. נסו שוב או התקשרו אלינו:{" "}
          <a href={site.phoneHref} className="tnum font-bold underline underline-offset-2">
            {site.phone}
          </a>
        </p>
      )}
      <div className={cn("text-center text-[13.5px]", dark ? "text-white/70" : "text-ink-faint")}>
        ללא עלות וללא התחייבות — שכר טרחה רק בהצלחה
      </div>
    </form>
  );
}
