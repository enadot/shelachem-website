import Link from "next/link";
import type { FaqItem } from "@/lib/content/types";
import { Reveal } from "@/components/shared/reveal";
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
      className="scroll-mt-24 bg-surface px-4 py-12 md:px-[clamp(24px,5vw,72px)] md:py-[100px]"
    >
      <Reveal className="mx-auto grid max-w-[1296px] items-start md:grid-cols-[minmax(0,400px)_1fr] md:gap-20">
        <div className="px-1.5 md:px-0">
          <h2 className="m-0 mb-2 font-display text-[28px] font-light text-ink md:mb-4 md:text-[48px] md:tracking-[-0.5px]">
            שאלות <span className="font-black">ותשובות</span>
          </h2>
          <p className="m-0 mb-5 text-[15px] leading-relaxed text-ink-secondary md:mb-7 md:text-[19px]">
            התשובות הקצרות לשאלות הנפוצות.
          </p>
          <a
            href={site.phoneHref}
            className="tnum mb-7 hidden items-center gap-2.5 rounded-[10px] bg-white px-[22px] py-3.5 text-xl font-black text-ink no-underline md:inline-flex"
          >
            <span className="text-brand">
              <PhoneIcon size={18} />
            </span>
            {site.phone}
          </a>
        </div>
        <div>
          <FaqAccordion items={visible} className="[&>div]:border-transparent" />
          <div className="mt-6">
            <Link
              href="/faq"
              className="inline-flex min-h-12 items-center gap-2 rounded-[10px] border-[1.5px] border-brand bg-transparent px-6 text-base font-bold text-brand no-underline transition-colors hover:bg-white"
            >
              {remaining > 0 ? `לכל השאלות והתשובות — עוד ${remaining}` : "לכל השאלות והתשובות"}
              <ChevronForward size={16} />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
