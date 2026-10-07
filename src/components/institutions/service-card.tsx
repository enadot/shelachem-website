"use client";

import Link from "next/link";
import { useLeadModal } from "@/components/shared/lead-modal";
import { ArrowForward } from "@/components/shared/icons";

/** יעד העוגן ההיסטורי בכרטיסים שאין להם עמוד שירות משלהם. */
const LEAD_ANCHOR = "/#lead-form";

type Card = { name: string; tag: string; description: string; href: string };

/**
 * שורת "במה אנחנו מטפלים" בעמוד מוסד — שורה מלאה היא היעד (לא קישור טקסט קטן).
 *
 * שורה שיש לה עמוד שירות היא קישור ("לפרטים"). שורה בלי עמוד פותחת את מודאל
 * בדיקת הזכאות **עם הנושא ממולא מראש**, בלי לעזוב את העמוד — במקום לזרוק את
 * המשתמש לעוגן בדף הבית ולבקש ממנו לבחור את הזכות מחדש.
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
      <span className="min-w-0 flex-1">
        <span className="mb-1 block text-[13px] font-bold tracking-[0.04em] text-ink-faint">
          {card.tag}
        </span>
        <span className="block font-display text-xl font-black leading-snug text-ink transition-colors duration-300 group-hover:text-brand md:text-[22px]">
          {card.name}
        </span>
        <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-muted">
          {card.description}
        </span>
        <span className="sr-only">{hasPage ? " — לפרטים" : " — בדיקת זכאות"}</span>
      </span>
      <span
        aria-hidden
        className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white"
      >
        <ArrowForward size={16} className="nudge" />
      </span>
    </>
  );

  const shell =
    "group flex w-full min-h-11 items-start gap-5 py-6 text-start no-underline";

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
      className={`${shell} cursor-pointer border-0 bg-transparent font-[inherit]`}
    >
      {body}
    </button>
  );
}
