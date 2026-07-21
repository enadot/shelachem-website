import type { Metadata } from "next";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "הצהרת הנגישות של אתר שלכם — מימוש זכויות רפואיות.",
  robots: { index: false },
};

/** עמוד placeholder — יושלם עם פרטי רכז הנגישות של החברה. */
export default function AccessibilityPage() {
  return (
    <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)]">
      <div className="mx-auto max-w-[880px]">
        <h1 className="m-0 mb-5 font-display text-[32px] font-light tracking-tight text-ink md:text-[44px]">
          הצהרת <span className="keyword-underline">נגישות</span>
        </h1>
        <p className="m-0 mb-4 text-[17px] leading-relaxed text-ink-secondary">
          אתר שלכם נבנה מתוך מחויבות להנגשת שירותי החברה לכלל האוכלוסייה, בהתאם לתקן הישראלי
          (ת״י 5568) ולהנחיות WCAG 2.1 ברמה AA: ניווט מקלדת מלא, ניגודיות צבעים תקינה, תיאורי
          תמונות, טפסים נגישים ותמיכה בהעדפת צמצום תנועה.
        </p>
        <p className="m-0 mb-4 text-[17px] leading-relaxed text-ink-secondary">
          נתקלתם בקושי בגלישה? נשמח לתקן — פנו אלינו בטלפון{" "}
          <a href={site.phoneHref} className="tnum font-bold text-brand no-underline">
            {site.phone}
          </a>{" "}
          או בדוא״ל{" "}
          <a href={`mailto:${site.email}`} className="font-bold text-brand no-underline">
            {site.email}
          </a>
          .
        </p>
        <p className="m-0 text-[15px] text-ink-faint">
          פרטי רכז הנגישות ותאריך העדכון האחרון יפורסמו בעמוד זה.
        </p>
      </div>
    </section>
  );
}
