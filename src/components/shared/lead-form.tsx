"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

const schema = z.object({
  full_name: z.string().trim().min(2, "נא להזין שם מלא"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{1,2}-?\d{7}$/, "נא להזין מספר טלפון ישראלי תקין"),
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
  className,
}: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
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
      topic: "",
      data_consent: false,
      marketing_consent: false,
      company: "",
    },
  });

  const dark = variant === "dark";

  const inputClass = cn(
    "focus-brand w-full min-h-12 rounded-[10px] border px-4 py-3 text-base transition-colors",
    dark
      ? "border-white/25 bg-white/10 text-white placeholder:text-white/60"
      : "border-[#cbd5e1] bg-white text-ink placeholder:text-ink-faint",
  );

  const onSubmit = handleSubmit(async (values) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.full_name,
          phone: values.phone,
          email: values.email,
          topic: values.topic || undefined,
          source_page: sourcePage,
          marketing_consent: values.marketing_consent,
          company: values.company,
        }),
      });
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
          נציג שלנו יחזור אליכם בהקדם — בדרך כלל תוך יום עסקים אחד.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-3", className)}>
      <div>
        <input
          {...register("full_name")}
          aria-label="שם מלא (שדה חובה)"
          placeholder="*שם מלא"
          autoComplete="name"
          className={inputClass}
          aria-invalid={Boolean(errors.full_name)}
        />
        {errors.full_name && (
          <p className={cn("m-0 mt-1 text-[13px]", dark ? "text-red-200" : "text-accent-text")}>
            {errors.full_name.message}
          </p>
        )}
      </div>
      <div>
        <input
          {...register("phone")}
          aria-label="טלפון (שדה חובה)"
          placeholder="*טלפון"
          type="tel"
          autoComplete="tel"
          className={cn(inputClass, "tnum")}
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone && (
          <p className={cn("m-0 mt-1 text-[13px]", dark ? "text-red-200" : "text-accent-text")}>
            {errors.phone.message}
          </p>
        )}
      </div>
      <div>
        <input
          {...register("email")}
          aria-label="דוא״ל (אופציונלי)"
          placeholder="דואר אלקטרוני"
          type="email"
          autoComplete="email"
          className={inputClass}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && (
          <p className={cn("m-0 mt-1 text-[13px]", dark ? "text-red-200" : "text-accent-text")}>
            {errors.email.message}
          </p>
        )}
      </div>
      {topicOptions && topicOptions.length > 0 && (
        <select
          {...register("topic")}
          aria-label={topicLabel}
          className={cn(inputClass, "cursor-pointer")}
          defaultValue=""
        >
          <option value="" disabled>
            {topicLabel}
          </option>
          {topicOptions.map((o) => (
            <option key={o} value={o} className="text-ink">
              {o}
            </option>
          ))}
        </select>
      )}

      {/* Honeypot — hidden from humans, catches naive bots. */}
      <input
        {...register("company")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute h-0 w-0 overflow-hidden opacity-0"
      />

      <label
        className={cn(
          "flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-normal",
          dark ? "text-white/75" : "text-ink-muted",
        )}
      >
        <input
          type="checkbox"
          {...register("data_consent")}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer"
        />
        <span>ידוע לי כי המידע שאמסור יישמר במאגרי המידע של החברה בהתאם למפורט במדיניות הפרטיות</span>
      </label>
      {errors.data_consent && (
        <p className={cn("m-0 -mt-1 text-[13px]", dark ? "text-red-200" : "text-accent-text")}>
          {errors.data_consent.message}
        </p>
      )}
      {withMarketingConsent && (
        <label
          className={cn(
            "flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-normal",
            dark ? "text-white/75" : "text-ink-muted",
          )}
        >
          <input
            type="checkbox"
            {...register("marketing_consent")}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer"
          />
          <span>אני מאשר/ת קבלת עדכונים ותוכן שיווקי (ניתן להסרה בכל עת)</span>
        </label>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="pill focus-brand min-h-[50px] w-full cursor-pointer border-none bg-accent px-7 py-3 text-[17px] font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "sending" ? "שולחים…" : submitLabel}
      </button>
      {status === "error" && (
        <p className={cn("m-0 text-center text-[13px]", dark ? "text-red-200" : "text-accent-text")} role="alert">
          משהו השתבש בשליחה. נסו שוב או התקשרו אלינו.
        </p>
      )}
      <div className={cn("text-center text-[13.5px]", dark ? "text-white/70" : "text-ink-faint")}>
        ללא עלות וללא התחייבות — שכר טרחה רק בהצלחה
      </div>
    </form>
  );
}
