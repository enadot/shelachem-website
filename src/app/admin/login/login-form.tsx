"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";
import { Field } from "@/components/admin/ui";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="דוא״ל" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          dir="ltr"
          defaultValue={state.email}
          required
          className="h-11 bg-white text-[15px]"
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
          className="h-11 bg-white text-[15px]"
        />
      </Field>
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription className="font-bold">{state.error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" size="lg" disabled={pending} className="mt-1 h-11 w-full text-[15px]">
        {pending && <Loader2 className="animate-spin" aria-hidden />}
        {pending ? "מתחבר…" : "כניסה"}
      </Button>
    </form>
  );
}
