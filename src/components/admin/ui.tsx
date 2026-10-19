import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge as UiBadge } from "@/components/admin/ui/badge";
import { Label } from "@/components/admin/ui/label";
import { Switch as UiSwitch } from "@/components/admin/ui/switch";
import { Textarea as UiTextarea } from "@/components/admin/ui/textarea";

/**
 * אבני הבניין של לוח הבקרה, מעל רכיבי shadcn/ui (src/components/admin/ui).
 * שפה: משטחים לבנים על רקע #f4f6fb, קווי שיער, כותרות RaananPro, מספרים ב-tnum.
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
    <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="m-0 font-display text-[26px] font-light leading-tight tracking-tight text-foreground md:text-[32px]">
          {title} {strong && <span className="font-black">{strong}</span>}
        </h1>
        {description && (
          <div className="m-0 mt-1.5 max-w-[720px] text-[15px] leading-relaxed text-muted-foreground">{description}</div>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** כרטיס עם כותרת ותיאור — היחידה הבסיסית של כל מסך. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn("gap-0 py-0 shadow-none", className)}>
      {title && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b px-5 py-4 md:px-6">
          <div className="min-w-0">
            <CardTitle className="text-[16.5px] font-bold">{title}</CardTitle>
            {description && <CardDescription className="mt-1 text-[14px] leading-relaxed">{description}</CardDescription>}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn("px-5 py-5 md:px-6", contentClassName)}>{children}</CardContent>
    </Card>
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
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor} className="text-[14.5px] font-bold text-foreground">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="m-0 text-[13px] leading-snug text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="m-0 text-[13px] font-bold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <UiTextarea className={cn("min-h-[110px] bg-white text-[15px] leading-relaxed", className)} {...props} />;
}

/** מתג כן/לא עם תווית והסבר. */
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
    <div className="flex items-start justify-between gap-6 rounded-lg border bg-white p-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-[14.5px] font-bold">
          {label}
        </Label>
        {description && <p className="m-0 mt-1 text-[13px] leading-snug text-muted-foreground">{description}</p>}
      </div>
      <UiSwitch id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5" />
    </div>
  );
}

const badgeTone = {
  brand: "bg-secondary text-primary",
  gold: "bg-accent-tint-strong text-ink",
  ok: "bg-[#e3f4e8] text-[#15793a]",
  muted: "bg-muted text-muted-foreground",
  danger: "bg-[#fbe6e6] text-destructive",
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
    <UiBadge variant="secondary" className={cn("px-2.5 py-0.5 text-[12.5px] font-bold", badgeTone[tone], className)}>
      {children}
    </UiBadge>
  );
}

export function EmptyState({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-white px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">{icon}</div>
      )}
      <p className="m-0 text-[16px] font-bold text-foreground">{title}</p>
      {children && <div className="mt-1.5 max-w-sm text-[14.5px] text-muted-foreground">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** אותיות ראשונות לאווטאר ("אביב כהן" → "אכ"). */
export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("") || "?"
  );
}
