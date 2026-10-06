import Link from "next/link";
import type { FaqItem } from "@/lib/content/types";
import { Reveal } from "@/components/shared/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { ChevronForward } from "@/components/shared/icons";
import { PhoneIcon } from "@/components/layout/contact-modal";
import { homepageFaqs } from "@/lib/faq-groups";
import { site } from "@/lib/config";

/**
 * שאלות ותשובות בדף הבית (designs/homepage-v3.html) — כותרת וטלפון בצד, אקורדיון לבן.
 *
 * ה-`FAQPage` JSON-LD עבר ל-`/faq`: כתובת קנונית אחת לשאלות מדורגת טוב יותר
 * משתי כתובות שחולקות את אותו תוכן.
 */
export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  // חמש בלבד — השאר בעמוד /faq. רשימה ארוכה בדף הבית היא קיר טקסט.
  const visible = homepageFaqs(faqs).slice(0, 5);
  const remaining = faqs.length - visible.length;

  return (
    <section
      id="faq"
      className="scroll-mt-24 bg-surface px-[22px] py-16 md:px-[clamp(24px,5vw,72px)] md:py-[120px]"
    >
      <div className="mx-auto max-w-[1296px]">
        <Eyebrow index="07">שאלות ותשובות</Eyebrow>
        <div className="mt-6 grid items-start gap-8 md:mt-8 md:grid-cols-[minmax(0,420px)_1fr] md:gap-20">
          <div className="md:sticky md:top-28">
            <Reveal
              as="h2"
              variant="mask"
              className="m-0 mb-4 font-display text-[32px] font-light leading-[1.1] text-ink md:mb-6 md:text-[56px] md:leading-[1.02] md:tracking-[-0.02em]"
            >
              יש שאלות?
              <br />
              <span className="font-black">יש תשובות.</span>
            </Reveal>
            <p className="m-0 mb-6 text-base text-ink-muted md:text-lg">
              ועל כל מה שלא כתוב כאן — עונים בטלפון.
            </p>
            <a
              href={site.phoneHref}
              className="group tnum hidden items-center gap-3 text-2xl font-black text-ink no-underline md:inline-flex"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white">
                <PhoneIcon size={18} />
              </span>
              <span className="link-draw">{site.phone}</span>
            </a>
          </div>
          <Reveal>
            <FaqAccordion items={visible} />
            <Link
              href="/faq"
              className="group mt-8 inline-flex items-center gap-2 text-base font-bold text-brand no-underline md:text-[17px]"
            >
              <span className="link-draw">
                {remaining > 0 ? `לכל השאלות והתשובות — עוד ${remaining}` : "לכל השאלות והתשובות"}
              </span>
              <ChevronForward size={16} className="nudge" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
