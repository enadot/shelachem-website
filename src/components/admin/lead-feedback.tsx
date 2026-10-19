"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { addNoteAction, updateFeedbackAction } from "@/app/admin/(panel)/leads/actions";
import { Field, Textarea } from "@/components/admin/ui";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

export interface FeedbackOption {
  id: number;
  name: string;
  action: "none" | "reason" | "reminder";
}

/** Radix Select לא מקבל ערך ריק — "ללא משוב" מיוצג כ-"none". */
const NONE = "none";
const toValue = (id: number | null) => (id === null ? NONE : String(id));
const fromValue = (v: string) => (v === NONE ? null : Number(v));

function FeedbackItems({ options }: { options: FeedbackOption[] }) {
  return (
    <SelectContent>
      <SelectItem value={NONE}>ללא משוב</SelectItem>
      {options.map((f) => (
        <SelectItem key={f.id} value={String(f.id)}>
          {f.name}
        </SelectItem>
      ))}
    </SelectContent>
  );
}

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
    <Select
      value={toValue(value)}
      disabled={pending}
      onValueChange={(v) => {
        const next = fromValue(v);
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
    >
      <SelectTrigger
        aria-label={label ?? "משוב"}
        size="sm"
        className={cn(
          "w-full min-w-[150px] bg-white font-bold md:w-[170px]",
          value === null ? "border-amber-300 bg-amber-50 text-amber-900" : "text-foreground",
        )}
      >
        {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
        <SelectValue />
      </SelectTrigger>
      <FeedbackItems options={options} />
    </Select>
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
      className="flex flex-col gap-4"
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
      <Select value={toValue(feedbackId)} onValueChange={(v) => setFeedbackId(fromValue(v))}>
        <SelectTrigger aria-label="משוב" className="h-10 w-full bg-white text-[15px]">
          <SelectValue />
        </SelectTrigger>
        <FeedbackItems options={options} />
      </Select>
      {action === "reason" && (
        <Field label="סיבה" hint="לא חובה" htmlFor="fb-reason">
          <Input id="fb-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="h-10 bg-white" />
        </Field>
      )}
      {action === "reminder" && (
        <Field label="מתי לחזור אליו" hint="תיווצר משימה ב-BARAM Leads" htmlFor="fb-remind">
          <Input
            id="fb-remind"
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            className="h-10 bg-white"
          />
        </Field>
      )}
      <Button type="submit" className="self-start" disabled={pending || !dirty}>
        {pending && <Loader2 className="animate-spin" aria-hidden />}
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
        className="min-h-[90px]"
      />
      <Button type="submit" variant="secondary" className="self-start" disabled={pending || !text.trim()}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
        {pending ? "מוסיף…" : "הוספת הערה"}
      </Button>
    </form>
  );
}
