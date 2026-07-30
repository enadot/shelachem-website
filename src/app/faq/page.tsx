import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs, getServices } from "@/lib/content";
import { ChevronForward } from "@/components/shared/icons";
import type { FaqItem } from "@/lib/content/types";
import { NavyHero } from "@/components/shared/navy-hero";
import { PageCta } from "@/components/shared/page-cta";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { groupFaqs } from "@/lib/faq-groups";
import { faqPageNode } from "@/lib/schema";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "שאלות ותשובות על מימוש זכויות רפואיות",
  alternates: { canonical: "/faq" },
  description:
    "כל השאלות הנפוצות על מימוש זכויות רפואיות: איך יודעים אם מגיע לכם, כמה זמן לוקח התהליך, איך מחשבים אחוזי נכות, מה עושים אחרי דחייה ואיך עובד שכר טרחה רק בהצלחה.",
};

/**
 * עמוד השאלות והתשובות המרכזי.
 *
 * למה עמוד ולא סקשן: 16 שאלות באקורדיון בתחתית עמוד בית בן ~9,500px אינן
 * נמצאות ואינן מדורגות. עמוד ייעודי הוא כתובת קנונית אחת ל-`FAQPage`, מקור
 * long-tail לחיפוש, וחומר ציטוט למנועי מענה (GEO). דף הבית שומר את השאלות
 * הפותחות ומקשר לכאן.
 */
export default async function FaqPage() {
  const [faqs, services] = await Promise.all([getFaqs(), getServices()]);

  const grouped = groupFaqs(faqs);

  // שאלות ספציפיות מעמודי השירות — תוכן קיים שעד כה נראה רק בעמוד השירות עצמו.
  const serviceGroups = services
    .filter((s) => s.faqs.length > 0)
    .map((s) => ({
      id: `service-${s.slug}`,
      label: s.name,
      intro: `שאלות שחוזרות ספציפית סביב ${s.name}.`,
      items: s.faqs.map((f): FaqItem => ({ ...f, id: `${s.slug}-${f.id}` })),
      href: `/services/${s.slug}`,
    }));

  const sections = [...grouped.map((g) => ({ ...g, href: undefined })), ...serviceGroups];
  const allItems = sections.flatMap((s) => s.items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqPageNode(allItems, {
              url: `${site.domain}/faq`,
              name: "שאלות ותשובות — מימוש זכויות רפואיות",
            }),
          ),
        }}
      />

      <NavyHero
        breadcrumb={[{ label: "בית", href: "/" }, { label: "שאלות ותשובות" }]}
        title="שאלות"
        strong="ותשובות"
        intro={`${allItems.length} השאלות שאנחנו נשאלים הכי הרבה — על זכאות, על אחוזי נכות, על החזרי מס ועל מה שקורה אחרי דחייה. בלי שפה של פקידים.`}
      />

      <section className="px-6 py-10 md:px-[clamp(24px,6.7vw,96px)] md:py-14">
        <div className="mx-auto grid max-w-[1100px] items-start gap-10 md:grid-cols-[240px_1fr] md:gap-14">
          {/* נושאים — ניווט בעמוד */}
          <nav aria-label="נושאים" className="md:sticky md:top-24">
            <h2 className="m-0 mb-3 text-[15px] font-bold text-ink">הנושאים</h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0 md:flex-col md:gap-0">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="pill inline-flex min-h-11 items-center border border-hairline px-3.5 text-[14.5px] text-ink-secondary no-underline transition-colors hover:border-brand hover:text-brand md:rounded-none md:border-0 md:px-0 md:text-[15px]"
                  >
                    {s.label}
                    <span className="tnum ms-2 text-ink-faint">{s.items.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col gap-10">
            {/*
              בכוונה בלי `Reveal`: זה עמוד עיון שמגיעים אליו מחיפוש ומקישור עוגן,
              והתוכן צריך פשוט להיות שם. גם נמדד — גלילה מהירה עד לתחתית דילגה על
              ה-IntersectionObserver והשאירה ארבעה נושאים ריקים לגמרי.
              (וגם DESIGN.md: אנימציית כניסה זהה לכל סקשן היא דקדוק שלא נבחר.)
            */}
            {sections.map((s) => (
              <section key={s.id} className="scroll-mt-24" id={s.id}>
                <h2 className="m-0 mb-1.5 font-display text-[26px] font-light tracking-tight text-ink md:text-[32px]">
                  {s.label}
                </h2>
                {s.intro && (
                  <p className="m-0 mb-4 max-w-[680px] text-[16px] leading-relaxed text-ink-secondary">
                    {s.intro}
                  </p>
                )}
                <FaqAccordion items={s.items} />
                {s.href && (
                  <Link
                    href={s.href}
                    className="mt-3.5 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-brand no-underline hover:underline"
                  >
                    לעמוד המלא של {s.label}
                    <ChevronForward size={15} />
                  </Link>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>

      <PageCta
        title="לא מצאתם את השאלה שלכם?"
        strong="נענה בטלפון."
        subtitle="שיחת בדיקת זכאות ראשונית ללא עלות וללא התחייבות — נגיד ביושר אם יש בסיס."
      />
    </>
  );
}
