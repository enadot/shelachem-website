import type { ClaimMode } from "@/lib/content/local/lp-claims";
import { resolveList } from "@/lib/content/local/lp-claims";
import { LP_DISCLOSURE_EXTRA, LP_DISCLOSURE_TITLE } from "@/lib/content/local/landing-pages";
import { SectionHeading } from "@/components/shared/section-heading";
import { Claimed, Rich } from "@/components/lp/claim-text";
import { cn } from "@/lib/utils";

/** אתר ביטוח לאומי — הגילוי הנאות תמיד מקשר אליו (מדיניות Google לשירותים ממשלתיים). */
export const BTL_HOME = "https://www.btl.gov.il/";

const btlLink = (label: string, className?: string) => (
  <a href={BTL_HOME} target="_blank" rel="noopener" className={cn("font-bold underline underline-offset-2", className)}>
    {label}
  </a>
);

/**
 * גילוי נאות קצר — מתחת לכל טופס בעמודי הנחיתה. תמיד מוצג, לא כפוף לאישור טענות:
 * חברה פרטית, והשירות זמין ישירות וללא עלות באתר ביטוח לאומי.
 */
export function LpDisclosureShort({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <p
      data-lp-disclosure="short"
      className={cn(
        "m-0 text-[14.5px] leading-relaxed",
        tone === "dark" ? "text-white/75" : "text-ink-muted",
        className,
      )}
    >
      שלכם היא חברה פרטית לליווי במימוש זכויות רפואיות, ואינה קשורה לביטוח לאומי או לגוף ממשלתי
      כלשהו. אפשר להגיש תביעה ישירות לביטוח לאומי, ללא עלות, באתר{" "}
      {btlLink("btl.gov.il", tone === "dark" ? "text-white" : "text-ink-secondary")}.
    </p>
  );
}

/**
 * גילוי נאות מלא — מעל ה-CTA הסופי. פסקאות 1-2 קבועות (לא כפופות לאישור);
 * פסקאות 3-4 עוברות בשער הטענות.
 */
export function LpDisclosureFull({
  mode,
  btlUrl,
  benefitName,
}: {
  mode: ClaimMode;
  btlUrl: string;
  benefitName: string;
}) {
  const extra = resolveList(LP_DISCLOSURE_EXTRA, mode);
  const [title, strong] = LP_DISCLOSURE_TITLE.split(/\*\*(.+?)\*\*/);
  return (
    <section
      data-lp-section="disclosure"
      className="px-6 py-14 md:px-[clamp(24px,6.7vw,96px)] md:py-20"
      aria-labelledby="lp-disclosure-title"
    >
      <div className="mx-auto max-w-[1240px] border-t border-hairline pt-10 md:pt-14">
        <SectionHeading strong={strong} className="mb-6 text-[26px] md:text-[34px]">
          <span id="lp-disclosure-title">{title.trim()}</span>
        </SectionHeading>
        <div className="flex max-w-[72ch] flex-col gap-4 text-[16px] leading-relaxed text-ink-secondary md:text-[17px]">
          <p className="m-0">
            ״שלכם — מימוש זכויות רפואיות בע״מ״ היא חברה פרטית. איננו חלק מהמוסד לביטוח לאומי, ממשרד
            ממשלתי או מרשות ציבורית כלשהי, ואיננו פועלים מטעמם.
          </p>
          <p className="m-0">
            אין חובה להיעזר בליווי בתשלום: כל אחד יכול להגיש תביעה בעצמו, ללא עלות, באתר ביטוח לאומי (
            {btlLink("www.btl.gov.il", "text-ink")}) או בסניפי המוסד.
            {btlUrl !== BTL_HOME && (
              <>
                {" "}
                מידע רשמי על {benefitName}:{" "}
                <a href={btlUrl} target="_blank" rel="noopener" className="font-bold text-ink underline underline-offset-2">
                  באתר ביטוח לאומי
                </a>
                .
              </>
            )}
          </p>
          {extra.map((p) => (
            <p key={p.value.slice(0, 24)} className="m-0">
              <Claimed pending={p.pending}>
                <Rich text={p.value} />
              </Claimed>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
