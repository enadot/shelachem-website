"use client";

import { Button } from "@/components/ui/button";
import { ChevronForward } from "@/components/shared/icons";
import { useLeadModal } from "@/components/shared/lead-modal";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

/**
 * כפתור "בדיקת זכאות חינם" — פותח את מודאל הטופס אחרי הידרציה.
 * לפני שה-JS רץ זה עוגן אמיתי לטופס בדף הבית, אחרת הלחיצה לא עושה כלום.
 */
export const LEAD_FORM_HREF = "/#lead-form";

export function LeadCta({
  children,
  sourcePage,
  topic,
  className,
  variant = "accent",
  size,
}: {
  children?: React.ReactNode;
  /** נשמר על הליד — מאיפה בדיוק נפתח הטופס. */
  sourcePage: string;
  /** נושא שממולא מראש בטופס (למשל שם הזכות שהמשתמש קרא עליה). */
  topic?: string;
  className?: string;
} & VariantProps<typeof buttonVariants>) {
  const { openLeadForm } = useLeadModal();
  return (
    <Button asChild variant={variant} size={size} className={cn(className)}>
      <a
        href={LEAD_FORM_HREF}
        onClick={(e) => {
          e.preventDefault();
          openLeadForm(sourcePage, topic);
        }}
      >
        {children ?? (
          <>
            בדיקת זכאות חינם
            <ChevronForward size={16} />
          </>
        )}
      </a>
    </Button>
  );
}
