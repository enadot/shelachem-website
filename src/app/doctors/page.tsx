import type { Metadata } from "next";
import { getDoctors } from "@/lib/content";
import { doctorSpecialtyLabels } from "@/lib/content/local/doctors";
import { NavyHero } from "@/components/shared/navy-hero";
import { PageCta } from "@/components/shared/page-cta";
import { Reveal } from "@/components/shared/reveal";
import { DoctorsGrid } from "@/components/doctors/doctors-grid";

export const metadata: Metadata = {
  title: "הרופאים והמומחים",
  description:
    "צוות רופאים מומחים שמלווה כל תיק: חוות דעת מקצועיות, הכנה אישית לוועדות הרפואיות ומעקב עד להחלטה.",
};

const whySteps = [
  {
    title: "חוות דעת רפואית מקצועית",
    body: "רופא מומחה בתחום הרלוונטי קורא את כל התיעוד הרפואי שלכם וכותב חוות דעת מנומקת — במונחים שהוועדה מחויבת להתייחס אליהם.",
  },
  {
    title: "הכנה אישית לוועדה",
    body: "לפני הוועדה תשבו עם רופא מהצוות: מה ישאלו, מה חשוב להגיד, ואיך לתאר את המגבלה שלכם בצורה מדויקת — בלי להמעיט ובלי להגזים.",
  },
  {
    title: "מעקב עד להחלטה",
    body: "אם ההחלטה לא משקפת את המצב האמיתי, הרופאים שלנו מנתחים את הפרוטוקול ובונים את הבסיס הרפואי לערר — עד למיצוי מלא של הזכויות.",
  },
];

export default async function DoctorsPage() {
  const doctors = await getDoctors();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": doctors.map((d) => ({
      "@type": "Physician",
      name: d.name,
      medicalSpecialty: doctorSpecialtyLabels[d.specialty],
      description: d.bio,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavyHero
        breadcrumb={[{ label: "בית", href: "/" }, { label: "הרופאים והמומחים" }]}
        title="הרופאים שעומדים"
        strong="מאחוריכם"
        intro="בוועדה רפואית, הנייר החזק ביותר הוא חוות דעת של מומחה. הצוות הרפואי שלנו מכיר את הוועדות מבפנים — ובונה איתכם את התיק שקשה לדחות."
      />

      {/* why doctors matter */}
      <section className="px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <div className="mx-auto max-w-[1240px]">
          <h2 className="m-0 mb-6 font-display text-[26px] font-light md:text-4xl">
            למה רופא מומחה <span className="keyword-underline">מכריע את התיק</span>
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {whySteps.map((step, i) => (
              <Reveal
                key={step.title}
                delay={i * 0.09}
                className="rounded-xl border border-hairline bg-white p-7"
              >
                <div className="tnum mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#eef0ff] text-xl font-bold text-brand">
                  {i + 1}
                </div>
                <div className="mb-2 text-xl font-bold text-ink">{step.title}</div>
                <div className="text-base leading-relaxed text-ink-secondary">{step.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* doctors grid + filters */}
      <section className="bg-surface px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <div className="mx-auto max-w-[1240px]">
          <h2 className="m-0 mb-6 font-display text-[26px] font-light md:text-4xl">
            הכירו את <span className="keyword-underline">המומחים</span>
          </h2>
          <DoctorsGrid doctors={doctors} />
          <p className="m-0 mt-6 text-[15px] text-ink-faint">
            * הצוות המלא מונה מעל 100 רופאים ומומחים בכל תחומי הרפואה.
          </p>
        </div>
      </section>

      <PageCta
        title="לא בטוחים איזה מומחה מתאים לתיק שלכם?"
        strong="נכוון אתכם."
        subtitle="שיחת בדיקה ראשונית חינם — נתאים את הרופא הנכון למצב הרפואי שלכם."
      />
    </>
  );
}
