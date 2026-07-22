import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstitution, getService, getServices } from "@/lib/content";
import { LeadForm } from "@/components/shared/lead-form";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { Carousel } from "@/components/shared/carousel";
import { Reveal, Entrance } from "@/components/shared/reveal";
import { TaxCalculator } from "@/components/services/tax-calculator";
import { StatValue } from "@/components/magicui/number-ticker";
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
  return { title: service.name, description: service.heroIntro };
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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* hero */}
      <section className="border-b border-hairline bg-white px-6 pb-8 pt-8 md:px-[clamp(24px,6.7vw,96px)] md:pt-10">
        <div className="mx-auto max-w-[1240px]">
          <nav className="mb-5 flex items-center gap-2 text-sm text-ink-faint" aria-label="פירורי לחם">
            <Link href="/" className="text-ink-faint no-underline hover:text-brand">בית</Link>
            <span aria-hidden>‹</span>
            {institution && (
              <>
                <Link href={`/institutions/${institution.slug}`} className="text-ink-faint no-underline hover:text-brand">
                  {institution.name}
                </Link>
                <span aria-hidden>‹</span>
              </>
            )}
            <span className="font-bold text-ink">{service.name}</span>
          </nav>
          <Entrance>
            <h1 className="m-0 mb-2.5 font-display text-[32px] font-light leading-[1.12] tracking-tight text-ink md:text-[52px]">
              {service.name.replace(" מטעמי בריאות", "")}{" "}
              {service.name.includes("מטעמי בריאות") && (
                <span className="keyword-underline">מטעמי בריאות</span>
              )}
            </h1>
          </Entrance>
          <p className="m-0 max-w-[760px] text-[17px] leading-relaxed text-ink-secondary md:text-[19px]">
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
              <div className="mb-3.5 flex items-center gap-2.5 text-[19px] font-bold text-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="#0000FF" strokeWidth="2" />
                  <line x1="12" y1="11" x2="12" y2="16.5" stroke="#0000FF" strokeWidth="2.4" strokeLinecap="round" />
                  <circle cx="12" cy="7.6" r="1.4" fill="#0000FF" />
                </svg>
                מה חשוב לדעת — בשורה התחתונה
              </div>
              <div className="grid gap-3 text-base leading-normal text-ink-secondary md:grid-cols-2 md:gap-x-7">
                {service.takeaways.map((t) => (
                  <div key={t} className="flex gap-2.5">
                    <span className="font-black text-brand" aria-hidden>✓</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* eligibility */}
          {service.eligibility.length > 0 && (
            <Reveal>
              <h2 className="m-0 mb-4 font-display text-[26px] font-light tracking-tight md:text-[32px]">
                מי זכאי <span className="font-bold">ל{service.name.split(" ")[0]}?</span>
              </h2>
              <div className="flex flex-col gap-2.5">
                {service.eligibility.map((e, i) => (
                  <div
                    key={e.title}
                    className="flex items-start gap-3.5 rounded-xl border border-hairline bg-white px-5 py-4"
                  >
                    <span className="tnum flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#fde3e2] text-base font-bold text-[#c93330]">
                      {i + 1}
                    </span>
                    <div className="text-[16.5px] leading-relaxed text-ink-secondary">
                      <b className="text-ink">{e.title}</b> — {e.description}
                    </div>
                  </div>
                ))}
              </div>
              {service.eligibilityTip && (
                <p className="m-0 mt-4 rounded-[10px] bg-surface px-4.5 py-3.5 text-[15.5px] leading-relaxed text-ink-muted">
                  💡 {service.eligibilityTip}
                </p>
              )}
            </Reveal>
          )}

          {/* sections */}
          {service.sections.length > 0 && (
            <Reveal className="flex flex-col gap-6">
              <h2 className="m-0 font-display text-[26px] font-light tracking-tight md:text-[32px]">
                מצבים <span className="font-bold">שכדאי להכיר</span>
              </h2>
              {service.sections.map((sec) => (
                <div key={sec.id}>
                  <h3 className="m-0 mb-2 text-[21px] font-bold text-ink">{sec.heading}</h3>
                  {sec.paragraphs.map((p) => (
                    <p key={p.slice(0, 32)} className="m-0 text-[16.5px] leading-relaxed text-ink-secondary">
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
              <h2 className="m-0 mb-4 font-display text-[26px] font-light tracking-tight md:text-[32px]">
                קיבלו פטור <span className="font-bold">בזכות שלכם</span>
              </h2>
              <Carousel ariaLabel="סיפורי לקוחות" showArrows={false}>
                {service.testimonials.map((t) => (
                  <TestimonialCard key={t.id} testimonial={t} className="bg-surface" />
                ))}
              </Carousel>
            </Reveal>
          )}

          {/* FAQ */}
          {service.faqs.length > 0 && (
            <Reveal>
              <h2 className="m-0 mb-4 font-display text-[26px] font-light tracking-tight md:text-[32px]">
                שאלות נפוצות <span className="font-bold">על {service.name.split(" ")[0]}</span>
              </h2>
              <FaqAccordion items={service.faqs} />
            </Reveal>
          )}

          {/* resources */}
          {service.resources.length > 0 && (
            <Reveal>
              <h2 className="m-0 mb-4 font-display text-[26px] font-light tracking-tight md:text-[32px]">
                להעמיק <span className="font-bold">בנושא</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {service.resources.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-white text-ink no-underline transition-shadow hover:shadow-[0_12px_32px_rgba(13,37,61,0.12)]"
                  >
                    <div className="relative h-[120px] bg-surface-blue">
                      {r.image && <Image src={r.image} alt="" fill sizes="300px" className="object-cover" />}
                    </div>
                    <div className="flex flex-col gap-2.5 px-5 py-4">
                      <div className="text-[16.5px] leading-snug">{r.title}</div>
                      <div className="text-[15px] text-brand">למאמר במגזין ←</div>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* sidebar */}
        <aside className="flex flex-col gap-5 md:sticky md:top-24">
          <div className="relative flex flex-col gap-3 rounded-card border border-[#e6ebf2] bg-white px-6 pb-5 pt-9 shadow-[0_20px_48px_rgba(13,37,61,0.14)]">
            <div className="pill absolute -top-[19px] right-5 bg-brand px-4.5 py-3 text-[15px] font-bold leading-none text-white shadow-[0_10px_24px_rgba(0,0,120,0.25)]">
              בודקים זכאות — חינם
            </div>
            <LeadForm sourcePage={`service-${service.slug}`} submitLabel="חזרו אליי ›" withMarketingConsent={false} />
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
    </>
  );
}
