"use client";

import { Button } from "@/components/ui/button";
import { useLeadModal } from "@/components/shared/lead-modal";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

/**
 * כפתור "בדיקת זכאות חינם" — פותח את מודאל הטופס.
 * מחליף קישורי עוגן ל-#lead-form: מודאל ממיר טוב יותר מקפיצה לראש העמוד.
 */
export function LeadCta({
  children = "בדיקת זכאות חינם ›",
  sourcePage,
  className,
  variant = "accent",
  size,
}: {
  children?: React.ReactNode;
  /** נשמר על הליד — מאיפה בדיוק נפתח הטופס. */
  sourcePage: string;
  className?: string;
} & VariantProps<typeof buttonVariants>) {
  const { openLeadForm } = useLeadModal();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={() => openLeadForm(sourcePage)}
    >
      {children}
    </Button>
  );
}
