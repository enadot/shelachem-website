import { cn } from "@/lib/utils";

/**
 * כותרת סקשן במשקל 300 עם הדגשה 700/900 — התבנית הטיפוגרפית של המותג.
 * `strong` מודגש; `underlineStrong` מוסיף את קו המותג האדום (keyword-underline).
 */
export function SectionHeading({
  as: Tag = "h2",
  children,
  strong,
  underlineStrong = false,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  children?: React.ReactNode;
  strong?: React.ReactNode;
  underlineStrong?: boolean;
  className?: string;
}) {
  return (
    <Tag className={cn("m-0 font-display font-light tracking-tight text-ink", className)}>
      {children}
      {strong !== undefined && (
        <>
          {" "}
          <span className={underlineStrong ? "keyword-underline" : "font-bold"}>{strong}</span>
        </>
      )}
    </Tag>
  );
}
