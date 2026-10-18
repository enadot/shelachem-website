"use client";

import { useState, useTransition } from "react";
import { updateLeadAction } from "@/app/admin/(panel)/leads/actions";
import { LEAD_STATUS_OPTIONS } from "@/lib/admin/lead-status";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

/** שינוי סטטוס ישירות מהטבלה. */
export function LeadStatusSelect({ id, status, label }: { id: string; status: string | null; label?: string }) {
  const [value, setValue] = useState(status || "new");
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <select
      aria-label={label ?? "סטטוס"}
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        const prev = value;
        setValue(next);
        start(async () => {
          const res = await updateLeadAction({ id, status: next });
          if (!res.ok) {
            setValue(prev);
            toast(res.error ?? "השמירה נכשלה", "error");
          } else toast("הסטטוס עודכן");
        });
      }}
      className={cn(
        "min-h-10 cursor-pointer rounded-[10px] border-[1.5px] border-hairline bg-white px-3 text-[14px] font-bold",
        value === "new" ? "text-brand" : "text-ink-secondary",
      )}
    >
      {LEAD_STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
