import type { Metadata } from "next";
import { Suspense } from "react";
import { CmsImage } from "@/components/shared/cms-image";
import { LeadCta } from "@/components/shared/lead-cta";
import Link from "next/link";
import { getArticles } from "@/lib/content";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { CategoryFilter } from "@/components/magazine/category-filter";
import { ArrowForward, ChevronForward } from "@/components/shared/icons";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "המגזין",
  alternates: { canonical: "/magazine" },
  description:
    "מדריכים, עדכוני חוק וסיפורי הצלחה על מימוש זכויות רפואיות — בשפה של בני אדם, לא של פקידים.",
};

/**
 * העמוד סטטי: הסינון לפי קטגוריה עבר ל-`CategoryFilter` בצד הלקוח, ולכן אין כאן
 * `searchParams` שהופך כל בקשה לרינדור בשרת.
 */
export default async function MagazinePage() {
  const articles = await getArticles();

  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);
  const mostRead = rest.slice(0, 4);

  return (
    <>
      {/* header */}
      <section className="bg-white px-6 pb-8 pt-8 md:px-[clamp(24px,6.7vw,96px)] md:pb-12 md:pt-10">
        <div className="mx-auto max-w-[1240px]">
          <Breadcrumb
            className="mb-4"
            items={[{ label: "בית", href: "/" }, { label: "המגזין" }]}
          />
          <h1 className="m-0 mb-4 max-w-[980px] font-display text-[36px] font-light leading-[1.08] tracking-[-0.01em] text-ink md:mb-6 md:text-[64px] md:leading-[1.02] md:tracking-[-0.02em]">
            ידע זה כוח. <span className="font-black">וכוח זה כסף שמגיע לכם.</span>
          </h1>
          <p className="m-0 max-w-[720px] text-[17px] leading-relaxed text-ink-secondary md:text-lg">
            מדריכים, עדכוני חוק וכל מה שצריך לדעת כדי לא לפספס אף זכות — בשפה של בני אדם, לא של
            פקידים.
          </p>
        </div>
      </section>

      {/* featured */}
      {featured && (
        <section className="px-6 md:px-[clamp(24px,6.7vw,96px)]">
          <Reveal className="mx-auto max-w-[1240px]">
            <Link
              href={`/magazine/${featured.slug}`}
              className="group grid min-h-[280px] overflow-hidden rounded-2xl bg-ink text-white no-underline md:min-h-[420px] md:grid-cols-[1.15fr_1fr]"
            >
              <div className="relative min-h-[220px] overflow-hidden bg-surface-blue md:min-h-[420px] [&_img]:transition-transform [&_img]:duration-1000 [&_img]:ease-[var(--ease-out)] group-hover:[&_img]:scale-[1.03]">
                {featured.image && (
                  <CmsImage src={featured.image} alt="" fill sizes="(max-width:768px) 100vw, 640px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-col justify-center gap-4 p-7 md:px-[46px] md:py-11">
                <div className="flex items-center gap-3">
                  <span className="text-[13.5px] font-bold text-gold">הכתבה המרכזית</span>
                  <span aria-hidden className="h-px w-4 bg-white/30" />
                  <span className="tnum text-sm text-white/65">
                    {featured.category} · {featured.readingMinutes} דק׳ קריאה
                  </span>
                </div>
                <div className="font-display text-[28px] font-black leading-[1.1] md:text-[42px]">
                  {featured.title}
                </div>
                <p className="m-0 text-[16px] leading-relaxed text-white/80 md:text-[17px]">
                  {featured.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-base font-bold text-gold">
                  <span className="link-draw">לקריאת הכתבה המלאה</span>
                  <ArrowForward size={17} className="nudge" />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* grid + sidebar */}
      <section className="px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-20">
        <div className="mx-auto grid max-w-[1240px] items-start gap-10 md:grid-cols-[1fr_320px]">
          <div className="flex min-w-0 flex-col gap-5">
            {/* הסינון קורא את ?cat= בצד הלקוח — Suspense שומר את העמוד סטטי */}
            <Suspense fallback={<div className="min-h-11" />}>
              <CategoryFilter articles={rest} />
            </Suspense>
          </div>

          {/* sidebar */}
          <aside className="flex flex-col gap-4.5 md:sticky md:top-24">
            <div className="border-t border-ink pt-4">
              <div className="mb-3 text-[15px] font-bold text-ink">הנקראים ביותר</div>
              <div className="flex flex-col gap-3">
                {mostRead.map((a, i) => (
                  <Link key={a.id} href={`/magazine/${a.slug}`} className="flex gap-3 text-ink no-underline hover:text-brand">
                    <span className="tnum font-display text-[22px] font-black leading-none text-hairline">
                      {i + 1}
                    </span>
                    <span className="text-[14.5px] leading-snug">{a.title}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="surface-navy relative overflow-hidden rounded-[14px] bg-banner p-6 text-white">
              <div className="relative">
                <div className="mb-1.5 font-display text-[22px] font-bold">קראתם והתעורר חשד שמגיע לכם?</div>
                <p className="m-0 mb-4 text-[14.5px] leading-relaxed text-white/85">
                  בדיקת זכאות ראשונה חינם — נגיד לכם ביושר אם יש בסיס לתביעה.
                </p>
                <LeadCta sourcePage="magazine-sidebar" size="sm" className="text-[15px]">
                  בדקו את הזכאות שלי
                  <ChevronForward size={15} />
                </LeadCta>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
