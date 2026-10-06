import Image from "next/image";
import { Reveal } from "@/components/shared/reveal";
import { LeadForm } from "@/components/shared/lead-form";

/** CTA סופי על רויאל (designs/homepage-v3.html) — כותרת משמאל לטופס, כפתור זהב. */
export function FinalCta() {
  return (
    <section className="brand-gradient surface-navy relative overflow-hidden px-[22px] py-[52px] text-white [--royal-shape:ellipse_110%_80%_at_50%_40%] md:px-[clamp(24px,5vw,72px)] md:py-[92px] md:[--royal-shape:ellipse_70%_100%_at_25%_50%]">
      <Image
        src="/images/swirl-white.png"
        alt=""
        aria-hidden
        width={480}
        height={480}
        className="pointer-events-none absolute -left-[70px] -top-10 w-[260px] opacity-[0.12] md:-top-20 md:left-10 md:w-[480px]"
      />
      <Reveal className="relative mx-auto grid max-w-[1296px] items-center gap-[22px] md:grid-cols-2 md:gap-20">
        <div>
          <h2 className="m-0 mb-2.5 font-display text-[34px] font-black leading-none text-white md:mb-3.5 md:text-[60px] md:tracking-[-1px]">
            בואו לבדוק <br className="hidden md:block" />
            מה מגיע לכם
          </h2>
          <p className="m-0 text-base leading-relaxed text-on-royal-muted md:text-xl">
            השאירו פרטים ונחזור אליכם היום. בלי עלות, בלי התחייבות, בלי אותיות קטנות.
          </p>
        </div>
        <LeadForm
          variant="dark"
          layout="hero"
          sourcePage="home-final-cta"
          submitLabel="צרו איתי קשר"
          withMarketingConsent={false}
        />
      </Reveal>
    </section>
  );
}
