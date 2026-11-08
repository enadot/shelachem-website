import { after } from "next/server";
import { backupLead, forwardBackedUp } from "@/lib/lead-backups";
import { handleLeadPost } from "@/lib/lead-submission";

/**
 * ליד מהאתר. הדפדפן פונה רק לכאן (JSON או POST של טופס); BARAM מקבל את הליד
 * מהשרת. סימון test ב-preview נשאר ב-forwardLead — לא נוגעים בו.
 */
export async function POST(request: Request) {
  return handleLeadPost(request, {
    async save(lead) {
      // קודם גיבוי במסד שלנו, ואז ההעברה ל-BARAM אחרי שהתשובה כבר יצאה לגולש.
      const backupId = await backupLead(lead);
      after(() => forwardBackedUp(backupId, lead));
    },
  });
}
