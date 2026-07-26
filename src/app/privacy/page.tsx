import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  alternates: { canonical: "/privacy" },
  description: "מדיניות הפרטיות של שלכם — מימוש זכויות רפואיות בע״מ.",
  robots: { index: false },
};

/** עמוד placeholder — הנוסח המשפטי הסופי יסופק על ידי הלקוח. */
export default function PrivacyPage() {
  return (
    <section className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)]">
      <div className="mx-auto max-w-[880px]">
        <h1 className="m-0 mb-5 font-display text-[32px] font-light tracking-tight text-ink md:text-[44px]">
          מדיניות <span className="keyword-underline">פרטיות</span>
        </h1>
        <p className="m-0 mb-4 text-[17px] leading-relaxed text-ink-secondary">
          המידע שנמסר לנו באמצעות טופסי האתר נשמר במאגרי המידע של שלכם — מימוש זכויות רפואיות
          בע״מ, ומשמש לצורך בדיקת הזכאות ויצירת קשר בלבד. איננו מעבירים את פרטיכם לגורמים
          שלישיים ללא הסכמתכם, למעט כנדרש על פי דין.
        </p>
        <p className="m-0 text-[15px] text-ink-faint">
          הנוסח המלא של מדיניות הפרטיות יפורסם בעמוד זה בקרוב.
        </p>
      </div>
    </section>
  );
}
