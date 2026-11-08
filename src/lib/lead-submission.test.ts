import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { googleTagLoaderSource } from "./marketing";
import {
  formDataToObject,
  handleLeadPost,
  leadPostAllowed,
  leadResponseAccepted,
  parseLeadBody,
  runLeadTracking,
} from "./lead-submission";

const valid = {
  full_name: "דנה לוי",
  phone: "054-123-4567",
  email: "",
  source_page: "home-final-cta",
  marketing_consent: false,
  company: "",
};

function jsonRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://www.shelachem.net/api/leads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://www.shelachem.net",
      host: "www.shelachem.net",
      "sec-fetch-site": "same-origin",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function formRequest(fields: Record<string, string>, headers: Record<string, string> = {}) {
  const body = new URLSearchParams(fields);
  return new Request("https://www.shelachem.net/api/leads", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://www.shelachem.net",
      host: "www.shelachem.net",
      "sec-fetch-site": "same-origin",
      ...headers,
    },
    body,
  });
}

describe("parseLeadBody", () => {
  it("accepts the current JSON shape and normalizes the phone", () => {
    const parsed = parseLeadBody({ ...valid, attribution: { last: { params: { utm_source: "google" } } } }, "json");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.lead.phone, "0541234567");
    assert.equal(parsed.lead.email, null);
    assert.equal(parsed.lead.marketing_consent, false);
    assert.deepEqual(parsed.lead.attribution?.last, { params: { utm_source: "google" } });
  });

  it("keeps accepting JSON that omits data_consent (cached client)", () => {
    const parsed = parseLeadBody(valid, "json");
    assert.equal(parsed.ok, true);
  });

  it("rejects an explicit refusal", () => {
    const parsed = parseLeadBody({ ...valid, data_consent: false }, "json");
    assert.equal(parsed.ok, false);
    if (parsed.ok) return;
    assert.match(parsed.error, /לאשר/);
  });

  it("accepts a native form post only with consent", () => {
    const missing = parseLeadBody(valid, "form");
    assert.equal(missing.ok, false);

    const parsed = parseLeadBody(
      { ...valid, data_consent: "on", marketing_consent: "yes", phone: "+972541234567", topic: "ביטוח לאומי" },
      "form",
    );
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.lead.phone, "0541234567");
    assert.equal(parsed.lead.marketing_consent, true);
    assert.equal(parsed.lead.topic, "ביטוח לאומי");
    assert.equal("attribution" in parsed.lead, false);
  });

  it("ignores attribution pasted into a form post", () => {
    const parsed = parseLeadBody(
      { ...valid, data_consent: "on", attribution: "x".repeat(5000) },
      "form",
    );
    assert.equal(parsed.ok, true);
  });

  it("rejects a bad phone and a filled honeypot without a lead", () => {
    const phone = parseLeadBody({ ...valid, phone: "123" }, "json");
    assert.equal(phone.ok, false);
    const bot = parseLeadBody({ ...valid, company: "acme" }, "json");
    assert.equal(bot.ok, false);
  });
});

describe("leadPostAllowed", () => {
  it("allows same-origin and a missing origin", () => {
    assert.equal(
      leadPostAllowed({ origin: "https://www.shelachem.net", host: "www.shelachem.net", fetchSite: "same-origin" }),
      true,
    );
    assert.equal(leadPostAllowed({ origin: null, host: "www.shelachem.net", fetchSite: "same-origin" }), true);
    assert.equal(
      leadPostAllowed({ origin: "http://localhost:3000", host: "localhost:3000", fetchSite: null }),
      true,
    );
  });

  it("rejects a cross-site form", () => {
    assert.equal(
      leadPostAllowed({ origin: "https://evil.example", host: "www.shelachem.net", fetchSite: "cross-site" }),
      false,
    );
    assert.equal(
      leadPostAllowed({ origin: "https://evil.example", host: "www.shelachem.net", fetchSite: null }),
      false,
    );
  });
});

describe("filter and tracking", () => {
  it("does not treat an HTML block page as a saved lead", () => {
    assert.equal(leadResponseAccepted(200, "text/html; charset=utf-8", null), false);
    assert.equal(leadResponseAccepted(200, "application/json", { ok: false }), false);
    assert.equal(leadResponseAccepted(400, "application/json", { ok: false }), false);
    assert.equal(leadResponseAccepted(200, "application/json", { ok: true }), true);
  });

  it("swallows a blocked third-party tracker", async () => {
    await runLeadTracking(() => {
      throw new Error("gtag blocked");
    });
    await runLeadTracking(() => Promise.reject(new Error("fbq blocked")));
  });
});

describe("handleLeadPost", () => {
  it("saves one JSON lead and does not echo it", async () => {
    const saved: unknown[] = [];
    const res = await handleLeadPost(jsonRequest({ ...valid, data_consent: true }), {
      save: async (lead) => {
        saved.push(lead);
      },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(saved.length, 1);
  });

  it("redirects a native form once and does not save an invalid one", async () => {
    const saved: unknown[] = [];
    const save = async (lead: unknown) => {
      saved.push(lead);
    };
    const bad = await handleLeadPost(formRequest({ full_name: "דנה לוי", phone: "0541234567" }), { save });
    assert.equal(bad.status, 400);
    assert.equal(saved.length, 0);
    const html = await bad.text();
    assert.match(html, /לאשר/);
    assert.doesNotMatch(html, /<script/i);

    const ok = await handleLeadPost(
      formRequest({
        full_name: "דנה לוי",
        phone: "054-1234567",
        data_consent: "on",
        source_page: "home-form-fallback",
        company: "",
      }),
      { save },
    );
    assert.equal(ok.status, 303);
    assert.equal(new URL(ok.headers.get("location")!, "https://www.shelachem.net").pathname, "/lead-received");
    assert.equal(saved.length, 1);
  });

  it("does not save a cross-site post", async () => {
    let called = false;
    const res = await handleLeadPost(
      formRequest(
        { full_name: "דנה לוי", phone: "0541234567", data_consent: "on" },
        { origin: "https://evil.example", "sec-fetch-site": "cross-site" },
      ),
      {
        save: async () => {
          called = true;
        },
      },
    );
    assert.equal(res.status, 403);
    assert.equal(called, false);
  });

  it("reports a failed save instead of success", async () => {
    const res = await handleLeadPost(jsonRequest(valid), {
      save: async () => {
        throw new Error("db down");
      },
    });
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.ok, false);
  });
});

describe("form encoding", () => {
  it("keeps the last string field and drops files", () => {
    const form = new FormData();
    form.append("phone", "054");
    form.append("phone", "0541234567");
    form.append("file", new Blob(["x"]), "a.txt");
    assert.deepEqual(formDataToObject(form), { phone: "0541234567" });
  });
});

describe("source guards", () => {
  it("does not call Baram from the submission parser", () => {
    const src = readFileSync(new URL("./lead-submission.ts", import.meta.url), "utf8");
    assert.doesNotMatch(src, /leads\.baram\.digital/);
    assert.doesNotMatch(src, /forwardLead/);
  });

  it("keeps the browser form on the same origin and checks the JSON body", () => {
    const form = readFileSync(new URL("../components/shared/lead-form.tsx", import.meta.url), "utf8");
    assert.match(form, /action="\/api\/leads"/);
    assert.match(form, /method="post"/);
    assert.match(form, /leadResponseAccepted/);
    assert.match(form, /runLeadTracking/);
    assert.doesNotMatch(form, /leads\.baram\.digital/);
  });

  it("does not preload the Google tag in the document head", () => {
    const scripts = readFileSync(new URL("../components/marketing/marketing-scripts.tsx", import.meta.url), "utf8");
    assert.match(scripts, /googleTagLoaderSource/);
    assert.match(scripts, /strategy="lazyOnload"/);
    assert.doesNotMatch(scripts, /strategy="afterInteractive"/);
    assert.doesNotMatch(scripts, /<Script[\s\S]*?src=\{`https:\/\/www\.googletagmanager\.com/);
    const loader = googleTagLoaderSource(
      {
        ga4Id: "G-TEST123",
        googleAdsId: "AW-123",
        enhancedConversions: false,
        consentRequired: false,
        verification: {},
      },
      "G-TEST123",
    );
    assert.match(loader, /s\.async=true/);
    assert.match(loader, /googletagmanager\.com\/gtag\/js/);
    assert.doesNotMatch(loader, /preload/);
    assert.match(loader, /typeof gtag!=='function'/);
  });

  it("renders a no-JS lead form on the homepage quiz", () => {
    const quiz = readFileSync(new URL("../components/home/eligibility-quiz.tsx", import.meta.url), "utf8");
    assert.match(quiz, /lead-form-fallback/);
    assert.match(quiz, /home-form-fallback/);
  });

  it("keeps the preview test flag on the real forwarder", () => {
    const forwarding = readFileSync(new URL("./lead-forwarding.ts", import.meta.url), "utf8");
    assert.match(forwarding, /VERCEL_ENV === "preview"/);
    assert.match(forwarding, /test: true/);
  });
});
