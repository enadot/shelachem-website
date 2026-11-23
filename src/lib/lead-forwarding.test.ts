import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";
import { shelachemBackupPayload } from "./forms-backup";
import { describeForwardError, interpretIngestResponse } from "./ingest-result";
import { forwardLead, type ForwardableLead } from "./lead-forwarding";

const HOOK = "https://leads.baram.digital/api/ingest/testtokenvalue1234";

const lead: ForwardableLead = {
  full_name: "דנה לוי",
  phone: "0541234567",
  source_page: "home-final-cta",
};

/** אותו נוסח כמו במייל של Make: ifempty(bl_error; ifempty(error; "לא צוין")). */
function emailError(blError: string): string {
  const payload = shelachemBackupPayload(lead, {
    event: "lead_forward_failed",
    status: "forward_failed",
    bl_ok: false,
    bl_error: blError,
  });
  return payload.bl_error || "לא צוין";
}

function assertSafeError(text: string) {
  assert.notEqual(text, "לא צוין");
  assert.notEqual(text.trim(), "");
  assert.doesNotMatch(text, /leads\.baram\.digital/);
  assert.doesNotMatch(text, /testtokenvalue1234/);
  assert.doesNotMatch(text, /https?:\/\//);
}

describe("interpretIngestResponse", () => {
  it("accepts every success shape the ingest route returns", () => {
    const dropped = interpretIngestResponse(200, JSON.stringify({ ok: true }));
    assert.deepEqual(dropped, { ok: true });

    // spam is answered as status "new", so it is the same success body.
    for (const status of ["new", "invalid_details", "test"] as const) {
      const created = interpretIngestResponse(201, JSON.stringify({ ok: true, leadId: 4812, status }));
      assert.deepEqual(created, { ok: true, leadId: 4812 });
    }

    const duplicate = interpretIngestResponse(
      201,
      JSON.stringify({ ok: true, leadId: 4816, status: "duplicate", duplicateOf: 12 }),
    );
    assert.deepEqual(duplicate, { ok: true, leadId: 4816 });
  });

  it("accepts a 201 success body that starts with a BOM", () => {
    const verdict = interpretIngestResponse(201, `\uFEFF${JSON.stringify({ ok: true, leadId: 7, status: "new" })}`);
    assert.deepEqual(verdict, { ok: true, leadId: 7 });
  });

  it("treats non-2xx and an explicit body error as failure, with status and a redacted snippet", () => {
    const cases: Array<{ status: number; body: unknown }> = [
      { status: 400, body: { ok: false, error: "invalid_body" } },
      { status: 400, body: { ok: false, error: "empty_payload" } },
      { status: 403, body: { ok: false, error: "tenant_paused" } },
      { status: 403, body: { ok: false, error: "channel_inactive" } },
      { status: 404, body: { ok: false, error: "unknown_channel" } },
      { status: 413, body: { ok: false, error: "too_large" } },
      { status: 429, body: { ok: false, error: "rate_limited" } },
      { status: 500, body: { ok: false, error: "internal" } },
      { status: 200, body: { ok: false, error: "internal" } },
      { status: 500, body: { ok: false, error: { message: "db down" } } },
    ];
    for (const item of cases) {
      const verdict = interpretIngestResponse(item.status, JSON.stringify(item.body));
      assert.equal(verdict.ok, false);
      if (!verdict.ok) {
        assert.match(verdict.error, new RegExp(String(item.status)));
        const line = emailError(`site: ${verdict.error}`);
        assertSafeError(line);
      }
    }

    const html = interpretIngestResponse(
      502,
      `<html>bad gateway ${HOOK}</html>`,
    );
    assert.equal(html.ok, false);
    if (!html.ok) {
      assert.match(html.error, /HTTP 502/);
      assert.match(html.error, /bad gateway/);
      const line = emailError(`site: ${html.error}`);
      assertSafeError(line);
      assert.match(line, /bad gateway/);
    }
  });
});

describe("describeForwardError", () => {
  it("keeps a timeout or network message and drops the ingest URL", () => {
    const timeout = new DOMException("", "TimeoutError");
    assert.equal(describeForwardError(timeout), "timeout");
    const aborted = new DOMException("The operation was aborted due to timeout", "TimeoutError");
    assert.match(describeForwardError(aborted), /timeout/i);
    const network = new TypeError(`fetch failed ${HOOK}`);
    const text = describeForwardError(network);
    assert.match(text, /fetch failed/);
    assertSafeError(text);
    assert.equal(describeForwardError("nope"), "network error");
  });
});

describe("forwardLead", () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  let logs: string[];

  afterEach(() => {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  });

  function spy() {
    logs = [];
    console.error = (...args: unknown[]) => {
      logs.push(args.map((part) => String(part)).join(" "));
    };
  }

  it("returns ok for a 201 duplicate and does not build a failure email", async () => {
    spy();
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: true, leadId: 4816, status: "duplicate", duplicateOf: 12 }), { status: 201 });
    const result = await forwardLead(lead, { site: HOOK });
    assert.deepEqual(result, { ok: true, channel: "site", leadId: 4816 });
    assert.equal(logs.length, 0);
  });

  it("puts the HTTP status and error code in the failure email", async () => {
    spy();
    globalThis.fetch = async () => new Response(JSON.stringify({ ok: false, error: "internal" }), { status: 500 });
    const result = await forwardLead(lead, { site: HOOK });
    assert.equal(result.ok, false);
    if (!result.ok) {
      const line = emailError(result.error);
      assert.match(line, /HTTP 500/);
      assert.match(line, /internal/);
      assertSafeError(line);
    }
    assert.doesNotMatch(logs.join("\n"), /leads\.baram\.digital|testtokenvalue1234/);
  });

  it("reports a network error without the webhook URL", async () => {
    spy();
    globalThis.fetch = () => Promise.reject(new TypeError(`connect ECONNREFUSED ${HOOK}`));
    const result = await forwardLead(lead, { site: HOOK });
    assert.equal(result.ok, false);
    if (!result.ok) {
      const line = emailError(result.error);
      assert.match(line, /ECONNREFUSED/);
      assertSafeError(line);
    }
    assert.doesNotMatch(logs.join("\n"), /leads\.baram\.digital|testtokenvalue1234/);
  });

  it("reports a timeout when the request throws TimeoutError", async () => {
    spy();
    globalThis.fetch = (_input, init) => {
      assert.ok(init?.signal);
      return Promise.reject(new DOMException("", "TimeoutError"));
    };
    const result = await forwardLead(lead, { site: HOOK });
    assert.equal(result.ok, false);
    if (!result.ok) {
      const line = emailError(result.error);
      assert.match(line, /timeout/);
      assertSafeError(line);
    }
  });

  it("arms an 8s abort on the ingest request", () => {
    const source = readFileSync(new URL("./lead-forwarding.ts", import.meta.url), "utf8");
    assert.match(source, /const TIMEOUT_MS = 8000/);
    assert.match(source, /AbortSignal\.timeout\(TIMEOUT_MS\)/);
  });
});
