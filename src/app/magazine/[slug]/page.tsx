import type { Metadata } from "next";
import { CmsImage } from "@/components/shared/cms-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getArticles } from "@/lib/content";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { ArticleCard } from "@/components/shared/article-card";
import { Entrance } from "@/components/shared/reveal";
import { site } from "@/lib/config";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: "article" },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const all = await getArticles();
  const readNext = (
    article.related?.length
      ? article.related.map((s) => all.find((a) => a.slug === s)).filter((a) => a !== undefined)
      : all.filter((a) => a.slug !== article.slug)
  ).slice(0, 3);

  const tocSections = (article.body ?? []).filter((s) => s.heading);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    inLanguage: "he",
    author: article.author
      ? { "@type": "Person", name: article.author.name, jobTitle: article.author.role }
      : { "@type": "Organization", name: site.shortName },
    publisher: { "@type": "Organization", name: site.name, url: site.domain },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-[1040px] px-6 pt-7 md:px-12">
        {/* breadcrumb + header */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-faint" aria-label="פירורי לחם">
          <Link href="/" className="text-ink-faint no-underline hover:text-brand">בית</Link>
          <span aria-hidden>‹</span>
          <Link href="/magazine" className="text-ink-faint no-underline hover:text-brand">המגזין</Link>
          <span aria-hidden>‹</span>
          <Link
            href={`/magazine?cat=${encodeURIComponent(article.category)}`}
            className="text-ink-faint no-underline hover:text-brand"
          >
            {article.category}
          </Link>
        </nav>
        <div className="flex flex-col gap-4 pt-6">
          <div className="flex items-center gap-3">
            <span className="pill bg-[#eef0ff] px-4 py-1.5 text-sm font-bold text-brand">
              {article.category}
            </span>
            <span className="tnum text-[15px] text-ink-faint">
              עודכן ב{article.publishedLabel} · {article.readingMinutes} דק׳ קריאה
            </span>
          </div>
          <Entrance>
            <h1 className="m-0 max-w-[900px] font-display text-[32px] font-light leading-[1.15] tracking-tight text-ink md:text-[54px] md:leading-[1.12]">
              {article.title}
            </h1>
          </Entrance>
          <p className="m-0 max-w-[820px] text-[17px] leading-relaxed text-ink-secondary md:text-xl">
            {article.excerpt}
          </p>
          {article.author && (
            <div className="flex items-center gap-3.5 pb-5 pt-1.5">
              <PersonAvatar name={article.author.name} size={48} />
              <div>
                <div className="text-base font-bold text-ink">{article.author.name}</div>
                <div className="text-sm text-ink-faint">{article.author.role}</div>
              </div>
            </div>
          )}
        </div>
        {/* hero image */}
        <div className="relative h-[220px] overflow-hidden rounded-card bg-surface-blue md:h-[420px]">
          {article.image && (
            <CmsImage src={article.image} alt="" fill sizes="(max-width:768px) 100vw, 1040px" className="object-cover" priority />
          )}
        </div>
      </div>

      {/* body + side rail */}
      <div className="mx-auto grid max-w-[1040px] items-start gap-10 px-6 py-9 md:grid-cols-[1fr_260px] md:gap-14 md:px-12 md:py-11">
        <article className="flex min-w-0 flex-col gap-7 text-lg leading-[1.75] text-ink-secondary">
          {(article.body ?? []).map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              {section.heading && (
                <h2 className="m-0 mb-3.5 font-display text-[26px] font-light tracking-tight text-ink md:text-[34px]">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 32)} className="m-0 mb-3.5 last:mb-0">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="m-0 flex flex-col gap-3 pe-0 ps-5">
                  {section.bullets.map((b) => (
                    <li key={b.slice(0, 32)}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* mid-article CTA */}
          <div className="relative overflow-hidden rounded-2xl bg-banner px-7 py-7 text-white md:px-8">
            <div
              aria-hidden
              className="absolute -left-[70px] -top-[110px] h-[360px] w-[420px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
            />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="min-w-[260px] flex-1">
                <div className="mb-1.5 font-display text-[22px] font-bold md:text-[26px]">
                  קיבלתם פחות ממה שמגיע לכם?
                </div>
                <div className="text-base leading-relaxed text-white/85">
                  בדיקת זכאות ראשונה חינם — נבחן את הקביעה שלכם ונגיד ביושר אם יש בסיס לערר.
                </div>
              </div>
              <Link
                href="/#lead-form"
                className="pill inline-block shrink-0 bg-accent px-8 py-3.5 text-[17px] font-bold text-white no-underline transition-colors hover:bg-accent-hover"
              >
                בדקו את הזכאות שלי ›
              </Link>
            </div>
          </div>

          {/* author bio */}
          {article.author?.bio && (
            <div className="flex items-start gap-5 rounded-2xl border border-hairline bg-surface px-7 py-6">
              <PersonAvatar name={article.author.name} size={64} />
              <div>
                <div className="mb-1 text-sm font-bold text-accent">הכירו את המומחית</div>
                <div className="mb-1.5 text-[19px] font-bold text-ink">{article.author.name}</div>
                <p className="m-0 text-base leading-relaxed text-ink-secondary">{article.author.bio}</p>
              </div>
            </div>
          )}
        </article>

        {/* side rail */}
        <aside className="hidden flex-col gap-4.5 md:sticky md:top-24 md:flex">
          {tocSections.length > 0 && (
            <div className="rounded-[14px] border border-hairline bg-surface px-5 py-5">
              <div className="mb-3 text-[15px] font-bold text-ink">בעמוד הזה</div>
              <div className="flex flex-col gap-2 text-[14.5px] leading-snug">
                {tocSections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="text-ink-secondary no-underline hover:text-brand">
                    {s.heading}
                  </a>
                ))}
              </div>
            </div>
          )}
          <Link
            href="/#lead-form"
            className="pill block bg-brand px-5 py-3 text-center text-[15px] font-bold text-white no-underline transition-colors hover:bg-brand-hover"
          >
            בדיקת זכאות חינם ›
          </Link>
        </aside>
      </div>

      {/* read next */}
      {readNext.length > 0 && (
        <section className="bg-surface px-6 py-10 md:px-[clamp(24px,6.7vw,96px)] md:py-14">
          <div className="mx-auto max-w-[1240px]">
            <h2 className="m-0 mb-6 font-display text-[24px] font-light md:text-[32px]">
              המשיכו <span className="keyword-underline">לקרוא</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
              {readNext.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
