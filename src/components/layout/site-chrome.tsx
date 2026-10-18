import { getSiteSettings } from "@/lib/content";
import { siteGraph } from "@/lib/schema";
import { consentInitScript } from "@/lib/marketing";
import { SettingsProvider } from "@/components/settings-provider";
import { ContactModalProvider } from "@/components/layout/contact-modal-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { LeadModalProvider } from "@/components/shared/lead-modal";
import { MarketingScripts } from "@/components/marketing/marketing-scripts";
import { MarketingTracker } from "@/components/marketing/marketing-tracker";
import { CookieConsent } from "@/components/marketing/cookie-consent";

/**
 * המעטפת של האתר הציבורי: תגי מדידה, header/footer, מודאלים ו-JSON-LD.
 * משמשת את `(site)/layout.tsx` ואת עמוד ה-404 — ולא את לוח הבקרה, שאין בו
 * פיקסלים ולא ניווט של האתר.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const { marketing } = settings;

  return (
    <SettingsProvider settings={settings}>
      {/* Consent Mode + dataLayer — חייב לרוץ לפני כל תג מדידה */}
      <script dangerouslySetInnerHTML={{ __html: consentInitScript(marketing) }} />
      {marketing.gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${marketing.gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      )}
      {/*
        מפעיל את הסתרת ה-Reveal רק כשה-JS באמת רץ. ה-failsafe מסיר את הסימון
        אם ההידרציה לא הגיעה תוך 4 שניות — עדיף אתר בלי אנימציה מאתר ריק.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var d=document.documentElement;d.setAttribute('data-js','');" +
            "setTimeout(function(){if(!d.hasAttribute('data-reveal-ready'))d.removeAttribute('data-js')},4000)})()",
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph(settings)) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:right-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:font-bold focus:text-white"
      >
        דילוג לתוכן הראשי
      </a>
      <LeadModalProvider>
        <ContactModalProvider>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <MobileCtaBar />
          <CookieConsent />
        </ContactModalProvider>
      </LeadModalProvider>
      <MarketingScripts />
      <MarketingTracker />
    </SettingsProvider>
  );
}
