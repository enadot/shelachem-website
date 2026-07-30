import { Breadcrumb, type Crumb } from "@/components/shared/breadcrumb";

/** Hero נייבי לעמודי משנה — פירורי לחם, h1 עם הדגשה בקו אדום ופסקת פתיחה. */
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
    <section className="surface-navy relative overflow-hidden bg-banner text-white">
      <div
        aria-hidden
        className="absolute -left-[60px] -top-[90px] h-[280px] w-[320px] rounded-full md:-right-[120px] md:left-auto md:-top-40 md:h-[480px] md:w-[560px]"
        style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
      />
      <div className="relative mx-auto flex max-w-[1240px] flex-col gap-3.5 px-6 py-10 md:px-12 md:py-16">
        <Breadcrumb items={breadcrumb} tone="inverse" />
        {/* בלי Entrance — ה-h1 הוא אלמנט ה-LCP ואסור שיהיה תלוי בהידרציה */}
        <h1 className="m-0 font-display text-[38px] font-light leading-[1.12] tracking-tight text-white md:text-[54px]">
            {title}
            {strong !== undefined && (
              <>
                {" "}
                <span className="border-b-[5px] border-accent font-black md:border-b-[7px]">{strong}</span>
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
