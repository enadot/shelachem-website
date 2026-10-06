import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstitution, getInstitutions } from "@/lib/content";
import { NavyHero } from "@/components/shared/navy-hero";
import { LeadForm } from "@/components/shared/lead-form";
import { Reveal } from "@/components/shared/reveal";
import { StatStrip } from "@/components/shared/stat-strip";
import { NumberedSteps } from "@/components/shared/numbered-steps";
import { Eyebrow } from "@/components/shared/eyebrow";
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
      <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow index="01">השיטה</Eyebrow>
          <SectionHeading strong="עובדים" className="mb-10 mt-6 text-[30px] md:mb-14 md:mt-8 md:text-[52px]">
            איך אנחנו
          </SectionHeading>
          <NumberedSteps steps={inst.approach} />
        </div>
      </section>

      {/* services — שורות בקווי שיער */}
      <section className="bg-surface px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow index="02">במה אנחנו מטפלים</Eyebrow>
          <SectionHeading strong={`מול ${inst.name}`} className="mb-10 mt-6 text-[30px] md:mb-14 md:mt-8 md:text-[52px]">
            כל מה שאפשר לממש
          </SectionHeading>
          <Reveal
            as="ul"
            variant="stagger"
            className="m-0 grid list-none border-t border-hairline p-0 md:grid-cols-2 md:gap-x-12"
          >
            {inst.serviceCards.map((card) => (
              <li key={card.name} className="border-b border-hairline">
                <InstitutionServiceCard card={card} institutionName={inst.name} />
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* stats */}
      <section className="surface-navy bg-night px-6 py-14 text-white md:px-[clamp(24px,6.7vw,96px)] md:py-20">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow index="03" tone="dark">במספרים</Eyebrow>
          <StatStrip stats={inst.stats} tone="dark" className="mt-8 md:mt-10" />
          {inst.statsNote && <div className="mt-6 text-sm text-white/60">{inst.statsNote}</div>}
        </div>
      </section>

      {/* contact form — כותרת גדולה מימין, טופס משמאל, בלי כרטיס */}
      <section
        id="lead-form"
        className="scroll-mt-24 px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24"
      >
        {/* id="lead-form" — כך MobileCtaBar מתקפל כשהטופס עצמו על המסך */}
        <div className="mx-auto grid max-w-[1240px] items-start gap-10 md:grid-cols-[1fr_1fr] md:gap-20">
          <div>
            <SectionHeading strong="דברו איתנו." className="mb-4 text-[30px] md:mb-6 md:text-[52px]">
              רוצים שנטפל בשבילכם מול {inst.name}?
            </SectionHeading>
            <p className="m-0 mb-6 max-w-[440px] text-base leading-relaxed text-ink-secondary md:text-lg">
              בדיקת זכאות ראשונית חינם — בחרו נושא ונחזור אליכם עם תשובה.
            </p>
            <Link
              href="/faq"
              className="group inline-flex items-center gap-1.5 text-[15px] font-bold text-brand no-underline"
            >
              <span className="link-draw">עוד לא בטוחים? קראו את השאלות והתשובות</span>
              <ChevronForward size={14} className="nudge" />
            </Link>
          </div>
          <Reveal delay={0.1}>
            <LeadForm
              sourcePage={`institution-${inst.slug}`}
              submitLabel="חזרו אליי"
              withMarketingConsent={false}
              topicOptions={[...inst.formOptions]}
              topicLabel="במה נוכל לעזור?"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
