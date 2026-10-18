"use client";

import { useState, useTransition } from "react";
import { updateLeadAction } from "@/app/admin/(panel)/leads/actions";
import { Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast";

export function LeadNotes({ id, initial }: { id: string; initial: string }) {
  const [notes, setNotes] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <div className="flex flex-col gap-3">
      <Textarea
        aria-label="הערות פנימיות"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="למשל: חזרנו אליו ב-10:30, ביקש לדבר שוב ביום ראשון…"
        rows={6}
      />
      <Button
        size="sm"
        className="self-start"
        disabled={pending || notes === saved}
        onClick={() =>
          start(async () => {
            const res = await updateLeadAction({ id, notes });
            if (res.ok) {
              setSaved(notes);
              toast("ההערות נשמרו");
            } else toast(res.error ?? "השמירה נכשלה", "error");
          })
        }
      >
        {pending ? "שומר…" : "שמירת הערות"}
      </Button>
    </div>
  );
}
