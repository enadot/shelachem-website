import { Breadcrumb, type Crumb } from "@/components/shared/breadcrumb";
import { CmsImage } from "@/components/shared/cms-image";
import { cn } from "@/lib/utils";

/**
 * כותרת עמוד פנימי — לבנה, טיפוגרפית, מפוצלת: כותרת גדולה (300 + הדגשה 900 בדיו,
 * בלי צבע) מימין, ופסקת הפתיחה והפעולות משמאל, מיושרות לתחתית. קו שיער סוגר.
 *
 * בלי אנימציית כניסה: ה-h1 הוא אלמנט ה-LCP, והוא פשוט צריך להיות שם.
 *
 * `image` — צילום רחב שסוגר את הכותרת (21:9 בדסקטופ, 4:3 במובייל) במקום קו השיער.
 */
export function PageHeader({
  breadcrumb,
  title,
  strong,
  intro,
  children,
  image,
  className,
}: {
  breadcrumb: Crumb[];
  title: React.ReactNode;
  strong?: React.ReactNode;
  intro?: React.ReactNode;
  /** פעולות (כפתורים/קישורים) מתחת לפסקת הפתיחה. */
  children?: React.ReactNode;
  /** `position` — נקודת המיקוד של החיתוך (object-position), למשל "50% 30%". */
  image?: { src: string; alt: string; position?: string } | null;
  className?: string;
}) {
  const hasAside = Boolean(intro || children);
  return (
    <section
      className={cn(
        "border-b border-hairline bg-white px-6 md:px-[clamp(24px,6.7vw,96px)]",
        image && "border-b-0",
        className,
      )}
    >
      <div className={cn("mx-auto max-w-[1240px] pb-10 pt-7 md:pb-16 md:pt-9", image && "md:pb-0")}>
        <Breadcrumb items={breadcrumb} />
        <div
          className={cn(
            "mt-10 grid gap-6 md:mt-20 md:items-end md:gap-16",
            hasAside && "md:grid-cols-[1.4fr_1fr]",
          )}
        >
          <h1 className="m-0 max-w-[16ch] text-balance font-display text-[42px] font-light leading-[1.02] tracking-[-0.02em] text-ink md:text-[76px] md:leading-[0.98] md:tracking-[-0.03em]">
            {title}
            {strong !== undefined && (
              <>
                {" "}
                <span className="font-black">{strong}</span>
              </>
            )}
          </h1>
          {hasAside && (
            <div className="md:pb-2">
              {intro && (
                <p className="m-0 max-w-[460px] text-[17px] leading-relaxed text-ink-secondary md:text-[19px]">
                  {intro}
                </p>
              )}
              {children && <div className="mt-6 flex flex-wrap items-center gap-4">{children}</div>}
            </div>
          )}
        </div>
        {image && (
          <figure className="relative m-0 mt-10 aspect-[4/3] overflow-hidden rounded-2xl bg-surface md:mt-16 md:aspect-[21/9]">
            <CmsImage
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(max-width:768px) 100vw, 1240px"
              className="object-cover"
              style={{ objectPosition: image.position ?? "50% 40%" }}
            />
          </figure>
        )}
      </div>
    </section>
  );
}
