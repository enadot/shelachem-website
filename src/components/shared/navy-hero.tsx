import Image from "next/image";
import { Breadcrumb, type Crumb } from "@/components/shared/breadcrumb";

/** Hero רויאל לעמודי משנה (שפת v3) — פירורי לחם, h1 עם הדגשה בזהב ופסקת פתיחה. */
export function NavyHero({
  breadcrumb,
  title,
  strong,
  intro,
  children,
}: {
  breadcrumb: Crumb[];
  title: React.ReactNode;
  strong?: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="brand-gradient surface-navy relative overflow-hidden text-white [--royal-shape:ellipse_80%_120%_at_70%_40%]">
      <Image
        src="/images/swirl-white.png"
        alt=""
        aria-hidden
        width={420}
        height={420}
        className="pointer-events-none absolute -left-[90px] -top-[110px] w-[260px] opacity-[0.12] md:-top-[140px] md:left-[6%] md:w-[420px]"
      />
      <div className="relative mx-auto flex max-w-[1240px] flex-col gap-3.5 px-6 py-10 md:px-12 md:py-16">
        <Breadcrumb items={breadcrumb} tone="inverse" />
        {/* בלי Entrance — ה-h1 הוא אלמנט ה-LCP ואסור שיהיה תלוי בהידרציה */}
        <h1 className="m-0 font-display text-[38px] font-light leading-[1.12] tracking-tight text-white md:text-[54px]">
            {title}
            {strong !== undefined && (
              <>
                {" "}
                <span className="font-black text-gold">{strong}</span>
              </>
            )}
        </h1>
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
