"use client";

import { toast } from "sonner";
import { Toaster } from "@/components/admin/ui/sonner";

type Tone = "ok" | "error";

/** הודעות קצרות ("נשמר") — sonner, מוכרז לקורא מסך. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors closeButton />
    </>
  );
}

const show = (text: string, tone: Tone = "ok"): void => {
  if (tone === "ok") toast.success(text);
  else toast.error(text);
};

export const useToast = () => show;
