import type { Metadata } from "next";
import Link from "next/link";
import { getInstitutions } from "@/lib/content";
import { PageHeader } from "@/components/shared/page-header";
import { LeadForm } from "@/components/shared/lead-form";
import { StatStrip } from "@/components/shared/stat-strip";
import { ArrowForward } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "מוסדות ובירוקרטיה",
  alternates: { canonical: "/institutions" },
  description:
    "ביטוח לאומי, מס הכנסה, קרנות פנסיה וחברות ביטוח — כל המוסדות שמולם אנחנו מממשים את הזכויות שלכם, במקום אחד.",
};

const reassurance = [
  { value: "13", label: "שנות ניסיון מול המוסדות" },
  { value: "10,059", label: "לקוחות שליווינו עד לקבלת הזכות" },
  { value: "0 ₪", label: "מראש — שכר טרחה רק בהצלחה" },
];

export default async function InstitutionsPage() {
  const institutions = await getInstitutions();

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "בית", href: "/" }, { label: "מוסדות ובירוקרטיה" }]}
        title="כל מוסד, והדרך"
        strong="לנצח בו"
        intro="לכל מוסד יש שפה משלו, טפסים משלו וּוועדות משלו. אנחנו מדברים את כולן — ויודעים בדיוק איך מגישים תיק שמתקבל."
      />

      {/* institutions — שורות עריכתיות: מספר, שם גדול, תיאור ורשימת זכויות */}
      <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <ol className="m-0 list-none border-t border-ink p-0">
            {institutions.map((inst, i) => (
              <li key={inst.id} className="border-b border-hairline">
                <Link
                  href={`/institutions/${inst.slug}`}
                  className="group grid gap-3 py-8 text-ink no-underline md:grid-cols-[64px_1fr_1.2fr_48px] md:items-start md:gap-8 md:py-12"
                >
                  <span className="tnum text-sm font-bold text-brand md:pt-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-display text-[30px] font-black leading-[1.05] tracking-[-0.01em] transition-colors duration-300 group-hover:text-brand md:text-[44px]">
                      {inst.name}
                    </span>
                    <span className="mt-2 block text-[15px] font-bold text-ink-muted">{inst.tagline}</span>
                  </span>
                  <span className="md:pt-2">
                    <span className="block text-base leading-relaxed text-ink-secondary md:text-[17px]">
                      {inst.description}
                    </span>
                    <span className="mt-3 block text-sm leading-relaxed text-ink-faint">
                      {inst.services.map((s) => s.name).join(" · ")}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="mt-2 hidden h-12 w-12 items-center justify-center rounded-full border border-hairline text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white md:flex"
                  >
                    <ArrowForward size={18} className="nudge" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* reassurance strip */}
      <section className="px-6 pb-14 md:px-[clamp(24px,6.7vw,96px)] md:pb-24">
        <div className="mx-auto max-w-[1240px]">
          <StatStrip stats={reassurance} />
        </div>
      </section>

      {/* navy contact form */}
      <section className="surface-navy bg-brand px-6 py-14 text-white md:px-[clamp(24px,6.7vw,96px)] md:py-24">
        <div className="mx-auto max-w-[880px]">
          <div className="relative">
            <h2 className="m-0 mb-3 text-center font-display text-[30px] font-light leading-[1.1] text-white md:text-[48px]">
              לא בטוחים מול איזה מוסד להתחיל? <span className="font-black">נבדוק בשבילכם.</span>
            </h2>
            <p className="m-0 mb-7 text-center text-base text-white/85 md:text-[17px]">
              השאירו פרטים ובחרו את המוסד הרלוונטי — נחזור אליכם עם תשובה ראשונית, בחינם.
            </p>
            <LeadForm
              variant="dark"
              sourcePage="institutions-hub"
              submitLabel="חזרו אליי"
              withMarketingConsent={false}
              topicOptions={institutions.map((i) => i.name)}
              topicLabel="מול איזה מוסד? (לא חובה)"
              className="mx-auto max-w-[520px]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
