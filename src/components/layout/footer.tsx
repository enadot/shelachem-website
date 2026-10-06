import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/config";
import { Reveal } from "@/components/shared/reveal";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "מוסדות ובירוקרטיה",
    links: [
      { label: "ביטוח לאומי", href: "/institutions/bituach-leumi" },
      { label: "מס הכנסה", href: "/institutions/mas-hachnasa" },
      { label: "קרנות פנסיה", href: "/institutions/karnot-pensia" },
      { label: "חברות ביטוח", href: "/institutions/hevrot-bituach" },
      { label: "משרד הרישוי", href: "/institutions/misrad-harishui" },
    ],
  },
  {
    title: "אודות",
    links: [
      { label: "הסיפור שלנו", href: "/about" },
      { label: "צוות ההנהלה", href: "/team" },
      { label: "הרופאים שלנו", href: "/doctors" },
      { label: "סניפים ויצירת קשר", href: "/branches" },
    ],
  },
  {
    // היה "מגזין" והכיל את "סניפים" — קישור שלא שייך לעמודה. הכותרת החדשה מתארת
    // את מה שבאמת יש כאן, וכל קישור מוביל ליעד שונה.
    title: "ידע ותשובות",
    links: [
      { label: "כל הכתבות", href: "/magazine" },
      { label: "מדריכים", href: "/magazine?cat=מדריכים" },
      { label: "סיפורי הצלחה", href: "/magazine?cat=סיפורי הצלחה" },
      { label: "שאלות ותשובות", href: "/faq" },
    ],
  },
  {
    // כל קישור מצביע לעמוד שבאמת מטפל בזכות הזאת, ולא ל-/institutions הגנרי.
    title: "מחלות וזכויות",
    links: [
      { label: "פטור ממס הכנסה", href: "/services/tax-exemption" },
      { label: "נכות כללית", href: "/institutions/bituach-leumi" },
      { label: "ילד נכה", href: "/institutions/bituach-leumi" },
      { label: "אובדן כושר עבודה", href: "/institutions/karnot-pensia" },
      { label: "ביטוח סיעודי", href: "/institutions/hevrot-bituach" },
      { label: "תו נכה", href: "/institutions/misrad-harishui" },
    ],
  },
];

/**
 * מגה-פוטר — לוגו 2026 + 4 עמודות, ובתחתית סימן-מילה "שלכם" ענק שחותך את
 * שפת הדף (חתימה עריכתית במקום פס זכויות יוצרים יבש). משמש בכל האתר.
 */
export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-hairline-soft bg-white px-[22px] pt-9 md:px-[clamp(24px,5vw,72px)] md:pt-14">
      <div className="mx-auto max-w-[1296px]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm leading-8 text-ink-muted md:grid-cols-[1.3fr_repeat(4,1fr)] md:gap-10 md:text-[15px]">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/images/logo-2026.png"
              alt="שלכם — מימוש זכויות רפואיות"
              width={725}
              height={371}
              className="h-[66px] w-auto md:h-[96px]"
            />
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <div className="mb-1 font-black text-ink">{col.title}</div>
              {col.links.map((l) => (
                <div key={l.label}>
                  {/* min-h-11 — יעד מגע 44px (WCAG 2.2 Target Size). */}
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-ink-muted no-underline transition-colors hover:text-brand"
                  >
                    {l.label}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-hairline-soft pt-4 text-[13px] leading-7 text-ink-muted md:mt-9 md:text-[15px]">
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
        <Reveal
          variant="mask"
          className="pointer-events-none mt-8 select-none md:mt-12"
        >
          <div
            aria-hidden
            className="-mb-[0.18em] text-center font-display text-[34vw] font-black leading-[0.8] tracking-[-0.04em] text-brand md:text-[min(30vw,420px)]"
          >
            שלכם
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
