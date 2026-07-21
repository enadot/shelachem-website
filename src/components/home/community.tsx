import { site } from "@/lib/config";
import { Reveal } from "@/components/shared/reveal";

const socialLinks: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "פייסבוק",
    href: site.socials.facebook,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.5 21.5v-7.4h2.5l.4-2.9h-2.9V9.3c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.2H8.1v2.9h2.4v7.4z" />
      </svg>
    ),
  },
  {
    label: "אינסטגרם",
    href: site.socials.instagram,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="7" r="1.3" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "יוטיוב",
    href: site.socials.youtube,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10.2 9.2 L15.2 12 L10.2 14.8 Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "טיקטוק",
    href: site.socials.tiktok,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.6 3c.4 1.9 1.6 3.3 3.6 3.6v2.9c-1.4 0-2.6-.4-3.6-1.1v5.9c0 3-2.3 5.3-5.3 5.3-2.9 0-5.2-2.2-5.2-5 0-2.9 2.6-5.2 5.7-4.9v3c-1.4-.3-2.7.7-2.7 2 0 1.2 1 2.1 2.2 2.1 1.3 0 2.3-1 2.3-2.4V3z" />
      </svg>
    ),
  },
  {
    label: "לינקדאין",
    href: site.socials.linkedin,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <rect x="3" y="9.5" width="3" height="11" />
        <circle cx="4.5" cy="5.5" r="1.8" />
        <path d="M10 9.5h2.9v1.5c.5-.9 1.6-1.7 3.2-1.7 2.4 0 3.9 1.6 3.9 4.5v6.7h-3v-6.2c0-1.5-.6-2.3-1.8-2.3-1.3 0-2.2 1-2.2 2.5v6h-3z" />
      </svg>
    ),
  },
];

/** רשתות חברתיות (homepage-live.html §9). */
export function Community() {
  return (
    <section className="bg-surface px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-14">
      <Reveal className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8">
        <div className="max-w-[640px]">
          <div className="mb-1.5 text-[22px] font-bold text-ink md:text-[28px]">
            אל תפספסו שום עדכון רלוונטי
          </div>
          <div className="text-[17px] leading-relaxed text-ink-muted md:text-lg">
            עוקבים אחרינו ומקבלים ראשונים כל שינוי בחוק, כל עדכון בקצבאות וכל זכות חדשה שנפתחת.
            כי מה ששווה כסף כדאי לדעת מוקדם
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pill inline-flex items-center gap-2 border border-hairline bg-white px-5 py-[11px] text-base text-ink no-underline transition-colors hover:border-brand hover:text-brand"
            >
              {s.icon}
              {s.label}
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
