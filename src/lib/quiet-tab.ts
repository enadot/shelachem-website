import { cn } from "@/lib/utils";

/** טאב סינון שקט — טקסט עמום, והפעיל במילוי דיו. אותה שפה כמו סינון התחומים בדף הבית. */
export function quietTab(active: boolean, className?: string) {
  return cn(
    "inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border-none px-4 text-[15px] font-bold no-underline transition-colors duration-300",
    active ? "bg-ink text-white hover:text-white" : "bg-transparent text-ink-muted hover:text-ink",
    className,
  );
}
