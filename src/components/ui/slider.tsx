"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

/** סליידר המחשבון — מסילה בהירה על נייבי, ידית לבנה עם טבעת מותג. */
function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/25">
        <SliderPrimitive.Range className="absolute h-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label="בחירת ערך"
        className="focus-brand block h-5 w-5 cursor-grab rounded-full border-2 border-accent bg-white shadow-md transition-transform active:scale-110"
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
