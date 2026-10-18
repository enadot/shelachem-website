"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { marketing } from "@/lib/marketing";
import { OPEN_CONSENT_EVENT, setConsent, useConsent } from "@/lib/consent";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

/**
 * באנר עוגיות — מוצג רק כש-`NEXT_PUBLIC_CONSENT_REQUIRED=true` ועוד לא נבחר כלום,
 * או כשהגולש פותח אותו מחדש מהקישור "הגדרות עוגיות" בפוטר.
 * לא חוסם את האתר: יושב בתחתית, מעל בר ה-CTA של המובייל.
 */
export function CookieConsent() {
  const consent = useConsent();
  const [reopened, setReopened] = useState(false);
  // לא מרנדרים בשרת: שם הבחירה השמורה לא ידועה, והבאנר היה מהבהב גם למי שכבר בחר.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  if (!marketing.consentRequired || !mounted || (consent !== null && !reopened)) return null;

  const choose = (choice: "granted" | "denied") => {
    setConsent(choice);
    setReopened(false);
  };

  return (
    <section
      role="region"
      aria-label="הגדרות עוגיות"
      className="fixed inset-x-3 bottom-[76px] z-50 mx-auto flex max-w-[720px] flex-col gap-4 rounded-card border border-hairline bg-white p-5 text-ink shadow-[0_18px_50px_rgba(4,8,40,0.22)] md:bottom-6 md:flex-row md:items-center md:gap-6"
    >
      <p className="m-0 flex-1 text-[15.5px] leading-relaxed text-ink-secondary">
        אנחנו משתמשים בעוגיות למדידה ולשיפור הפרסום שלנו. אפשר לאשר, או להמשיך רק עם
        העוגיות ההכרחיות לפעולת האתר.{" "}
        <Link href="/privacy" className="font-bold text-brand">
          מדיניות הפרטיות
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" onClick={() => choose("granted")}>
          אישור
        </Button>
        <Button size="sm" variant="outline" onClick={() => choose("denied")}>
          רק הכרחיות
        </Button>
      </div>
    </section>
  );
}

/** קישור לפוטר שפותח מחדש את הבאנר. לא מוצג כשאין צורך בהסכמה. */
export function CookieSettingsLink({ className }: { className?: string }) {
  if (!marketing.consentRequired) return null;
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className={className}
    >
      הגדרות עוגיות
    </button>
  );
}
