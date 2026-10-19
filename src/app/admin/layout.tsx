import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/toast";
import { Direction } from "radix-ui";
import { TooltipProvider } from "@/components/admin/ui/tooltip";

export const metadata: Metadata = {
  title: { default: "לוח בקרה", template: "%s · לוח בקרה | שלכם" },
  robots: { index: false, follow: false },
};

/**
 * לוח הבקרה — בלי header/footer ובלי תגי מדידה של האתר הציבורי.
 * `data-admin-shell` מפעיל את ברירות המחדל של shadcn (צבע גבול) — ראו globals.css.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Radix (Select, Dropdown, Tabs…) מקבל RTL מכאן — אחרת ניווט במקלדת ויישור הם LTR.
    <Direction.Provider dir="rtl">
      <TooltipProvider delayDuration={200}>
        <ToastProvider>
          <div data-admin-shell className="flex min-h-full flex-1 flex-col bg-sidebar text-foreground">
            {children}
          </div>
        </ToastProvider>
      </TooltipProvider>
    </Direction.Provider>
  );
}
