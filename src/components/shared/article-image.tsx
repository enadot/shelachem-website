import Image from "next/image";
import { CmsImage } from "@/components/shared/cms-image";
import { cn } from "@/lib/utils";

/**
 * תמונת כתבה, עם מצב ריק ממותג.
 *
 * למה: `article-placeholder.avif` הוא 296×222 פיקסלים, והוא הוגש כתמונת ההירו
 * של הכתבה בקופסה של 944×420 — מתיחה של 3.3× — ובכרטיסי "המשיכו לקרוא" במתיחה
 * של 4.6×. במגזין זה גם היה אלמנט ה-LCP, כלומר הדבר הראשון שהמבקר רואה היה
 * bitmap מטושטש, וארבעה עותקים שלו נטענו בכל עמוד כתבה.
 *
 * במקום למתוח bitmap: משטח מותג עם סימן הלב של שלכם. נראה מכוון, שוקל ~1KB,
 * ולא מתחזה לצילום. תמונה אמיתית מה-CMS מוצגת כרגיל, עם ה-alt שלה.
 */
export function ArticleImage({
  src,
  alt,
  sizes,
  priority,
  className,
  markSize = 180,
}: {
  src?: string | null;
  alt?: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
  markSize?: number;
}) {
  if (src) {
    return (
      <CmsImage
        src={src}
        alt={alt ?? ""}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-surface-blue"
    >
      <Image
        src="/images/heart.svg"
        alt=""
        width={markSize}
        height={Math.round(markSize * 0.9)}
        className="opacity-[0.16]"
        style={{ width: markSize, height: "auto" }}
      />
    </div>
  );
}
