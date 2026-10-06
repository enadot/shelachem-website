import Image from "next/image";
import { Entrance } from "@/components/shared/reveal";
import { EligibilityQuiz } from "@/components/home/eligibility-quiz";
import { CmsImage } from "@/components/shared/cms-image";
import { getGlobals } from "@/lib/content";
import { site } from "@/lib/config";

const heroInstitutions = [
  { label: "ביטוח לאומי", brush: "" },
  { label: "מס הכנסה", brush: "brush-2" },
  { label: "חברות ביטוח", brush: "brush-3" },
];

/**
 * Hero v3 (designs/homepage-v3.html §5a/5b) — רויאל מלא:
 * תגית זהב, h1 עם "שלכם" ענק, שלושה מוסדות עם קו מכחול, ותמונת הצוות.
 * מתחתיו כרטיס לבן שעולה על ההירו (-72px / -48px) ובו בדיקת זכאות בשלבים.
 * תמונת הצוות מנוהלת ב-CMS (globals ▸ hero_image); נפילה חזרה ל-hero-gavel-team.
 */
export async function Hero() {
  const globals = await getGlobals();
  const teamImage = globals?.hero_image ?? "/images/hero-gavel-team.webp";
  const teamImageAlt = globals?.hero_image_alt ?? "צוות המומחים של שלכם";

  return (
    <>
      <section
        className="brand-gradient surface-navy relative overflow-hidden text-white [--royal-shape:ellipse_110%_80%_at_50%_60%] md:[--royal-shape:ellipse_70%_90%_at_30%_50%]"
      >
        <Image
          src="/images/swirl-white.png"
          alt=""
          aria-hidden
          width={560}
          height={560}
          className="pointer-events-none absolute left-1/2 top-[300px] w-[300px] -translate-x-1/2 opacity-[0.14] md:left-[28%] md:top-1/2 md:w-[560px] md:-translate-y-[55%]"
        />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-6 px-[22px] pt-[30px] md:grid-cols-[minmax(0,600px)_1fr] md:px-[clamp(24px,5vw,72px)] md:pb-[120px] md:pt-[72px]">
          <div>
            <Entrance>
              <span className="badge-gold px-[18px] pb-1.5 pt-[7px] text-base md:px-[26px] md:pb-2 md:pt-[9px] md:text-[19px]">
                מאז {site.foundedYear} · {site.stats.clients} לקוחות
              </span>
            </Entrance>
            {/* בלי Entrance — ה-h1 הוא אלמנט ה-LCP ואסור שיהיה תלוי בהידרציה */}
            <h1 className="m-0 mt-[18px] font-display text-[34px] font-light leading-[1.12] tracking-[-0.3px] text-white md:mt-[26px] md:text-[clamp(40px,3.6vw,52px)] md:leading-[1.08] md:tracking-[-0.5px]">
              <b className="font-black">המקצוענים</b> שמנצחים את הבירוקרטיה בדרך לזכויות
              <span className="mt-1.5 block text-[100px] font-black leading-[0.88] tracking-[-2px] md:mt-2 md:text-[clamp(120px,12.2vw,176px)] md:leading-[0.84] md:tracking-[-5px]">
                שלכם
              </span>
            </h1>
            <Entrance delay={0.2}>
              <ul className="m-0 mt-[18px] grid list-none grid-cols-3 gap-2 p-0 md:mt-7 md:grid-cols-[repeat(3,minmax(0,170px))] md:gap-3">
                {heroInstitutions.map((inst) => (
                  <li key={inst.label} className="flex flex-col gap-1.5 md:gap-[9px]">
                    <span className="text-[15px] font-black md:text-xl">{inst.label}</span>
                    <span aria-hidden className={`brush h-[7px] md:h-2.5 ${inst.brush}`} />
                  </li>
                ))}
              </ul>
            </Entrance>
          </div>
          <Entrance delay={0.25} fade className="flex justify-center">
            <CmsImage
              src={teamImage}
              alt={teamImageAlt}
              width={1536}
              height={1024}
              priority
              sizes="(min-width: 768px) 48vw, 100vw"
              className="mb-14 mt-[22px] h-auto w-full max-w-[690px] drop-shadow-[0_16px_32px_rgba(0,10,60,0.4)] md:my-0 md:drop-shadow-[0_24px_48px_rgba(0,10,60,0.45)]"
            />
          </Entrance>
        </div>
      </section>

      {/* כרטיס הטופס — עולה על ההירו */}
      <div className="relative z-[2] mx-3.5 -mt-12 md:mx-auto md:-mt-[72px] md:max-w-[1440px] md:px-[clamp(24px,5vw,72px)]">
        <Entrance delay={0.2}>
          <div
            id="lead-form"
            className="scroll-mt-28 rounded-2xl bg-white px-[18px] pb-[18px] pt-5 shadow-[rgba(10,21,112,0.20)_0_22px_50px] md:rounded-[18px] md:px-8 md:py-7 md:shadow-[rgba(10,21,112,0.18)_0_28px_64px]"
          >
            <EligibilityQuiz />
          </div>
        </Entrance>
      </div>
    </>
  );
}
