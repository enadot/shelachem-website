import Image, { type ImageProps } from "next/image";

/**
 * תמונה מהלוח (Vercel Blob) או מקומית (/images/...). שתיהן עוברות דרך next/image —
 * רוחב לפי המסך, דחיסה ו-AVIF/WebP. ה-host של Blob מאושר ב-next.config.ts.
 */
export function CmsImage({ alt, ...props }: ImageProps) {
  return <Image {...props} alt={alt} />;
}
