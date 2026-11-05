"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLandingPath, LP_WHATSAPP_HREF, site } from "@/lib/config";
import { LeadCta } from "@/components/shared/lead-cta";
import { ArrowForward } from "@/components/shared/icons";

/**
 * החלקים בפוטר שמשתנים בעמודי הנחיתה (`/lp/*`). בעמודי הנחיתה הפוטר לא מקשר
 * לעמוד הרופאים ולעדויות, ולא מציג טענות שעוד לא אושרו (T-026).
 *
 * הנתונים מיובאים כאן ולא מועברים כ-props מהשרת — כך הם לא נכנסים ל-HTML או
 * ל-payload של עמודי הנחיתה בכלל.
 */
export type FooterVariant = "default" | "lp";

export function useFooterVariant(variant?: FooterVariant): FooterVariant {
  const pathname = usePathname();
  return variant ?? (pathname?.startsWith("/lp/") ? "lp" : "default");
}

const columns: { title: string; links: { label: string; href: string; hideOnLp?: boolean }[] }[] = [
  {
    title: "מוסדות ובירוקרטיה",
    links: [
      { label: "ביטוח לאומי", href: "/institutions/bituach-leumi" },
      { label: "מס הכנסה", href: "/institutions/mas-hachnasa" },
      { label: "קרנות פנסיה", href: "/institutions/karnot-pensia" },
      { label: "חברות ביטוח", href: "/institutions/hevrot-bituach" },
    ],
  },
  {
    title: "אודות",
    links: [
      { label: "הסיפור שלנו", href: "/about" },
      { label: "צוות ההנהלה", href: "/team" },
      { label: "הרופאים שלנו", href: "/doctors", hideOnLp: true },
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
      { label: "סיפורי הצלחה", href: "/magazine?cat=סיפורי הצלחה", hideOnLp: true },
      { label: "שאלות ותשובות", href: "/faq" },
    ],
  },
  {
    // כל קישור מצביע לעמוד שבאמת מטפל בזכות הזאת, ולא ל-/institutions הגנרי.
    title: "מחלות וזכויות",
    links: [
      { label: "פטור ממס הכנסה", href: "/services/tax-exemption" },
      { label: "נכות כללית", href: "/services/general-disability" },
      { label: "ילד נכה", href: "/services/disabled-child" },
      { label: "אובדן כושר עבודה", href: "/services/loss-of-work-capacity" },
      { label: "ביטוח סיעודי", href: "/services/long-term-care" },
    ],
  },
];

export function FooterBlurb({ variant }: { variant?: FooterVariant }) {
  const v = useFooterVariant(variant);
  return (
    <p className="m-0 mt-6 max-w-[440px] text-base leading-relaxed text-ink-secondary md:text-[17px]">
      {v === "lp" ? (
        <>
          {site.shortName} היא חברה פרטית לליווי במימוש זכויות רפואיות, ואינה קשורה לביטוח לאומי או
          לגוף ממשלתי כלשהו.
        </>
      ) : (
        <>
          מאז {site.foundedYear} אנחנו מלווים אנשים מול ביטוח לאומי, מס הכנסה, קרנות הפנסיה וחברות
          הביטוח — עד שהזכות אצלם. <b className="text-ink">{site.feeModel}.</b>
        </>
      )}
    </p>
  );
}

export function FooterLeadCta({ variant }: { variant?: FooterVariant }) {
  const v = useFooterVariant(variant);
  return (
    <LeadCta sourcePage={v === "lp" ? "lp-footer" : "footer"} variant="brand" className="group">
      {v === "lp" ? "בדיקת זכאות" : "בדיקת זכאות חינם"}
      <ArrowForward size={16} className="nudge" />
    </LeadCta>
  );
}

/** וואטסאפ בפוטר: בעמודי /lp תמיד `wa.me/97238002000`, לא המספר מה-CMS (QA B1). */
export function FooterWhatsapp({ href }: { href: string }) {
  const wa = isLandingPath(usePathname()) ? LP_WHATSAPP_HREF : href;
  return (
    <a
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[15px] font-bold text-ink no-underline transition-colors duration-300 hover:text-brand"
    >
      <span className="link-draw">וואטסאפ</span>
    </a>
  );
}

/**
 * ניווט הפוטר. בעמודי הנחיתה רשימת הסניפים (עיר + כתובת + הוראות הגעה) מוסתרת (QA G3).
 * הקישור "סניפים ויצירת קשר" בעמודת האודות נשאר.
 */
export function FooterLower({
  variant,
  branches,
}: {
  variant?: FooterVariant;
  branches: { id: string; city: string; address: string }[];
}) {
  const v = useFooterVariant(variant);
  return (
    <div
      className={
        v === "lp"
          ? "grid grid-cols-2 gap-x-6 gap-y-10 border-b border-hairline py-12 md:grid-cols-4 md:gap-10 md:py-14"
          : "grid grid-cols-2 gap-x-6 gap-y-10 border-b border-hairline py-12 md:grid-cols-5 md:gap-10 md:py-14"
      }
    >
      <FooterColumns variant={variant} />
      {v !== "lp" && (
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
      )}
    </div>
  );
}

export function FooterColumns({ variant }: { variant?: FooterVariant }) {
  const v = useFooterVariant(variant);
  return columns.map((col) => (
    <nav key={col.title} aria-label={col.title}>
      <div className="mb-3 text-sm font-bold tracking-[0.04em] text-ink">{col.title}</div>
      <ul className="m-0 list-none p-0">
        {col.links
          .filter((l) => !(v === "lp" && l.hideOnLp))
          .map((l) => (
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
  ));
}
