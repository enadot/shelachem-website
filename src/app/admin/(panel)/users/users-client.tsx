"use client";

import { useState, useTransition } from "react";
import { createUserAction, resetPasswordAction, updateUserAction } from "./actions";
import { Field } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast";

const ROLES = [
  { value: "editor", label: "עורך אתר" },
  { value: "admin", label: "מנהל" },
] as const;

const selectClass =
  "min-h-10 cursor-pointer rounded-[10px] border-[1.5px] border-hairline bg-white px-3 text-[14px] font-bold disabled:opacity-60";

/** הסיסמה הזמנית מוצגת פעם אחת — להעביר למשתמש בערוץ בטוח. */
function TempPassword({ name, password }: { name: string; password: string }) {
  return (
    <div role="status" className="rounded-[10px] bg-accent-tint-strong p-4 text-[14.5px]">
      סיסמה זמנית ל{name}:{" "}
      <code dir="ltr" className="tnum select-all rounded bg-white px-2 py-1 font-bold">
        {password}
      </code>
      <p className="m-0 mt-2 text-[13.5px] text-ink-secondary">
        מוצגת רק עכשיו. שלחו אותה למשתמש — בכניסה הראשונה הוא יתבקש לבחור סיסמה משלו.
      </p>
    </div>
  );
}

export function CreateUserForm() {
  const empty = { name: "", email: "", role: "editor" as "editor" | "admin" };
  const [v, setV] = useState(empty);
  const [error, setError] = useState<string>();
  const [created, setCreated] = useState<{ name: string; password: string }>();
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-4">
      <form
        className="grid gap-4 md:grid-cols-[1fr_1fr_180px_auto] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await createUserAction(v);
            if (res.ok && res.password) {
              setCreated({ name: v.name, password: res.password });
              setV(empty);
              setError(undefined);
            } else setError(res.error);
          });
        }}
      >
        <Field label="שם" htmlFor="nu-name">
          <Input id="nu-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} required />
        </Field>
        <Field label="דוא״ל" htmlFor="nu-email">
          <Input
            id="nu-email"
            type="email"
            dir="ltr"
            value={v.email}
            onChange={(e) => setV({ ...v, email: e.target.value })}
            required
          />
        </Field>
        <Field label="הרשאה" htmlFor="nu-role">
          <select
            id="nu-role"
            value={v.role}
            onChange={(e) => setV({ ...v, role: e.target.value as "editor" | "admin" })}
            className={`${selectClass} min-h-[50px] text-[16px]`}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" size="sm" disabled={pending} className="min-h-[50px]">
          {pending ? "יוצר…" : "יצירת משתמש"}
        </Button>
        {error && (
          <p role="alert" className="m-0 text-[14px] font-bold text-danger md:col-span-4">
            {error}
          </p>
        )}
      </form>
      {created && <TempPassword {...created} />}
    </div>
  );
}

export function UserRowActions({
  id,
  name,
  role,
  active,
  self,
}: {
  id: string;
  name: string;
  role: "admin" | "editor";
  active: boolean;
  self: boolean;
}) {
  const [pending, start] = useTransition();
  const [password, setPassword] = useState<string>();
  const toast = useToast();
  const run = (fn: () => Promise<{ ok: boolean; error?: string; password?: string }>, done: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return toast(res.error ?? "הפעולה נכשלה", "error");
      if (res.password) setPassword(res.password);
      toast(done);
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={`הרשאה — ${name}`}
          value={role}
          disabled={pending || self}
          onChange={(e) => run(() => updateUserAction({ id, role: e.target.value as "admin" | "editor" }), "ההרשאה עודכנה")}
          className={selectClass}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (confirm(`לאפס את הסיסמה של ${name}? הוא ינותק מכל המכשירים.`)) {
              run(() => resetPasswordAction(id), "נוצרה סיסמה זמנית");
            }
          }}
        >
          איפוס סיסמה
        </Button>
        {!self && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            className={active ? "text-danger" : undefined}
            onClick={() => run(() => updateUserAction({ id, active: !active }), active ? "המשתמש הושבת" : "המשתמש הופעל")}
          >
            {active ? "השבתה" : "הפעלה"}
          </Button>
        )}
      </div>
      {password && <TempPassword name={name} password={password} />}
    </div>
  );
}
