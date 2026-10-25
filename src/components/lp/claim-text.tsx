import { Fragment } from "react";
import type { ClaimId } from "@/lib/content/local/lp-claims";
import { cn } from "@/lib/utils";

/** `**הדגשה**` בתוך מחרוזת → משקל 900, כמו `strong` של הכותרות באתר. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-black">
        {p}
      </span>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

/** תג "ממתין לאישור" לכל טענה פתוחה. מוצג רק מחוץ לפרודקשן (במצב review). */
export function ClaimBadges({ pending, className }: { pending: readonly ClaimId[]; className?: string }) {
  if (pending.length === 0) return null;
  return (
    <span className={cn("ms-1.5 inline-flex flex-wrap gap-1 align-middle", className)}>
      {pending.map((c) => (
        <span
          key={c}
          data-claim={c}
          className="inline-flex items-center whitespace-nowrap rounded-full border border-amber-500 bg-amber-50 px-2 py-0.5 font-body text-[12px] font-bold leading-none tracking-normal text-amber-900"
        >
          {c} · ממתין לאישור
        </span>
      ))}
    </span>
  );
}

/** עוטף טקסט שמכיל טענה פתוחה בסימון עדין + תגים. בלי טענות — הטקסט כמו שהוא. */
export function Claimed({
  pending,
  children,
}: {
  pending: readonly ClaimId[];
  children: React.ReactNode;
}) {
  if (pending.length === 0) return <>{children}</>;
  return (
    <>
      <span data-claims={pending.join(" ")} className="rounded-sm bg-amber-100/70 decoration-amber-500 decoration-dotted underline-offset-4 [box-decoration-break:clone] underline">
        {children}
      </span>
      <ClaimBadges pending={pending} />
    </>
  );
}
