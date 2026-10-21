import assert from "node:assert/strict";
import test from "node:test";
import worker from "./registration-worker.mjs";

// Exercise the actual default Worker entrypoint without exporting extra
// functions that Cloudflare could interpret as named service entrypoints.
function withFetcher(fetcher) {
  return async (request, env) => {
    const original = globalThis.fetch;
    globalThis.fetch = fetcher;
    try { return await worker.fetch(request, env); }
    finally { globalThis.fetch = original; }
  };
}

const origin = "https://chiazaokoli.github.io";
const env = { MAILERLITE_API_TOKEN: "test-secret-not-a-real-token" };
const submission = {
  email: "test@example.com", firstName: "Ada", lastName: "Okafor",
  phone: "+2348012345678", profession: "Student", company: "NIQS",
  country: "Nigeria", state: "Lagos", attended: "No", referral: "Word of mouth", website: "",
};
const request = (body = submission, headers = {}) => new Request("https://worker.example/register", {
  method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body),
});
const json = (body, status = 200) => Response.json(body, { status });
function upstream({ groups = [{ id: "123", name: "KFSD Demo Group" }], status = "active", failAt, failureStatus = 500 } = {}) {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === failAt) return json({ message: "Private upstream error" }, failureStatus);
    if (url.includes("/groups?")) return json({ data: groups });
    return json({ data: { id: "456", email: "test@example.com", status } }, 201);
  };
  return { handler: withFetcher(fetcher), calls };
}

test("saves every answer in the exact event group using the supplied tags", async () => {
  const { handler, calls } = upstream();
  const response = await handler(request({ ...submission, firstName: " Ada " }), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.status, "registered");
  assert.equal(new URL(calls[0].url).searchParams.get("filter[name]"), "KFSD Demo Group");
  const payload = JSON.parse(calls[1].options.body);
  assert.deepEqual(payload, {
    email: "test@example.com", groups: ["123"], fields: {
      name: "Ada", first_name: "Ada", last_name: "Okafor", phone: "+2348012345678", profession: "Student",
      company: "NIQS", country: "Nigeria", state: "Lagos",
      have_you_attended_kfsd_soft_skills_training_before: "No",
      how_did_you_hear_about_kfsd_soft_skills_training: "Word of mouth",
    },
  });
  assert.equal(calls[1].options.headers.Authorization, `Bearer ${env.MAILERLITE_API_TOKEN}`);
  assert.ok(calls[1].options.signal instanceof AbortSignal);
  assert.ok(!JSON.stringify(body).includes(env.MAILERLITE_API_TOKEN));
});

test("a supplied group ID skips lookup; blank optional company is not overwritten", async () => {
  const { handler, calls } = upstream();
  assert.equal((await handler(request({ ...submission, company: "" }), { ...env, MAILERLITE_GROUP_ID: "789" })).status, 200);
  assert.equal(calls.length, 1);
  const payload = JSON.parse(calls[0].options.body);
  assert.deepEqual(payload.groups, ["789"]);
  assert.equal(payload.fields.company, undefined);
  assert.equal(payload.status, undefined);
});

test("invalid required answers return field errors without contacting MailerLite", async () => {
  const { handler, calls } = upstream();
  const response = await handler(request({ ...submission, email: "invalid", phone: "12", firstName: "", attended: "maybe", referral: "fake", company: "invalid" }), env);
  assert.equal(response.status, 422);
  const { errors } = await response.json();
  for (const field of ["email", "phone", "firstName", "attended", "referral", "company"]) assert.ok(errors[field]);
  assert.equal(calls.length, 0);
});

test("rejects bots, malformed JSON, arrays, invalid types, and oversized bodies", async () => {
  const { handler, calls } = upstream();
  assert.equal((await handler(request({ ...submission, website: "spam" }), env)).status, 400);
  assert.equal((await handler(request([]), env)).status, 400);
  assert.equal((await handler(request({ ...submission, firstName: {} }), env)).status, 422);
  assert.equal((await handler(request({ ...submission, state: "x".repeat(9000) }), env)).status, 413);
  assert.equal((await handler(new Request("https://worker.example/register", { method: "POST", headers: { origin, "content-type": "application/json" }, body: "{" }), env)).status, 400);
  assert.equal(calls.length, 0);
});

test("CORS permits the website, rejects other origins, and handles preflight", async () => {
  const { handler, calls } = upstream();
  const options = await handler(new Request("https://worker.example/register", { method: "OPTIONS", headers: { origin } }), env);
  assert.equal(options.status, 204);
  assert.equal(options.headers.get("access-control-allow-origin"), origin);
  const rejected = await handler(request(submission, { origin: "https://untrusted.example" }), env);
  assert.equal(rejected.status, 403);
  assert.equal(rejected.headers.get("access-control-allow-origin"), null);
  assert.equal((await handler(request(submission, { "content-type": "text/plain" }), env)).status, 415);
  assert.equal(calls.length, 0);
});

test("missing token, missing/ambiguous group, and upstream failures never report success", async () => {
  assert.equal((await upstream().handler(request(), {})).status, 503);
  for (const groups of [[], [{ id: "1", name: "Other group" }], [{ id: "1", name: "KFSD Demo Group" }, { id: "2", name: "KFSD Demo Group" }]]) {
    const { handler, calls } = upstream({ groups });
    assert.equal((await handler(request(), env)).status, 503);
    assert.equal(calls.length, 1);
  }
  for (const failAt of [1, 2]) {
    const response = await upstream({ failAt }).handler(request(), env);
    assert.equal(response.status, 502);
    const text = await response.text();
    assert.ok(!text.includes("Private upstream error"));
    assert.ok(!text.includes(env.MAILERLITE_API_TOKEN));
  }
  const limited = await upstream({ failAt: 2, failureStatus: 429 }).handler(request(), env);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "60");
});

test("network errors and timeouts return a retryable failure", async () => {
  for (const error of [new TypeError("Connection failed"), new DOMException("Timed out", "TimeoutError")]) {
    const handler = withFetcher(async () => { throw error; });
    const response = await handler(request(), env);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, false);
  }
});

test("uses Cloudflare-supported redirect handling and refuses upstream redirects", async () => {
  let calls = 0;
  const handler = withFetcher(async (_url, options) => {
    calls++;
    // workerd throws before sending a request if redirect is "error".
    assert.ok(["manual", "follow"].includes(options.redirect));
    assert.equal(options.redirect, "manual", "never forward the API token through a redirect");
    return new Response(null, { status: 302, headers: { Location: "https://untrusted.example/" } });
  });
  const response = await handler(request(), env);
  assert.equal(response.status, 502);
  assert.equal((await response.json()).ok, false);
  assert.equal(calls, 1);
});

test("unconfirmed records are distinguished and unsubscribed/bounced records are not reactivated", async () => {
  const pending = await upstream({ status: "unconfirmed" }).handler(request(), env);
  assert.equal((await pending.json()).status, "pending");
  for (const status of ["unsubscribed", "bounced", "junk"]) {
    const response = await upstream({ status }).handler(request(), env);
    assert.equal(response.status, 409);
    assert.equal((await response.json()).ok, false);
  }
});

test("malformed provider success is not accepted as a saved registration", async () => {
  const handler = withFetcher(async (url) => url.includes("/groups?") ? json({ data: [{ id: "123", name: "KFSD Demo Group" }] }) : json({ data: {} }));
  assert.equal((await handler(request(), env)).status, 502);
});

test("public health check reveals no secrets and makes no subscriber requests", async () => {
  const { handler, calls } = upstream();
  const response = await handler(new Request("https://worker.example/health"), env);
  assert.deepEqual(await response.json(), { service: "kfsd-registration", version: 1, configured: true });
  assert.equal(calls.length, 0);
});
