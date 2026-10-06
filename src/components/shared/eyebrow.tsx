import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

/**
 * כותרת-על ממוספרת לסקשן: "01  תחומי פעילות ───────".
 * המספור והקו נותנים לעמוד מקצב של מסמך ערוך, במקום כותרות-על צבעוניות בכל סקשן.
 */
export function Eyebrow({
  index,
  children,
  tone = "light",
  className,
}: {
  index?: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-[13px] font-bold tracking-[0.06em] md:text-sm",
        dark ? "text-white/70" : "text-ink-muted",
        className,
      )}
    >
      {index && <span className={cn("tnum", dark ? "text-gold" : "text-brand")}>{index}</span>}
      <span>{children}</span>
      <Reveal
        as="span"
        variant="line"
        className={cn("block h-px flex-1", dark ? "bg-white/20" : "bg-hairline")}
      >
        {null}
      </Reveal>
    </div>
  );
}
