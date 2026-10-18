"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { migrateAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast";

/** מוצג כשחסרים ב-CMS שדות שהלוח צריך. רק admin יכול להריץ את העדכון. */
export function MigrationBanner({ isAdmin, missing }: { isAdmin: boolean; missing: number }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const toast = useToast();
  const router = useRouter();

  return (
    <div
      role="status"
      className="mb-8 flex flex-col gap-3 rounded-card border border-gold-deep/40 bg-accent-tint px-5 py-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p className="m-0 font-bold text-ink">נדרש עדכון מבנה חד-פעמי למערכת התוכן</p>
        <p className="m-0 mt-1 text-[14.5px] text-ink-secondary">
          {isAdmin
            ? `חסרים ${missing} שדות שהלוח משתמש בהם (שיווק, פרטי קשר, סטטוס לידים). העדכון בטוח ולא משנה תוכן קיים.`
            : "יש לבקש ממנהל המערכת להתחבר וללחוץ על “עדכון מבנה”. עד אז חלק מההגדרות לא יישמרו."}
        </p>
        {error && <p className="m-0 mt-2 text-[14px] font-bold text-danger">{error}</p>}
      </div>
      {isAdmin && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await migrateAction();
              if (!res.ok) return setError(res.error);
              toast("המבנה עודכן");
              router.refresh();
            })
          }
        >
          {pending ? "מעדכן…" : "עדכון מבנה"}
        </Button>
      )}
    </div>
  );
}
