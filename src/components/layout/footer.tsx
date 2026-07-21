import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/config";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "מוסדות ובירוקרטיה",
    links: [
      { label: "ביטוח לאומי", href: "/institutions/bituach-leumi" },
      { label: "מס הכנסה", href: "/services/tax-exemption" },
      { label: "קרנות פנסיה", href: "/institutions" },
      { label: "חברות ביטוח", href: "/institutions" },
      { label: "משרד הרישוי", href: "/institutions" },
    ],
  },
  {
    title: "אודות",
    links: [
      { label: "הסיפור שלנו", href: "/about" },
      { label: "צוות ההנהלה", href: "/team" },
      { label: "הרופאים שלנו", href: "/doctors" },
      { label: "יצירת קשר", href: "/branches" },
    ],
  },
  {
    title: "מגזין",
    links: [
      { label: "כל הכתבות", href: "/magazine" },
      { label: "מדריכים", href: "/magazine" },
      { label: "שאלות ותשובות", href: "/#faq" },
      { label: "סניפים", href: "/branches" },
    ],
  },
  {
    title: "מחלות וזכויות",
    links: [
      { label: "פטור ממס הכנסה", href: "/services/tax-exemption" },
      { label: "נכות כללית", href: "/institutions/bituach-leumi" },
      { label: "אובדן כושר עבודה", href: "/institutions" },
      { label: "ילד נכה", href: "/institutions/bituach-leumi" },
      { label: "ביטוח סיעודי", href: "/institutions" },
    ],
  },
];

/** מגה-פוטר (עיצוב דף הבית) — משמש בכל האתר. */
export function Footer() {
  return (
    <footer className="border-t border-hairline bg-white px-6 pb-7 pt-10 md:px-[clamp(24px,6.7vw,96px)] md:pt-14">
      <div className="mx-auto max-w-[1200px]">
        <Image src="/images/logo.svg" alt="שלכם" width={136} height={56} className="mb-5 h-14 w-auto" />
        <div className="grid grid-cols-2 gap-6 text-sm leading-8 text-ink-muted md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <div className="mb-1 font-bold text-ink">{col.title}</div>
              {col.links.map((l) => (
                <div key={l.label}>
                  <Link href={l.href} className="text-ink-muted no-underline transition-colors hover:text-brand">
                    {l.label}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-hairline pt-4 text-[13px] leading-7 text-ink-muted">
          <b className="text-ink">סניפים:</b> ירושלים — בניין שערי העיר, רח׳ יפו פינת שרי ישראל (קומה 9) · בני
          ברק — רח׳ ז׳בוטינסקי 168 ·{" "}
          <a href={site.phoneHref} className="tnum text-ink-muted no-underline hover:text-brand">
            {site.phone}
          </a>
          <br />
          <span className="mt-1 inline-flex flex-wrap items-center gap-x-3">
            <span>© {site.name}</span>
            <Link href="/privacy" className="text-ink-muted underline-offset-2 hover:text-brand">
              מדיניות פרטיות
            </Link>
            <Link href="/accessibility" className="text-ink-muted underline-offset-2 hover:text-brand">
              הצהרת נגישות
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
