import type { Metadata } from "next";
import { requireSession } from "@/lib/admin/session";
import { PASSWORD_MIN } from "@/lib/admin/password";
import Image from "next/image";
import { ChangePasswordForm } from "./change-password-form";
import { Card, CardContent } from "@/components/admin/ui/card";

export const metadata: Metadata = { title: "החלפת סיסמה" };

export default async function ChangePasswordPage() {
  const { user } = await requireSession({ allowTempPassword: true });
  return (
    <main className="flex min-h-svh flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full max-w-[440px] py-0 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <Image src="/images/logo.svg" alt="שלכם" width={96} height={40} className="mb-6 text-primary" />
          <h1 className="m-0 font-display text-[28px] font-light leading-[1.1] text-foreground">
            בחירת <span className="font-black">סיסמה חדשה</span>
          </h1>
          <p className="m-0 mb-6 mt-2 text-[14.5px] text-muted-foreground">
            {user.mustChangePassword
              ? "נכנסתם עם סיסמה זמנית. בחרו סיסמה משלכם כדי להמשיך."
              : "הסיסמה החדשה תחליף את הקודמת, וכל שאר החיבורים שלכם ינותקו."}{" "}
            לפחות {PASSWORD_MIN} תווים.
          </p>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
