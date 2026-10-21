import { CmsImage } from "@/components/shared/cms-image";
import { cn } from "@/lib/utils";

/*
 * סמל הלב של שלכם (public/images/heart.svg) מפוצל לשני חלקיו: ה"טיפה" (האונה
 * השמאלית) והלולאה-וי. הצילום ממלא את הטיפה, והלולאה בכחול המותג — כך שהתמונה
 * נקראת כחלק מהסמל עצמו.
 *
 * הקואורדינטות במערכת של heart.svg (viewBox 273.6–361.5 × 24.8–103.4).
 */
const LOOP =
  "M321.121 30.6663C325.634 26.8117 331.369 24.8374 337.01 24.8374C342.65 24.8374 349.608 27.1878 354.308 31.9826C359.103 36.7773 361.453 43.0763 361.453 49.2813C361.453 55.4863 359.103 61.8793 354.308 66.5801L347.821 73.0671L321.873 99.0152L317.454 103.434L313.036 99.0152L301.566 87.5454L305.985 83.1267L310.403 78.708L317.454 85.7592L338.984 64.2297L345.471 57.7426C347.821 55.3923 349.044 52.2898 349.044 49.1873C349.044 46.0848 347.821 42.9823 345.471 40.632C343.121 38.2816 340.018 37.0593 336.916 37.0593C333.813 37.0593 330.711 38.2816 328.36 40.632L326.856 42.1362C326.48 40.726 326.01 39.2217 325.446 37.8115C324.412 35.1791 322.907 32.7347 321.121 30.4783V30.6663Z";
const DROP =
  "M315.386 66.7681C320.181 61.9734 322.531 55.6743 322.531 49.4693C322.531 43.2643 320.181 36.8714 315.386 32.1706C310.591 27.3759 304.292 25.0254 298.087 25.0254C291.882 25.0254 285.489 27.3759 280.789 32.1706C275.994 36.9654 273.644 43.2643 273.644 49.4693C273.644 55.6743 275.994 62.0674 280.789 66.7681L293.763 79.7422L298.181 84.1609L302.6 79.7422L315.574 66.7681H315.386Z";

// תיבת הסמל ותיבת הטיפה בתוכה — לחישוב מיקום הצילום באחוזים.
const MARK = { x: 273.644, y: 24.8374, w: 87.809, h: 78.597 };
const DROP_BOX = { x: 273.644, y: 25.0254, w: 48.887, h: 59.136 };
const CLIP_ID = "heart-photo-drop";

export function HeartPhoto({
  src,
  alt,
  position = "50% 40%",
  priority,
  className,
}: {
  src: string;
  alt: string;
  /** נקודת המיקוד של החיתוך בתוך הטיפה (object-position). */
  position?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[87.8/78.6] w-full", className)}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
          <path
            d={DROP}
            transform={`scale(${1 / DROP_BOX.w} ${1 / DROP_BOX.h}) translate(${-DROP_BOX.x} ${-DROP_BOX.y})`}
          />
        </clipPath>
      </svg>
      <div
        className="absolute bg-surface"
        style={{
          left: `${((DROP_BOX.x - MARK.x) / MARK.w) * 100}%`,
          top: `${((DROP_BOX.y - MARK.y) / MARK.h) * 100}%`,
          width: `${(DROP_BOX.w / MARK.w) * 100}%`,
          height: `${(DROP_BOX.h / MARK.h) * 100}%`,
          clipPath: `url(#${CLIP_ID})`,
        }}
      >
        <CmsImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width:768px) 60vw, 300px"
          className="object-cover"
          style={{ objectPosition: position }}
        />
      </div>
      <svg
        viewBox={`${MARK.x} ${MARK.y} ${MARK.w} ${MARK.h}`}
        className="pointer-events-none absolute inset-0 size-full text-brand"
        aria-hidden
      >
        <path d={LOOP} fill="currentColor" />
      </svg>
    </div>
  );
}
