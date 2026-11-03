"use client";

import { Button } from "@/components/ui/button";
import { ChevronForward } from "@/components/shared/icons";
import { useLeadModal } from "@/components/shared/lead-modal";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

/**
 * כפתור "בדיקת זכאות חינם" — פותח את מודאל הטופס.
 * מחליף קישורי עוגן ל-#lead-form: מודאל ממיר טוב יותר מקפיצה לראש העמוד.
 */
/** יעד fallback לפני הידרציה — טופס הזכאות בהירו של דף הבית. */
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
      {/* T-043: עוגן אמיתי ולא <button> — לפני הידרציה (WebView איטי של וואטסאפ, רשת סלולרית)
          כפתור בלי href "מת" ללחיצה. ה-href הוא fallback; אחרי הידרציה נפתח המודאל. */}
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
