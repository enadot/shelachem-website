import { CmsImage } from "@/components/shared/cms-image";
import { cn } from "@/lib/utils";

/** אווטאר אדם — תמונה אם קיימת, אחרת ראשי תיבות על רקע כחלחל (כמו בעיצובים). */
export function PersonAvatar({
  name,
  image,
  size = 64,
  className,
}: {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  if (image) {
    return (
      <CmsImage
        src={image}
        alt={name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  const initials = name
    .replace(/["״'׳]/g, "")
    .split(/\s+/)
    .filter((w) => !["דר", "פרופ"].includes(w.replace(/[^א-ת]/g, "")))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[#eef0ff] font-bold text-brand",
        className,
      )}
    >
      {initials}
    </span>
  );
}
