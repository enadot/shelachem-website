"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** פס שמירה דביק בתחתית הטופס — בולט כשיש שינויים שלא נשמרו. */
export function SaveBar({
  dirty,
  pending,
  label = "שמירה",
  extra,
}: {
  dirty: boolean;
  pending: boolean;
  label?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-card border px-5 py-3 transition-colors",
        dirty ? "border-brand bg-white shadow-[0_12px_32px_rgba(4,8,40,0.14)]" : "border-hairline bg-white/90",
      )}
    >
      <span className="text-[14.5px] text-ink-muted" aria-live="polite">
        {pending ? "שומר…" : dirty ? "יש שינויים שלא נשמרו" : "הכול שמור"}
      </span>
      <div className="flex items-center gap-2">
        {extra}
        <Button type="submit" size="sm" disabled={!dirty || pending}>
          {pending ? "שומר…" : label}
        </Button>
      </div>
    </div>
  );
}
