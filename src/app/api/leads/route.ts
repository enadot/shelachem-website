import { after } from "next/server";
import { sendFormsBackup, shelachemBackupPayload } from "@/lib/forms-backup";
import { describeForwardError } from "@/lib/ingest-result";
import { backupLead, forwardBackedUp } from "@/lib/lead-backups";
import { handleLeadPost } from "@/lib/lead-submission";

/**
 * ליד מהאתר. הדפדפן פונה רק לכאן (JSON או POST של טופס); BARAM מקבל את הליד
 * מהשרת. סימון test ב-preview נשאר ב-forwardLead — לא נוגעים בו.
 * אחרי האימות נשלח גם עותק ל-Make. הוא רץ אחרי שהתשובה יצאה, ולא נוגע
 * בגיבוי במסד או בהעברה ל-BARAM.
 */
export async function POST(request: Request) {
  return handleLeadPost(request, {
    async save(lead) {
      // קודם גיבוי במסד שלנו, ואז ההעברה ל-BARAM אחרי שהתשובה כבר יצאה לגולש.
      const backupId = await backupLead(lead);
      after(async () => {
        // עותק ה-Make יוצא במקביל ל-BARAM. timeout קצר, והתוצאה לא משנה את ההעברה.
        const makeBackup = sendFormsBackup(
          shelachemBackupPayload(lead, { event: "lead_backup", status: "received", bl_ok: true }),
        ).catch(() => undefined);
        try {
          const res = await forwardBackedUp(backupId, lead);
          if (!res.ok) {
            await sendFormsBackup(
              shelachemBackupPayload(lead, {
                event: "lead_forward_failed",
                status: "forward_failed",
                bl_ok: false,
                bl_error: res.error,
              }),
            );
          }
        } catch (err) {
          await sendFormsBackup(
            shelachemBackupPayload(lead, {
              event: "lead_forward_failed",
              status: "forward_failed",
              bl_ok: false,
              bl_error: describeForwardError(err),
            }),
          );
          throw err;
        } finally {
          await makeBackup;
        }
      });
    },
  });
}
