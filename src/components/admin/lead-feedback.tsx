"use client";

import { useState, useTransition } from "react";
import { addNoteAction, updateFeedbackAction } from "@/app/admin/(panel)/leads/actions";
import { Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

export interface FeedbackOption {
  id: number;
  name: string;
  action: "none" | "reason" | "reminder";
}

const selectClass =
  "min-h-10 cursor-pointer rounded-[10px] border-[1.5px] border-hairline bg-white px-3 text-[14px] font-bold";

/** שינוי משוב ישירות מהטבלה (משוב שדורש סיבה/מועד — דרך עמוד הליד). */
export function FeedbackSelect({
  id,
  value: initial,
  options,
  label,
}: {
  id: number;
  value: number | null;
  options: FeedbackOption[];
  label?: string;
}) {
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <select
      aria-label={label ?? "משוב"}
      value={value ?? ""}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value ? Number(e.target.value) : null;
        const prev = value;
        setValue(next);
        start(async () => {
          const res = await updateFeedbackAction({ id, feedbackId: next });
          if (!res.ok) {
            setValue(prev);
            toast(res.error ?? "השמירה נכשלה", "error");
          } else toast("המשוב עודכן ב-BARAM Leads");
        });
      }}
      className={cn(selectClass, value === null ? "text-brand" : "text-ink-secondary")}
    >
      <option value="">ללא משוב</option>
      {options.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  );
}

/** "2026-10-18T10:30" (שעון מקומי בדפדפן) → ISO עם אזור זמן. */
function localToIso(v: string) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** משוב מלא בעמוד הליד: כולל סיבה ("לא רלוונטי") ומועד חזרה ("לחזור מאוחר יותר"). */
export function FeedbackForm({ id, value, options }: { id: number; value: number | null; options: FeedbackOption[] }) {
  const [feedbackId, setFeedbackId] = useState<number | null>(value);
  const [reason, setReason] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [saved, setSaved] = useState(value);
  const [pending, start] = useTransition();
  const toast = useToast();
  const action = options.find((f) => f.id === feedbackId)?.action ?? "none";
  const dirty = feedbackId !== saved || (action === "reason" && reason) || (action === "reminder" && remindAt);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateFeedbackAction({
            id,
            feedbackId,
            reason: action === "reason" ? reason : undefined,
            remindAt: action === "reminder" && remindAt ? localToIso(remindAt) : undefined,
          });
          if (res.ok) {
            setSaved(feedbackId);
            setReason("");
            setRemindAt("");
            toast("המשוב עודכן ב-BARAM Leads");
          } else toast(res.error ?? "השמירה נכשלה", "error");
        });
      }}
    >
      <select
        aria-label="משוב"
        value={feedbackId ?? ""}
        onChange={(e) => setFeedbackId(e.target.value ? Number(e.target.value) : null)}
        className={cn(selectClass, "min-h-[50px] w-full text-[16px]")}
      >
        <option value="">ללא משוב</option>
        {options.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      {action === "reason" && (
        <Input aria-label="סיבה" placeholder="סיבה (לא חובה)" value={reason} onChange={(e) => setReason(e.target.value)} />
      )}
      {action === "reminder" && (
        <label className="flex flex-col gap-1 text-[13.5px] font-bold">
          מתי לחזור אליו (תיווצר משימה ב-BARAM)
          <Input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
        </label>
      )}
      <Button type="submit" size="sm" className="self-start" disabled={pending || !dirty}>
        {pending ? "שומר…" : "עדכון משוב"}
      </Button>
    </form>
  );
}

export function NoteForm({ id }: { id: number }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await addNoteAction({ id, text });
          if (res.ok) {
            setText("");
            toast("ההערה נוספה");
          } else toast(res.error ?? "השמירה נכשלה", "error");
        });
      }}
    >
      <Textarea
        aria-label="הערה חדשה"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="למשל: חזרנו אליו ב-10:30, ביקש לדבר שוב ביום ראשון…"
        rows={3}
      />
      <Button type="submit" size="sm" className="self-start" disabled={pending || !text.trim()}>
        {pending ? "מוסיף…" : "הוספת הערה"}
      </Button>
    </form>
  );
}
