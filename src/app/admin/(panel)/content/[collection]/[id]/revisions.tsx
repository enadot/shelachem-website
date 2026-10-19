"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreRevisionAction } from "../../actions";
import { History } from "lucide-react";
import { Panel } from "@/components/admin/ui";
import { Button } from "@/components/admin/ui/button";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { useToast } from "@/components/admin/toast";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

/** גרסאות קודמות של הפריט — שחזור מחזיר את התוכן כפי שהיה לפני השמירה ההיא. */
export function Revisions({
  collection,
  id,
  revisions,
}: {
  collection: string;
  id: string;
  revisions: { id: number; savedAt: Date; savedBy: string | null }[];
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  return (
    <Panel
      title="גרסאות קודמות"
      description="לפני כל שמירה נשמר עותק של הגרסה הקודמת. שחזור מחזיר אותה לאתר מיד — והגרסה הנוכחית נשמרת גם היא."
      className="mt-4"
      contentClassName="py-1"
    >
      <ul className="m-0 list-none divide-y p-0">
        {revisions.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 py-2.5">
            <span className="flex min-w-0 items-center gap-3 text-[14px]">
              <History className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0">
                <span className="tnum font-bold">{fmt(r.savedAt)}</span>
                {r.savedBy && (
                  <span className="block truncate text-[12.5px] text-muted-foreground sm:inline"> · {r.savedBy}</span>
                )}
              </span>
            </span>
            <ConfirmButton
              title="לשחזר את הגרסה הזו?"
              description="התוכן הנוכחי יישמר כגרסה קודמת, והגרסה הזו תופיע באתר מיד."
              confirmLabel="שחזור"
              onConfirm={() =>
                start(async () => {
                  const res = await restoreRevisionAction(collection, id, r.id);
                  if (res.ok) {
                    toast("הגרסה שוחזרה");
                    router.refresh();
                  } else toast(res.error ?? "השחזור נכשל", "error");
                })
              }
            >
              <Button type="button" variant="outline" size="sm" disabled={pending}>
                שחזור
              </Button>
            </ConfirmButton>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
