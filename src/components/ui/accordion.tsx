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
      className={cn("rounded-xl border border-hairline-soft bg-white px-4 transition-shadow duration-200 data-[state=open]:shadow-[rgba(18,40,168,0.10)_0_10px_28px] md:rounded-[14px] md:px-[26px]", className)}
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
          "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3.5 border-none bg-transparent py-4 text-start text-base font-bold text-ink md:py-[22px] md:text-[19px] [&[data-state=open]>span]:rotate-45",
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-surface-blue text-[22px] leading-none text-brand transition-transform duration-200 md:h-9 md:w-9 md:text-2xl"
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
      <div className={cn("pb-[18px] text-[15px] leading-[1.65] text-ink-secondary md:pb-6 md:text-[17px] md:leading-[1.7]", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
