"use client";

import { useEffect } from "react";
import { site } from "@/lib/config";

/** מודאל ״דברו איתנו״ — וואטסאפ / טלפון / מייל (עיצוב: Shelachem Live). */
export function ContactModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      dir="rtl"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(6,10,44,0.55)] p-5 backdrop-blur-[7px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="דברו איתנו"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[430px] rounded-3xl bg-white px-8 pb-7 pt-10 text-ink shadow-[rgba(4,8,40,0.4)_0_32px_90px]"
      >
        <button
          aria-label="סגירה"
          onClick={onClose}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f5f9] text-ink transition-colors hover:bg-[#e4e9f0]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
        <h3 className="mb-2 font-display text-[30px] font-light leading-[1.2] tracking-[-0.3px]">
          לדבר איתנו
          <br />
          <span className="font-bold">בכל דרך שנוחה לכם.</span>
        </h3>
        <p className="mb-[26px] text-base leading-[1.55] text-ink-muted">
          עונים מהר, בלי תפריטים ובלי המתנות.
        </p>
        <div className="flex flex-col gap-3">
          <ContactRow
            href={site.whatsappHref}
            external
            iconBg="#25D366"
            hoverClass="hover:border-[#25D366] hover:shadow-[rgba(37,211,102,0.18)_0_10px_24px]"
            title="וואטסאפ"
            subtitle="שלחו הודעה — נחזור תוך דקות"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.5A9.4 9.4 0 0 0 3.9 16.7L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.5Zm0 17.1c-1.5 0-3-.4-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3a7.7 7.7 0 1 1 6.8 3.7Zm4.3-5.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1a6.3 6.3 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.2.2-.4.1-.2 0-.3 0-.4l-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.4c.1.2 1.6 2.5 3.9 3.5.6.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1 0 0-.2-.1-.5-.2Z" />
              </svg>
            }
          />
          <ContactRow
            href={site.phoneHref}
            iconBg="#0000FF"
            hoverClass="hover:border-brand hover:shadow-[rgba(0,0,255,0.14)_0_10px_24px]"
            title="טלפון"
            subtitle={site.phone}
            subtitleTnum
            icon={<PhoneIcon size={21} />}
          />
          <ContactRow
            href={`mailto:${site.email}`}
            iconBg="#F0514F"
            hoverClass="hover:border-accent hover:shadow-[rgba(240,81,79,0.16)_0_10px_24px]"
            title="מייל"
            subtitle={site.email}
            icon={
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 7.5l8 5.5 8-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
        <div className="mt-[22px] text-center text-sm text-ink-faint">
          בדיקת הזכאות — ללא עלות וללא התחייבות
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  href,
  external,
  iconBg,
  hoverClass,
  title,
  subtitle,
  subtitleTnum,
  icon,
}: {
  href: string;
  external?: boolean;
  iconBg: string;
  hoverClass: string;
  title: string;
  subtitle: string;
  subtitleTnum?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      className={`flex items-center gap-4 rounded-2xl border border-hairline px-[18px] py-[15px] text-ink no-underline transition-all hover:-translate-y-0.5 ${hoverClass}`}
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: iconBg }}
      >
        {icon}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[17px] font-bold">{title}</span>
        <span className={`text-sm text-ink-faint${subtitleTnum ? " tnum" : ""}`}>{subtitle}</span>
      </span>
      <span className="text-xl text-[#94a3b8]">‹</span>
    </a>
  );
}

export function PhoneIcon({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 3.5h3l1.5 4.5-2 1.5a13 13 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
