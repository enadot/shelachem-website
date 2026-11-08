import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "הפרטים התקבלו",
  robots: { index: false, follow: false },
};

/** יעד ההפניה אחרי POST רגיל של טופס ליד. רענון הוא GET — הליד לא נשלח שוב. */
export default function LeadReceivedPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="m-0 font-display text-3xl font-bold text-ink md:text-4xl">הפרטים התקבלו</h1>
      <p className="m-0 mt-4 max-w-[460px] text-base leading-relaxed text-ink-secondary">
        נחזור אליכם בדרך כלל תוך יום עסקים אחד. שכר טרחה בהצלחה בלבד.
      </p>
      <p className="m-0 mt-6 text-base text-ink-secondary">
        אפשר גם להתקשר{" "}
        <a href={site.phoneHref} className="tnum font-bold text-brand no-underline">
          {site.phone}
        </a>{" "}
        או{" "}
        <a href={site.whatsappHref} className="font-bold text-brand no-underline">
          בוואטסאפ
        </a>
        .
      </p>
      <Link
        href="/"
        className="mt-8 rounded-[10px] bg-brand px-7 py-3.5 text-base font-bold text-white no-underline"
      >
        חזרה לאתר
      </Link>
    </section>
  );
}
