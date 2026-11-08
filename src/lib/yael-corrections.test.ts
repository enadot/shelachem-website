import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { GENERAL_DISABILITY_BENEFITS, isGeneralDisabilitySource } from "./general-disability-benefits";
import { customerLetters } from "./customer-letters";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("story paragraph", () => {
  const about = read("../app/(site)/about/page.tsx");

  it("uses Yael's wording and the corrected duplicate", () => {
    const flat = about.replace(/\s+/g, " ");
    assert.match(flat, /מאחורי כל תיק עומד: פיקוח של צוות רפואי וצוות מקצועי מומחה\./);
    assert.match(flat, /הצוות שלנו מכיר ומנוסה בתהליכים, מכירים את הוועדות מבפנים/);
    assert.match(flat, /הסיוע שלנו הוא בתחומים: מס הכנסה, ביטוח לאומי וחברות הביטוח\./);
    assert.match(flat, /אנו לא גובים שקל עד שאתם מקבלים את התוצאה\./);
    assert.doesNotMatch(about, /את את/);
    assert.doesNotMatch(about, /מלווים אישיים/);
  });
});

describe("pregnancy item", () => {
  it("is gone from the homepage chooser and the service page remains", () => {
    const specialties = read("../components/home/specialties.tsx");
    const quiz = read("../components/home/eligibility-quiz.tsx");
    const service = read("./content/local/services-areas.ts");
    assert.doesNotMatch(specialties, /name: "שמירת הריון"/);
    assert.doesNotMatch(specialties, /pregnancy-risk/);
    assert.doesNotMatch(quiz, /שמירת הריון/);
    assert.match(service, /name: "שמירת הריון"/);
    assert.match(service, /slug: "pregnancy-risk"/);
  });
});

describe("general disability benefits", () => {
  it("keeps the three approved labels in one row on the page and the opened form", () => {
    assert.deepEqual([...GENERAL_DISABILITY_BENEFITS], [
      "שכר טרחה בהצלחה בלבד",
      "פגישה אישית ודיסקרטית",
      "עשרות אלפי הצלחות",
    ]);
    assert.equal(isGeneralDisabilitySource("service-general-disability-hero"), true);
    assert.equal(isGeneralDisabilitySource("service-tax-exemption-hero"), false);
    const page = read("../app/(site)/services/[slug]/page.tsx");
    const modal = read("../components/shared/lead-modal.tsx");
    assert.match(page, /GENERAL_DISABILITY_BENEFITS/);
    assert.match(page, /grid-cols-3/);
    assert.match(modal, /isGeneralDisabilitySource/);
    assert.match(modal, /grid-cols-3/);
  });
});

describe("customer letters", () => {
  it("lists only the 17 files copied from the public legacy gallery", () => {
    assert.equal(customerLetters.length, 17);
    for (const letter of customerLetters) {
      assert.match(letter.src, /^\/images\/customers\//);
      assert.ok(letter.width > 0 && letter.height > 0);
    }
  });
});
