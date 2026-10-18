/** סטטוסי טיפול בליד — משותף ללקוח ולשרת (migrate.ts מגדיר מהם את בחירות השדה). */
export const LEAD_STATUS_OPTIONS = [
  { value: "new", label: "חדש" },
  { value: "in_progress", label: "בטיפול" },
  { value: "closed", label: "נסגר — לקוח" },
  { value: "irrelevant", label: "לא רלוונטי" },
] as const;
