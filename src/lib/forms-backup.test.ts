import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";
import { redactUrls, sendFormsBackup, shelachemBackupPayload, type FormsBackupPayload } from "./forms-backup";

const ENV = "MAKE_FORMS_BACKUP_WEBHOOK_URL";
const HOOK = "https://backup.example/hook/secret-token";

const lead = {
  full_name: "דנה לוי",
  phone: "0541234567",
  email: null as string | null,
  topic: "ביטוח לאומי · מחלה כרונית",
  source_page: "home-quiz|utm_source=google&utm_medium=cpc",
  marketing_consent: true,
  attribution: {
    page: "/quiz",
    first: { params: { utm_source: "old" }, landing: "/old" },
    last: {
      params: {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "spring",
        utm_term: "זכויות",
        utm_content: "ad1",
        gclid: "g-1",
        fbclid: "f-1",
      },
      landing: "/services/bituach-leumi",
      referrer: "https://www.google.com/",
    },
  },
};

function received(): FormsBackupPayload {
  return shelachemBackupPayload(lead, { event: "lead_backup", status: "received" });
}

describe("shelachemBackupPayload", () => {
  it("copies the validated lead and prefers the last touch", () => {
    const payload = received();
    assert.equal(payload.client, "שלכם");
    assert.equal(payload.event, "lead_backup");
    assert.equal(payload.status, "received");
    assert.equal(payload.form, "home-quiz");
    assert.equal(payload.source_page, lead.source_page);
    assert.equal(payload.name, "דנה לוי");
    assert.equal(payload.phone, "0541234567");
    assert.equal(payload.email, "");
    assert.equal(payload.topic, lead.topic);
    assert.equal(payload.marketing_consent, true);
    assert.equal(payload.landing_page_url, "https://www.shelachem.net/services/bituach-leumi");
    assert.equal(payload.utm_source, "google");
    assert.equal(payload.utm_medium, "cpc");
    assert.equal(payload.utm_campaign, "spring");
    assert.equal(payload.utm_term, "זכויות");
    assert.equal(payload.utm_content, "ad1");
    assert.equal(payload.gclid, "g-1");
    assert.equal(payload.fbclid, "f-1");
    assert.equal(payload.referrer, "https://www.google.com/");
    assert.equal(payload.notes, "נושא: ביטוח לאומי · מחלה כרונית\nטופס: home-quiz");
    assert.equal("bl_ok" in payload, false);
    assert.equal("bl_error" in payload, false);
  });

  it("marks a Baram failure and strips webhook URLs from the error", () => {
    const payload = shelachemBackupPayload(lead, {
      event: "lead_forward_failed",
      status: "forward_failed",
      bl_ok: false,
      bl_error: "site: 500 rejected https://leads.baram.digital/api/ingest/secret-token",
    });
    assert.equal(payload.status, "forward_failed");
    assert.equal(payload.bl_ok, false);
    assert.match(payload.bl_error ?? "", /rejected/);
    assert.doesNotMatch(payload.bl_error ?? "", /leads\.baram\.digital/);
    assert.doesNotMatch(payload.bl_error ?? "", /secret-token/);
  });

  it("falls back to the page path when there is no touch", () => {
    const payload = shelachemBackupPayload(
      { full_name: "דנה לוי", phone: "0541234567", attribution: { page: "/faq" } },
      { event: "lead_backup", status: "received" },
    );
    assert.equal(payload.landing_page_url, "https://www.shelachem.net/faq");
    assert.equal(payload.form, undefined);
  });
});

describe("redactUrls", () => {
  it("replaces http(s) URLs and keeps the rest of the message", () => {
    assert.equal(redactUrls("failed http://insecure.example/a and https://ok.example/b?x=1"), "failed [redacted] and [redacted]");
  });
});

describe("sendFormsBackup", () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  let logs: string[];

  afterEach(() => {
    globalThis.fetch = originalFetch;
    console.error = originalError;
    delete process.env[ENV];
  });

  function spy() {
    logs = [];
    console.error = (...args: unknown[]) => {
      logs.push(args.map((part) => String(part)).join(" "));
    };
  }

  it("skips silently when the env var is missing, blank, or not https", async () => {
    let calls = 0;
    globalThis.fetch = () => {
      calls += 1;
      return Promise.resolve(new Response(null, { status: 200 }));
    };
    await sendFormsBackup(received());
    process.env[ENV] = "   ";
    await sendFormsBackup(received());
    process.env[ENV] = "http://backup.example/hook";
    await sendFormsBackup(received());
    process.env[ENV] = "not a url";
    await sendFormsBackup(received());
    assert.equal(calls, 0);
  });

  it("posts the backup and does not log the webhook URL", async () => {
    spy();
    const bodies: string[] = [];
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), HOOK);
      assert.equal(init?.method, "POST");
      bodies.push(String(init?.body));
      return new Response("no", { status: 503 });
    };
    process.env[ENV] = HOOK;
    await sendFormsBackup(received());
    assert.equal(bodies.length, 1);
    assert.equal(JSON.parse(bodies[0]).phone, "0541234567");
    assert.equal(logs.length, 1);
    assert.match(logs[0], /503/);
    assert.doesNotMatch(logs.join("\n"), /backup\.example/);
    assert.doesNotMatch(logs.join("\n"), /secret-token/);
  });

  it("swallows a thrown request and a timeout without revealing the URL", async () => {
    spy();
    process.env[ENV] = HOOK;
    globalThis.fetch = () => {
      throw new Error(`Failed to parse URL from ${HOOK}`);
    };
    await sendFormsBackup(received());
    assert.doesNotMatch(logs.join("\n"), /backup\.example|secret-token/);

    globalThis.fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        const signal = init?.signal;
        assert.ok(signal);
        // AbortSignal.timeout does not keep the event loop alive on its own.
        const hang = setTimeout(() => reject(new Error("test hung")), 4000);
        signal.addEventListener("abort", () => {
          clearTimeout(hang);
          reject(Object.assign(new Error("aborted"), { name: "TimeoutError" }));
        });
      });
    const started = Date.now();
    await sendFormsBackup(received());
    const elapsed = Date.now() - started;
    assert.ok(elapsed < 4000, `timeout waited ${elapsed}ms`);
    assert.ok(elapsed >= 1500, `timeout returned too fast (${elapsed}ms)`);
  });
});

describe("leads route wiring", () => {
  it("keeps the database backup and the Baram forward, and adds a non-blocking Make copy", () => {
    const route = readFileSync(new URL("../app/api/leads/route.ts", import.meta.url), "utf8");
    const backup = readFileSync(new URL("./lead-backups.ts", import.meta.url), "utf8");
    const forwarding = readFileSync(new URL("./lead-forwarding.ts", import.meta.url), "utf8");
    assert.match(route, /const backupId = await backupLead\(lead\)/);
    assert.match(route, /forwardBackedUp\(backupId, lead\)/);
    assert.match(route, /after\(async \(\) =>/);
    assert.match(route, /event: "lead_backup", status: "received"/);
    assert.match(route, /event: "lead_forward_failed"/);
    assert.match(route, /status: "forward_failed"/);
    assert.match(route, /throw err/);
    assert.doesNotMatch(route, /MAKE_FORMS_BACKUP_WEBHOOK_URL/);
    assert.doesNotMatch(route, /https?:\/\/hook\./);
    assert.doesNotMatch(backup, /forms-backup|MAKE_FORMS_BACKUP/);
    assert.doesNotMatch(forwarding, /forms-backup|MAKE_FORMS_BACKUP/);

    const source = readFileSync(new URL("./forms-backup.ts", import.meta.url), "utf8");
    assert.match(source, /MAKE_FORMS_BACKUP_WEBHOOK_URL/);
    assert.match(source, /AbortSignal\.timeout\(TIMEOUT_MS\)/);
    assert.match(source, /const TIMEOUT_MS = 2000/);
    assert.doesNotMatch(source, /https?:\/\/(?!www\.shelachem\.net)/);
  });
});
