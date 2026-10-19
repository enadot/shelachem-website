"use client";

import { useTransition } from "react";
import { retryBackupsAction } from "@/app/admin/(panel)/leads/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast";

export function RetryBackupsButton() {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await retryBackupsAction();
          if (res.ok) toast(res.sent === 1 ? "הליד הועבר ל-BARAM Leads" : `${res.sent} לידים הועברו ל-BARAM Leads`);
          else toast(res.error ?? "השליחה נכשלה", "error");
        })
      }
    >
      {pending ? "שולח…" : "שלח שוב ל-BARAM"}
    </Button>
  );
}
