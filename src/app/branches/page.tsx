import type { Metadata } from "next";
import { branches, site } from "@/lib/config";
import { NavyHero } from "@/components/shared/navy-hero";
import { PageCta } from "@/components/shared/page-cta";
import { Reveal } from "@/components/shared/reveal";
import { BranchesExplorer } from "@/components/branches/branches-explorer";
import { ChevronForward } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "סניפים ויצירת קשר",
  alternates: { canonical: "/branches" },
  description:
    "הסניפים של שלכם בירושלים ובבני ברק — כתובות, הוראות הגעה, נגישות ואפשרות לפגישת זום מכל מקום בארץ.",
};

export default function BranchesPage() {
  return (
    <>
      <NavyHero
        breadcrumb={[{ label: "בית", href: "/" }, { label: "סניפים ויצירת קשר" }]}
        title="קרובים אליכם,"
        strong="בכל הארץ"
        intro="שני סניפים — ירושלים ובני ברק — ופגישות דיגיטליות לכל מקום אחר. בחרו את הדרך הנוחה לכם להיפגש."
      />

      <section className="px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <div className="mx-auto max-w-[1240px]">
          <BranchesExplorer branches={branches} />
        </div>
      </section>

      {/* digital option */}
      <section className="px-6 pb-12 md:px-[clamp(24px,6.7vw,96px)] md:pb-16">
        <Reveal className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-5 rounded-card bg-surface-blue px-7 py-7 md:flex-row md:items-center md:px-11 md:py-9">
          <div>
            <h2 className="m-0 mb-2 font-display text-[22px] font-light text-ink md:text-[28px]">
              רחוקים מסניף? <span className="font-bold">ניפגש בזום.</span>
            </h2>
            <p className="m-0 text-base text-ink-secondary md:text-[17px]">
              רוב הליווי מתנהל טלפונית ודיגיטלית — פגישת היכרות בזום זמינה לכל מקום בארץ, באותה
              רמת שירות בדיוק.
            </p>
          </div>
          <a
            href={site.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="pill inline-flex shrink-0 items-center gap-2 bg-brand px-7 py-3 text-[17px] font-bold text-white no-underline transition-colors hover:bg-brand-hover"
          >
            תיאום פגישה דיגיטלית
            <ChevronForward size={16} />
          </a>
        </Reveal>
      </section>

      <PageCta />
    </>
  );
}
