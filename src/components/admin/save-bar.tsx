"use client";

import { CircleCheck, CircleDot, Loader2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
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
        "sticky bottom-3 z-20 flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 backdrop-blur transition-all md:px-5",
        dirty ? "border-primary/40 bg-white shadow-lg shadow-primary/10" : "bg-white/90",
      )}
    >
      <span className="flex items-center gap-2 text-[14px] text-muted-foreground" aria-live="polite">
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : dirty ? (
          <CircleDot className="size-4 text-amber-500" aria-hidden />
        ) : (
          <CircleCheck className="size-4 text-emerald-600" aria-hidden />
        )}
        {pending ? "שומר…" : dirty ? "יש שינויים שלא נשמרו" : "הכול שמור"}
      </span>
      <div className="flex items-center gap-2">
        {extra}
        <Button type="submit" disabled={!dirty || pending}>
          {pending ? "שומר…" : label}
        </Button>
      </div>
    </div>
  );
}
