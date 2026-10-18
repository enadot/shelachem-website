import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * אבני הבניין של לוח הבקרה — באותה שפה של האתר: משטחים שטוחים, קווי שיער,
 * כותרות RaananPro בניגוד 300↔900, מספרים ב-tnum. בלי צללים ובלי גרדיאנטים.
 */

export function PageTitle({
  title,
  strong,
  description,
  actions,
}: {
  title: string;
  strong?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="m-0 font-display text-[30px] font-light leading-[1.1] text-ink md:text-[40px]">
          {title} {strong && <span className="font-black">{strong}</span>}
        </h1>
        {description && (
          <p className="m-0 mt-2 max-w-[680px] text-[15.5px] leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-card border border-hairline bg-white p-5 md:p-7", className)}>
      {title && (
        <div className="mb-5">
          <h2 className="m-0 text-[19px] font-bold text-ink">{title}</h2>
          {description && (
            <p className="m-0 mt-1 text-[14.5px] leading-relaxed text-ink-muted">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/** תווית + הסבר + שגיאה סביב שדה. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[15px] font-bold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="m-0 text-[13.5px] leading-snug text-ink-faint">{hint}</p>}
      {error && (
        <p role="alert" className="m-0 text-[13.5px] font-bold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-[110px] w-full rounded-[10px] border-[1.5px] border-hairline bg-field px-4 py-3 text-[16px] leading-relaxed text-ink transition-colors placeholder:text-ink-faint focus:border-brand focus:bg-white aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

/** מתג כן/לא — כפתור עם role=switch (נגיש למקלדת ולקורא מסך). */
export function Switch({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <label htmlFor={id} className="text-[15px] font-bold text-ink">
          {label}
        </label>
        {description && (
          <p className="m-0 mt-1 text-[13.5px] leading-snug text-ink-faint">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-7 w-12 shrink-0 cursor-pointer rounded-full border-none transition-colors duration-200",
          checked ? "bg-brand" : "bg-hairline",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white transition-[inset-inline-start] duration-200",
            checked ? "start-6" : "start-1",
          )}
        />
      </button>
    </div>
  );
}

const badgeTone = {
  brand: "bg-surface-tag text-brand",
  gold: "bg-accent-tint-strong text-ink",
  ok: "bg-[#e3f4e8] text-[#15793a]",
  muted: "bg-surface text-ink-muted",
  danger: "bg-[#fbe6e6] text-danger",
} as const;

export function Badge({
  tone = "brand",
  children,
  className,
}: {
  tone?: keyof typeof badgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold",
        badgeTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-hairline bg-white px-6 py-14 text-center">
      <p className="m-0 text-lg font-bold text-ink">{title}</p>
      {children && <div className="mt-2 text-[15px] text-ink-muted">{children}</div>}
    </div>
  );
}
