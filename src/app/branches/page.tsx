import type { Metadata } from "next";
import Image from "next/image";
import { branches, site } from "@/lib/config";
import { PageHeader } from "@/components/shared/page-header";
import { PageCta } from "@/components/shared/page-cta";
import { ArrowForward } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "סניפים ויצירת קשר",
  alternates: { canonical: "/branches" },
  description:
    "הסניפים של שלכם בירושלים ובבני ברק — כתובות, הוראות הגעה, נגישות ואפשרות לפגישת זום מכל מקום בארץ.",
};

const navLink =
  "group inline-flex min-h-11 items-center gap-2 text-[15px] font-bold text-ink no-underline transition-colors duration-300 hover:text-brand";

/**
 * סניפים — כל סניף הוא שורה רחבה: שם העיר בגדול, כתובת וטלפון, והוראות הגעה
 * ונגישות בעמודה שלישית (השראה: SIGMA, Zendesk). הפגישה הדיגיטלית היא "הסניף
 * השלישי" באותה שפה, במקום כרטיס צבעוני נפרד.
 */
export default function BranchesPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "בית", href: "/" }, { label: "סניפים ויצירת קשר" }]}
        title="קרובים אליכם,"
        strong="בכל הארץ."
        intro="שני סניפים — ירושלים ובני ברק — ופגישות דיגיטליות לכל מקום אחר. בחרו את הדרך הנוחה לכם להיפגש."
      >
        <a href={site.phoneHref} className="tnum text-xl font-bold text-ink no-underline transition-colors duration-300 hover:text-brand">
          {site.phone}
        </a>
      </PageHeader>

      <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <ol className="mx-auto my-0 max-w-[1240px] list-none border-t border-ink p-0">
          {branches.map((b, i) => (
            <li
              key={b.id}
              className="grid gap-6 border-b border-hairline py-10 md:grid-cols-[1fr_1fr_1.1fr] md:gap-12 md:py-14"
            >
              <div>
                <span className="tnum text-sm font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="m-0 mt-2 font-display text-[40px] font-black leading-none tracking-[-0.02em] text-ink md:text-[56px]">
                  {b.city}
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                <p className="m-0 text-lg leading-snug text-ink">{b.address}</p>
                <a href={b.phoneHref} className="tnum self-start text-lg font-bold text-brand no-underline">
                  {b.phone}
                </a>
                <div className="mt-1 flex flex-wrap gap-x-6">
                  <a href={b.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={navLink}>
                    <Image src="/images/google-maps-icon.svg" alt="" width={16} height={16} aria-hidden />
                    <span className="link-draw">Google Maps</span>
                  </a>
                  <a href={b.wazeUrl} target="_blank" rel="noopener noreferrer" className={navLink}>
                    <Image src="/images/waze-icon-colored.svg" alt="" width={16} height={16} aria-hidden />
                    <span className="link-draw">Waze</span>
                  </a>
                </div>
              </div>

              <dl className="m-0 grid gap-6 sm:grid-cols-2 md:gap-8">
                {[
                  { term: "איך מגיעים", items: b.arrival },
                  { term: "נגישות", items: b.accessibility },
                ].map((g) => (
                  <div key={g.term}>
                    <dt className="mb-2 text-sm font-bold tracking-[0.04em] text-ink-muted">{g.term}</dt>
                    {g.items.map((a) => (
                      <dd key={a} className="m-0 text-[15px] leading-relaxed text-ink-secondary">
                        {a}
                      </dd>
                    ))}
                  </div>
                ))}
              </dl>
            </li>
          ))}

          {/* הסניף הדיגיטלי */}
          <li className="grid gap-6 border-b border-hairline py-10 md:grid-cols-[1fr_1fr_1.1fr] md:gap-12 md:py-14">
            <div>
              <span className="tnum text-sm font-bold text-brand">
                {String(branches.length + 1).padStart(2, "0")}
              </span>
              <h2 className="m-0 mt-2 font-display text-[40px] font-light leading-none tracking-[-0.02em] text-ink md:text-[56px]">
                בכל <span className="font-black">מקום</span>
              </h2>
            </div>
            <p className="m-0 text-lg leading-snug text-ink">
              רחוקים מסניף? ניפגש בזום. רוב הליווי מתנהל טלפונית ודיגיטלית — באותה רמת שירות בדיוק.
            </p>
            <div className="md:self-end">
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-[10px] bg-brand px-6 py-3.5 text-base font-bold text-white no-underline transition-colors duration-300 hover:bg-brand-hover active:scale-[0.98]"
              >
                תיאום פגישה דיגיטלית
                <ArrowForward size={16} className="nudge" />
              </a>
            </div>
          </li>
        </ol>
      </section>

      <PageCta />
    </>
  );
}
