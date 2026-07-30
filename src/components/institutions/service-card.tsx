"use client";

import Link from "next/link";
import { useLeadModal } from "@/components/shared/lead-modal";
import { ArrowForward, ChevronForward } from "@/components/shared/icons";

/** יעד העוגן ההיסטורי בכרטיסים שאין להם עמוד שירות משלהם. */
const LEAD_ANCHOR = "/#lead-form";

type Card = { name: string; tag: string; description: string; href: string };

/**
 * כרטיס "במה אנחנו מטפלים" בעמוד מוסד.
 *
 * שני תיקונים:
 *
 * 1. **הכרטיס כולו הוא היעד**, ולא קישור טקסט של 350×23px שהיה חצי מרצפת המגע
 *    של 44px.
 * 2. **התווית אומרת את האמת.** 20 מ-23 הכרטיסים הפנו ל-`/#lead-form` — כלומר
 *    "לפרטים" זרק את המשתמש לעוגן בדף הבית, ומשם הוא נדרש לזכור על איזו זכות
 *    קרא ולבחור אותה מחדש מרשימה של שבע. כרטיס בלי עמוד משלו פותח עכשיו את
 *    מודאל בדיקת הזכאות **עם הנושא ממולא מראש**, בלי לעזוב את העמוד; רק כרטיס
 *    שיש לו עמוד אמיתי אומר "לפרטים".
 */
export function InstitutionServiceCard({
  card,
  institutionName,
}: {
  card: Card;
  institutionName: string;
}) {
  const { openLeadForm } = useLeadModal();
  const hasPage = card.href !== LEAD_ANCHOR;

  const body = (
    <>
      <span className="pill self-start bg-accent-tint px-3 py-1 text-[13px] font-bold text-accent-text">
        {card.tag}
      </span>
      <h3 className="m-0 font-body text-lg font-bold text-ink">{card.name}</h3>
      <p className="m-0 flex-1 text-[15px] leading-relaxed text-ink-secondary">
        {card.description}
      </p>
      <span className="flex items-center gap-1.5 text-[15px] font-bold text-brand">
        {hasPage ? (
          <>
            לפרטים
            <ArrowForward size={16} className="transition-transform group-hover:-translate-x-1" />
          </>
        ) : (
          <>
            בדקו זכאות
            <ChevronForward size={15} className="transition-transform group-hover:-translate-x-1" />
          </>
        )}
      </span>
    </>
  );

  const shell =
    "group flex h-full min-h-11 flex-col gap-2.5 rounded-xl border border-hairline bg-white p-6 text-start no-underline transition-shadow hover:shadow-[0_12px_32px_rgba(13,37,61,0.12)]";

  if (hasPage) {
    return (
      <Link href={card.href} className={shell}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openLeadForm(`institution-card-${card.name}`, card.name)}
      aria-label={`בדיקת זכאות — ${card.name} מול ${institutionName}`}
      className={`${shell} cursor-pointer`}
    >
      {body}
    </button>
  );
}
