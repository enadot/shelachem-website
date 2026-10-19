import type { Metadata } from "next";
import { requireSession } from "@/lib/admin/session";
import { PASSWORD_MIN } from "@/lib/admin/password";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "החלפת סיסמה" };

export default async function ChangePasswordPage() {
  const { user } = await requireSession({ allowTempPassword: true });
  return (
    <main className="flex min-h-svh flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <h1 className="m-0 font-display text-[34px] font-light leading-[1.1] text-ink">
          בחירת <span className="font-black">סיסמה חדשה</span>
        </h1>
        <p className="m-0 mb-8 mt-2 text-[15.5px] text-ink-muted">
          {user.mustChangePassword
            ? "נכנסתם עם סיסמה זמנית. בחרו סיסמה משלכם כדי להמשיך."
            : "הסיסמה החדשה תחליף את הקודמת, וכל שאר החיבורים שלכם ינותקו."}{" "}
          לפחות {PASSWORD_MIN} תווים.
        </p>
        <ChangePasswordForm />
      </div>
    </main>
  );
}
