import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstitution, getInstitutions } from "@/lib/content";
import { NavyHero } from "@/components/shared/navy-hero";
import { LeadForm } from "@/components/shared/lead-form";
import { Reveal } from "@/components/shared/reveal";
import { StatValue } from "@/components/magicui/number-ticker";
import { SectionHeading } from "@/components/shared/section-heading";
import { ChevronForward } from "@/components/shared/icons";
import { InstitutionServiceCard } from "@/components/institutions/service-card";

export async function generateStaticParams() {
  const institutions = await getInstitutions();
  return institutions.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) return {};
  return {
    title: inst.name,
    description: inst.description,
    alternates: { canonical: `/institutions/${inst.slug}` },
  };
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) notFound();

  return (
    <>
      <NavyHero
        breadcrumb={[
          { label: "בית", href: "/" },
          { label: "מוסדות ובירוקרטיה", href: "/institutions" },
          { label: inst.name },
        ]}
        title={inst.heroTitle.replace(/ — .*$/, "")}
        strong={inst.heroTitle.includes(" — ") ? inst.heroTitle.split(" — ")[1] : undefined}
        intro={inst.heroIntro}
      />

      {/* approach */}
      <section className="px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading strong="עובדים" underlineStrong className="mb-6 text-[26px] md:text-4xl">
            איך אנחנו
          </SectionHeading>
          <ol className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 md:grid-cols-4">
            {inst.approach.map((step, i) => (
              <Reveal
                key={step.title}
                as="li"
                delay={i * 0.09}
                className="rounded-xl border border-hairline bg-white p-6"
              >
                <div className="tnum mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface-blue text-xl font-bold text-brand">
                  {i + 1}
                </div>
                <h3 className="m-0 mb-2 font-body text-lg font-bold text-ink">{step.title}</h3>
                <div className="text-[15px] leading-relaxed text-ink-secondary">
                  {step.description}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* services */}
      <section className="bg-surface px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            strong={`מול ${inst.name}`}
            underlineStrong
            className="mb-6 text-[26px] md:text-4xl"
          >
            במה אנחנו מטפלים
          </SectionHeading>
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
            {inst.serviceCards.map((card, i) => (
              <Reveal key={card.name} as="li" delay={(i % 3) * 0.09} className="h-full">
                <InstitutionServiceCard card={card} institutionName={inst.name} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* stats */}
      <section className="px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <Reveal className="surface-navy relative mx-auto max-w-[1240px] overflow-hidden rounded-card bg-banner px-8 py-10 text-white md:px-12">
          <div
            aria-hidden
            className="absolute -left-[100px] -top-36 h-[440px] w-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
          />
          <div className="relative grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {inst.stats.map((st) => (
              <div key={st.label} className="flex flex-col gap-1.5">
                <div
                  /* #e75f5d על נייבי = 3.84:1; הגוון הרגיל נפל ב-2.86:1 מול 3:1 */
                  className={`tnum font-display text-[34px] font-black md:text-[46px] ${st.accent ? "text-accent-on-navy" : "text-white"}`}
                >
                  <StatValue value={st.value} />
                </div>
                <div className="text-[15px] text-white/90 md:text-base">{st.label}</div>
              </div>
            ))}
          </div>
          {inst.statsNote && (
            <div className="relative mt-6 text-center text-sm text-white/60">{inst.statsNote}</div>
          )}
        </Reveal>
      </section>

      {/* contact form */}
      <section className="px-6 pb-14 md:px-[clamp(24px,6.7vw,96px)]">
        {/* id="lead-form" — כך MobileCtaBar מתקפל כשהטופס עצמו על המסך */}
        <Reveal
          id="lead-form"
          className="mx-auto max-w-[720px] scroll-mt-24 rounded-card border border-hairline bg-white px-7 py-9 md:px-12"
        >
          <h2 className="m-0 mb-2 text-center font-display text-[24px] font-light text-ink md:text-[30px]">
            רוצים שנטפל בשבילכם מול {inst.name}? <span className="font-bold">דברו איתנו.</span>
          </h2>
          <p className="m-0 mb-7 text-center text-base text-ink-secondary">
            בדיקת זכאות ראשונית חינם — בחרו נושא ונחזור אליכם עם תשובה.
          </p>
          <LeadForm
            sourcePage={`institution-${inst.slug}`}
            submitLabel="חזרו אליי"
            withMarketingConsent={false}
            topicOptions={[...inst.formOptions]}
            topicLabel="במה נוכל לעזור?"
          />
          <p className="m-0 mt-5 text-center text-[15px] text-ink-secondary">
            עוד לא בטוחים?{" "}
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 font-bold text-brand no-underline hover:underline"
            >
              קראו את השאלות והתשובות
              <ChevronForward size={14} />
            </Link>
          </p>
        </Reveal>
      </section>
    </>
  );
}
