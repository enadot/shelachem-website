import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArticles } from "@/lib/content";
import { ArticleCard } from "@/components/shared/article-card";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "המגזין",
  description:
    "מדריכים, עדכוני חוק וסיפורי הצלחה על מימוש זכויות רפואיות — בשפה של בני אדם, לא של פקידים.",
};

const categories = ["הכל", "מדריכים", "חדשות", "סיפורי הצלחה"];

export default async function MagazinePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const activeCat = categories.includes(cat ?? "") ? (cat as string) : "הכל";
  const articles = await getArticles();

  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);
  const visible = rest.filter((a) => activeCat === "הכל" || a.category === activeCat);
  const mostRead = rest.slice(0, 4);

  return (
    <>
      {/* header */}
      <section className="border-b border-hairline bg-white px-6 pb-6 pt-8 md:px-[clamp(24px,6.7vw,96px)] md:pt-10">
        <div className="mx-auto max-w-[1240px]">
          <nav className="mb-4 flex items-center gap-2 text-sm text-ink-faint" aria-label="פירורי לחם">
            <Link href="/" className="text-ink-faint no-underline hover:text-brand">בית</Link>
            <span aria-hidden>‹</span>
            <span className="font-bold text-ink">המגזין</span>
          </nav>
          <h1 className="m-0 mb-2 font-display text-[34px] font-light tracking-tight text-ink md:text-[48px]">
            ידע זה כוח. <span className="keyword-underline">וכוח זה כסף שמגיע לכם.</span>
          </h1>
          <p className="m-0 max-w-[720px] text-[17px] leading-relaxed text-ink-secondary md:text-lg">
            מדריכים, עדכוני חוק וכל מה שצריך לדעת כדי לא לפספס אף זכות — בשפה של בני אדם, לא של
            פקידים.
          </p>
        </div>
      </section>

      {/* featured */}
      {featured && (
        <section className="px-6 pt-6 md:px-[clamp(24px,6.7vw,96px)]">
          <Reveal className="mx-auto max-w-[1240px]">
            <Link
              href={`/magazine/${featured.slug}`}
              className="grid min-h-[280px] overflow-hidden rounded-card bg-ink text-white no-underline md:min-h-[380px] md:grid-cols-[1.15fr_1fr]"
            >
              <div className="relative min-h-[200px] bg-surface-blue md:min-h-[380px]">
                {featured.image && (
                  <Image src={featured.image} alt="" fill sizes="(max-width:768px) 100vw, 640px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-col justify-center gap-4 p-7 md:px-[46px] md:py-11">
                <div className="flex items-center gap-3">
                  <span className="pill bg-accent px-3.5 py-1.5 text-[13.5px] font-bold text-white">
                    הכתבה המרכזית
                  </span>
                  <span className="tnum text-sm text-white/65">
                    {featured.category} · {featured.readingMinutes} דק׳ קריאה
                  </span>
                </div>
                <div className="font-display text-[26px] font-bold leading-tight md:text-[38px]">
                  {featured.title}
                </div>
                <p className="m-0 text-[16px] leading-relaxed text-white/80 md:text-[17px]">
                  {featured.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-base font-bold text-[#ffd7d6]">
                  לקריאת הכתבה המלאה ←
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* grid + sidebar */}
      <section className="px-6 py-9 md:px-[clamp(24px,6.7vw,96px)] md:pb-14">
        <div className="mx-auto grid max-w-[1240px] items-start gap-10 md:grid-cols-[1fr_320px]">
          <div className="flex min-w-0 flex-col gap-5">
            {/* category chips */}
            <div className="flex flex-wrap items-center gap-2.5">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={c === "הכל" ? "/magazine" : `/magazine?cat=${encodeURIComponent(c)}`}
                  className={cn(
                    "pill min-h-11 border px-5 py-2 text-[15.5px] no-underline transition-colors inline-flex items-center",
                    activeCat === c
                      ? "border-brand bg-brand font-bold text-white"
                      : "border-[#cbd5e1] bg-white text-ink-secondary hover:border-brand hover:text-brand",
                  )}
                >
                  {c}
                </Link>
              ))}
              <span className="tnum ms-auto text-[14.5px] text-ink-faint">
                {visible.length} מאמרים
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-[18px]">
              {visible.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>

          {/* sidebar */}
          <aside className="flex flex-col gap-4.5 md:sticky md:top-24">
            <div className="rounded-[14px] border border-hairline bg-surface p-5">
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
            <div className="relative overflow-hidden rounded-[14px] bg-banner p-6 text-white">
              <div
                aria-hidden
                className="absolute -left-14 -top-20 h-[260px] w-[300px] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
              />
              <div className="relative">
                <div className="mb-1.5 font-display text-[22px] font-bold">קראתם והתעורר חשד שמגיע לכם?</div>
                <p className="m-0 mb-4 text-[14.5px] leading-relaxed text-white/85">
                  בדיקת זכאות ראשונה חינם — נגיד לכם ביושר אם יש בסיס לתביעה.
                </p>
                <Link
                  href="/#lead-form"
                  className="pill inline-block bg-accent px-5 py-2.5 text-[15px] font-bold text-white no-underline transition-colors hover:bg-accent-hover"
                >
                  בדקו את הזכאות שלי ›
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
