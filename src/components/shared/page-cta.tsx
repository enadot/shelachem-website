import { LeadCta } from "@/components/shared/lead-cta";
import { ArrowForward } from "@/components/shared/icons";
import { getSiteSettings } from "@/lib/content";

/**
 * CTA תחתון לעמודי תוכן — פס מלא עם כותרת גדולה, טלפון וכפתור. בלי כרטיס:
 * קו שיער כהה מעליו סוגר את העמוד כמו סוף מסמך.
 */
export async function PageCta({
  title = "רוצים לדעת מה מגיע לכם?",
  strong = "נבדוק יחד, בחינם.",
  subtitle = "פגישת היכרות ראשונית ללא עלות וללא התחייבות — שכר טרחה רק בהצלחה.",
}: {
  title?: string;
  strong?: string;
  subtitle?: string;
}) {
  const { contact } = await getSiteSettings();
  return (
    <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
      <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-8 border-t border-ink pt-10 md:flex-row md:items-end md:gap-16 md:pt-14">
        <div className="max-w-[760px]">
          <h2
            className="m-0 mb-3 font-display text-[30px] font-light leading-[1.1] text-ink md:mb-4 md:text-[52px] md:leading-[1.04] md:tracking-[-0.02em]"
          >
            {title} <span className="font-black">{strong}</span>
          </h2>
          <p className="m-0 text-base text-ink-secondary md:text-lg">{subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-5">
          <a
            href={contact.phoneHref}
            className="tnum text-lg font-bold text-ink no-underline transition-colors duration-300 hover:text-brand"
          >
            {contact.phone}
          </a>
          <LeadCta sourcePage="page-cta" variant="brand" size="lg" className="group">
            חזרו אליי
            <ArrowForward size={18} className="nudge" />
          </LeadCta>
        </div>
      </div>
    </section>
  );
}
