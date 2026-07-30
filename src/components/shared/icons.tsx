/**
 * מערכת האייקונים של האתר — SVG מצוירים, לא גליפי יוניקוד.
 *
 * למה: עד כה שימשו `›`, `‹` ו-`←` בשלוש קונבנציות שונות לאותה משמעות ("קדימה"),
 * וגליפים כמו `✓` ו-`💡` שימשו כאייקונים. גליף בתוך טקסט של כפתור נקרא בקורא מסך
 * ("סימן ציטוט זוויתי..."), ותלוי בהיפוך דו-כיווני שאינו מובטח בכל מנוע.
 *
 * הכלל: המסמך כולו `dir="rtl"`, ולכן **קדימה = שמאלה**. `ChevronForward` מצביע
 * שמאלה ו-`ChevronBack` ימינה — בלי הסתמכות על bidi mirroring.
 *
 * גיאומטריה אחידה: viewBox 24×24, `stroke-width: 2`, קצוות עגולים, `currentColor`,
 * ו-`aria-hidden` תמיד (האייקון מלווה טקסט, לא מחליף אותו).
 */

type IconProps = {
  /** גודל בפיקסלים (רוחב וגובה). */
  size?: number;
  className?: string;
};

function Svg({
  size = 16,
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** קדימה בכיוון הקריאה (RTL → שמאלה). המשך, לפרטים, לקרוא עוד. */
export function ChevronForward(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

/** אחורה בכיוון הקריאה (RTL → ימינה). חזרה, שלב קודם. */
export function ChevronBack(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

/** חץ מלא קדימה — לקישורי "המשיכו לקרוא" ולכרטיסים שהם קישור. */
export function ArrowForward(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </Svg>
  );
}

/** מפריד פירורי לחם. קו נטוי דק — לא גליף ציטוט. */
export function BreadcrumbSeparator({ size = 14, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M15 4L9 20" />
    </svg>
  );
}

/** וי אישור — פריטי "מה חשוב לדעת" והודעות הצלחה. */
export function Check(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 13l4.5 4.5L19 6.5" />
    </Svg>
  );
}

/** וי בתוך עיגול — הודעת הצלחה של הטופס. */
export function CheckCircle({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.4l2.8 2.8L16 9.6" />
    </svg>
  );
}

/** נורה — תיבת טיפ/שימו לב. */
export function Bulb({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M12 3a5.5 5.5 0 0 0-3.2 9.96c.5.37.8.94.8 1.54v.5h4.8v-.5c0-.6.3-1.17.8-1.54A5.5 5.5 0 0 0 12 3Z" />
      <path d="M10 18.5h4" />
      <path d="M10.8 21h2.4" />
    </svg>
  );
}

/** עיגול מידע — כותרת "בשורה התחתונה". */
export function InfoCircle({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.6h.01" strokeWidth={2.6} />
    </svg>
  );
}
