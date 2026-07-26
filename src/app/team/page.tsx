import type { Metadata } from "next";
import { getTeam } from "@/lib/content";
import { NavyHero } from "@/components/shared/navy-hero";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { PageCta } from "@/components/shared/page-cta";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "צוות ההנהלה",
  alternates: { canonical: "/team" },
  description:
    "הכירו את הנהגת שלכם — מומחים בעלי עשרות שנות ניסיון במערכות הבריאות, השיווק והכספים, מחויבים אישית לכל לקוח.",
};

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <>
      <NavyHero
        breadcrumb={[{ label: "בית", href: "/" }, { label: "צוות ההנהלה" }]}
        title="הנהגת"
        strong="שלכם"
        intro="מומחים בעלי עשרות שנות ניסיון במערכות הבריאות, השיווק והכספים — מחויבים אישית לכל לקוח ולקוח."
      />

      <section className="px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <div className="mx-auto max-w-[1240px]">
          <h2 className="m-0 mb-6 font-display text-[26px] font-light md:text-4xl">
            האנשים <span className="keyword-underline">שמובילים</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {team.map((p, i) => (
              <Reveal
                key={p.id}
                delay={(i % 3) * 0.09}
                className="flex gap-4 rounded-[14px] border border-hairline bg-white p-4 md:p-5"
              >
                <PersonAvatar name={p.name} image={p.image} size={88} className="!rounded-[14px]" />
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[17.5px] font-black text-ink">{p.name}</div>
                    {p.linkedin && (
                      <a
                        href={p.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`הפרופיל של ${p.name} בלינקדאין`}
                        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#eef0ff] text-brand no-underline transition-colors hover:bg-brand hover:text-white"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M6.94 8.75H3.56V20.4h3.38V8.75ZM5.25 3.6a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92Zm8.02 6.9V8.75H9.94V20.4h3.38v-5.9c0-1.79.86-2.86 2.36-2.86 1.32 0 2.02.9 2.02 2.62v6.14h3.38v-6.8c0-3.06-1.66-4.86-4.2-4.86-1.85 0-3 .86-3.6 1.76Z" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="text-sm font-bold text-brand">{p.title}</div>
                  <div className="text-[13.5px] leading-normal text-ink-muted">{p.bio}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* spirit */}
      <section className="px-6 pb-12 md:px-[clamp(24px,6.7vw,96px)] md:pb-16">
        <Reveal className="mx-auto flex max-w-[1240px] flex-col gap-2.5 rounded-card border border-[#f6dcdb] bg-[#fdf2f2] px-6 py-6 md:px-12 md:py-10">
          <div className="text-sm font-bold text-accent md:text-[15px]">רוח שלכם</div>
          <h2 className="m-0 font-display text-[24px] font-light leading-tight md:text-[34px]">
            מעבר להנהלה — <span className="font-black">DNA של אנשים.</span>
          </h2>
          <p className="m-0 max-w-[760px] text-[15.5px] leading-relaxed text-ink-secondary md:text-lg">
            צוות מגוון מכל המגזרים והקהילות — רופאים, מומחי זכויות ומלווים אישיים. מה שמחבר את
            כולנו: קודם כל בן אדם, אחר כך תיק.
          </p>
        </Reveal>
      </section>

      <PageCta title="רוצים לדבר עם הצוות?" strong="נשמח להכיר." subtitle="בחינם וללא התחייבות · שכר טרחה רק בהצלחה." />
    </>
  );
}
