import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  alternates: { canonical: "/privacy" },
  description: "מדיניות הפרטיות של שלכם — מימוש זכויות רפואיות בע״מ.",
  robots: { index: false },
};

/** עמוד placeholder — הנוסח המשפטי הסופי יסופק על ידי הלקוח. */
export default function PrivacyPage() {
  return (
    <LegalPage
      current="/privacy"
      title="מדיניות"
      strong="פרטיות"
      intro="מה קורה לפרטים שאתם משאירים באתר — בקצרה ובשפה פשוטה."
      sections={[
        {
          id: "storage",
          title: "איפה המידע נשמר",
          body: (
            <p>
              המידע שנמסר לנו באמצעות טופסי האתר נשמר במאגרי המידע של שלכם — מימוש זכויות רפואיות
              בע״מ.
            </p>
          ),
        },
        {
          id: "use",
          title: "למה הוא משמש",
          body: <p>לצורך בדיקת הזכאות ויצירת קשר בלבד.</p>,
        },
        {
          id: "sharing",
          title: "העברה לגורמים אחרים",
          body: (
            <p>איננו מעבירים את פרטיכם לגורמים שלישיים ללא הסכמתכם, למעט כנדרש על פי דין.</p>
          ),
        },
      ]}
      note="הנוסח המלא של מדיניות הפרטיות יפורסם בעמוד זה בקרוב."
    />
  );
}
