import Image from "next/image";
import Link from "next/link";
import { branches, site } from "@/lib/config";
import { LeadCta } from "@/components/shared/lead-cta";
import { ArrowForward } from "@/components/shared/icons";

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

const year = new Date().getFullYear();

/**
 * פוטר — שלוש שכבות עם קווי שיער:
 * 1. לוגו והצהרה קצרה מימין, ויצירת קשר בולטת משמאל (טלפון גדול, וואטסאפ, דוא״ל
 *    ובדיקת זכאות).
 * 2. ארבע עמודות ניווט ועמודת סניפים.
 * 3. שורת זכויות ומסמכים משפטיים.
 */
export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface px-[22px] md:px-[clamp(24px,5vw,72px)]">
      <div className="mx-auto max-w-[1296px]">
        {/* 1 — brand + contact */}
        <div className="grid gap-10 border-b border-hairline py-12 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-20 md:py-16">
          <div>
            <Image
              src="/images/logo-2026.png"
              alt="שלכם — מימוש זכויות רפואיות"
              width={725}
              height={371}
              className="h-[64px] w-auto md:h-[84px]"
            />
            <p className="m-0 mt-6 max-w-[440px] text-base leading-relaxed text-ink-secondary md:text-[17px]">
              מאז {site.foundedYear} אנחנו מלווים אנשים מול ביטוח לאומי, מס הכנסה, קרנות הפנסיה וחברות
              הביטוח — עד שהזכות אצלם. <b className="text-ink">{site.feeModel}.</b>
            </p>
          </div>

          <div className="md:justify-self-end">
            <div className="text-sm font-bold tracking-[0.04em] text-ink-muted">דברו איתנו</div>
            <a
              href={site.phoneHref}
              className="tnum mt-2 block font-display text-[40px] font-light leading-none tracking-[-0.01em] text-ink no-underline transition-colors duration-300 hover:text-brand md:text-[56px]"
            >
              {site.phone}
            </a>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <LeadCta sourcePage="footer" variant="brand" className="group">
                בדיקת זכאות חינם
                <ArrowForward size={16} className="nudge" />
              </LeadCta>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-bold text-ink no-underline transition-colors duration-300 hover:text-brand"
              >
                <span className="link-draw">וואטסאפ</span>
              </a>
              <a
                href={`mailto:${site.email}`}
                className="text-[15px] font-bold text-ink no-underline transition-colors duration-300 hover:text-brand"
              >
                <span className="link-draw">{site.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2 — navigation + branches */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-hairline py-12 md:grid-cols-5 md:gap-10 md:py-14">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <div className="mb-3 text-sm font-bold tracking-[0.04em] text-ink">{col.title}</div>
              <ul className="m-0 list-none p-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {/* min-h-11 — יעד מגע 44px (WCAG 2.2 Target Size). */}
                    <Link
                      href={l.href}
                      className="inline-flex min-h-10 items-center text-[15px] text-ink-muted no-underline transition-colors duration-300 hover:text-ink md:min-h-11"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 text-sm font-bold tracking-[0.04em] text-ink">סניפים</div>
            <ul className="m-0 flex list-none flex-col gap-5 p-0">
              {branches.map((b) => (
                <li key={b.id} className="text-[15px] leading-relaxed">
                  <div className="font-bold text-ink">{b.city}</div>
                  <div className="text-ink-muted">{b.address}</div>
                </li>
              ))}
            </ul>
            <Link
              href="/branches"
              className="group mt-4 inline-flex min-h-11 items-center gap-2 text-[15px] font-bold text-brand no-underline"
            >
              <span className="link-draw">הוראות הגעה</span>
              <ArrowForward size={14} className="nudge" />
            </Link>
          </div>
        </div>

        {/* 3 — legal */}
        {/* pb-24 במובייל — שלא ייבלע מתחת לבר ה-CTA הקבוע */}
        <div className="flex flex-col gap-3 pb-24 pt-6 text-[13.5px] text-ink-muted md:flex-row md:items-center md:justify-between md:pb-6">
          <span>
            © {year} {site.legalName}
          </span>
          <span className="flex flex-wrap items-center gap-x-6">
            <Link href="/privacy" className="inline-flex min-h-11 items-center text-ink-muted no-underline hover:text-ink">
              מדיניות פרטיות
            </Link>
            <Link href="/accessibility" className="inline-flex min-h-11 items-center text-ink-muted no-underline hover:text-ink">
              הצהרת נגישות
            </Link>
            <Link href="/faq" className="inline-flex min-h-11 items-center text-ink-muted no-underline hover:text-ink">
              שאלות ותשובות
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
