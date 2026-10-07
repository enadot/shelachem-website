import * as React from "react";
import { cn } from "@/lib/utils";

/** שדה קלט בסגנון v3 — רקע אפרפר, מסגרת 1.5px, בפוקוס מסגרת רויאל ורקע לבן. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-[50px] w-full rounded-[10px] border-[1.5px] border-hairline bg-field px-4 py-3 text-[17px] text-ink transition-colors placeholder:text-ink-faint focus:border-brand focus:bg-white aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
