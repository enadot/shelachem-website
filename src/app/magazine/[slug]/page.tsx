import type { Metadata } from "next";
import { LeadCta } from "@/components/shared/lead-cta";
import { notFound } from "next/navigation";
import { getArticle, getArticles } from "@/lib/content";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { ArticleCard } from "@/components/shared/article-card";
import { ArticleImage } from "@/components/shared/article-image";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Check, ChevronForward } from "@/components/shared/icons";
import { ORG_ID, WEBSITE_ID, ref } from "@/lib/schema";
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
    alternates: { canonical: `/magazine/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt ?? article.publishedAt ?? undefined,
      ...(article.image ? { images: [{ url: article.image }] } : {}),
    },
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

  const url = `${site.domain}/magazine/${article.slug}`;
  const wordCount = (article.body ?? []).reduce(
    (n, sec) =>
      n +
      [sec.heading ?? "", ...sec.paragraphs, ...(sec.bullets ?? [])]
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length,
    0,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: article.title,
    description: article.excerpt,
    inLanguage: "he-IL",
    articleSection: article.category,
    wordCount,
    isAccessibleForFree: true,
    ...(article.publishedAt
      ? {
          datePublished: article.publishedAt,
          dateModified: article.updatedAt ?? article.publishedAt,
        }
      : {}),
    ...(article.image ? { image: new URL(article.image, site.domain).href } : {}),
    author: article.author
      ? {
          "@type": "Person",
          name: article.author.name,
          jobTitle: article.author.role,
          worksFor: ref(ORG_ID),
        }
      : ref(ORG_ID),
    publisher: ref(ORG_ID),
    isPartOf: ref(WEBSITE_ID),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-[1040px] px-6 pt-7 md:px-12">
        {/* breadcrumb + header */}
        <Breadcrumb
          items={[
            { label: "בית", href: "/" },
            { label: "המגזין", href: "/magazine" },
            {
              label: article.category,
              href: `/magazine?cat=${encodeURIComponent(article.category)}`,
            },
          ]}
        />
        <div className="flex flex-col gap-4 pt-6">
          <div className="flex items-center gap-3">
            <span className="pill bg-[#eef0ff] px-4 py-1.5 text-sm font-bold text-brand">
              {article.category}
            </span>
            <span className="tnum text-[15px] text-ink-faint">
              עודכן ב{article.publishedLabel} · {article.readingMinutes} דק׳ קריאה
            </span>
          </div>
          {/*
            ה-h1 אינו עטוף באנימציית כניסה. נמדד ב-6× CPU / 400kbps: ה-HTML צויר
            אחרי 2.28ש׳ אבל הכותרת נשארה ב-opacity:0 עד ש-failsafe ההידרציה שוחרר
            אותה ב-5.95ש׳ — כלומר כמעט 4 שניות של עמוד ריק מול הפרסונה המרכזית
            (רבקה, אנדרואיד ישן), כשהתוכן כבר היה ב-DOM. ה-h1 הוא גם אלמנט ה-LCP.
          */}
          <h1 className="m-0 max-w-[900px] font-display text-[32px] font-light leading-[1.15] tracking-tight text-ink md:text-[54px] md:leading-[1.12]">
            {article.title}
          </h1>
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
          <ArticleImage
            src={article.image}
            alt={article.imageAlt}
            sizes="(max-width:768px) 100vw, 1040px"
            priority
            markSize={260}
          />
        </div>
      </div>

      {/* body + side rail */}
      <div className="mx-auto grid max-w-[1040px] items-start gap-10 px-6 py-9 md:grid-cols-[1fr_260px] md:gap-14 md:px-12 md:py-11">
        <article className="flex min-w-0 flex-col gap-7 text-lg leading-[1.75] text-ink-secondary">
          {/* בשורה התחתונה — התשובה הישירה לפני הפירוט. הפורמט שמנועי מענה
              מצטטים, וגם מה שקורא ממהר צריך כדי להחליט להישאר. */}
          {article.keyPoints && article.keyPoints.length > 0 && (
            <div className="rounded-[14px] border border-hairline bg-surface px-6 py-5">
              <h2 className="m-0 mb-3 font-body text-[17px] font-bold text-ink">
                בשורה התחתונה
              </h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[16.5px] leading-relaxed">
                {article.keyPoints.map((point) => (
                  <li key={point.slice(0, 32)} className="flex gap-2.5">
                    <Check size={18} className="mt-1.5 shrink-0 text-brand" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* תוכן העמוד — במובייל הסרגל הצדדי מוסתר, וכתבה של 9 דקות נשארה
              בלי שום ניווט פנימי. */}
          {tocSections.length > 1 && (
            <nav aria-label="בעמוד הזה" className="md:hidden">
              <details className="rounded-[14px] border border-hairline bg-surface px-5 py-4">
                <summary className="cursor-pointer text-[15.5px] font-bold text-ink">
                  בעמוד הזה — {tocSections.length} פרקים
                </summary>
                <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0 text-[15.5px]">
                  {tocSections.map((sec) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        className="inline-flex min-h-11 items-center gap-1.5 text-ink-secondary no-underline"
                      >
                        <ChevronForward size={14} className="text-brand" />
                        {sec.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </nav>
          )}
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
          <div className="surface-navy relative overflow-hidden rounded-2xl bg-banner px-7 py-7 text-white md:px-8">
            <div
              aria-hidden
              className="absolute -left-[70px] -top-[110px] h-[360px] w-[420px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
            />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="min-w-[260px] flex-1">
                {/* ההרגעה מובילה, לא נגררת: לקורא שכבר מתבייש בקביעה נמוכה,
                    "קיבלתם פחות ממה שמגיע לכם?" בפתיחה נקרא כהאשמה. */}
                <div className="mb-1.5 font-display text-[22px] font-bold md:text-[26px]">
                  נבדוק את הקביעה שלכם, ונגיד ביושר.
                </div>
                <div className="text-base leading-relaxed text-white/85">
                  בדיקת זכאות ראשונה חינם — אם אין בסיס לערר נאמר לכם את זה, בלי לגרור אתכם
                  לתהליך.
                </div>
              </div>
              <LeadCta sourcePage="article-cta" topic={article.category} className="shrink-0">
                בדקו את הזכאות שלי
                <ChevronForward size={16} />
              </LeadCta>
            </div>
          </div>

          {/* author bio */}
          {article.author?.bio && (
            <div className="flex items-start gap-5 rounded-2xl border border-hairline bg-surface px-7 py-6">
              <PersonAvatar name={article.author.name} size={64} />
              <div>
                {/* #c93330 על #f6f9fc = 4.97:1 — text-accent נפל שם ב-4.31:1 */}
                <div className="mb-1 text-sm font-bold text-accent-text">הכירו את המומחית</div>
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
          {/* היה עוגן לעמוד אחר, לצד CTA שפותח מודאל — אותה מילה, שתי התנהגויות */}
          <LeadCta
            sourcePage="article-rail"
            topic={article.category}
            variant="brand"
            size="sm"
            className="w-full"
          />
        </aside>
      </div>

      {/* read next */}
      {readNext.length > 0 && (
        <section className="bg-surface px-6 py-10 md:px-[clamp(24px,6.7vw,96px)] md:py-14">
          <div className="mx-auto max-w-[1240px]">
            <SectionHeading strong="לקרוא" underlineStrong className="mb-6 text-[24px] md:text-[32px]">
              המשיכו
            </SectionHeading>
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
