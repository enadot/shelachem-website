"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { site } from "@/lib/config";
import { PhoneIcon } from "./contact-modal";

const items = [
  {
    href: "/",
    label: "בית",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 11.5 12 4.5l7.5 7V20h-5v-5h-5v5h-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "הסיפור שלנו",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 20C6 15.5 3.5 12.5 3.5 9.4 3.5 7 5.4 5 7.9 5c1.7 0 3.2.9 4.1 2.3C12.9 5.9 14.4 5 16.1 5c2.5 0 4.4 2 4.4 4.4 0 3.1-2.5 6.1-8.5 10.6Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/institutions",
    label: "תחומי פעילות",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="8" width="17" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/#how-it-works",
    label: "איך זה עובד",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="18" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="8" cy="18.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.4 7.4 15.6 10.8M16 14.4 10.2 16.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/magazine",
    label: "מגזין",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 6c-1.8-1.6-4.2-2-8-2v15c3.8 0 6.2.4 8 2 1.8-1.6 4.2-2 8-2V4c-3.8 0-6.2.4-8 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <line x1="12" y1="6" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

/** תפריט מובייל מסך-מלא בגרדיאנט כחול עם כניסת stagger (עיצוב: Shelachem Live). */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[linear-gradient(210deg,#1f1fff_0%,#0000d6_55%,#0000a8_100%)]"
    >
      <div className="absolute -top-[140px] -left-[120px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_70%)]" />
      <Image
        src="/images/heart.svg"
        alt=""
        aria-hidden="true"
        width={340}
        height={306}
        className="pointer-events-none absolute -bottom-[90px] -left-[70px] w-[340px] opacity-[0.12] brightness-0 invert"
      />

      <div className="relative flex items-center justify-between gap-3 px-5 py-3.5">
        <button
          aria-label="סגירת תפריט"
          onClick={onClose}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
        <span className="inline-flex rounded-xl bg-white px-2.5 py-[5px]">
          <Image src="/images/logo.svg" alt="שלכם" width={82} height={34} className="h-[34px] w-auto" />
        </span>
        <a
          href={site.phoneHref}
          aria-label="חייגו אלינו"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white no-underline"
        >
          <PhoneIcon size={18} />
        </a>
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-0.5 px-7">
        {items.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-4 border-b border-white/10 py-[13px] text-white no-underline"
            >
              <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-white/15">
                {item.icon}
              </span>
              <span className="flex-1 font-display text-2xl font-bold text-white">{item.label}</span>
              <span className="text-xl text-white/55">‹</span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="relative flex flex-col gap-3.5 px-7 pb-[34px]">
        <Link
          href="/#lead-form"
          onClick={onClose}
          className="block rounded-full bg-accent p-4 text-center text-lg font-bold text-white no-underline shadow-[rgba(0,0,40,0.3)_0_12px_28px]"
        >
          בדיקת זכאות חינם
        </Link>
        <a href={site.phoneHref} className="tnum block text-center text-[17px] text-white no-underline">
          {site.phone} · זמינים עכשיו
        </a>
      </div>
    </motion.div>
  );
}
