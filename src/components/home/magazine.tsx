import Link from "next/link";
import type { Article } from "@/lib/content/types";
import { Carousel } from "@/components/shared/carousel";
import { ArticleCard } from "@/components/shared/article-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArrowForward } from "@/components/shared/icons";

/** קרוסלת המגזין (homepage-live.html §8). */
export function Magazine({ articles }: { articles: Article[] }) {
  return (
    <section className="px-6 pb-16 md:px-[clamp(24px,6.7vw,96px)] md:pb-24">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <SectionHeading strong="וכוח זה כסף שמגיע לכם." className="text-[28px] md:text-[38px]">
            ידע זה כוח.
          </SectionHeading>
          <Link href="/magazine" className="inline-flex items-center gap-1.5 text-lg text-brand no-underline hover:underline">
            לכל הכתבות
            <ArrowForward size={16} />
          </Link>
        </div>
        <p className="m-0 mb-7 max-w-[640px] text-[17px] text-ink-secondary md:text-[19px]">
          מדריכים, עדכוני חוק וכל מה שצריך לדעת כדי לא לפספס אף זכות — בשפה של בני אדם, לא של
          פקידים.
        </p>
        <Carousel ariaLabel="כתבות מהמגזין" itemGap={20}>
          {articles.slice(0, 8).map((a) => (
            <ArticleCard key={a.id} article={a} className="w-[85vw] max-w-[340px]" />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
