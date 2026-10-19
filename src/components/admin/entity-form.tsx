"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { FORMS } from "@/lib/admin/collections";
import { validate, emptyValue, type FieldConfig, type Values } from "@/lib/admin/fields";
import { upload } from "@vercel/blob/client";
import { Field, Switch, Textarea } from "@/components/admin/ui";
import { SaveBar } from "@/components/admin/save-bar";
import { Input as UiInput } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <UiInput className={cn("h-10 bg-white text-[15px]", className)} {...props} />;
}

/** Radix Select לא מקבל ערך ריק — "בלי בחירה" מיוצג כך. */
const NO_VALUE = "__none";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** שם קובץ בטוח ל-URL (עברית ורווחים → מקפים); Blob מוסיף סיומת אקראית. */
function safeFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext =
    dot > 0
      ? name
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      : "jpg";
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "image"}.${ext || "jpg"}`;
}

function uploadError(err: unknown) {
  const msg = err instanceof Error ? err.message : "";
  // השגיאה מהשרת (התחברות, נתיב) מגיעה כטקסט בעברית; שגיאות רשת/ספרייה — הודעה כללית.
  return /[\u0590-\u05FF]/.test(msg) ? msg.replace(/^Vercel Blob:\s*/, "") : "ההעלאה נכשלה — נסו שוב";
}

export interface SaveResult {
  ok: boolean;
  error?: string;
  errors?: Record<string, string>;
  /** פריט חדש — לאן לעבור אחרי השמירה. */
  redirectTo?: string;
}

interface Ctx {
  errors: Record<string, string>;
}

/**
 * טופס גנרי לכל מסך עריכה בלוח. ההגדרה (שדות, סוגים, חובה) נלקחת מ-`FORMS[form]`
 * — כאן מועבר רק המפתח, כי RegExp-ים של הבדיקה לא עוברים מהשרת ללקוח.
 */
export function EntityForm({
  form,
  initial,
  action,
  extraActions,
  onSaved,
}: {
  form: keyof typeof FORMS;
  initial: Values;
  action: (values: Values) => Promise<SaveResult>;
  extraActions?: React.ReactNode;
  onSaved?: (res: SaveResult) => void;
}) {
  const fields = FORMS[form].fields;
  const [values, setValues] = useState<Values>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const toast = useToast();
  const dirty = JSON.stringify(values) !== saved;

  const submit = () => {
    const found = validate(fields, values);
    setErrors(found);
    if (Object.keys(found).length) {
      toast("יש שדות שצריך לתקן", "error");
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return;
    }
    start(async () => {
      const res = await action(values);
      if (res.ok) {
        setSaved(JSON.stringify(values));
        toast("נשמר — האתר מעודכן");
        onSaved?.(res);
        if (res.redirectTo) window.location.assign(res.redirectTo);
      } else {
        setErrors(res.errors ?? {});
        toast(res.error ?? "השמירה נכשלה", "error");
      }
    });
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-4 pb-6"
    >
      {sections(fields).map((sec, i) => (
        <Card key={i} className="gap-0 py-0 shadow-none">
          {sec.title && (
            <div className="border-b px-5 py-4 md:px-7">
              <h2 className="m-0 font-body text-[16px] font-bold text-foreground">{sec.title}</h2>
              {sec.description && <p className="m-0 mt-1 text-[13.5px] text-muted-foreground">{sec.description}</p>}
            </div>
          )}
          <div className="grid gap-x-6 gap-y-6 p-5 md:grid-cols-2 md:p-7">
            <Fields
              fields={sec.fields}
              values={values}
              path=""
              ctx={{ errors }}
              onChange={(name, v) => setValues((cur) => ({ ...cur, [name]: v }))}
            />
          </div>
        </Card>
      ))}
      <SaveBar dirty={dirty} pending={pending} extra={extraActions} />
    </form>
  );
}

/**
 * חלוקה לכרטיסים: שדות פשוטים יחד, וכל רשימה/קבוצה ברמה העליונה (סניפים, רשתות,
 * שעות…) בכרטיס משלה, עם הכותרת שלה כראש הכרטיס.
 */
function sections(fields: FieldConfig[]) {
  const out: { title?: string; description?: string; fields: FieldConfig[] }[] = [];
  for (const f of fields) {
    if (f.type === "repeater" || f.type === "group") {
      out.push({ title: f.label, description: f.hint, fields: [{ ...f, label: "", hint: undefined }] });
    } else {
      const last = out[out.length - 1];
      if (last && !last.title) last.fields.push(f);
      else out.push({ fields: [f] });
    }
  }
  return out;
}

function Fields({
  fields,
  values,
  path,
  ctx,
  onChange,
}: {
  fields: FieldConfig[];
  values: Values;
  path: string;
  ctx: Ctx;
  onChange: (name: string, v: unknown) => void;
}) {
  return (
    <>
      {fields.map((f) => (
        <FieldInput
          key={f.name}
          f={f}
          value={values[f.name]}
          path={`${path}${f.name}`}
          ctx={ctx}
          legacy={f.legacyField ? values[f.legacyField] : undefined}
          onChange={(v) => onChange(f.name, v)}
        />
      ))}
    </>
  );
}

function FieldInput({
  f,
  value,
  path,
  ctx,
  legacy,
  onChange,
}: {
  f: FieldConfig;
  value: unknown;
  path: string;
  ctx: Ctx;
  legacy?: unknown;
  onChange: (v: unknown) => void;
}) {
  const error = ctx.errors[path];
  const id = `f-${path.replace(/\./g, "-")}`;
  const wide = !f.half || ["repeater", "group", "string-list", "textarea", "checkboxes"].includes(f.type);
  const span = wide ? "md:col-span-2" : "";
  const label = f.required ? `${f.label} *` : f.label;
  const common = { id, "aria-invalid": Boolean(error), dir: f.ltr ? ("ltr" as const) : undefined };

  switch (f.type) {
    case "boolean":
      return (
        <div className={span}>
          <Switch id={id} checked={value === true} onChange={onChange} label={f.label} description={f.hint} />
        </div>
      );
    case "textarea":
      return (
        <Field label={label} hint={f.hint} error={error} htmlFor={id} className={span}>
          <Textarea
            {...common}
            rows={f.rows ?? 4}
            value={String(value ?? "")}
            placeholder={f.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    case "select":
      return (
        <Field label={label} hint={f.hint} error={error} htmlFor={id} className={span}>
          <Select value={String(value || NO_VALUE)} onValueChange={(v) => onChange(v === NO_VALUE ? "" : v)}>
            <SelectTrigger id={id} aria-invalid={Boolean(error)} className="h-10 w-full bg-white text-[15px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_VALUE}>— בחרו —</SelectItem>
              {f.options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );
    case "checkboxes": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset className={cn("m-0 border-none p-0", span)}>
          <legend className="mb-2 p-0 text-[14.5px] font-bold text-foreground">{label}</legend>
          <div className="flex flex-wrap gap-2">
            {f.options?.map((o) => {
              const on = list.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange(on ? list.filter((x) => x !== o.value) : [...list, o.value])}
                  className={cn(
                    "min-h-9 cursor-pointer rounded-full border px-3.5 text-[14px] font-bold transition-colors",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-white text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {error && <p className="m-0 mt-1 text-[13px] font-bold text-destructive">{error}</p>}
        </fieldset>
      );
    }
    case "image":
      return (
        <Field label={label} hint={f.hint} error={error} className={span}>
          <ImageInput value={value as string} legacy={legacy as string} onChange={onChange} />
        </Field>
      );
    case "string-list":
      return <StringList f={f} label={label} value={value as string[]} error={error} span={span} onChange={onChange} />;
    case "repeater":
      return <Repeater f={f} label={label} value={value as Values[]} path={path} ctx={ctx} onChange={onChange} />;
    case "group":
      return (
        <fieldset className={cn("m-0 md:col-span-2", f.label ? "rounded-xl border bg-muted/40 p-4" : "border-none p-0")}>
          {f.label && <legend className="px-1 text-[14.5px] font-bold text-foreground">{f.label}</legend>}
          {f.hint && <p className="m-0 mb-3 text-[13px] text-muted-foreground">{f.hint}</p>}
          <div className="grid gap-5 md:grid-cols-2">
            <Fields
              fields={f.fields ?? []}
              values={(value ?? {}) as Values}
              path={`${path}.`}
              ctx={ctx}
              onChange={(name, v) => onChange({ ...((value ?? {}) as Values), [name]: v })}
            />
          </div>
        </fieldset>
      );
    default:
      return (
        <Field label={label} hint={f.hint} error={error} htmlFor={id} className={span}>
          <Input
            {...common}
            type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
            value={value == null ? "" : String(value)}
            placeholder={f.placeholder}
            maxLength={f.maxLength}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
  }
}

/** כפתור קטן ומרובע לפעולות על פריט (הזזה/מחיקה). */
function IconButton({
  label,
  onClick,
  disabled,
  children,
  danger,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn("bg-white", danger ? "text-destructive hover:text-destructive" : "text-muted-foreground")}
    >
      {children}
    </Button>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="mt-3 border-dashed bg-white text-primary">
      <Plus aria-hidden />
      הוספת {label}
    </Button>
  );
}

const move = <T,>(list: T[], from: number, to: number) => {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

function StringList({
  f,
  label,
  value,
  error,
  span,
  onChange,
}: {
  f: FieldConfig;
  label: string;
  value: string[];
  error?: string;
  span: string;
  onChange: (v: unknown) => void;
}) {
  const list = Array.isArray(value) ? value : [];
  const long = (f.rows ?? 1) > 1;
  return (
    <fieldset className={cn("m-0 border-none p-0", span)}>
      <legend className="mb-1 p-0 text-[14.5px] font-bold text-foreground">{label}</legend>
      {f.hint && <p className="m-0 mb-2 text-[13px] text-muted-foreground">{f.hint}</p>}
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {list.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="tnum mt-2.5 w-6 shrink-0 text-center text-[13px] text-muted-foreground">{i + 1}</span>
            {long ? (
              <Textarea
                aria-label={`${f.itemLabel ?? "פריט"} ${i + 1}`}
                rows={f.rows}
                value={item}
                onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ) : (
              <Input
                aria-label={`${f.itemLabel ?? "פריט"} ${i + 1}`}
                value={item}
                onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))}
              />
            )}
            <div className="mt-1 flex shrink-0 gap-1">
              <IconButton label="הזזה למעלה" disabled={i === 0} onClick={() => onChange(move(list, i, i - 1))}>
                <ChevronUp size={16} />
              </IconButton>
              <IconButton
                label="הזזה למטה"
                disabled={i === list.length - 1}
                onClick={() => onChange(move(list, i, i + 1))}
              >
                <ChevronDown size={16} />
              </IconButton>
              <IconButton label="מחיקה" danger onClick={() => onChange(list.filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          </li>
        ))}
      </ol>
      <AddButton label={f.itemLabel ?? "פריט"} onClick={() => onChange([...list, ""])} />
      {error && <p className="m-0 mt-1 text-[13px] font-bold text-destructive">{error}</p>}
    </fieldset>
  );
}

function Repeater({
  f,
  label,
  value,
  path,
  ctx,
  onChange,
}: {
  f: FieldConfig;
  label: string;
  value: Values[];
  path: string;
  ctx: Ctx;
  onChange: (v: unknown) => void;
}) {
  const list = Array.isArray(value) ? value : [];
  const sub = f.fields ?? [];
  // פריטים חדשים נפתחים; קיימים מכווצים כשיש הרבה — שהמסך לא יהיה קיר של שדות.
  const [open, setOpen] = useState<Set<number>>(() => new Set(list.length <= 2 ? list.map((_, i) => i) : []));
  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const hasError = (i: number) => Object.keys(ctx.errors).some((k) => k.startsWith(`${path}.${i}.`));

  return (
    <fieldset className="m-0 border-none p-0 md:col-span-2">
      {label && <legend className="mb-1 p-0 text-[14.5px] font-bold text-foreground">{label}</legend>}
      {f.hint && <p className="m-0 mb-3 text-[13px] text-muted-foreground">{f.hint}</p>}
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {list.map((item, i) => {
          const title = String((f.itemTitle && item[f.itemTitle]) || "") || `${f.itemLabel ?? "פריט"} ${i + 1}`;
          const isOpen = open.has(i) || hasError(i);
          return (
            <li
              key={i}
              className={cn("overflow-hidden rounded-xl border bg-muted/40", hasError(i) && "border-destructive")}
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent text-start text-[14.5px] font-bold text-foreground"
                >
                  <span className="tnum flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate">{title}</span>
                  <ChevronDown
                    size={16}
                    aria-hidden
                    className={cn("shrink-0 transition-transform", isOpen && "rotate-180")}
                  />
                </button>
                <IconButton label="הזזה למעלה" disabled={i === 0} onClick={() => onChange(move(list, i, i - 1))}>
                  <ChevronUp size={16} />
                </IconButton>
                <IconButton
                  label="הזזה למטה"
                  disabled={i === list.length - 1}
                  onClick={() => onChange(move(list, i, i + 1))}
                >
                  <ChevronDown size={16} />
                </IconButton>
                <ConfirmButton
                  title={`למחוק את "${title}"?`}
                  description="הפריט יוסר מהרשימה. השינוי נשמר רק כשלוחצים על שמירה."
                  confirmLabel="מחיקה"
                  destructive
                  onConfirm={() => onChange(list.filter((_, j) => j !== i))}
                >
                  <IconButton label={`מחיקת ${title}`} danger>
                    <Trash2 size={16} />
                  </IconButton>
                </ConfirmButton>
              </div>
              {isOpen && (
                <div className="grid gap-5 border-t bg-white p-4 md:grid-cols-2">
                  <Fields
                    fields={sub}
                    values={item}
                    path={`${path}.${i}.`}
                    ctx={ctx}
                    onChange={(name, v) => onChange(list.map((x, j) => (j === i ? { ...x, [name]: v } : x)))}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <AddButton
        label={f.itemLabel ?? "פריט"}
        onClick={() => {
          onChange([...list, Object.fromEntries(sub.map((s) => [s.name, emptyValue(s)]))]);
          setOpen((s) => new Set(s).add(list.length));
        }}
      />
    </fieldset>
  );
}

/** כתובת תצוגה: התמונה שהועלתה (Vercel Blob), או נתיב סטטי ישן מהאתר. */
const isImageUrl = (v: string | undefined) => Boolean(v && /^(https?:\/\/|\/)/.test(v));
function previewUrl(value: string | undefined, legacy: string | undefined) {
  if (isImageUrl(value)) return value!;
  if (isImageUrl(legacy)) return legacy!;
  return null;
}

function ImageInput({ value, legacy, onChange }: { value?: string; legacy?: string; onChange: (v: unknown) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const src = previewUrl(value, legacy);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={pending}
        aria-label={src ? "החלפת תמונה" : "העלאת תמונה"}
        className="relative flex h-[130px] w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/60 p-0 transition-colors hover:border-primary/60"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- תצוגה מקדימה בלבד, מכל מקור
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-[13px] text-muted-foreground">
            <ImagePlus size={26} aria-hidden />
            לחצו להעלאה
          </span>
        )}
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
          </span>
        )}
      </button>
      <div className="flex flex-col gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (!IMAGE_TYPES.includes(file.type)) return toast("רק JPG, PNG, WebP או AVIF", "error");
            if (file.size > MAX_IMAGE_BYTES) return toast("הקובץ גדול מ-10MB", "error");
            start(async () => {
              try {
                const blob = await upload(`uploads/${safeFileName(file.name)}`, file, {
                  access: "public",
                  handleUploadUrl: "/admin/upload",
                });
                onChange(blob.url);
                toast("התמונה הועלתה — לא לשכוח לשמור");
              } catch (err) {
                toast(uploadError(err), "error");
              }
            });
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
          className="bg-white"
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Upload aria-hidden />}
          {pending ? "מעלה…" : src ? "החלפת תמונה" : "העלאת תמונה"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" onClick={() => onChange("")} className="justify-start text-destructive">
            <Trash2 aria-hidden />
            הסרת התמונה
          </Button>
        )}
        <span className="text-[12px] text-muted-foreground">JPG / PNG / WebP, עד 10MB</span>
      </div>
    </div>
  );
}
