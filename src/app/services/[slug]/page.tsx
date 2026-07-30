import type { Metadata } from "next";
import { CmsImage } from "@/components/shared/cms-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticles, getInstitution, getService, getServices } from "@/lib/content";
import { LeadForm } from "@/components/shared/lead-form";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { Carousel } from "@/components/shared/carousel";
import { Reveal } from "@/components/shared/reveal";
import { TaxCalculator } from "@/components/services/tax-calculator";
import { StatValue } from "@/components/magicui/number-ticker";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { PageCta } from "@/components/shared/page-cta";
import { ArrowForward, Bulb, Check, InfoCircle } from "@/components/shared/icons";
import { faqPageNode, serviceNode } from "@/lib/schema";
import { site } from "@/lib/config";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.heroIntro,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();
  const institution = await getInstitution(service.institutionSlug);

  /**
   * המשאבים נגזרים מהכתבות שבאמת פורסמו: הכותרת נלקחת מהכתבה עצמה במקום
   * ממחרוזת שהוקלדה בנפרד (שכבר סטתה מהכותרת האמיתית), וכתבה בלי גוף לא מוצגת
   * כלל — קודם הקישור הסקרן ביותר באתר הוביל לעמוד ריק.
   */
  const publishedArticles = await getArticles();
  const resources = service.resources
    .map((r) => {
      const slug = r.href.replace("/magazine/", "");
      const article = publishedArticles.find((a) => a.slug === slug);
      return article
        ? { href: r.href, title: article.title, image: article.image ?? r.image, article }
        : null;
    })
    .filter((r) => r !== null);

  const jsonLd = [
    serviceNode({
      name: service.name,
      description: service.heroIntro,
      slug: service.slug,
      institutionName: institution?.name,
    }),
    ...(service.faqs.length
      ? [faqPageNode(service.faqs, { url: `${site.domain}/services/${service.slug}` })]
      : []),
  ];

  return (
    <>
      {jsonLd.map((node) => (
        <script
          key={node["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}

      {/* hero */}
      <section className="border-b border-hairline bg-white px-6 pb-8 pt-8 md:px-[clamp(24px,6.7vw,96px)] md:pt-10">
        <div className="mx-auto max-w-[1240px]">
          <Breadcrumb
            className="mb-5"
            items={[
              { label: "בית", href: "/" },
              ...(institution
                ? [{ label: institution.name, href: `/institutions/${institution.slug}` }]
                : []),
              { label: service.name },
            ]}
          />
          <h1 className="m-0 mb-2.5 font-display text-[32px] font-light leading-[1.12] tracking-tight text-ink md:text-[52px]">
            {service.name.replace(" מטעמי בריאות", "")}{" "}
            {service.name.includes("מטעמי בריאות") && (
              <span className="keyword-underline">מטעמי בריאות</span>
            )}
          </h1>
          <p className="m-0 max-w-[68ch] text-[17px] leading-relaxed text-ink-secondary md:text-[19px]">
            {service.heroIntro}
          </p>
        </div>
      </section>

      {/* main grid */}
      <div className="mx-auto grid max-w-[1240px] items-start gap-10 px-6 py-10 md:grid-cols-[1fr_380px] md:px-[clamp(24px,6.7vw,96px)] md:py-12 lg:px-6">
        <div className="flex min-w-0 flex-col gap-10">
          {/* key takeaways */}
          {service.takeaways.length > 0 && (
            <Reveal className="rounded-[14px] border border-hairline border-s-[5px] border-s-brand bg-surface px-7 py-6">
              <h2 className="m-0 mb-3.5 flex items-center gap-2.5 font-body text-[19px] font-bold text-ink">
                <InfoCircle className="shrink-0 text-brand" />
                מה חשוב לדעת — בשורה התחתונה
              </h2>
              <ul className="m-0 grid list-none gap-3 p-0 text-base leading-normal text-ink-secondary md:grid-cols-2 md:gap-x-7">
                {service.takeaways.map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <Check size={18} className="mt-1 shrink-0 text-brand" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {/* eligibility */}
          {service.eligibility.length > 0 && (
            <Reveal>
              {/* היה `service.name.split(" ")[0]` — שרד רק לשירות היחיד שקיים
                  היום ("מי זכאי להחזרי?" לכל שם אחר). */}
              <SectionHeading strong="זכאי?" underlineStrong className="mb-4 text-[26px] md:text-[32px]">
                מי
              </SectionHeading>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {service.eligibility.map((e, i) => (
                  <li
                    key={e.title}
                    className="flex items-start gap-3.5 rounded-xl border border-hairline bg-white px-5 py-4"
                  >
                    {/* #b32926 על #fde3e2 = 5.29:1 — הצירוף הקודם (#c93330) נפל ב-4.32:1 */}
                    <span
                      aria-hidden
                      className="tnum flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-accent-tint-strong text-base font-bold text-accent-ink"
                    >
                      {i + 1}
                    </span>
                    <div className="max-w-[68ch] text-[16.5px] leading-relaxed text-ink-secondary">
                      <b className="text-ink">{e.title}</b> — {e.description}
                    </div>
                  </li>
                ))}
              </ul>
              {service.eligibilityTip && (
                <p className="m-0 mt-4 flex max-w-[68ch] items-start gap-2.5 rounded-[10px] bg-surface px-4.5 py-3.5 text-[15.5px] leading-relaxed text-ink-muted">
                  <Bulb className="mt-0.5 shrink-0 text-accent-text" />
                  <span>{service.eligibilityTip}</span>
                </p>
              )}
            </Reveal>
          )}

          {/* sections */}
          {service.sections.length > 0 && (
            <Reveal className="flex flex-col gap-6">
              <SectionHeading strong="שכדאי להכיר" underlineStrong className="text-[26px] md:text-[32px]">
                מצבים
              </SectionHeading>
              {service.sections.map((sec) => (
                <div key={sec.id}>
                  <h3 className="m-0 mb-2 text-[21px] font-bold text-ink">{sec.heading}</h3>
                  {sec.paragraphs.map((p) => (
                    <p key={p.slice(0, 32)} className="m-0 max-w-[68ch] text-[16.5px] leading-relaxed text-ink-secondary">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </Reveal>
          )}

          {/* calculator */}
          {service.hasTaxCalculator && (
            <Reveal>
              <TaxCalculator />
            </Reveal>
          )}

          {/* testimonials */}
          {service.testimonials.length > 0 && (
            <Reveal>
              <SectionHeading strong="בזכות שלכם" underlineStrong className="mb-4 text-[26px] md:text-[32px]">
                קיבלו פטור
              </SectionHeading>
              {/* showArrows היה false — בדסקטופ 224px מהקרוסלה היו מחוץ למסך בלי
                  שום דרך להגיע אליהם בעכבר. */}
              <Carousel ariaLabel="סיפורי לקוחות">
                {service.testimonials.map((t) => (
                  <TestimonialCard key={t.id} testimonial={t} className="bg-surface" />
                ))}
              </Carousel>
            </Reveal>
          )}

          {/* FAQ */}
          {service.faqs.length > 0 && (
            <Reveal>
              <SectionHeading strong="נפוצות" underlineStrong className="mb-4 text-[26px] md:text-[32px]">
                שאלות
              </SectionHeading>
              <FaqAccordion items={service.faqs} />
              <Link
                href="/faq"
                className="mt-3.5 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-brand no-underline hover:underline"
              >
                לכל השאלות והתשובות
                <ArrowForward size={16} />
              </Link>
            </Reveal>
          )}

          {/* resources */}
          {resources.length > 0 && (
            <Reveal>
              <SectionHeading strong="בנושא" underlineStrong className="mb-4 text-[26px] md:text-[32px]">
                להעמיק
              </SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                {resources.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-white text-ink no-underline transition-shadow hover:shadow-[0_12px_32px_rgba(13,37,61,0.12)]"
                  >
                    <div className="relative h-[120px] bg-surface-blue">
                      {r.image && <CmsImage src={r.image} alt="" fill sizes="300px" className="object-cover" />}
                    </div>
                    <div className="flex flex-col gap-2.5 px-5 py-4">
                      <div className="text-[16.5px] leading-snug">{r.title}</div>
                      <div className="flex items-center gap-1.5 text-[15px] font-bold text-brand">
                        למאמר במגזין
                        <ArrowForward size={15} className="transition-transform group-hover:-translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* sidebar */}
        <aside className="flex flex-col gap-5 md:sticky md:top-24">
          {/* id="lead-form" — MobileCtaBar מסתתר כשהטופס נראה, ובלי ה-id הזה הבר
              היה קבוע לנצח דווקא בעמודים שנושאים את התנועה האורגנית. */}
          <div
            id="lead-form"
            className="relative flex scroll-mt-24 flex-col gap-3 rounded-card border border-[#e6ebf2] bg-white px-6 pb-5 pt-9 shadow-[0_20px_48px_rgba(13,37,61,0.14)]"
          >
            <div className="pill absolute -top-[19px] right-5 bg-brand px-4.5 py-3 text-[15px] font-bold leading-none text-white shadow-[0_10px_24px_rgba(0,0,120,0.25)]">
              בודקים זכאות — חינם
            </div>
            <LeadForm sourcePage={`service-${service.slug}`} submitLabel="חזרו אליי" withMarketingConsent={false} />
          </div>

          {/* why us */}
          <div className="rounded-2xl border border-hairline bg-surface p-6">
            <div className="mb-4 text-lg font-bold text-ink">למה שלכם?</div>
            <div className="flex flex-col gap-3.5 text-[15.5px] text-ink-secondary">
              <div className="flex items-center gap-3">
                <b className="tnum min-w-16 text-[22px] text-brand">
                  <StatValue value="13" />
                </b>
                <span>שנות ניסיון מול רשות המסים וביטוח לאומי</span>
              </div>
              <div className="flex items-center gap-3">
                <b className="tnum min-w-16 text-[22px] text-brand">
                  <StatValue value="10,059" />
                </b>
                <span>לקוחות שליווינו עד לקבלת הזכות</span>
              </div>
              <div className="flex items-center gap-3">
                <b className="tnum min-w-16 text-[22px] text-accent">0 ₪</b>
                <span>מראש — שכר טרחה רק בהצלחה</span>
              </div>
            </div>
          </div>

          {/* related rights */}
          {service.relatedRights.length > 0 && (
            <div className="rounded-2xl border border-hairline bg-white p-6">
              <div className="mb-3 text-lg font-bold text-ink">זכויות משיקות</div>
              <div className="flex flex-wrap gap-2">
                {service.relatedRights.map((r) =>
                  r.href ? (
                    <Link
                      key={r.name}
                      href={r.href}
                      className="pill border border-hairline bg-surface px-3.5 py-2 text-sm text-ink-secondary no-underline transition-colors hover:border-brand hover:text-brand"
                    >
                      {r.name}
                    </Link>
                  ) : (
                    <span key={r.name} className="pill border border-hairline bg-surface px-3.5 py-2 text-sm text-ink-secondary">
                      {r.name}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          <a href={site.phoneHref} className="pill flex items-center justify-center gap-2 border border-hairline bg-white px-5 py-3.5 text-[17px] font-bold text-ink no-underline transition-colors hover:border-brand hover:text-brand">
            <span>מעדיפים לדבר?</span>
            <span className="tnum text-brand">{site.phone}</span>
          </a>
        </aside>
      </div>

      <PageCta />
    </>
  );
}
