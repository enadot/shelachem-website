"use client";

import { useActionState } from "react";
import { changePasswordAction, type PasswordState } from "../actions";
import { Field } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="flex flex-col gap-5">
      <Field label="סיסמה נוכחית" htmlFor="current">
        <Input id="current" name="current" type="password" autoComplete="current-password" dir="ltr" required />
      </Field>
      <Field label="סיסמה חדשה" htmlFor="next">
        <Input id="next" name="next" type="password" autoComplete="new-password" dir="ltr" required />
      </Field>
      <Field label="שוב, לאימות" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" dir="ltr" required />
      </Field>
      {state.error && (
        <p role="alert" className="m-0 text-[14.5px] font-bold text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "שומר…" : "שמירת סיסמה"}
      </Button>
    </form>
  );
}
