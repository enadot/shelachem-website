import type { FaqItem } from "@/lib/content/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

/** אקורדיון שאלות ותשובות — shadcn/Radix, עם אייקון + שמסתובב כמו בעיצוב. */
export function FaqAccordion({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <Accordion type="single" collapsible className={cn("flex flex-col gap-2.5", className)}>
      {items.map((f) => (
        <AccordionItem key={f.id} value={f.id}>
          <AccordionTrigger>{f.question}</AccordionTrigger>
          <AccordionContent>{f.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
