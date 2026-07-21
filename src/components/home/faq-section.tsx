import type { FaqItem } from "@/lib/content/types";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { FaqAccordion } from "@/components/shared/faq-accordion";

/** שאלות ותשובות (homepage-live.html §11) + FAQPage JSON-LD. */
export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section id="faq" className="scroll-mt-24 bg-surface px-6 py-16 md:px-[clamp(24px,6.7vw,96px)] md:py-[88px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal className="mx-auto max-w-[880px]">
        <SectionHeading strong="ותשובות" className="mb-3 text-center text-[28px] md:text-[38px]">
          שאלות
        </SectionHeading>
        <p className="mx-auto mb-9 mt-0 max-w-[640px] text-center text-[17px] text-ink-secondary md:text-[19px]">
          ריכזנו עבורכם את השאלות הנפוצות ביותר — כדי שתבינו טוב יותר את הזכויות שלכם ואיך אנחנו
          מסייעים לממש אותן.
        </p>
        <FaqAccordion items={faqs} className="[&>details]:bg-white" />
      </Reveal>
    </section>
  );
}
