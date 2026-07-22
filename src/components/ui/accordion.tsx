"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn("rounded-xl border border-hairline bg-surface px-5", className)}
      {...props}
    />
  );
}

/** כותרת שאלה — אייקון + שמסתובב ל-× בפתיחה (כמו בעיצוב). */
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="m-0">
      <AccordionPrimitive.Trigger
        className={cn(
          "focus-brand flex min-h-11 w-full cursor-pointer items-center justify-between gap-3.5 border-none bg-transparent py-4 text-start text-[17px] font-bold text-ink [&[data-state=open]>span]:rotate-45",
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden
          className="shrink-0 text-2xl font-light leading-none text-brand transition-transform duration-200"
        >
          +
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-5 text-base leading-relaxed text-ink-secondary", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
