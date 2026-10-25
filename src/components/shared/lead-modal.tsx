"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { LeadForm } from "@/components/shared/lead-form";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Check } from "@/components/shared/icons";
import { useSite } from "@/components/settings-provider";

export interface LeadModalOptions {
  /** תוכן מתחת לטופס במודאל (למשל גילוי נאות בעמודי הנחיתה). */
  footnote?: React.ReactNode;
}

interface LeadModalApi {
  /**
   * פותח את מודאל בדיקת הזכאות. `sourcePage` נשמר על הליד לצורך attribution,
   * ו-`topic` ממלא מראש את הנושא שהמשתמש קרא עליו.
   */
  openLeadForm: (sourcePage?: string, topic?: string, options?: LeadModalOptions) => void;
  closeLeadForm: () => void;
}

const Ctx = createContext<LeadModalApi>({ openLeadForm: () => {}, closeLeadForm: () => {} });

export function useLeadModal() {
  return useContext(Ctx);
}

export function LeadModalProvider({ children }: { children: React.ReactNode }) {
  const { contact } = useSite();
  const [source, setSource] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [footnote, setFootnote] = useState<React.ReactNode>(null);
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
    <Ctx.Provider value={{ openLeadForm, closeLeadForm }}>
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
                  בדיקת זכאות חינם
                  <br />
                  <span className="font-bold">כדאי לדעת אילו זכויות פתוחות בפניכם.</span>
                </h2>
              </DialogTitle>
              <DialogDescription asChild>
                <p className="relative m-0 mt-3 max-w-[400px] text-[15.5px] leading-[1.55] text-white/85">
                  שם וטלפון — ואנחנו בודקים בשבילכם מול ביטוח לאומי, מס הכנסה, קרנות הפנסיה
                  וחברות הביטוח.
                </p>
              </DialogDescription>
              <ul className="relative m-0 mt-5 flex flex-wrap gap-x-5 gap-y-2 p-0 text-[13.5px] font-bold text-white/90">
                {["דיסקרטיות מלאה", "שכר טרחה בהצלחה בלבד", "חוזרים תוך יום עסקים"].map((item) => (
                  <li key={item} className="flex list-none items-center gap-1.5">
                    <Check size={14} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-6 pt-5 md:px-7">
              <LeadForm
                sourcePage={source}
                presetTopic={topic}
                submitLabel="שלחו לי בדיקת זכאות"
                footnote={footnote}
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
