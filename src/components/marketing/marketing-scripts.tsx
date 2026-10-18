"use client";

import Script from "next/script";
import { useMarketingAllowed } from "@/lib/consent";
import { directGoogleTagId, marketing } from "@/lib/marketing";

/** המזהים מוזרקים כמחרוזת JSON — גם מזהה שעבר ולידציה לא נכתב גולמי לתוך קוד. */
const q = (v: string) => JSON.stringify(v);

/**
 * טעינת תגי השיווק. כל תג נטען רק אם הוגדר לו מזהה ב-`src/lib/marketing.ts`.
 *
 * GTM ו-gtag.js נטענים תמיד — Consent Mode (שהוגדר בסקריפט ה-inline שב-layout)
 * קובע מה מותר להם לשמור. פיקסלים של צד שלישי, שאין להם Consent Mode אמין,
 * נטענים רק אחרי הסכמה כשנדרשת הסכמה.
 */
export function MarketingScripts() {
  const allowed = useMarketingAllowed();
  const { gtmId, ga4Id, googleAdsId, metaPixelId, tiktokPixelId, linkedinPartnerId, clarityId } =
    marketing;

  return (
    <>
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${q(gtmId)});`}
        </Script>
      )}

      {directGoogleTagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${directGoogleTagId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-config" strategy="afterInteractive">
            {`gtag('js',new Date());` +
              (ga4Id ? `gtag('config',${q(ga4Id)});` : "") +
              (googleAdsId
                ? `gtag('config',${q(googleAdsId)},{allow_enhanced_conversions:${marketing.enhancedConversions}});`
                : "")}
          </Script>
        </>
      )}

      {allowed && metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${q(metaPixelId)});fbq('track','PageView');`}
        </Script>
      )}

      {allowed && tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=d.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=d.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load(${q(tiktokPixelId)});ttq.page();}(window,document,'ttq');`}
        </Script>
      )}

      {allowed && linkedinPartnerId && (
        <Script id="linkedin-insight" strategy="afterInteractive">
          {`window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(${q(linkedinPartnerId)});(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);`}
        </Script>
      )}

      {allowed && clarityId && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script",${q(clarityId)});`}
        </Script>
      )}
    </>
  );
}

