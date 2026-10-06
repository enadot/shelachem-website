import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { Eyebrow } from "@/components/shared/eyebrow";
import { ArrowForward } from "@/components/shared/icons";
import { site } from "@/lib/config";

const stats = [
  { value: String(site.foundedYear), label: "שנת הקמה" },
  { value: site.stats.clients, label: "לקוחות שליווינו" },
  { value: "0 ₪", label: "מראש — שכר טרחה רק בהצלחה" },
];

/**
 * הסיפור שלנו — תמונה שנחשפת במסכה, פסקה אחת, ורצועת מספרים גדולים עם קווי
 * שיער (במקום תגית זהב על התמונה).
 */
export function Story() {
  return (
    <section className="px-[22px] py-16 md:px-[clamp(24px,5vw,72px)] md:py-[120px]">
      <div className="mx-auto max-w-[1296px]">
        <Eyebrow index="04">הסיפור שלנו</Eyebrow>
        <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-[1fr_1.1fr] md:items-end md:gap-20">
          <div>
            <Reveal
              as="h2"
              variant="mask"
              className="m-0 mb-5 font-display text-[32px] font-light leading-[1.1] text-ink md:mb-7 md:text-[56px] md:leading-[1.02] md:tracking-[-0.02em]"
            >
              מ-{site.foundedYear} אנחנו עושים דבר אחד <span className="font-black">ועושים אותו עד הסוף.</span>
            </Reveal>
            <Reveal>
              <p className="m-0 mb-6 max-w-[520px] text-base leading-relaxed text-ink-secondary md:mb-8 md:text-lg">
                {`ליווינו ${site.stats.clients} לקוחות מול ביטוח לאומי, מס הכנסה, קרנות הפנסיה וחברות הביטוח.`}{" "}
                <b className="text-ink">הזכות לא שייכת לאף מגזר — היא שלכם.</b>
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-base font-bold text-brand no-underline md:text-[17px]"
              >
                <span className="link-draw">קצת יותר עלינו</span>
                <ArrowForward size={16} className="nudge" />
              </Link>
            </Reveal>
          </div>
          <Reveal variant="image" className="relative aspect-[4/3] rounded-2xl md:aspect-[5/4]">
            <Image
              src="/images/story.webp"
              alt="צוות שלכם"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>

        <Reveal
          as="ul"
          variant="stagger"
          className="m-0 mt-12 grid list-none border-t border-hairline p-0 md:mt-20 md:grid-cols-3"
        >
          {stats.map((st) => (
            <li
              key={st.label}
              className="flex items-baseline justify-between gap-4 border-b border-hairline py-5 md:flex-col md:items-start md:justify-start md:gap-3 md:border-b-0 md:py-8 md:[&:not(:first-child)]:border-r md:[&:not(:first-child)]:pr-8"
            >
              <span className="tnum font-display text-[44px] font-light leading-none text-ink md:text-[80px] md:tracking-[-0.02em]">
                {st.value}
              </span>
              <span className="text-[15px] text-ink-muted md:text-base">{st.label}</span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
