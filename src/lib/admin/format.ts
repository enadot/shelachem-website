/**
 * תאריך ושעה בעברית, באזור הזמן של ישראל (השרת יכול לרוץ ב-UTC).
 * "14.10.26 · 10:07" — נקודה אמצעית במקום פסיק, כי בטקסט RTL הפסיק של Intl נודד לצד הלא נכון.
 */
export function formatDate(iso: string | null | undefined, withTime = true) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const part = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("he-IL", { timeZone: "Asia/Jerusalem", ...o }).format(d);
  const date = part({ day: "2-digit", month: "2-digit", year: "2-digit" });
  return withTime ? `${date} · ${part({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}` : date;
}
