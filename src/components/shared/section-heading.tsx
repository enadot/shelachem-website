import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

/**
 * כותרת סקשן בעמודי תוכן — משקל 300 עם הדגשה 900, נחשפת במסכה (כמו בדף הבית).
 * `strong` הוא החלק המודגש. `underlineStrong` נשאר לתאימות; ההדגשה היא המשקל
 * עצמו, בלי קו קישוט.
 */
export function SectionHeading({
  as = "h2",
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
    <Reveal
      as={as}
      variant="mask"
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
    </Reveal>
  );
}
