import Link from "next/link";
import type { Article } from "@/lib/content/types";
import { Carousel } from "@/components/shared/carousel";
import { ArticleImage } from "@/components/shared/article-image";
import { ArrowForward } from "@/components/shared/icons";

/** קרוסלת המגזין (designs/homepage-v3.html) — תמונה + כותרת, חצים רויאל. */
export function Magazine({ articles }: { articles: Article[] }) {
  return (
    <section className="py-[52px] md:px-[clamp(24px,5vw,72px)] md:py-[100px]">
      <div className="mx-auto max-w-[1296px]">
        <div className="px-[22px] md:px-0">
          <h2 className="m-0 mb-2 font-display text-[28px] font-light text-ink md:mb-3 md:text-[48px] md:tracking-[-0.5px]">
            ידע זה כוח. <span className="font-black">וכוח זה כסף שמגיע לכם.</span>
          </h2>
          <p className="m-0 mb-5 max-w-[760px] text-base text-ink-secondary md:mb-2 md:text-[19px]">
            מדריכים ועדכוני חוק — בשפה של בני אדם, לא של פקידים.
          </p>
        </div>
        <Carousel ariaLabel="כתבות מהמגזין" itemGap={24} className="px-[22px] md:px-0">
          {articles.slice(0, 8).map((a) => (
            <Link
              key={a.id}
              href={`/magazine/${a.slug}`}
              className="flex w-[250px] flex-col gap-3 text-ink no-underline transition-colors hover:text-brand md:w-[310px] md:gap-4"
            >
              <div className="relative h-[150px] overflow-hidden rounded-xl bg-surface-blue md:h-[200px] md:rounded-[14px]">
                <ArticleImage
                  src={a.image}
                  alt={a.imageAlt}
                  sizes="(max-width: 768px) 250px, 310px"
                  markSize={96}
                />
              </div>
              <div className="text-base font-bold leading-[1.4] md:text-[19px]">{a.title}</div>
            </Link>
          ))}
        </Carousel>
        <div className="px-[22px] pt-3.5 md:px-0 md:pt-6">
          <Link
            href="/magazine"
            className="inline-flex items-center gap-1.5 text-base font-bold text-brand no-underline hover:underline md:text-[17px]"
          >
            לכל הכתבות
            <ArrowForward size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
