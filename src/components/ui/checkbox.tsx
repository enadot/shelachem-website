"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * צ'קבוקס הסכמה — 18px, מותג כחול.
 * ה-`before:` פורש יעד מגע של 44×44 סביב הריבוע בלי לשנות את המראה (WCAG 2.2 —
 * Target Size). ה-pseudo מרוכז על הריבוע, ולכן גם לחיצה "לידו" תופסת.
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "relative mt-0.5 flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-[#cbd5e1] bg-white transition-colors data-[state=checked]:border-brand data-[state=checked]:bg-brand",
        "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
