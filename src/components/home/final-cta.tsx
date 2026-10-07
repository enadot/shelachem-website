import { Reveal } from "@/components/shared/reveal";
import { LeadForm } from "@/components/shared/lead-form";

/** CTA סופי על רויאל — כותרת גדולה וטופס קצר (שם + טלפון), בלי עיטורים. */
export function FinalCta() {
  return (
    <section className="surface-navy bg-brand px-[22px] py-16 text-white md:px-[clamp(24px,5vw,72px)] md:py-[120px]">
      <div className="mx-auto grid max-w-[1296px] items-end gap-10 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <div>
          <Reveal
            as="h2"
            variant="mask"
            className="m-0 mb-4 font-display text-[44px] font-black leading-[0.95] tracking-[-0.02em] text-white md:mb-6 md:text-[88px]"
          >
            בואו לבדוק
            <br />
            מה מגיע לכם.
          </Reveal>
          <p className="m-0 text-base text-on-royal-muted md:text-xl">
            נחזור אליכם היום. בלי עלות ובלי התחייבות.
          </p>
        </div>
        <Reveal delay={0.15}>
          <LeadForm
            variant="dark"
            layout="hero"
            sourcePage="home-final-cta"
            submitLabel="צרו איתי קשר"
            withMarketingConsent={false}
            withEmail={false}
          />
        </Reveal>
      </div>
    </section>
  );
}
