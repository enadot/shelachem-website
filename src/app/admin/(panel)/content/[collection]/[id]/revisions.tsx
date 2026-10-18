"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreRevisionAction } from "../../actions";
import { Panel } from "@/components/admin/ui";
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
      className="mb-10"
    >
      <ul className="m-0 list-none p-0">
        {revisions.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 border-b border-hairline-soft py-2.5 last:border-none">
            <span className="text-[14.5px]">
              <span className="tnum font-bold">{fmt(r.savedAt)}</span>
              {r.savedBy && <span className="text-ink-muted"> · נשמר ע״י {r.savedBy}</span>}
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm("לשחזר את הגרסה הזו? התוכן הנוכחי יישמר כגרסה קודמת.")) return;
                start(async () => {
                  const res = await restoreRevisionAction(collection, id, r.id);
                  if (res.ok) {
                    toast("הגרסה שוחזרה");
                    router.refresh();
                  } else toast(res.error ?? "השחזור נכשל", "error");
                });
              }}
              className="min-h-10 cursor-pointer rounded-[10px] border-[1.5px] border-brand bg-white px-4 text-[14px] font-bold text-brand disabled:opacity-60"
            >
              שחזור
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
