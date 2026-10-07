import type { Metadata } from "next";
import { getTeam } from "@/lib/content";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { PageCta } from "@/components/shared/page-cta";
import { Eyebrow } from "@/components/shared/eyebrow";

export const metadata: Metadata = {
  title: "צוות ההנהלה",
  alternates: { canonical: "/team" },
  description:
    "הכירו את הנהגת שלכם — מומחים בעלי עשרות שנות ניסיון במערכות הבריאות, השיווק והכספים, מחויבים אישית לכל לקוח.",
};

/**
 * צוות ההנהלה — עמודת הצהרה דביקה מימין ורשימת אנשים משמאל, כל אחד בשורה עם
 * קו שיער (השראה: Granola, Analogue). בלי כרטיסים ובלי אנימציה.
 */
export default async function TeamPage() {
  const team = await getTeam();

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "בית", href: "/" }, { label: "צוות ההנהלה" }]}
        title="הנהגת"
        strong="שלכם"
        intro="מומחים בעלי עשרות שנות ניסיון במערכות הבריאות, השיווק והכספים — מחויבים אישית לכל לקוח ולקוח."
      />

      <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <div className="mx-auto grid max-w-[1240px] items-start gap-12 md:grid-cols-[1fr_1.5fr] md:gap-20">
          <div className="md:sticky md:top-28">
            <Eyebrow index="01">ההנהלה</Eyebrow>
            <h2 className="m-0 mb-5 mt-6 font-display text-[30px] font-light leading-[1.1] text-ink md:mt-8 md:text-[48px] md:leading-[1.04] md:tracking-[-0.02em]">
              האנשים <span className="font-black">שמובילים.</span>
            </h2>
            <p className="m-0 max-w-[420px] text-base leading-relaxed text-ink-secondary md:text-lg">
              צוות מגוון מכל המגזרים והקהילות — רופאים, מומחי זכויות ומלווים אישיים. מה שמחבר את
              כולנו: <b className="text-ink">קודם כל בן אדם, אחר כך תיק.</b>
            </p>
          </div>

          <ol className="m-0 list-none border-t border-ink p-0">
            {team.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-[64px_1fr] gap-x-5 border-b border-hairline py-7 md:grid-cols-[88px_1fr] md:gap-x-7 md:py-9"
              >
                <PersonAvatar
                  name={p.name}
                  image={p.image}
                  size={88}
                  className="!h-16 !w-16 !rounded-xl md:!h-[88px] md:!w-[88px]"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="m-0 font-display text-[22px] font-black leading-tight text-ink md:text-[26px]">
                      {p.name}
                    </h3>
                    {p.linkedin && (
                      <a
                        href={p.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`הפרופיל של ${p.name} בלינקדאין`}
                        className="text-sm font-bold text-ink-muted no-underline transition-colors duration-300 hover:text-brand"
                      >
                        <span className="link-draw">LinkedIn</span>
                      </a>
                    )}
                  </div>
                  <div className="mt-1 text-[15px] font-bold text-brand">{p.title}</div>
                  <p className="m-0 mt-3 max-w-[56ch] text-[15.5px] leading-relaxed text-ink-muted">
                    {p.bio}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PageCta title="רוצים לדבר עם הצוות?" strong="נשמח להכיר." subtitle="בחינם וללא התחייבות · שכר טרחה רק בהצלחה." />
    </>
  );
}
