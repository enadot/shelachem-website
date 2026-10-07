import Link from "next/link";
import type { Article } from "@/lib/content/types";
import { Carousel } from "@/components/shared/carousel";
import { ArticleImage } from "@/components/shared/article-image";
import { ArrowForward } from "@/components/shared/icons";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Reveal } from "@/components/shared/reveal";

/** קרוסלת המגזין — תמונה + כותרת; בריחוף התמונה מתקרבת בעדינות. */
export function Magazine({ articles }: { articles: Article[] }) {
  return (
    <section className="py-16 md:px-[clamp(24px,5vw,72px)] md:py-[120px]">
      <div className="mx-auto max-w-[1296px]">
        <div className="px-[22px] md:px-0">
          <Eyebrow index="06">מגזין</Eyebrow>
          <Reveal
            as="h2"
            variant="mask"
            className="m-0 mb-3 mt-6 font-display text-[32px] font-light leading-[1.1] text-ink md:mt-8 md:text-[56px] md:leading-[1.02] md:tracking-[-0.02em]"
          >
            ידע זה כוח. <span className="font-black">וכוח זה כסף שמגיע לכם.</span>
          </Reveal>
          <p className="m-0 mb-6 max-w-[760px] text-base text-ink-muted md:mb-2 md:text-lg">
            מדריכים ועדכוני חוק — בשפה של בני אדם, לא של פקידים.
          </p>
        </div>
        <Carousel ariaLabel="כתבות מהמגזין" itemGap={24} className="px-[22px] md:px-0">
          {articles.slice(0, 8).map((a) => (
            <Link
              key={a.id}
              href={`/magazine/${a.slug}`}
              className="group flex w-[260px] flex-col gap-3 text-ink no-underline transition-colors duration-300 hover:text-brand md:w-[340px] md:gap-4"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-blue [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[&_img]:scale-[1.04]">
                <ArticleImage
                  src={a.image}
                  alt={a.imageAlt}
                  sizes="(max-width: 768px) 250px, 310px"
                  markSize={96}
                />
              </div>
              <div className="text-base font-bold leading-[1.4] md:text-lg">{a.title}</div>
            </Link>
          ))}
        </Carousel>
        <div className="px-[22px] pt-3.5 md:px-0 md:pt-6">
          <Link
            href="/magazine"
            className="group inline-flex items-center gap-2 text-base font-bold text-brand no-underline md:text-[17px]"
          >
            <span className="link-draw">לכל הכתבות</span>
            <ArrowForward size={16} className="nudge" />
          </Link>
        </div>
      </div>
    </section>
  );
}
