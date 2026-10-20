import {
  Accessibility,
  Baby,
  Bandage,
  Briefcase,
  HandHelping,
  HardHat,
  HouseHeart,
  PiggyBank,
  ReceiptText,
  ShieldPlus,
  Stethoscope,
  ToyBrick,
  type LucideIcon,
} from "lucide-react";

/** המפתחות תואמים ל-SERVICE_VISUALS בלוח (src/lib/admin/collections.ts). */
const ICONS: Record<string, LucideIcon> = {
  accessibility: Accessibility,
  hands: HandHelping,
  child: ToyBrick,
  shield: ShieldPlus,
  hardhat: HardHat,
  lungs: Stethoscope,
  pregnancy: Baby,
  bandage: Bandage,
  briefcase: Briefcase,
  piggybank: PiggyBank,
  "home-heart": HouseHeart,
  receipt: ReceiptText,
};

/**
 * איור לכותרת עמוד שירות שאין לו צילום — קומפוזיציה מקורית בשפת האתר: משטח
 * רויאל, טבעות קו שיער שמתרחבות מהאייקון (כמו גלים של "תשומת לב"), ואייקון דק
 * בזהב. דקורטיבי בלבד (aria-hidden) — הכותרת והפתיח כבר אומרים הכול.
 *
 * ממלא את אותו מקום של הצילום ב-PageHeader (21:9 בדסקטופ, 4:3 במובייל).
 */
export function ServiceVisual({ visual, label }: { visual?: string | null; label?: string }) {
  const Icon = (visual && ICONS[visual]) || ShieldPlus;
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-brand">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_18%_50%,var(--color-brand-bright)_0%,transparent_60%)]" />
      {/* טבעות — מרוכזות סביב האייקון, בצד השמאלי (סוף השורה ב-RTL) */}
      <svg
        className="absolute left-[18%] top-1/2 h-[220%] -translate-x-1/2 -translate-y-1/2 md:h-[260%]"
        viewBox="0 0 400 400"
        fill="none"
      >
        {[40, 72, 104, 136, 168, 196].map((r, i) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            stroke={i === 1 ? "var(--color-gold)" : "white"}
            strokeOpacity={i === 1 ? 0.55 : 0.14 - i * 0.012}
            strokeWidth={i === 1 ? 0.6 : 0.5}
          />
        ))}
      </svg>
      <div className="absolute left-[18%] top-1/2 flex size-[96px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 md:size-[148px]">
        <Icon className="size-10 text-gold md:size-16" strokeWidth={1.1} />
      </div>
      {/* קווי שיער אופקיים — מקצב של מסמך ערוך בצד הימני */}
      <div className="absolute inset-y-[22%] right-[7%] flex w-[38%] flex-col justify-between">
        {[100, 82, 92, 64].map((w, i) => (
          <span key={i} className="block h-px bg-white/20" style={{ width: `${w}%` }} />
        ))}
      </div>
      {label && (
        <span className="absolute bottom-5 right-[7%] text-[13px] font-bold tracking-[0.06em] text-white/70 md:bottom-8 md:text-sm">
          {label}
        </span>
      )}
    </div>
  );
}
