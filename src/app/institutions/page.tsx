import type { Metadata } from "next";
import Link from "next/link";
import { getInstitutions } from "@/lib/content";
import { NavyHero } from "@/components/shared/navy-hero";
import { LeadForm } from "@/components/shared/lead-form";
import { Reveal } from "@/components/shared/reveal";
import { StatValue } from "@/components/magicui/number-ticker";

export const metadata: Metadata = {
  title: "מוסדות ובירוקרטיה",
  description:
    "ביטוח לאומי, מס הכנסה, קרנות פנסיה וחברות ביטוח — כל המוסדות שמולם אנחנו מממשים את הזכויות שלכם, במקום אחד.",
};

const reassurance = [
  { value: "13", label: "שנות ניסיון מול המוסדות" },
  { value: "10,059", label: "לקוחות שליווינו עד לקבלת הזכות" },
  { value: "0 ₪", label: "מראש — שכר טרחה רק בהצלחה", accent: true },
];

export default async function InstitutionsPage() {
  const institutions = await getInstitutions();

  return (
    <>
      <NavyHero
        breadcrumb={[{ label: "בית", href: "/" }, { label: "מוסדות ובירוקרטיה" }]}
        title="כל מוסד, והדרך"
        strong="לנצח בו"
        intro="לכל מוסד יש שפה משלו, טפסים משלו וּוועדות משלו. אנחנו מדברים את כולן — ויודעים בדיוק איך מגישים תיק שמתקבל."
      />

      {/* institutions grid */}
      <section className="px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <div className="mx-auto grid max-w-[1240px] gap-5 md:grid-cols-2 md:gap-6">
          {institutions.map((inst, i) => (
            <Reveal
              key={inst.id}
              delay={(i % 2) * 0.09}
              className="flex flex-col gap-4 rounded-card border border-hairline bg-white p-7 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(0,55,112,0.10)] md:p-8"
            >
              <div>
                <div className="mb-1 font-display text-[24px] font-bold text-ink md:text-[26px]">
                  {inst.name}
                </div>
                <div className="text-[15px] font-bold text-brand">{inst.tagline}</div>
              </div>
              <p className="m-0 flex-1 text-base leading-relaxed text-ink-secondary md:text-[17px]">
                {inst.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {inst.services.map((s) => (
                  <span
                    key={s.name}
                    className="pill border border-hairline bg-surface px-3.5 py-1.5 text-sm text-ink-secondary"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
              <Link
                href={`/institutions/${inst.slug}`}
                className="text-base font-bold text-brand no-underline hover:underline"
              >
                לעמוד המוסד ←
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* reassurance strip */}
      <section className="px-6 pb-12 md:px-[clamp(24px,6.7vw,96px)] md:pb-16">
        <Reveal className="mx-auto grid max-w-[1240px] gap-8 rounded-card bg-surface px-8 py-9 text-center md:grid-cols-3">
          {reassurance.map((r) => (
            <div key={r.label} className="flex flex-col gap-1">
              <div
                className={`tnum font-display text-[40px] font-black md:text-[48px] ${r.accent ? "text-accent" : "text-brand"}`}
              >
                <StatValue value={r.value} />
              </div>
              <div className="text-base text-ink-secondary md:text-[17px]">{r.label}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* navy contact form */}
      <section className="px-6 pb-14 md:px-[clamp(24px,6.7vw,96px)]">
        <Reveal className="relative mx-auto max-w-[880px] overflow-hidden rounded-card bg-banner px-7 py-9 text-white md:px-14 md:py-12">
          <div
            aria-hidden
            className="absolute -left-20 -top-28 h-[400px] w-[480px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
          />
          <div className="relative">
            <h2 className="m-0 mb-2 text-center font-display text-[24px] font-light text-white md:text-[32px]">
              לא בטוחים מול איזה מוסד להתחיל? <span className="font-bold">נבדוק בשבילכם.</span>
            </h2>
            <p className="m-0 mb-7 text-center text-base text-white/85 md:text-[17px]">
              השאירו פרטים ובחרו את המוסד הרלוונטי — נחזור אליכם עם תשובה ראשונית, בחינם.
            </p>
            <LeadForm
              variant="dark"
              sourcePage="institutions-hub"
              submitLabel="חזרו אליי ›"
              withMarketingConsent={false}
              topicOptions={institutions.map((i) => i.name)}
              topicLabel="מול איזה מוסד? (לא חובה)"
              className="mx-auto max-w-[520px]"
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
