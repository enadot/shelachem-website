import Link from "next/link";
import { Entrance } from "@/components/shared/reveal";

/** Hero נייבי לעמודי משנה — פירורי לחם, h1 עם הדגשה בקו אדום ופסקת פתיחה. */
export function NavyHero({
  breadcrumb,
  title,
  strong,
  intro,
  children,
}: {
  breadcrumb: { label: string; href?: string }[];
  title: React.ReactNode;
  strong?: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-banner text-white">
      <div
        aria-hidden
        className="absolute -left-[60px] -top-[90px] h-[280px] w-[320px] rounded-full md:-right-[120px] md:left-auto md:-top-40 md:h-[480px] md:w-[560px]"
        style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
      />
      <div className="relative mx-auto flex max-w-[1240px] flex-col gap-3.5 px-6 py-10 md:px-12 md:py-16">
        <nav className="flex items-center gap-2 text-sm text-white/75" aria-label="פירורי לחם">
          {breadcrumb.map((b, i) => (
            <span key={b.label} className="flex items-center gap-2">
              {b.href ? (
                <Link href={b.href} className="text-white/75 no-underline hover:text-white">
                  {b.label}
                </Link>
              ) : (
                <span className="font-bold text-white">{b.label}</span>
              )}
              {i < breadcrumb.length - 1 && <span aria-hidden>‹</span>}
            </span>
          ))}
        </nav>
        <Entrance>
          <h1 className="m-0 font-display text-[38px] font-light leading-[1.12] tracking-tight text-white md:text-[54px]">
            {title}
            {strong !== undefined && (
              <>
                {" "}
                <span className="border-b-[5px] border-accent font-black md:border-b-[7px]">{strong}</span>
              </>
            )}
          </h1>
        </Entrance>
        {intro && (
          <p className="m-0 max-w-[640px] text-[16.5px] leading-relaxed text-white/90 md:text-xl">
            {intro}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
