import type { Metadata } from "next";
import Image from "next/image";
import { directusUrl } from "@/lib/admin/auth-shared";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "התחברות" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;
  const configured = Boolean(directusUrl());

  return (
    <main className="grid min-h-svh flex-1 md:grid-cols-[1fr_minmax(0,560px)]">
      <div className="brand-gradient surface-navy relative hidden overflow-hidden p-14 text-white md:flex md:flex-col md:justify-between">
        <Image src="/images/logo-white.svg" alt="שלכם" width={170} height={70} priority />
        <p className="m-0 max-w-[460px] font-display text-[44px] font-light leading-[1.08]">
          כל מה שהאתר צריך, <span className="font-black">במקום אחד.</span>
        </p>
        <p className="m-0 text-[15px] text-on-royal-muted">לידים · תוכן · שיווק ופיקסלים · הגדרות</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px]">
          <Image
            src="/images/logo.svg"
            alt="שלכם"
            width={130}
            height={54}
            className="mb-10 text-brand md:hidden"
          />
          <h1 className="m-0 font-display text-[36px] font-light leading-[1.1] text-ink">
            כניסה ל<span className="font-black">לוח הבקרה</span>
          </h1>
          <p className="m-0 mb-8 mt-2 text-[15.5px] text-ink-muted">
            עם אותו דוא״ל וסיסמה של מערכת התוכן.
          </p>
          {expired && (
            <p role="status" className="mb-6 rounded-[10px] bg-accent-tint px-4 py-3 text-[14.5px]">
              ההתחברות פגה — נא להתחבר מחדש.
            </p>
          )}
          {configured ? (
            <LoginForm />
          ) : (
            <p role="alert" className="rounded-[10px] bg-[#fbe6e6] px-4 py-3 text-[15px] text-danger">
              מערכת התוכן (Directus) לא מחוברת לאתר. יש להגדיר את <code>DIRECTUS_URL</code> בשרת.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
