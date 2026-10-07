"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { site } from "@/lib/config";
import { useLeadModal } from "@/components/shared/lead-modal";

const items = [
  { href: "/", label: "בית" },
  { href: "/about", label: "הסיפור שלנו" },
  { href: "/#specialties", label: "תחומי פעילות" },
  { href: "/institutions", label: "מוסדות ובירוקרטיה" },
  { href: "/#how-it-works", label: "איך זה עובד" },
  { href: "/magazine", label: "מגזין" },
];

/** תפריט מובייל מסך-מלא ברויאל radial עם כניסת stagger (עיצוב: designs/homepage-v3.html §5a). */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  const { openLeadForm } = useLeadModal();
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
      style={{ "--royal-shape": "ellipse 90% 70% at 50% 35%" } as React.CSSProperties}
      className="brand-gradient surface-navy fixed inset-0 z-50 flex flex-col overflow-hidden"
    >
      <Image
        src="/images/swirl-white.png"
        alt=""
        aria-hidden="true"
        width={300}
        height={300}
        className="pointer-events-none absolute -bottom-[60px] -left-[60px] w-[300px] opacity-[0.12]"
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
        <span className="badge-gold px-4 pb-1.5 pt-[7px] text-[15px]">מאז {site.foundedYear}</span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center px-7">
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
              className={`block py-3 font-display text-[clamp(28px,8.5vw,34px)] font-black leading-tight text-white no-underline ${
                i < items.length - 1 ? "border-b border-white/15" : ""
              }`}
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="relative flex flex-col gap-3.5 px-7 pb-[34px]">
        <button
          type="button"
          onClick={() => {
            onClose();
            openLeadForm("mobile-menu");
          }}
          className="block w-full cursor-pointer rounded-[10px] border-none bg-gold p-4 text-center text-lg font-bold text-ink"
        >
          בדיקת זכאות חינם
        </button>
        <a href={site.phoneHref} className="tnum block text-center text-[17px] text-white no-underline">
          {site.phone} · זמינים עכשיו
        </a>
      </div>
    </motion.div>
  );
}
