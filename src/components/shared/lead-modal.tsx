"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LeadForm } from "@/components/shared/lead-form";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Check } from "@/components/shared/icons";
import { useSite } from "@/components/settings-provider";

export interface LeadModalOptions {
  /** תוכן מתחת לטופס במודאל (למשל גילוי נאות בעמודי הנחיתה). */
  footnote?: React.ReactNode;
}

/**
 * נוסח חלופי למודאל, שעמוד שלם קובע (עמודי הנחיתה, T-026): כל הטקסט כבר עבר בשער
 * הטענות בשרת. בלי variant — הנוסח הקבוע של האתר, ללא שינוי.
 */
export interface LeadModalVariant {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  /** `null` — בלי פסקת התיאור. */
  description: React.ReactNode | null;
  /** נקודות מתחת לכותרת; מערך ריק — בלי הרשימה. */
  bullets: { key: string; node: React.ReactNode }[];
  submitLabel?: string;
  /** ראו `LeadFormProps.trustLine` / `successNote`. */
  trustLine?: React.ReactNode;
  successNote?: React.ReactNode;
  /** footnote ברירת מחדל כשהפתיחה לא העבירה אחד (למשל כפתור הכותרת). */
  footnote?: React.ReactNode;
  /** ראו `LeadFormProps.withEmail` / `withMarketingConsent` (ברירת מחדל: כמו בשאר האתר). */
  withEmail?: boolean;
  withMarketingConsent?: boolean;
}

interface LeadModalApi {
  /**
   * פותח את מודאל בדיקת הזכאות. `sourcePage` נשמר על הליד לצורך attribution,
   * ו-`topic` ממלא מראש את הנושא שהמשתמש קרא עליו.
   */
  openLeadForm: (sourcePage?: string, topic?: string, options?: LeadModalOptions) => void;
  closeLeadForm: () => void;
  /** קובע/מנקה את ה-variant של העמוד הנוכחי (ראו `LeadModalPageVariant`). */
  setVariant: (v: LeadModalVariant | null) => void;
}

const Ctx = createContext<LeadModalApi>({
  openLeadForm: () => {},
  closeLeadForm: () => {},
  setVariant: () => {},
});

export function useLeadModal() {
  return useContext(Ctx);
}

export function LeadModalProvider({ children }: { children: React.ReactNode }) {
  const { contact } = useSite();
  const [source, setSource] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [footnote, setFootnote] = useState<React.ReactNode>(null);
  const [variant, setVariant] = useState<LeadModalVariant | null>(null);
  const openLeadForm = useCallback(
    (sourcePage = "lead-modal", presetTopic?: string, options?: LeadModalOptions) => {
      setTopic(presetTopic);
      setFootnote(options?.footnote ?? null);
      setSource(sourcePage);
    },
    [],
  );
  const closeLeadForm = useCallback(() => setSource(null), []);

  return (
    <Ctx.Provider value={{ openLeadForm, closeLeadForm, setVariant }}>
      {children}
      <Dialog open={source !== null} onOpenChange={(open) => !open && closeLeadForm()}>
        {source !== null && (
          <DialogContent
            dir="rtl"
            className="max-h-[92vh] max-w-[520px] overflow-y-auto rounded-[26px] border border-[#e4e7ec] p-0 shadow-[0_32px_90px_rgba(4,8,40,0.34)] duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none motion-reduce:duration-0"
          >
            {/* כותרת על רקע המותג — מסגרת רגשית לפני השדות */}
            <div
              className="brand-gradient surface-navy relative overflow-hidden px-7 pb-7 pt-8 text-white"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 70%)",
                }}
              />
              <DialogTitle asChild>
                <h2 className="relative m-0 font-display text-[28px] font-light leading-[1.15] tracking-[-0.3px] text-white md:text-[32px]">
                  {variant ? variant.title : "בדיקת זכאות חינם"}
                  <br />
                  <span className="font-bold">
                    {variant ? variant.subtitle : "כדאי לדעת אילו זכויות פתוחות בפניכם."}
                  </span>
                </h2>
              </DialogTitle>
              {variant && variant.description === null ? (
                <DialogDescription className="sr-only">טופס השארת פרטים</DialogDescription>
              ) : (
                <DialogDescription asChild>
                  <p className="relative m-0 mt-3 max-w-[400px] text-[15.5px] leading-[1.55] text-white/85">
                    {variant ? (
                      variant.description
                    ) : (
                      <>
                        שם וטלפון — ואנחנו בודקים בשבילכם מול ביטוח לאומי, מס הכנסה, קרנות הפנסיה
                        וחברות הביטוח.
                      </>
                    )}
                  </p>
                </DialogDescription>
              )}
              {(() => {
                const bullets = variant
                  ? variant.bullets
                  : ["דיסקרטיות מלאה", "שכר טרחה בהצלחה בלבד", "חוזרים תוך יום עסקים"].map((t) => ({ key: t, node: t }));
                return bullets.length > 0 ? (
                  <ul className="relative m-0 mt-5 flex flex-wrap gap-x-5 gap-y-2 p-0 text-[13.5px] font-bold text-white/90">
                    {bullets.map((item) => (
                      <li key={item.key} className="flex list-none items-center gap-1.5">
                        <Check size={14} />
                        {item.node}
                      </li>
                    ))}
                  </ul>
                ) : null;
              })()}
            </div>

            <div className="px-6 pb-6 pt-5 md:px-7">
              <LeadForm
                sourcePage={source}
                presetTopic={topic}
                submitLabel={variant?.submitLabel ?? "שלחו לי בדיקת זכאות"}
                footnote={footnote ?? variant?.footnote ?? null}
                {...(variant
                  ? {
                      trustLine: variant.trustLine,
                      successNote: variant.successNote,
                      ...(variant.withEmail !== undefined ? { withEmail: variant.withEmail } : {}),
                      ...(variant.withMarketingConsent !== undefined
                        ? { withMarketingConsent: variant.withMarketingConsent }
                        : {}),
                    }
                  : {})}
              />
              <div className="mt-4 border-t border-hairline-soft pt-3.5 text-center text-[13.5px] text-ink-muted">
                מעדיפים לדבר?{" "}
                <a href={contact.phoneHref} className="tnum font-bold text-brand no-underline">
                  {contact.phone}
                </a>{" "}
                <span aria-hidden>·</span>{" "}
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener"
                  className="font-bold text-[#17853f] no-underline"
                >
                  וואטסאפ
                </a>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Ctx.Provider>
  );
}

/**
 * קובע נוסח מודאל לעמוד הנוכחי, כל עוד הרכיב מורכב (כולל פתיחה מכפתור הכותרת).
 * בעזיבת העמוד חוזרים לנוסח הקבוע של האתר.
 */
export function LeadModalPageVariant({ variant }: { variant: LeadModalVariant }) {
  const { setVariant } = useLeadModal();
  useEffect(() => {
    setVariant(variant);
    return () => setVariant(null);
  }, [setVariant, variant]);
  return null;
}
