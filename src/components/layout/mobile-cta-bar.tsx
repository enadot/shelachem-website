"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/config";
import { useLeadModal } from "@/components/shared/lead-modal";

/**
 * בר CTA דביק במובייל — חיוג, וואטסאפ ובדיקת זכאות.
 * מוסתר כשטופס הליד נמצא על המסך (אין טעם להציע את מה שכבר מול העיניים).
 */
export function MobileCtaBar() {
  const [formVisible, setFormVisible] = useState(false);
  const { openLeadForm } = useLeadModal();

  useEffect(() => {
    const form = document.getElementById("lead-form");
    if (!form) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* spacer — שהבר הקבוע לא יסתיר את תחתית הפוטר */}
      <div aria-hidden className="h-16 md:hidden" />
      <nav
        aria-label="יצירת קשר מהירה"
        className={`fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-hairline bg-white/95 px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur transition-transform duration-300 md:hidden ${
          formVisible ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <a
          href={site.phoneHref}
          className="flex min-h-11 items-center justify-center rounded-full border border-brand px-2 text-[15px] font-bold text-brand no-underline"
        >
          חייגו
        </a>
        <a
          href={site.whatsappHref}
          target="_blank"
          rel="noopener"
          className="flex min-h-11 items-center justify-center rounded-full border border-[#1faf57] px-2 text-[15px] font-bold text-[#15793a] no-underline"
        >
          וואטסאפ
        </a>
        <button
          type="button"
          onClick={() => openLeadForm("mobile-cta-bar")}
          className="flex min-h-11 cursor-pointer items-center justify-center rounded-full border-none bg-accent px-2 text-[15px] font-bold text-white"
        >
          בדיקת זכאות
        </button>
      </nav>
    </>
  );
}
