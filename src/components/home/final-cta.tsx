import Image from "next/image";
import { Reveal } from "@/components/shared/reveal";
import { LeadForm } from "@/components/shared/lead-form";

/** CTA סופי עם לבבות watermark (homepage-live.html §10). */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-6 py-16 text-center md:px-[clamp(24px,6.7vw,96px)] md:py-[88px]">
      <Image
        src="/images/heart.svg"
        alt=""
        aria-hidden
        width={380}
        height={380}
        className="pointer-events-none absolute -bottom-[70px] -left-[50px] w-[280px] opacity-[0.07] md:w-[380px]"
      />
      <Image
        src="/images/heart.svg"
        alt=""
        aria-hidden
        width={300}
        height={300}
        className="pointer-events-none absolute -right-[70px] -top-[60px] w-[220px] opacity-[0.05] md:w-[300px]"
      />
      <Reveal className="relative mx-auto max-w-[820px]">
        <h2 className="m-0 mb-3 font-display text-[28px] font-bold tracking-tight text-ink md:text-[40px]">
          בואו לבדוק מה מגיע לכם
        </h2>
        <p className="m-0 mb-8 text-[17px] text-ink-muted md:text-[19px]">
          השאירו פרטים ונחזור אליכם היום. בלי עלות, בלי התחייבות, בלי אותיות קטנות.
        </p>
        <LeadForm
          layout="hero"
          sourcePage="home-final-cta"
          submitLabel="צרו איתי קשר"
          withMarketingConsent={false}
          className="mx-auto max-w-[640px] text-start"
        />
      </Reveal>
    </section>
  );
}
