import type { FaqItem } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** אקורדיון שאלות ותשובות — details/summary עם אייקון + שמסתובב (.faq-plus ב-globals). */
export function FaqAccordion({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {items.map((f) => (
        <details
          key={f.id}
          className="rounded-xl border border-hairline bg-surface px-5 open:pb-1"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3.5 py-4 text-[17px] font-bold text-ink [&::-webkit-details-marker]:hidden">
            {f.question}
            <span
              aria-hidden
              className="faq-plus shrink-0 text-2xl font-light leading-none text-brand transition-transform"
            >
              +
            </span>
          </summary>
          <p className="faq-answer m-0 pb-5 text-base leading-relaxed text-ink-secondary">
            {f.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
