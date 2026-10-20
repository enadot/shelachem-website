import { cn } from "@/lib/utils";

export type Stat = { value: string; label: string };

/**
 * רצועת מספרים — ספרות גדולות במשקל דק, מופרדות בקווי שיער. המספרים סטטיים:
 * מונה שרץ מאפס הוא סימן היכר של תבנית, ומספר אמון צריך להיקרא מיד.
 *
 * `<bdi dir="auto">` שומר על ערך וסימנו כיחידה אחת (`75%`, `0 ₪`) — ספרות בלבד
 * נקראות LTR, וערך מילולי ("עשרות אלפי", "מאז 2013") נשאר RTL בסדר המילים הנכון.
 * רצועה עם ערך מילולי כלשהו מקבלת גופן קטן יותר — מילים רחבות מספרות.
 */
export function StatStrip({
  stats,
  tone = "light",
  className,
}: {
  stats: readonly Stat[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  const line = dark ? "border-white/20" : "border-hairline";
  const wordy = stats.some((st) => /[\u0590-\u05FF]/.test(st.value));
  const cols = stats.length === 4 ? "md:grid-cols-4" : stats.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <ul
      className={cn("m-0 grid list-none border-t p-0", line, cols, className)}
    >
      {stats.map((st) => (
        <li
          key={st.label}
          className={cn(
            "flex items-baseline justify-between gap-4 border-b py-5 md:flex-col md:items-start md:justify-start md:gap-3 md:border-b-0 md:py-8 md:[&:not(:first-child)]:border-r md:[&:not(:first-child)]:pr-8",
            line,
          )}
        >
          <bdi
            dir="auto"
            className={cn(
              "tnum shrink-0 font-display text-[40px] font-light md:tracking-[-0.02em]",
              wordy ? "leading-[0.95] md:text-[56px]" : "leading-none md:text-[72px]",
              dark ? "text-white" : "text-ink",
            )}
          >
            {st.value}
          </bdi>
          <span className={cn("text-[15px] md:text-base", dark ? "text-white/75" : "text-ink-muted")}>
            {st.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
