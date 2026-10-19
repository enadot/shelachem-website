"use client";

import { useActionState } from "react";
import { changePasswordAction, type PasswordState } from "../actions";
import { Field } from "@/components/admin/ui";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="סיסמה נוכחית" htmlFor="current">
        <Input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          required
          className="h-11 bg-white text-[15px]"
        />
      </Field>
      <Field label="סיסמה חדשה" htmlFor="next">
        <Input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          dir="ltr"
          required
          className="h-11 bg-white text-[15px]"
        />
      </Field>
      <Field label="שוב, לאימות" htmlFor="confirm">
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          dir="ltr"
          required
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
        {pending ? "שומר…" : "שמירת סיסמה"}
      </Button>
    </form>
  );
}
