import Link from "next/link";
import type { FaqItem } from "@/lib/content/types";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { ChevronForward } from "@/components/shared/icons";
import { homepageFaqs } from "@/lib/faq-groups";

/**
 * שאלות ותשובות בדף הבית (homepage-live.html §11) — השאלות הפותחות בלבד.
 *
 * ה-`FAQPage` JSON-LD עבר ל-`/faq`: כתובת קנונית אחת לשאלות מדורגת טוב יותר
 * משתי כתובות שחולקות את אותו תוכן, וזה גם מקצר עמוד בית של ~9,500px.
 */
export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const visible = homepageFaqs(faqs);
  const remaining = faqs.length - visible.length;

  return (
    <section id="faq" className="scroll-mt-24 bg-surface px-6 py-16 md:px-[clamp(24px,6.7vw,96px)] md:py-[88px]">
      <Reveal className="mx-auto max-w-[880px]">
        <SectionHeading strong="ותשובות" className="mb-3 text-center text-[28px] md:text-[38px]">
          שאלות
        </SectionHeading>
        <p className="mx-auto mb-9 mt-0 max-w-[640px] text-center text-[17px] text-ink-secondary md:text-[19px]">
          ריכזנו עבורכם את השאלות הנפוצות ביותר — כדי שתבינו טוב יותר את הזכויות שלכם ואיך אנחנו
          מסייעים לממש אותן.
        </p>
        <FaqAccordion items={visible} className="[&>div]:bg-white" />
        <div className="mt-7 text-center">
          <Link
            href="/faq"
            className="pill inline-flex min-h-12 items-center gap-2 border border-hairline bg-white px-6 text-[16.5px] font-bold text-ink no-underline transition-colors hover:border-brand hover:text-brand"
          >
            {remaining > 0 ? `לכל השאלות והתשובות — עוד ${remaining}` : "לכל השאלות והתשובות"}
            <ChevronForward size={16} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
