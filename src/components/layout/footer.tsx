import Link from "next/link";
import { site } from "@/lib/config";
import { BrandLogo } from "./brand-logo";
import { FooterBlurb, FooterLeadCta, FooterLower, FooterWhatsapp, type FooterVariant } from "./footer-parts";
import { CookieSettingsLink } from "@/components/marketing/cookie-consent";
import { getSiteSettings } from "@/lib/content";

const year = new Date().getFullYear();

/**
 * פוטר — שלוש שכבות עם קווי שיער:
 * 1. לוגו והצהרה קצרה מימין, ויצירת קשר בולטת משמאל (טלפון גדול, וואטסאפ, דוא״ל
 *    ובדיקת זכאות).
 * 2. ארבע עמודות ניווט ועמודת סניפים.
 * 3. שורת זכויות ומסמכים משפטיים.
 *
 * `variant="lp"` — גרסת עמודי הנחיתה (בלי קישור לרופאים ולעדויות, בלי טענות).
 * בלי `variant` הגרסה נקבעת לפי הנתיב (`/lp/*`).
 */
export async function Footer({ variant }: { variant?: FooterVariant } = {}) {
  const { contact, branches } = await getSiteSettings();
  return (
    <footer className="border-t border-hairline bg-surface px-[22px] md:px-[clamp(24px,5vw,72px)]">
      <div className="mx-auto max-w-[1296px]">
        {/* 1 — brand + contact */}
        <div className="grid gap-10 border-b border-hairline py-12 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-20 md:py-16">
          <div>
            <BrandLogo className="h-[64px] w-auto md:h-[84px]" />
            <FooterBlurb variant={variant} />
          </div>

          <div className="md:justify-self-end">
            <div className="text-sm font-bold tracking-[0.04em] text-ink-muted">דברו איתנו</div>
            <a
              href={contact.phoneHref}
              className="tnum mt-2 block font-display text-[40px] font-light leading-none tracking-[-0.01em] text-ink no-underline transition-colors duration-300 hover:text-brand md:text-[56px]"
            >
              {contact.phone}
            </a>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <FooterLeadCta variant={variant} />
              <FooterWhatsapp href={contact.whatsappHref} />
              <a
                href={`mailto:${contact.email}`}
                className="text-[15px] font-bold text-ink no-underline transition-colors duration-300 hover:text-brand"
              >
                <span className="link-draw">{contact.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2 — navigation. בעמודי /lp בלי רשימת הסניפים (QA G3). */}
        <FooterLower variant={variant} branches={branches} />

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
            <CookieSettingsLink className="inline-flex min-h-11 cursor-pointer items-center border-none bg-transparent p-0 text-[13.5px] text-ink-muted hover:text-ink" />
          </span>
        </div>
      </div>
    </footer>
  );
}
