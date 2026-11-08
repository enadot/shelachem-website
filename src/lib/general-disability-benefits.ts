/** שלוש ההבטחות שאושרו לעמוד קצבת נכות כללית ולטופס שנפתח ממנו. */
export const GENERAL_DISABILITY_BENEFITS = [
  "שכר טרחה בהצלחה בלבד",
  "פגישה אישית ודיסקרטית",
  "עשרות אלפי הצלחות",
] as const;

export const isGeneralDisabilitySource = (source?: string | null) =>
  Boolean(source?.includes("general-disability"));
