import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstitution, getInstitutions } from "@/lib/content";
import { NavyHero } from "@/components/shared/navy-hero";
import { LeadForm } from "@/components/shared/lead-form";
import { Reveal } from "@/components/shared/reveal";
import { StatValue } from "@/components/magicui/number-ticker";

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
  return { title: inst.name, description: inst.description };
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
          <h2 className="m-0 mb-6 font-display text-[26px] font-light md:text-4xl">
            איך אנחנו <span className="keyword-underline">עובדים</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {inst.approach.map((step, i) => (
              <Reveal
                key={step.title}
                delay={i * 0.09}
                className="rounded-xl border border-hairline bg-white p-6"
              >
                <div className="tnum mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#eef0ff] text-xl font-bold text-brand">
                  {i + 1}
                </div>
                <div className="mb-2 text-lg font-bold text-ink">{step.title}</div>
                <div className="text-[15px] leading-relaxed text-ink-secondary">
                  {step.description}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* services */}
      <section className="bg-surface px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <div className="mx-auto max-w-[1240px]">
          <h2 className="m-0 mb-6 font-display text-[26px] font-light md:text-4xl">
            במה אנחנו מטפלים <span className="keyword-underline">מול {inst.name}</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
            {inst.serviceCards.map((card, i) => (
              <Reveal
                key={card.name}
                delay={(i % 3) * 0.09}
                className="flex flex-col gap-2.5 rounded-xl border border-hairline bg-white p-6"
              >
                <span className="pill self-start bg-accent-tint px-3 py-1 text-[13px] font-bold text-accent-text">
                  {card.tag}
                </span>
                <div className="text-lg font-bold text-ink">{card.name}</div>
                <p className="m-0 flex-1 text-[15px] leading-relaxed text-ink-secondary">
                  {card.description}
                </p>
                <Link href={card.href} className="text-[15px] font-bold text-brand no-underline hover:underline">
                  לפרטים ←
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <Reveal className="relative mx-auto max-w-[1240px] overflow-hidden rounded-card bg-banner px-8 py-10 text-white md:px-12">
          <div
            aria-hidden
            className="absolute -left-[100px] -top-36 h-[440px] w-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
          />
          <div className="relative grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {inst.stats.map((st) => (
              <div key={st.label} className="flex flex-col gap-1.5">
                <div
                  className={`tnum font-display text-[34px] font-black md:text-[46px] ${st.accent ? "text-accent" : "text-white"}`}
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
        <Reveal className="mx-auto max-w-[720px] rounded-card border border-hairline bg-white px-7 py-9 md:px-12">
          <h2 className="m-0 mb-2 text-center font-display text-[24px] font-light text-ink md:text-[30px]">
            רוצים שנטפל בשבילכם מול {inst.name}? <span className="font-bold">דברו איתנו.</span>
          </h2>
          <p className="m-0 mb-7 text-center text-base text-ink-secondary">
            בדיקת זכאות ראשונית חינם — בחרו נושא ונחזור אליכם עם תשובה.
          </p>
          <LeadForm
            sourcePage={`institution-${inst.slug}`}
            submitLabel="חזרו אליי ›"
            withMarketingConsent={false}
            topicOptions={[...inst.formOptions]}
            topicLabel="במה נוכל לעזור?"
          />
        </Reveal>
      </section>
    </>
  );
}
