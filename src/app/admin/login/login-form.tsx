"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";
import { Field } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="flex flex-col gap-5">
      <Field label="דוא״ל" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          dir="ltr"
          defaultValue={state.email}
          required
        />
      </Field>
      <Field label="סיסמה" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          required
          autoFocus={Boolean(state.error)}
        />
      </Field>
      {state.error && (
        <p role="alert" className="m-0 text-[14.5px] font-bold text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "מתחבר…" : "כניסה"}
      </Button>
    </form>
  );
}
