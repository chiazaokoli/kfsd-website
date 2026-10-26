// Editable source: run npm run build:worker, then deploy the GENERATED
// cloudflare/registration-worker.mjs file in Cloudflare's editor.
// Keep KIT_API_KEY in Cloudflare Secrets, never in this file.
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { validateRegistrationPhone } from "../../src/lib/registration-phone";
import countries from "../../src/data/registration-countries.json";
const API = "https://api.kit.com/v4";
const MAX_BODY_BYTES = 8192;
const FIELD_MAP = {
  lastName: "last_name",
  phone: "phone",
  profession: "profession",
  company: "company",
  country: "country",
  state: "state",
  attended: "attended_kfsd_training_before",
  referral: "how_did_you_hear_about_kfsd_soft_skills_training",
};
const FORM_FIELDS = ["firstName", ...Object.keys(FIELD_MAP)];
const REQUIRED = ["email", "firstName", "lastName", "phone", "profession", "country", "state", "attended", "referral"];
const COMPANIES = ["NIQS", "NICE", "NSE", "NIOB", "APWEN", "NISTRUCTE", "YEFON", "NIQS FOUNDATION", "Other"];
const REFERRALS = ["NIQS, NIOB, NSE, NISTRUCTE, YEFON, APWEN, CORBIN, COREN", "KFSD Alumni", "Social Media (Facebook, LinkedIn, Instagram)", "Impact Leaders Club", "Enactus", "DSN Network", "Whatsapp", "Word of mouth", "AIN", "MEK NextGen Innovators"];
const RETRY_MESSAGE = "Registration is temporarily unavailable. Your answers are still here. Please try again shortly.";
const RATE_LIMIT_MESSAGE = "Too many registration attempts from this network. Please try again in a minute.";

class RegistrationError extends Error {
  constructor(status, message, errors, reference) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.reference = reference;
  }
}

async function readSubmission(request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new RegistrationError(415, "Please submit the registration form on the website.");
  }
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    throw new RegistrationError(413, "The submission is too large. Please shorten your answers.");
  }
  if (!request.body) throw new RegistrationError(400, "Please complete the registration form.");
  const reader = request.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RegistrationError(413, "The submission is too large. Please shorten your answers.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  let input;
  try {
    input = JSON.parse(await new Blob(chunks).text());
  } catch {
    throw new RegistrationError(400, "Please submit a valid registration form.");
  }
  if (!input || typeof input !== "object" || Array.isArray(input) || input.website) {
    throw new RegistrationError(400, "Please submit a valid registration form.");
  }
  const values = {};
  const errors = {};
  for (const key of ["email", ...FORM_FIELDS]) {
    const value = input[key];
    values[key] = typeof value === "string" ? value.trim() : "";
    if (value !== undefined && typeof value !== "string") errors[key] = "Enter a valid answer.";
    if (values[key].length > (key === "email" ? 254 : 200)) errors[key] = "Please use a shorter answer.";
  }
  for (const key of REQUIRED) {
    if (!values[key]) errors[key] = "Please complete this field.";
  }
  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email address.";
  const phoneCountry = input.phoneCountry ?? parsePhoneNumberFromString(values.phone, { extract: false })?.country;
  const phone = validateRegistrationPhone(values.phone, phoneCountry);
  if (!phone.ok) errors.phone = phone.error;
  else values.phone = phone.number;
  if (input.countryCode !== undefined && !countries.some((country) => country.code === input.countryCode && country.name === values.country)) errors.country = "Select a country from the list.";
  if (values.company && !COMPANIES.includes(values.company)) errors.company = "Select a company from the list.";
  if (values.attended && !["Yes", "No", "Not sure"].includes(values.attended)) errors.attended = "Select an answer from the list.";
  if (values.referral && !REFERRALS.includes(values.referral)) errors.referral = "Select an answer from the list.";
  if (Object.keys(errors).length) throw new RegistrationError(422, "Please check the highlighted fields.", errors);
  return values;
}

function createRegistrationHandler(fetcher = fetch) {
  return async function handleRequest(request, env = {}) {
    const origin = request.headers.get("origin");
    const allowedOrigins = (env.ALLOWED_ORIGINS || "https://chiazaokoli.github.io").split(",").map((value) => value.trim());
    const allowed = allowedOrigins.includes(origin);
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Vary": "Origin",
      ...(allowed ? { "Access-Control-Allow-Origin": origin } : {}),
    };
    const reply = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });
    const path = new URL(request.url).pathname;
    if (!["/", "/register", "/health", "/location"].includes(path)) return reply(404, { ok: false, message: "Not found." });
    const tagId = String(env.KIT_TAG_ID || "").trim();
    if (request.method === "GET" && ["/", "/health"].includes(path)) {
      return reply(200, { service: "kfsd-registration", provider: "kit", version: 4, configured: Boolean(env.KIT_API_KEY && /^\d+$/.test(tagId)), rateLimited: Boolean(env.REGISTRATION_RATE_LIMITER) });
    }
    if (!allowed) return reply(403, { ok: false, message: "Please register through the KFSD website." });
    if (request.method === "GET" && path === "/location") {
      const location = request.cf || {};
      const countryCode = countries.some((country) => country.code === location.country) ? location.country : null;
      return reply(200, { countryCode, regionCode: typeof location.regionCode === "string" ? location.regionCode : null, region: typeof location.region === "string" ? location.region : null });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...headers, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" } });
    }
    if (request.method !== "POST" || !["/", "/register"].includes(path)) return reply(405, { ok: false, message: "Method not allowed." }, { Allow: "POST, OPTIONS" });

    let stage = "config";
    try {
      // The binding is configured in wrangler.jsonc. Count only registration
      // attempts, so location lookups, health checks, and CORS do not consume it.
      // Cloudflare supplies this header; never use a client-submitted IP value.
      if (env.REGISTRATION_RATE_LIMITER) {
        const clientIp = request.headers.get("CF-Connecting-IP");
        if (!clientIp) throw new RegistrationError(503, RETRY_MESSAGE, undefined, "K-R-IP");
        const { success } = await env.REGISTRATION_RATE_LIMITER.limit({ key: clientIp });
        if (!success) throw new RegistrationError(429, RATE_LIMIT_MESSAGE, undefined, "K-R-L");
      }
      const values = await readSubmission(request);
      if (!env.KIT_API_KEY || !/^\d+$/.test(tagId)) throw new RegistrationError(503, RETRY_MESSAGE, undefined, "K-C");
      // One deadline covers subscriber upsert and tagging. Never log tokens or answers.
      const signal = AbortSignal.timeout(12000);
      const api = async (url, options = {}) => {
        const response = await fetcher(url, {
          ...options,
          headers: { "X-Kit-Api-Key": env.KIT_API_KEY, Accept: "application/json", "Content-Type": "application/json" },
          signal,
          // Cloudflare supports only "manual" and "follow". Reject 3xx below
          // rather than forwarding the API credential to a new host.
          redirect: "manual",
        });
        if (!response.ok) throw new RegistrationError(response.status === 429 ? 429 : 502, RETRY_MESSAGE, undefined, `K-${stage}-${response.status}`);
        return response.json();
      };
      const fields = {};
      for (const [formKey, kitKey] of Object.entries(FIELD_MAP)) {
        if (values[formKey]) fields[kitKey] = values[formKey];
      }
      // Kit upserts by email. Explicit active state implements the single-opt-in
      // registration the event uses; the form submission is the subscriber's action.
      stage = "S";
      let result = await api(`${API}/subscribers`, {
        method: "POST",
        body: JSON.stringify({ email_address: values.email, first_name: values.firstName, state: "active", fields }),
      });
      // Kit accepts the subscriber even when it ignores unknown custom-field keys.
      // Resolve the two account-specific keys only if Kit reports that mismatch.
      if (result.warnings?.length) {
        stage = "F";
        const normalized = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        const customFields = [];
        let after;
        // Kit paginates custom fields; the two missing fields may be on a later page.
        for (let page = 0; page < 5; page++) {
          const url = `${API}/custom_fields?per_page=100${after ? `&after=${encodeURIComponent(after)}` : ""}`;
          const response = await api(url);
          if (!Array.isArray(response.custom_fields)) throw new RegistrationError(503, RETRY_MESSAGE, undefined, "K-F-R");
          customFields.push(...response.custom_fields);
          if (!response.pagination?.has_next_page) break;
          after = response.pagination.end_cursor;
          if (!after) throw new RegistrationError(503, RETRY_MESSAGE, undefined, "K-F-P");
        }
        const keyFor = (label, prefix) => {
          const exact = customFields.find((field) => normalized(field.label) === normalized(label));
          if (exact?.key) return exact.key;
          const candidates = customFields.filter((field) => normalized(field.label).startsWith(prefix));
          return candidates.length === 1 ? candidates[0].key : undefined;
        };
        const lastNameKey = keyFor("Last name", "last name");
        const referralKey = keyFor("How did you hear about KFSD soft skills training", "how did you hear");
        if (!lastNameKey || !referralKey) throw new RegistrationError(503, RETRY_MESSAGE, undefined, !lastNameKey && !referralKey ? "K-F-M" : !lastNameKey ? "K-F-L" : "K-F-H");
        delete fields[FIELD_MAP.lastName];
        delete fields[FIELD_MAP.referral];
        fields[lastNameKey] = values.lastName;
        fields[referralKey] = values.referral;
        stage = "S";
        result = await api(`${API}/subscribers`, {
          method: "POST",
          body: JSON.stringify({ email_address: values.email, first_name: values.firstName, state: "active", fields }),
        });
        if (result.warnings?.length) throw new RegistrationError(503, RETRY_MESSAGE, undefined, "K-S-F");
      }
      const subscriber = result.subscriber;
      if (!subscriber?.id || subscriber.email_address?.toLowerCase() !== values.email.toLowerCase()) throw new RegistrationError(502, RETRY_MESSAGE, undefined, "K-S-R");
      if (subscriber.state !== "active") {
        throw new RegistrationError(409, "We couldn't complete registration with this email address. Please contact KFSD for help.", undefined, "K-S-I");
      }
      stage = "T";
      const tagged = await api(`${API}/tags/${tagId}/subscribers/${subscriber.id}`, { method: "POST" });
      if (!tagged.subscriber?.id || String(tagged.subscriber.id) !== String(subscriber.id)) throw new RegistrationError(502, RETRY_MESSAGE, undefined, "K-T-R");
      return reply(200, {
        ok: true,
        status: "registered",
        message: "You're registered! Your details have been saved for the KFSD soft skills training.",
      });
    } catch (error) {
      if (error instanceof RegistrationError) {
        return reply(error.status, { ok: false, message: error.reference ? `${error.message} (Ref: ${error.reference})` : error.message, ...(error.errors ? { errors: error.errors } : {}) }, error.status === 429 ? { "Retry-After": "60" } : {});
      }
      return reply(503, { ok: false, message: `${RETRY_MESSAGE} (Ref: K-${stage}-N)` });
    }
  };
}

const worker = { fetch: (request, env) => createRegistrationHandler()(request, env) };
export default worker;
