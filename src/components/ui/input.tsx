import * as React from "react";
import { cn } from "@/lib/utils";

/** שדה קלט בסגנון הטפסים שבעיצוב (focus ring כחול, פינות 10px). */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-12 w-full rounded-[10px] border border-[#cbd5e1] bg-white px-4 py-3 text-base text-ink transition-colors placeholder:text-ink-faint aria-invalid:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
