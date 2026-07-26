"use client";

import Image, { type ImageProps } from "next/image";

/**
 * תמונה מה-CMS או מקומית.
 * לנכסים של Directus (כתובת .../assets/<id>) מוסיפים את פרמטרי הטרנספורמציה
 * של Directus: רוחב לפי המסך (srcset של next/image), דחיסה, ו-format=auto —
 * Directus מגיש AVIF/WebP לפי כותרת ה-Accept של הדפדפן ושומר את התוצאה בדיסק.
 * תמונות מקומיות (/images/...) ממשיכות במסלול הרגיל של next/image.
 */
const directusLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?width=${width}&quality=${quality ?? 75}&format=auto&withoutEnlargement=true`;

const isDirectusAsset = (src: ImageProps["src"]): src is string =>
  typeof src === "string" && /^https?:\/\/[^/]+\/assets\//.test(src);

export function CmsImage({ alt, ...props }: ImageProps) {
  return isDirectusAsset(props.src) ? (
    <Image {...props} alt={alt} loader={directusLoader} />
  ) : (
    <Image {...props} alt={alt} />
  );
}
