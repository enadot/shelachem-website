import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/toast";

export const metadata: Metadata = {
  title: { default: "לוח בקרה", template: "%s · לוח בקרה | שלכם" },
  robots: { index: false, follow: false },
};

/** לוח הבקרה — בלי header/footer ובלי תגי מדידה של האתר הציבורי. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-full flex-1 flex-col bg-surface text-ink">{children}</div>
    </ToastProvider>
  );
}
