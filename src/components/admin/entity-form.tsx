"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { FORMS } from "@/lib/admin/collections";
import { validate, emptyValue, type FieldConfig, type Values } from "@/lib/admin/fields";
import { uploadImageAction } from "@/app/admin/(panel)/upload-action";
import { Field, Switch, Textarea } from "@/components/admin/ui";
import { SaveBar } from "@/components/admin/save-bar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

export interface SaveResult {
  ok: boolean;
  error?: string;
  errors?: Record<string, string>;
  /** פריט חדש — לאן לעבור אחרי השמירה. */
  redirectTo?: string;
}

interface Ctx {
  errors: Record<string, string>;
  assetBase: string | null;
}

/**
 * טופס גנרי לכל מסך עריכה בלוח. ההגדרה (שדות, סוגים, חובה) נלקחת מ-`FORMS[form]`
 * — כאן מועבר רק המפתח, כי RegExp-ים של הבדיקה לא עוברים מהשרת ללקוח.
 */
export function EntityForm({
  form,
  initial,
  action,
  assetBase,
  extraActions,
  onSaved,
}: {
  form: keyof typeof FORMS;
  initial: Values;
  action: (values: Values) => Promise<SaveResult>;
  assetBase: string | null;
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
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus(),
      );
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
      className="flex flex-col gap-6 pb-24"
    >
      <div className="grid gap-x-6 gap-y-6 rounded-card border border-hairline bg-white p-5 md:grid-cols-2 md:p-7">
        <Fields
          fields={fields}
          values={values}
          path=""
          ctx={{ errors, assetBase }}
          onChange={(name, v) => setValues((cur) => ({ ...cur, [name]: v }))}
        />
      </div>
      <SaveBar dirty={dirty} pending={pending} extra={extraActions} />
    </form>
  );
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
          <select
            {...common}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[50px] w-full cursor-pointer rounded-[10px] border-[1.5px] border-hairline bg-field px-3 text-[16px] text-ink focus:border-brand focus:bg-white"
          >
            <option value="">— בחרו —</option>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      );
    case "checkboxes": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset className={cn("m-0 border-none p-0", span)}>
          <legend className="mb-2 p-0 text-[15px] font-bold text-ink">{label}</legend>
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
                    "min-h-10 cursor-pointer rounded-full border-[1.5px] px-4 text-[14.5px] font-bold transition-colors",
                    on ? "border-brand bg-brand text-white" : "border-hairline bg-white text-ink-secondary",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {error && <p className="m-0 mt-1 text-[13.5px] font-bold text-danger">{error}</p>}
        </fieldset>
      );
    }
    case "image":
      return (
        <Field label={label} hint={f.hint} error={error} className={span}>
          <ImageInput value={value as string} legacy={legacy as string} assetBase={ctx.assetBase} onChange={onChange} />
        </Field>
      );
    case "string-list":
      return (
        <StringList f={f} label={label} value={value as string[]} error={error} span={span} onChange={onChange} />
      );
    case "repeater":
      return <Repeater f={f} label={label} value={value as Values[]} path={path} ctx={ctx} onChange={onChange} />;
    case "group":
      return (
        <fieldset className="m-0 rounded-[12px] border border-hairline-soft p-4 md:col-span-2">
          <legend className="px-1 text-[15px] font-bold text-ink">{f.label}</legend>
          {f.hint && <p className="m-0 mb-3 text-[13.5px] text-ink-faint">{f.hint}</p>}
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
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] border border-hairline bg-white disabled:cursor-default disabled:opacity-30",
        danger ? "text-danger hover:border-danger" : "text-ink-secondary hover:border-brand hover:text-brand",
      )}
    >
      {children}
    </button>
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
      <legend className="mb-1 p-0 text-[15px] font-bold text-ink">{label}</legend>
      {f.hint && <p className="m-0 mb-2 text-[13.5px] text-ink-faint">{f.hint}</p>}
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {list.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="tnum mt-3 w-6 shrink-0 text-center text-[13px] text-ink-faint">{i + 1}</span>
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
            <div className="mt-1.5 flex shrink-0 gap-1">
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
      <button
        type="button"
        onClick={() => onChange([...list, ""])}
        className="mt-2 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed border-hairline bg-transparent px-4 text-[14.5px] font-bold text-brand hover:border-brand"
      >
        <Plus size={16} aria-hidden />
        הוספת {f.itemLabel ?? "פריט"}
      </button>
      {error && <p className="m-0 mt-1 text-[13.5px] font-bold text-danger">{error}</p>}
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
      <legend className="mb-1 p-0 text-[15px] font-bold text-ink">{label}</legend>
      {f.hint && <p className="m-0 mb-3 text-[13.5px] text-ink-faint">{f.hint}</p>}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {list.map((item, i) => {
          const title = String((f.itemTitle && item[f.itemTitle]) || "") || `${f.itemLabel ?? "פריט"} ${i + 1}`;
          const isOpen = open.has(i) || hasError(i);
          return (
            <li
              key={i}
              className={cn("rounded-[12px] border bg-surface/50", hasError(i) ? "border-danger" : "border-hairline")}
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex min-h-10 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent text-start text-[15px] font-bold text-ink"
                >
                  <span className="tnum text-[13px] text-ink-faint">{i + 1}</span>
                  <span className="truncate">{title}</span>
                  <ChevronDown size={16} aria-hidden className={cn("shrink-0 transition-transform", isOpen && "rotate-180")} />
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
                <IconButton
                  label={`מחיקת ${title}`}
                  danger
                  onClick={() => {
                    if (confirm(`למחוק את "${title}"?`)) onChange(list.filter((_, j) => j !== i));
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
              {isOpen && (
                <div className="grid gap-5 border-t border-hairline-soft bg-white p-4 md:grid-cols-2">
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
      <button
        type="button"
        onClick={() => {
          onChange([...list, Object.fromEntries(sub.map((s) => [s.name, emptyValue(s)]))]);
          setOpen((s) => new Set(s).add(list.length));
        }}
        className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed border-hairline bg-transparent px-4 text-[14.5px] font-bold text-brand hover:border-brand"
      >
        <Plus size={16} aria-hidden />
        הוספת {f.itemLabel ?? "פריט"}
      </button>
    </fieldset>
  );
}

/** כתובת תצוגה: נכס Directus לפי מזהה, או נתיב סטטי ישן מהאתר. */
function previewUrl(value: string | undefined, legacy: string | undefined, assetBase: string | null) {
  if (value) return assetBase ? `${assetBase}/assets/${value}?width=480&format=auto` : null;
  if (legacy && (legacy.startsWith("/") || legacy.startsWith("http"))) return legacy;
  return null;
}

function ImageInput({
  value,
  legacy,
  assetBase,
  onChange,
}: {
  value?: string;
  legacy?: string;
  assetBase: string | null;
  onChange: (v: unknown) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const src = previewUrl(value, legacy, assetBase);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-[120px] w-[180px] items-center justify-center overflow-hidden rounded-[10px] border border-hairline bg-surface">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- תצוגה מקדימה בלבד, מכל מקור
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus size={28} className="text-ink-faint" aria-hidden />
        )}
      </div>
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
            const fd = new FormData();
            fd.append("file", file);
            start(async () => {
              const res = await uploadImageAction(fd);
              if (res.ok) {
                onChange(res.id);
                toast("התמונה הועלתה — לא לשכוח לשמור");
              } else toast(res.error ?? "ההעלאה נכשלה", "error");
            });
          }}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
          className="min-h-10 cursor-pointer rounded-[10px] border-[1.5px] border-brand bg-white px-4 text-[14.5px] font-bold text-brand disabled:opacity-60"
        >
          {pending ? "מעלה…" : src ? "החלפת תמונה" : "העלאת תמונה"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="min-h-10 cursor-pointer border-none bg-transparent text-start text-[14px] text-danger"
          >
            הסרת התמונה
          </button>
        )}
        <span className="text-[12.5px] text-ink-faint">JPG / PNG / WebP, עד 10MB</span>
      </div>
    </div>
  );
}
