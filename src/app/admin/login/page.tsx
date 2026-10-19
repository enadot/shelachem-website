import type { Metadata } from "next";
import Image from "next/image";
import { dbEnabled } from "@/db";
import { LoginForm } from "./login-form";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";

export const metadata: Metadata = { title: "התחברות" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  const configured = dbEnabled();

  return (
    <main className="grid min-h-svh flex-1 md:grid-cols-[1fr_minmax(0,560px)]">
      <div className="brand-gradient surface-navy relative hidden overflow-hidden p-14 text-white md:flex md:flex-col md:justify-between">
        <Image src="/images/logo-white.svg" alt="שלכם" width={170} height={70} priority />
        <p className="m-0 max-w-[460px] font-display text-[44px] font-light leading-[1.08]">
          כל מה שהאתר צריך, <span className="font-black">במקום אחד.</span>
        </p>
        <p className="m-0 text-[15px] text-on-royal-muted">לידים · תוכן · שיווק ופיקסלים · הגדרות</p>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-[400px]">
          <Image src="/images/logo.svg" alt="שלכם" width={130} height={54} className="mb-10 text-brand md:hidden" />
          <h1 className="m-0 font-display text-[34px] font-light leading-[1.1] text-foreground">
            כניסה ל<span className="font-black">לוח הבקרה</span>
          </h1>
          <p className="m-0 mb-8 mt-2 text-[15px] text-muted-foreground">עם הדוא״ל והסיסמה שקיבלתם ממנהל האתר.</p>
          {expired && (
            <Alert className="mb-6 border-amber-300 bg-amber-50">
              <AlertDescription className="text-amber-950">ההתחברות פגה — נא להתחבר מחדש.</AlertDescription>
            </Alert>
          )}
          {configured ? (
            <LoginForm />
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                מסד הנתונים לא מחובר לאתר. יש לחבר את Neon לפרויקט ב-Vercel (<code>DATABASE_URL</code>).
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </main>
  );
}
