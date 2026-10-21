import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { CmsImage } from "@/components/shared/cms-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticles, getInstitution, getService, getServices, getSiteSettings } from "@/lib/content";
import { LeadForm } from "@/components/shared/lead-form";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { Carousel } from "@/components/shared/carousel";
import { TaxCalculator } from "@/components/services/tax-calculator";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { PageCta } from "@/components/shared/page-cta";
import { Eyebrow } from "@/components/shared/eyebrow";
import { ArrowForward } from "@/components/shared/icons";
import { LeadCta } from "@/components/shared/lead-cta";
import { NumberedSteps } from "@/components/shared/numbered-steps";
import { ServiceVisual } from "@/components/services/service-visual";
import { HeartPhoto } from "@/components/shared/heart-photo";
import { ServiceMethod } from "@/components/services/service-method";
import { Check, CircleAlert } from "lucide-react";
import { faqPageNode, serviceNode } from "@/lib/schema";
import { site } from "@/lib/config";

const whyUs = [
  { value: "מאז 2013", label: "ניסיון מול ביטוח לאומי, רשות המסים, קרנות וחברות ביטוח" },
  { value: "עשרות אלפי", label: "תיקים שצלחו איתנו" },
  { value: "0 ₪", label: "מראש — שכר טרחה בהצלחה בלבד" },
];

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
  return pageMetadata({
    title: service.name,
    description: service.heroIntro,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { contact } = await getSiteSettings();
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

  // שדות שנוספו עם עמודי התחומים — שורה מהמסד שנשמרה לפניהם לא תכיל אותם.
  const overview = service.overview ?? [];
  const rights = service.rights ?? [];
  const process = service.process ?? [];
  const mistakes = service.mistakes ?? [];
  const source = `service-${service.slug}`;
  const short = service.name.replace(" מטעמי בריאות", "");
  // הכותרת: מילה אחרונה בהדגשה ("קצבת נכות **כללית**"); בפטור ממס — "מטעמי בריאות".
  const words = short.split(" ");
  const health = service.name.includes("מטעמי בריאות");
  const title = health || words.length < 2 ? short : words.slice(0, -1).join(" ");
  const strong = health ? "מטעמי בריאות" : words.length < 2 ? undefined : words.at(-1);

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

      <PageHeader
        breadcrumb={[
          { label: "בית", href: "/" },
          ...(institution
            ? [{ label: institution.name, href: `/institutions/${institution.slug}` }]
            : []),
          { label: service.name },
        ]}
        title={title}
        strong={strong}
        intro={service.heroIntro}
        mark={service.image ? <HeartPhoto src={service.image} alt={service.imageAlt ?? ""} priority /> : undefined}
        media={<ServiceVisual visual={service.visual} label={institution?.name} />}
      >
        <LeadCta sourcePage={`${source}-hero`} topic={service.name} variant="brand" size="lg" className="group">
          בדיקת זכאות חינם
          <ArrowForward size={18} className="nudge" />
        </LeadCta>
        <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-[15px] text-ink-secondary">
          {["שכר טרחה בהצלחה בלבד", "בדיסקרטיות מלאה"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <Check aria-hidden size={16} strokeWidth={2.5} className="text-brand" />
              {t}
            </li>
          ))}
        </ul>
      </PageHeader>

      {/* main grid */}
      <div className="mx-auto grid max-w-[1240px] items-start gap-14 px-6 py-12 md:grid-cols-[1fr_360px] md:gap-16 md:px-[clamp(24px,6.7vw,96px)] md:py-20 lg:px-6">
        <div className="flex min-w-0 flex-col gap-16 md:gap-24">
          {/* מה זה בעצם */}
          {overview.length > 0 && (
            <section>
              <SectionHeading strong={`${short}?`} className="mb-6 text-[28px] md:text-[40px]">
                מה זה
              </SectionHeading>
              <div className="flex max-w-[68ch] flex-col gap-4">
                {overview.map((p) => (
                  <p key={p.slice(0, 32)} className="m-0 text-[17px] leading-relaxed text-ink-secondary md:text-lg">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* key takeaways — שורות עם קו שיער, בלי קופסה ואייקונים */}
          {service.takeaways.length > 0 && (
            <section>
              <Eyebrow>מה חשוב לדעת — בשורה התחתונה</Eyebrow>
              <ul
                className="m-0 mt-4 grid list-none p-0 md:grid-cols-2 md:gap-x-10"
              >
                {service.takeaways.map((t) => (
                  <li
                    key={t}
                    className="border-b border-hairline py-4 text-[16.5px] leading-relaxed text-ink"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* eligibility */}
          {service.eligibility.length > 0 && (
            <section>
              {/* היה `service.name.split(" ")[0]` — שרד רק לשירות היחיד שקיים
                  היום ("מי זכאי להחזרי?" לכל שם אחר). */}
              <SectionHeading strong="זכאי?" underlineStrong className="mb-6 text-[28px] md:text-[40px]">
                מי
              </SectionHeading>
              <ol className="m-0 list-none border-t border-hairline p-0">
                {service.eligibility.map((e, i) => (
                  <li
                    key={e.title}
                    className="grid grid-cols-[40px_1fr] gap-x-4 border-b border-hairline py-5 md:grid-cols-[64px_1fr]"
                  >
                    <span aria-hidden className="tnum pt-0.5 text-sm font-bold text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="max-w-[68ch]">
                      <h3 className="m-0 mb-1 font-body text-lg font-black text-ink">{e.title}</h3>
                      <p className="m-0 text-[16.5px] leading-relaxed text-ink-secondary">
                        {e.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              {service.eligibilityTip && (
                <p className="m-0 mt-5 max-w-[68ch] border-s-2 border-gold ps-4 text-[15.5px] leading-relaxed text-ink-muted">
                  {service.eligibilityTip}
                </p>
              )}
            </section>
          )}

          {/* מה כוללת הזכאות */}
          {rights.length > 0 && (
            <section>
              <SectionHeading strong="כוללת הזכאות?" className="mb-6 text-[28px] md:text-[40px]">
                מה
              </SectionHeading>
              <ul className="m-0 grid list-none border-t border-hairline p-0 md:grid-cols-2 md:gap-x-10">
                {rights.map((r) => (
                  <li key={r.title} className="border-b border-hairline py-5">
                    <h3 className="m-0 mb-1 font-body text-lg font-black text-ink">{r.title}</h3>
                    <p className="m-0 text-[16.5px] leading-relaxed text-ink-secondary">{r.description}</p>
                  </li>
                ))}
              </ul>
              {service.rightsNote && (
                <p className="m-0 mt-5 max-w-[68ch] border-s-2 border-gold ps-4 text-[15.5px] leading-relaxed text-ink-muted">
                  {service.rightsNote}
                </p>
              )}
              <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-surface-blue p-6 md:flex-row md:items-center md:justify-between md:p-7">
                <p className="m-0 text-[17px] font-bold text-ink">רוצים לדעת אם אתם עומדים בתנאים?</p>
                <LeadCta sourcePage={`${source}-rights`} topic={service.name} variant="brand" className="group shrink-0">
                  בדיקת זכאות חינם
                  <ArrowForward size={16} className="nudge" />
                </LeadCta>
              </div>
            </section>
          )}

          {/* sections */}
          {service.sections.length > 0 && (
            <section className="flex flex-col gap-7">
              <SectionHeading strong="שכדאי להכיר" underlineStrong className="text-[28px] md:text-[40px]">
                מצבים
              </SectionHeading>
              {service.sections.map((sec) => (
                <div key={sec.id}>
                  <h3 className="m-0 mb-2 font-body text-xl font-black text-ink">{sec.heading}</h3>
                  {sec.paragraphs.map((p) => (
                    <p key={p.slice(0, 32)} className="m-0 max-w-[68ch] text-[16.5px] leading-relaxed text-ink-secondary">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </section>
          )}

          {/* התהליך מול הגוף */}
          {process.length > 0 && (
            <section>
              <SectionHeading strong="שלב אחר שלב" className="mb-8 text-[28px] md:text-[40px]">
                התהליך,
              </SectionHeading>
              <NumberedSteps steps={process} className="md:grid-cols-2" />
            </section>
          )}

          {/* טעויות נפוצות */}
          {mistakes.length > 0 && (
            <section>
              <SectionHeading strong="שכדאי להימנע מהן" className="mb-6 text-[28px] md:text-[40px]">
                טעויות
              </SectionHeading>
              <ul className="m-0 list-none border-t border-hairline p-0">
                {mistakes.map((m) => (
                  <li key={m.title} className="flex items-start gap-4 border-b border-hairline py-5">
                    <CircleAlert aria-hidden size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold-deep" />
                    <div className="max-w-[64ch]">
                      <h3 className="m-0 mb-1 font-body text-lg font-black text-ink">{m.title}</h3>
                      <p className="m-0 text-[16.5px] leading-relaxed text-ink-secondary">{m.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* calculator */}
          {service.hasTaxCalculator && (
            <div>
              <TaxCalculator />
            </div>
          )}

          {/* testimonials */}
          {service.testimonials.length > 0 && (
            <div>
              <SectionHeading strong="בזכות שלכם" underlineStrong className="mb-6 text-[28px] md:text-[40px]">
                קיבלו פטור
              </SectionHeading>
              {/* showArrows היה false — בדסקטופ 224px מהקרוסלה היו מחוץ למסך בלי
                  שום דרך להגיע אליהם בעכבר. */}
              <Carousel ariaLabel="סיפורי לקוחות">
                {service.testimonials.map((t) => (
                  <TestimonialCard key={t.id} testimonial={t} />
                ))}
              </Carousel>
            </div>
          )}

          {/* FAQ */}
          {service.faqs.length > 0 && (
            <div>
              <SectionHeading strong="נפוצות" underlineStrong className="mb-6 text-[28px] md:text-[40px]">
                שאלות
              </SectionHeading>
              <FaqAccordion items={service.faqs} />
              <Link
                href="/faq"
                className="group mt-5 inline-flex min-h-11 items-center gap-2 text-base font-bold text-brand no-underline"
              >
                <span className="link-draw">לכל השאלות והתשובות</span>
                <ArrowForward size={16} className="nudge" />
              </Link>
            </div>
          )}

          {/* resources */}
          {resources.length > 0 && (
            <div>
              <SectionHeading strong="בנושא" underlineStrong className="mb-6 text-[28px] md:text-[40px]">
                להעמיק
              </SectionHeading>
              <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
                {resources.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="group flex flex-col gap-4 text-ink no-underline"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-surface-blue">
                      {r.image && (
                        <CmsImage
                          src={r.image}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 360px, 100vw"
                          className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-bold leading-snug">{r.title}</div>
                      <div className="flex items-center gap-2 text-[15px] font-bold text-brand">
                        <span className="link-draw">למאמר במגזין</span>
                        <ArrowForward size={15} className="nudge" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside className="flex flex-col gap-5 md:sticky md:top-24">
          {/* id="lead-form" — עוגן לקישורים ישירים לטופס. */}
          <div
            id="lead-form"
            className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-hairline bg-white p-6 md:p-7"
          >
            <div>
              <div className="mb-1 font-display text-2xl font-black text-ink">בודקים זכאות — חינם</div>
              <p className="m-0 text-[15px] text-ink-muted">נחזור אליכם היום, בדיסקרטיות מלאה.</p>
            </div>
            <LeadForm sourcePage={source} submitLabel="חזרו אליי" withMarketingConsent={false} />
          </div>

          {/* why us — מספרים סטטיים בקווי שיער */}
          <div>
            <div className="mb-1 text-sm font-bold tracking-[0.06em] text-ink-muted">למה שלכם</div>
            <dl className="m-0">
              {whyUs.map((w) => (
                <div key={w.label} className="flex items-baseline gap-4 border-b border-hairline py-3.5">
                  <dt className="order-2 text-[15px] text-ink-secondary">{w.label}</dt>
                  <dd className="m-0 min-w-[72px] shrink-0">
                    <bdi dir="auto" className="tnum whitespace-nowrap font-display text-[26px] font-light text-ink">
                      {w.value}
                    </bdi>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* related rights */}
          {service.relatedRights.length > 0 && (
            <div>
              <div className="mb-3 text-sm font-bold tracking-[0.06em] text-ink-muted">זכויות משיקות</div>
              <div className="flex flex-wrap gap-2">
                {service.relatedRights.map((r) =>
                  r.href ? (
                    <Link
                      key={r.name}
                      href={r.href}
                      className="rounded-full border border-hairline px-3.5 py-2 text-sm text-ink-secondary no-underline transition-colors duration-300 hover:border-ink hover:text-ink"
                    >
                      {r.name}
                    </Link>
                  ) : (
                    <span key={r.name} className="rounded-full border border-hairline px-3.5 py-2 text-sm text-ink-muted">
                      {r.name}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          <a href={contact.phoneHref} className="flex items-center justify-between gap-2 border-t border-ink pt-4 text-[17px] font-bold text-ink no-underline transition-colors duration-300 hover:text-brand">
            <span>מעדיפים לדבר?</span>
            <span className="tnum text-brand">{contact.phone}</span>
          </a>
        </aside>
      </div>

      <ServiceMethod sourcePage={`${source}-method`} topic={service.name} />

      <PageCta
        title={`רוצים לבדוק זכאות ל${short}?`}
        strong="נבדוק יחד, בחינם."
        subtitle="שכר טרחה בהצלחה בלבד, בדיסקרטיות מלאה — ומנהלת תיק אישית עד סיום התהליך."
      />
    </>
  );
}
