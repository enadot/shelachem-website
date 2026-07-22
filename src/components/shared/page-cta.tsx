import Link from "next/link";
import { site } from "@/lib/config";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

/** כרטיס CTA תחתון לעמודי תוכן — כותרת, טלפון וכפתור לטופס הליד. */
export function PageCta({
  title = "רוצים לדעת מה מגיע לכם?",
  strong = "נבדוק יחד, בחינם.",
  subtitle = "פגישת היכרות ראשונית ללא עלות וללא התחייבות — שכר טרחה רק בהצלחה.",
}: {
  title?: string;
  strong?: string;
  subtitle?: string;
}) {
  return (
    <section className="px-6 pb-14 md:px-[clamp(24px,6.7vw,96px)]">
      <Reveal className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 rounded-card border border-hairline bg-white px-7 py-8 md:flex-row md:items-center md:px-11 md:py-9">
        <div>
          <h2 className="m-0 mb-2 font-display text-[24px] font-light text-ink md:text-[30px]">
            {title} <span className="font-bold">{strong}</span>
          </h2>
          <p className="m-0 text-[16px] text-ink-secondary md:text-[17px]">{subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3.5">
          <a href={site.phoneHref} className="tnum text-lg font-bold text-ink no-underline hover:text-brand">
            {site.phone}
          </a>
          <Button asChild variant="accent">
            <Link href="/#lead-form">חזרו אליי ›</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
