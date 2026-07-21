import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";

/** הסיפור שלנו (homepage-live.html §5) — טקסט + ויז'ואל מותג (עד שתסופק תמונה). */
export function Story() {
  return (
    <section className="px-6 pb-16 pt-2 md:px-[clamp(24px,6.7vw,96px)] md:pb-24">
      <Reveal className="mx-auto grid max-w-[1240px] items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-[72px]">
        <div>
          <div className="mb-3 text-lg font-bold text-brand md:text-xl">הסיפור שלנו</div>
          <h2 className="m-0 mb-6 font-display text-[28px] font-light leading-tight tracking-tight text-ink md:text-[40px]">
            מ-2013 אנחנו עושים דבר אחד
            <br />
            <span className="font-bold">ועושים אותו עד הסוף.</span>
          </h2>
          <p className="m-0 mb-4 text-[17px] leading-relaxed text-ink-secondary md:text-[19px]">
            ״שלכם״ קמה מתוך אמונה פשוטה: לאף אחד אסור שייגמר הכוח מול הבירוקרטיה לפני שהוא מקבל
            את מה שמגיע לו. במשך שנים ליווינו 10,059 לקוחות&nbsp;במאבק מול ביטוח לאומי, מס
            הכנסה, קרנות הפנסיה וחברות הביטוח — והבאנו תוצאות.
          </p>
          <p className="m-0 mb-7 text-[17px] font-bold leading-relaxed text-ink-secondary md:text-[19px]">
            היום אנחנו פותחים את הדלת לכולם. כי הזכות למימוש זכויות לא שייכת לאף מגזר, לאף קבוצה
            ולאף אחד חוץ מכם. היא שלכם.
          </p>
          <Link href="/about" className="text-lg text-brand no-underline hover:underline">
            קצת יותר עלינו ←
          </Link>
        </div>
        <div className="relative flex h-[280px] items-center justify-center overflow-hidden rounded-xl border border-hairline bg-surface-blue md:h-[420px]">
          <Image
            src="/images/heart.svg"
            alt=""
            aria-hidden
            width={220}
            height={220}
            className="opacity-20"
          />
        </div>
      </Reveal>
    </section>
  );
}
