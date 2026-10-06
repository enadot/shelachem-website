import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { ArrowForward } from "@/components/shared/icons";
import { site } from "@/lib/config";

/** הסיפור שלנו (designs/homepage-v3.html) — טקסט + תמונה עם תגית זהב. */
export function Story() {
  return (
    <section className="px-[22px] py-[52px] md:px-[clamp(24px,5vw,72px)] md:py-[100px]">
      <Reveal className="mx-auto flex max-w-[1296px] flex-col-reverse gap-[26px] md:grid md:grid-cols-2 md:items-center md:gap-20">
        <div>
          <div className="mb-2 text-sm font-black tracking-[1px] text-brand md:mb-3 md:text-[15px]">
            הסיפור שלנו
          </div>
          <h2 className="m-0 mb-3.5 font-display text-[28px] font-light leading-[1.2] text-ink md:mb-6 md:text-[48px] md:leading-[1.08] md:tracking-[-0.5px]">
            מ-{site.foundedYear} אנחנו עושים דבר אחד
            <br />
            <span className="font-black">ועושים אותו עד הסוף.</span>
          </h2>
          <p className="m-0 mb-3 text-base leading-relaxed text-ink-secondary md:mb-4 md:text-[19px] md:leading-[1.65]">
            ״שלכם״ קמה מתוך אמונה פשוטה: לאף אחד אסור שייגמר הכוח מול הבירוקרטיה לפני שהוא מקבל
            את מה שמגיע לו. במשך שנים ליווינו {site.stats.clients} לקוחות&nbsp;במאבק מול ביטוח
            לאומי, מס הכנסה, קרנות הפנסיה וחברות הביטוח — והבאנו תוצאות.
          </p>
          <p className="m-0 mb-[18px] text-base font-bold leading-relaxed text-ink md:mb-7 md:text-[19px] md:leading-[1.65]">
            היום אנחנו פותחים את הדלת לכולם. כי הזכות למימוש זכויות לא שייכת לאף מגזר, לאף קבוצה
            ולאף אחד חוץ מכם. היא שלכם.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-base font-bold text-brand no-underline hover:underline md:rounded-[10px] md:border-[1.5px] md:border-brand md:px-[26px] md:py-[13px] md:text-[17px] md:hover:bg-surface-blue md:hover:no-underline"
          >
            קצת יותר עלינו
            <ArrowForward size={16} />
          </Link>
        </div>
        <div className="relative">
          <div className="relative h-[220px] overflow-hidden rounded-[14px] md:h-[480px] md:rounded-[18px]">
            <Image
              src="/images/story.webp"
              alt="צוות שלכם בפגישה עם לקוח"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <span className="badge-gold tnum absolute -bottom-3.5 right-4 px-5 pb-[7px] pt-2 text-[17px] md:-right-5 md:bottom-8 md:px-[30px] md:pb-2.5 md:pt-[11px] md:text-[23px]">
            {site.stats.clients} לקוחות
          </span>
        </div>
      </Reveal>
    </section>
  );
}
