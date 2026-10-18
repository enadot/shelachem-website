import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LegalPage } from "@/components/legal/legal-page";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "הצהרת נגישות",
  path: "/accessibility",
  description: "הצהרת הנגישות של אתר שלכם — מימוש זכויות רפואיות.",
  robots: { index: false },
});

const link = "font-bold text-brand no-underline hover:underline";

/** עמוד placeholder — יושלם עם פרטי רכז הנגישות של החברה. */
export default async function AccessibilityPage() {
  const { contact } = await getSiteSettings();
  return (
    <LegalPage
      current="/accessibility"
      title="הצהרת"
      strong="נגישות"
      intro="האתר נבנה כך שכל אחד יוכל להשתמש בו — בלי קשר למכשיר, ליכולת או לדרך הגלישה."
      sections={[
        {
          id: "commitment",
          title: "המחויבות שלנו",
          body: (
            <p>
              אתר שלכם נבנה מתוך מחויבות להנגשת שירותי החברה לכלל האוכלוסייה, בהתאם לתקן הישראלי
              (ת״י 5568) ולהנחיות WCAG 2.1 ברמה AA.
            </p>
          ),
        },
        {
          id: "what",
          title: "מה הונגש",
          body: (
            <p>
              ניווט מקלדת מלא, ניגודיות צבעים תקינה, תיאורי תמונות, טפסים נגישים ותמיכה בהעדפת
              צמצום תנועה.
            </p>
          ),
        },
        {
          id: "contact",
          title: "נתקלתם בקושי?",
          body: (
            <p>
              נשמח לתקן — פנו אלינו בטלפון{" "}
              <a href={contact.phoneHref} className={`tnum ${link}`}>
                {contact.phone}
              </a>{" "}
              או בדוא״ל{" "}
              <a href={`mailto:${contact.email}`} className={link}>
                {contact.email}
              </a>
              .
            </p>
          ),
        },
      ]}
      note="פרטי רכז הנגישות ותאריך העדכון האחרון יפורסמו בעמוד זה."
    />
  );
}
