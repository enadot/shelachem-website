"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LeadForm } from "@/components/shared/lead-form";
import { ChevronBack } from "@/components/shared/icons";
import { cn } from "@/lib/utils";

/**
 * בדיקת זכאות בשלבים — שאלה אחת בכל מסך, תשובות כקלפים גדולים, ופרטים אישיים
 * רק בסוף (בהשראת Complex Law / Monzo ב-Mobbin). מחליף את הטופס בן שלושת השדות
 * בכרטיס ההירו: שתי לחיצות קלות לפני שמבקשים מאנשים טלפון.
 * התשובות נשמרות על הליד כ-topic.
 */
const questions = [
  {
    id: "institution",
    title: "מול מי אתם צריכים עזרה?",
    options: ["ביטוח לאומי", "מס הכנסה", "חברת ביטוח או פנסיה", "עוד לא יודעים"],
  },
  {
    id: "reason",
    title: "מה הסיבה?",
    options: ["מחלה כרונית", "תאונה או פציעה", "תאונת עבודה", "ילד עם צרכים מיוחדים", "סיבה אחרת"],
  },
] as const;

const TOTAL = questions.length + 1;

export function EligibilityQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const moved = useRef(false);
  const reduce = useReducedMotion();

  // מעבר שלב → מיקוד בכותרת השאלה החדשה (callback ref, כי עם AnimatePresence
  // הכותרת החדשה עולה רק אחרי אנימציית היציאה), כדי שקורא מסך ישמע אותה.
  const headingRef = useCallback((el: HTMLHeadingElement | null) => {
    if (el && moved.current) el.focus({ preventScroll: true });
  }, []);

  const choose = (answer: string) => {
    moved.current = true;
    setAnswers((a) => [...a.slice(0, step), answer]);
    setStep((s) => s + 1);
  };
  const back = () => {
    moved.current = true;
    setStep((s) => Math.max(0, s - 1));
  };

  const q = questions[step];
  const title = q ? q.title : "לאן לחזור אליכם?";

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="flex items-center gap-3">
        <div aria-hidden className="flex flex-1 gap-1.5">
          {Array.from({ length: TOTAL }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-brand" : "bg-surface-tag",
              )}
            />
          ))}
        </div>
        <span className="tnum shrink-0 text-[13px] font-bold text-ink-muted">
          שלב {step + 1} מתוך {TOTAL}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-4 md:grid-cols-[230px_1fr] md:items-center md:gap-8"
        >
          <div className="flex flex-col items-start gap-1">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="m-0 font-display text-2xl font-black leading-[1.15] text-ink outline-none md:text-[28px]"
            >
              {title}
            </h2>
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="-ms-1 inline-flex min-h-11 cursor-pointer items-center gap-1 border-none bg-transparent px-1 text-[15px] font-bold text-brand"
              >
                <ChevronBack size={16} />
                חזרה
              </button>
            )}
          </div>

          {q ? (
            <ul
              className={cn(
                "m-0 grid list-none grid-cols-2 gap-2.5 p-0",
                q.options.length > 4 ? "md:grid-cols-5" : "md:grid-cols-4",
              )}
            >
              {q.options.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => choose(option)}
                    aria-pressed={answers[step] === option}
                    className={cn(
                      "flex h-full min-h-[60px] w-full cursor-pointer items-center justify-center rounded-xl border-[1.5px] px-3 py-3 text-center text-base font-bold leading-snug transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] md:min-h-[68px] md:text-[17px]",
                      answers[step] === option
                        ? "border-brand bg-brand text-white"
                        : "border-surface bg-surface text-ink hover:border-brand hover:bg-white",
                    )}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <LeadForm
              layout="inline"
              withEmail={false}
              sourcePage="home-quiz"
              presetTopic={answers.join(" · ")}
              submitLabel="בדקו לי"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
