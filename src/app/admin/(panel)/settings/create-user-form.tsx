"use client";

import { useState, useTransition } from "react";
import { createUserAction } from "./actions";
import { Field } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast";

export function CreateUserForm() {
  const empty = { name: "", email: "", password: "" };
  const [v, setV] = useState(empty);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <form
      className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await createUserAction(v);
          if (res.ok) {
            setV(empty);
            setError(undefined);
            toast("המשתמש נוצר — אפשר להתחבר עם הפרטים");
          } else setError(res.error);
        });
      }}
    >
      <Field label="שם" htmlFor="nu-name">
        <Input id="nu-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      </Field>
      <Field label="דוא״ל" htmlFor="nu-email">
        <Input id="nu-email" type="email" dir="ltr" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
      </Field>
      <Field label="סיסמה (10+ תווים)" htmlFor="nu-pass">
        <Input
          id="nu-pass"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          value={v.password}
          onChange={(e) => setV({ ...v, password: e.target.value })}
        />
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
  );
}
