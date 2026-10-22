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
const env = { KIT_API_KEY: "test-secret-not-a-real-token", KIT_TAG_ID: "24884438" };
const submission = {
  email: "test@example.com", firstName: "Ada", lastName: "Okafor",
  phone: "+2348012345678", profession: "Student", company: "NIQS",
  country: "Nigeria", state: "Lagos", attended: "No", referral: "Word of mouth", website: "",
};
const request = (body = submission, headers = {}) => new Request("https://worker.example/register", {
  method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body),
});
const json = (body, status = 200) => Response.json(body, { status });
function upstream({ state = "active", failAt, failureStatus = 500 } = {}) {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === failAt) return json({ message: "Private upstream error" }, failureStatus);
    if (url.endsWith("/subscribers")) return json({ subscriber: { id: 456, email_address: "test@example.com", state } }, 201);
    return json({ subscriber: { id: 456, email_address: "test@example.com", state } }, 200);
  };
  return { handler: withFetcher(fetcher), calls };
}

test("saves every answer as an active subscriber and applies the exact event tag", async () => {
  const { handler, calls } = upstream();
  const response = await handler(request({ ...submission, firstName: " Ada " }), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.status, "registered");
  assert.equal(calls[0].url, "https://api.kit.com/v4/subscribers");
  const payload = JSON.parse(calls[0].options.body);
  assert.deepEqual(payload, {
    email_address: "test@example.com", first_name: "Ada", state: "active", fields: {
      last_name: "Okafor", phone: "+2348012345678", profession: "Student",
      company: "NIQS", country: "Nigeria", state: "Lagos",
      attended_kfsd_training_before: "No",
      how_did_you_hear_about_kfsd_soft_skills_training: "Word of mouth",
    },
  });
  assert.equal(calls[0].options.headers["X-Kit-Api-Key"], env.KIT_API_KEY);
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  assert.equal(calls[1].url, "https://api.kit.com/v4/tags/24884438/subscribers/456");
  assert.equal(calls[1].options.method, "POST");
  assert.ok(!JSON.stringify(body).includes(env.KIT_API_KEY));
});

test("blank optional company is not overwritten", async () => {
  const { handler, calls } = upstream();
  assert.equal((await handler(request({ ...submission, company: "" }), env)).status, 200);
  assert.equal(calls.length, 2);
  const payload = JSON.parse(calls[0].options.body);
  assert.equal(payload.fields.company, undefined);
  assert.equal(payload.state, "active");
});

test("invalid required answers return field errors without contacting Kit", async () => {
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

test("missing configuration and upstream failures never report success", async () => {
  assert.equal((await upstream().handler(request(), {})).status, 503);
  assert.equal((await upstream().handler(request(), { KIT_API_KEY: env.KIT_API_KEY })).status, 503);
  assert.equal((await upstream().handler(request(), { ...env, KIT_TAG_ID: "not-an-id" })).status, 503);
  for (const failAt of [1, 2]) {
    const response = await upstream({ failAt }).handler(request(), env);
    assert.equal(response.status, 502);
    const text = await response.text();
    assert.ok(!text.includes("Private upstream error"));
    assert.ok(!text.includes(env.KIT_API_KEY));
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

test("only an active single-opt-in subscriber is reported as registered", async () => {
  for (const state of ["inactive", "cancelled", "bounced"]) {
    const response = await upstream({ state }).handler(request(), env);
    assert.equal(response.status, 409);
    assert.equal((await response.json()).ok, false);
  }
});

test("malformed provider success is not accepted as a saved registration", async () => {
  const handler = withFetcher(async () => json({ subscriber: {} }));
  assert.equal((await handler(request(), env)).status, 502);
});

test("public health check reveals no secrets and makes no subscriber requests", async () => {
  const { handler, calls } = upstream();
  const response = await handler(new Request("https://worker.example/health"), env);
  assert.deepEqual(await response.json(), { service: "kfsd-registration", provider: "kit", version: 4, configured: true });
  const invalid = await handler(new Request("https://worker.example/health"), { ...env, KIT_TAG_ID: "'24884438'" });
  assert.equal((await invalid.json()).configured, false);
  assert.equal(calls.length, 0);
});

test("validates international calling codes and saves normalized phone numbers", async () => {
  for (const [phoneCountry, phone, expected] of [
    ["NG", "0803 123 4567", "+2348031234567"],
    ["GB", "07911 123456", "+447911123456"],
    ["US", "(202) 555-0123", "+12025550123"],
    ["CA", "416 555 0123", "+14165550123"],
    ["IN", "98765 43210", "+919876543210"],
  ]) {
    const { handler, calls } = upstream();
    const response = await handler(request({ ...submission, phoneCountry, phone }), env);
    assert.equal(response.status, 200, `${phoneCountry}: ${await response.text()}`);
    assert.equal(JSON.parse(calls[0].options.body).fields.phone, expected);
  }
  for (const [phoneCountry, phone] of [["NG", "1234567"], ["NG", "0803 CALL ME"], ["NG", "+447911123456"], ["XX", "08031234567"], ["NG", "080312345678901234567890"]]) {
    const { handler, calls } = upstream();
    const response = await handler(request({ ...submission, phoneCountry, phone }), env);
    assert.equal(response.status, 422);
    assert.ok((await response.json()).errors.phone);
    assert.equal(calls.length, 0);
  }
});

test("country code must match the selected country label", async () => {
  const { handler, calls } = upstream();
  const response = await handler(request({ ...submission, countryCode: "CA", country: "Nigeria" }), env);
  assert.equal(response.status, 422);
  assert.ok((await response.json()).errors.country);
  assert.equal(calls.length, 0);
});

test("suggests country and region using Cloudflare metadata without exposing IP or calling Kit", async () => {
  const { handler, calls } = upstream();
  const req = new Request("https://worker.example/location", { headers: { origin, "CF-Connecting-IP": "192.0.2.10" } });
  Object.defineProperty(req, "cf", { value: { country: "CA", regionCode: "ON", region: "Ontario" } });
  const response = await handler(req);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.deepEqual(await response.json(), { countryCode: "CA", regionCode: "ON", region: "Ontario" });
  const unknown = await handler(new Request("https://worker.example/location", { headers: { origin } }));
  assert.deepEqual(await unknown.json(), { countryCode: null, regionCode: null, region: null });
  assert.equal(calls.length, 0);
});
