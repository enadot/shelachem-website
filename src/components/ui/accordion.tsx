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
      className={cn("border-b border-hairline", className)}
      {...props}
    />
  );
}

/** כותרת שאלה — שורת טקסט עם קו שיער; ה-+ (שני קווים דקים) מסתובב ל-× בפתיחה. */
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="m-0">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex min-h-11 w-full cursor-pointer items-center justify-between gap-6 border-none bg-transparent py-5 text-start text-[17px] font-bold text-ink transition-colors duration-300 hover:text-brand md:py-7 md:text-[21px] [&[data-state=open]>span]:rotate-45",
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden
          className="relative h-4 w-4 shrink-0 text-brand transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:h-5 md:w-5"
        >
          <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-current" />
          <span className="absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-current" />
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
      <div className={cn("max-w-[720px] pb-6 text-base leading-[1.7] text-ink-secondary md:pb-8 md:text-lg", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
