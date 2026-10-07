import { cn } from "@/lib/utils";

/**
 * כותרת סקשן בעמודי תוכן — משקל 300 עם הדגשה 900. סטטית: בעמודי תוכן הכותרת פשוט שם.
 * `strong` הוא החלק המודגש. `underlineStrong` נשאר לתאימות; ההדגשה היא המשקל
 * עצמו, בלי קו קישוט.
 */
export function SectionHeading({
  as: Tag = "h2",
  children,
  strong,
  className,
}: {
  as?: "h2" | "h3";
  children?: React.ReactNode;
  strong?: React.ReactNode;
  underlineStrong?: boolean;
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "m-0 font-display font-light leading-[1.1] tracking-[-0.01em] text-ink",
        className,
      )}
    >
      {children}
      {strong !== undefined && (
        <>
          {" "}
          <span className="font-black">{strong}</span>
        </>
      )}
    </Tag>
  );
}
