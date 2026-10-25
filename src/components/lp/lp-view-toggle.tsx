"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * מתג תצוגה צף — רק מחוץ לפרודקשן (העמוד לא מרנדר אותו ב-`VERCEL_ENV=production`).
 * "פרודקשן" = `?view=production`, שמציג בדיוק את מה שפרודקשן יציג: בלי טענות
 * שלא אושרו ובלי תגים.
 */
export function LpViewToggle({ strict, pendingCount }: { strict: boolean; pendingCount: number }) {
  const pathname = usePathname();
  const base =
    "inline-flex min-h-9 items-center rounded-full px-3.5 text-[13px] font-bold no-underline transition-colors";
  return (
    <div
      dir="rtl"
      data-lp-view-toggle
      className="fixed bottom-4 left-4 z-40 flex items-center gap-1 rounded-full border border-amber-400 bg-white/95 p-1 shadow-[0_8px_30px_rgba(4,8,40,0.18)] backdrop-blur"
    >
      <span className="px-2 text-[12px] font-bold text-amber-900">תצוגה:</span>
      <Link
        href={pathname}
        scroll={false}
        aria-current={!strict ? "true" : undefined}
        className={`${base} ${strict ? "text-ink-secondary hover:bg-surface" : "bg-amber-100 text-amber-900"}`}
      >
        סקירה{pendingCount > 0 ? ` (${pendingCount} טענות ממתינות)` : ""}
      </Link>
      <Link
        href={`${pathname}?view=production`}
        scroll={false}
        aria-current={strict ? "true" : undefined}
        className={`${base} ${strict ? "bg-ink text-white" : "text-ink-secondary hover:bg-surface"}`}
      >
        פרודקשן
      </Link>
    </div>
  );
}
