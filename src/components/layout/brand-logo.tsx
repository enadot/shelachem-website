"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { isLandingPath } from "@/lib/config";

const FULL = { src: "/images/logo-2026.png", width: 725, height: 371 } as const;
/**
 * לוגו 2026 בלי סרט "מאז 2013" ובלי שורת המוסדות (ביטוח לאומי / מס הכנסה / חברות ביטוח).
 * בעמודי הנחיתה השורה הזו סותרת את הגילוי הנאות (חברה פרטית, לא גוף ממשלתי). QA G2.
 */
const CLEAN = { src: "/images/logo-2026-clean.png", width: 725, height: 237 } as const;

export function BrandLogo({ className, priority }: { className?: string; priority?: boolean }) {
  const logo = isLandingPath(usePathname()) ? CLEAN : FULL;
  return (
    <Image
      src={logo.src}
      alt="שלכם — מימוש זכויות רפואיות"
      width={logo.width}
      height={logo.height}
      className={className}
      priority={priority}
    />
  );
}
