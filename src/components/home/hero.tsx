import { Entrance } from "@/components/shared/reveal";
import { LeadForm } from "@/components/shared/lead-form";

/**
 * Hero מפוצל לבן/כחול (homepage-live.html §1):
 * ימין — h1 + כרטיס טופס עם תגית pill צפה; שמאל — גרדיאנט כחול, glow פועם ופס "רצפה" כהה.
 * (תמונת הצוות תתווסף כשתסופק — public/images/hero-team.png.)
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[560px] flex-col overflow-hidden bg-white md:flex-row md:items-stretch md:min-h-[660px]">
      {/* right (white) half */}
      <div className="flex flex-[1.08] flex-col items-start px-6 pt-9 md:px-[clamp(24px,6.7vw,96px)] md:pt-16 md:ps-[clamp(32px,9vw,130px)]">
        <Entrance>
          <h1 className="m-0 mb-6 max-w-[520px] font-display text-[40px] font-light leading-[1.1] tracking-tight text-ink md:text-[clamp(46px,4.45vw,64px)] md:leading-[1.08]">
            13 שנות מקצוענות
            <br />
            במימוש הזכויות
            <br />
            <span className="keyword-underline text-black">שלכם</span>
          </h1>
        </Entrance>

        {/* blue half — mobile only, between h1 and the form card */}
        <BlueHalf className="relative -mx-6 block h-[340px] w-[calc(100%+48px)] md:hidden" />

        <Entrance
          delay={0.2}
          className="relative z-[2] -mt-12 w-full md:mt-auto md:max-w-[640px]"
        >
          <div
            id="lead-form"
            className="relative flex scroll-mt-24 flex-col gap-3.5 rounded-[20px] border border-[#e6ebf2] bg-white px-5 pb-5 pt-9 shadow-[0_20px_48px_rgba(13,37,61,0.14)] md:rounded-b-none md:rounded-t-[28px] md:border-b-0 md:px-7 md:pb-6 md:pt-10 md:shadow-[0_-20px_48px_rgba(13,37,61,0.12)]"
          >
            <div className="pill absolute -top-[21px] right-5 bg-brand px-5 py-3 text-base font-bold leading-none text-white shadow-[0_10px_24px_rgba(0,0,120,0.25)] md:-top-[25px] md:right-7 md:px-6 md:py-4 md:text-lg">
              מגיע לכם לדעת מה מגיע לכם
            </div>
            <LeadForm layout="hero" sourcePage="home-hero" submitLabel="אני רוצה לבדוק ›" />
          </div>
        </Entrance>
      </div>

      {/* blue half — desktop */}
      <BlueHalf className="relative hidden flex-[0.92] md:block" />
    </section>
  );
}

function BlueHalf({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{ background: "linear-gradient(200deg, #1f1fff 0%, #0000e6 55%, #0000bf 100%)" }}
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="animate-glow-pulse absolute -left-[120px] -top-[160px] h-[560px] w-[560px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        {/* the darker "floor" band behind the team */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[104px] md:h-40"
          style={{ background: "linear-gradient(180deg, #000085 0%, #0000ad 100%)" }}
        />
      </div>
    </div>
  );
}
