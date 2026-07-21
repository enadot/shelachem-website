import type { Doctor, DoctorSpecialty } from "../types";

export const doctorSpecialtyLabels: Record<DoctorSpecialty, string> = {
  internal: "רפואה פנימית",
  ortho: "אורתופדיה",
  cardio: "קרדיולוגיה",
  neuro: "נוירולוגיה",
  psych: "פסיכיאטריה",
  onco: "אונקולוגיה",
};

/** צוות הרופאים — לפי designs/doctors.html */
export const doctors: Doctor[] = [
  {
    id: "ehud-barak",
    name: 'ד"ר אהוד ברק',
    specialty: "internal",
    bio: "מומחה ברפואה פנימית עם 25 שנות ניסיון בבתי חולים מובילים. מתמחה בחוות דעת למחלות כרוניות ומורכבות.",
  },
  {
    id: "noa-sarig",
    name: 'ד"ר נועה שריג',
    specialty: "ortho",
    bio: "אורתופדית בכירה. מלווה תיקי תאונות עבודה ופגיעות גב וגפיים מול ועדות הביטוח הלאומי.",
  },
  {
    id: "dan-almog",
    name: "פרופ' דן אלמוג",
    specialty: "cardio",
    bio: "קרדיולוג ותיק וחוקר. חוות הדעת שלו בתחומי אי-ספיקת לב ומחלות כלי דם מוכרות בכל הוועדות.",
  },
  {
    id: "yael-oren",
    name: 'ד"ר יעל אורן',
    specialty: "neuro",
    bio: "נוירולוגית מומחית לפגיעות ראש, אפילפסיה וטרשת נפוצה. מכינה לקוחות לוועדות בליווי אישי.",
  },
  {
    id: "moshe-edri",
    name: 'ד"ר משה אדרי',
    specialty: "psych",
    bio: "פסיכיאטר בכיר. מתמחה בתיקי פוסט-טראומה, חרדה ודיכאון — כולל נפגעי פעולות איבה.",
  },
  {
    id: "ronit-kaplan",
    name: 'ד"ר רונית קפלן',
    specialty: "onco",
    bio: "אונקולוגית מומחית. מסייעת לחולים אונקולוגיים למצות פטור ממס, קצבאות וביטוחים פרטיים.",
  },
  {
    id: "sami-khoury",
    name: 'ד"ר סמי חורי',
    specialty: "ortho",
    bio: "מומחה לכירורגיה אורתופדית. מנוסה בהערכת נכות תפקודית ובייצוג מקצועי בוועדות עררים.",
  },
  {
    id: "tamar-weiss",
    name: 'ד"ר תמר וייס',
    specialty: "internal",
    bio: "מומחית ברפואה פנימית וראומטולוגיה. מלווה תיקי פיברומיאלגיה ומחלות אוטואימוניות.",
  },
];
