"use client";

import Link from "next/link";

/** Error boundary כלל-אתרי — הודעה ידידותית + ניסיון חוזר במקום מסך שגיאה חשוף. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="m-0 font-display text-3xl font-bold text-ink">משהו השתבש</h1>
      <p className="m-0 mt-3 max-w-[440px] text-base leading-relaxed text-ink-muted">
        נתקלנו בתקלה זמנית. אפשר לנסות שוב, ואם זה חוזר — נשמח שתתקשרו אלינו.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full cursor-pointer border-0 bg-brand px-7 py-3.5 text-base font-bold text-white transition-transform hover:scale-[1.03]"
        >
          לנסות שוב
        </button>
        <Link
          href="/"
          className="rounded-full border border-brand px-7 py-3.5 text-base font-bold text-brand no-underline transition-colors hover:bg-brand hover:text-white"
        >
          לדף הבית
        </Link>
      </div>
    </section>
  );
}
