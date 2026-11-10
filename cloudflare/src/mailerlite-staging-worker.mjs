// Editable source: run npm run build:worker, then deploy the GENERATED
// cloudflare/mailerlite-staging-worker.mjs file in a separate test Worker.
// Keep MAILERLITE_API_TOKEN in Cloudflare Secrets, never in this file.
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { validateRegistrationPhone } from "../../src/lib/registration-phone";
import countries from "../../src/data/registration-countries.json";
const API = "https://connect.mailerlite.com/api";
const TEST_GROUP_ID = "203742296935498805";
const MAX_BODY_BYTES = 8192;
const FIELD_MAP = {
  firstName: "Name",
  lastName: "Last name",
  phone: "Phone",
  profession: "Profession",
  company: "Company",
  country: "Country",
  state: "State",
  attended: "Have you attended KFSD soft skills training before?",
  referral: "How did you hear about KFSD soft skills training?",
};
const REQUIRED = ["email", "firstName", "lastName", "phone", "profession", "country", "state", "attended", "referral"];
const COMPANIES = ["NIQS", "NICE", "NSE", "NIOB", "APWEN", "NISTRUCTE", "YEFON", "NIQS FOUNDATION", "Other"];
const REFERRALS = ["NIQS, NIOB, NSE, NISTRUCTE, YEFON, APWEN, CORBIN, COREN", "KFSD Alumni", "Social Media (Facebook, LinkedIn, Instagram)", "Impact Leaders Club", "Enactus", "DSN Network", "Whatsapp", "Word of mouth", "AIN", "MEK NextGen Innovators"];
const RETRY_MESSAGE = "Registration is temporarily unavailable. Your answers are still here. Please try again shortly.";

class RegistrationError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
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
  for (const key of ["email", ...Object.keys(FIELD_MAP)]) {
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
    if (request.method === "GET" && ["/", "/health"].includes(path)) {
      return reply(200, { service: "kfsd-registration", provider: "mailerlite", configured: Boolean(env.MAILERLITE_API_TOKEN), rateLimited: Boolean(env.REGISTRATION_RATE_LIMITER) });
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

    try {
      if (env.REGISTRATION_RATE_LIMITER) {
        const clientIp = request.headers.get("CF-Connecting-IP");
        if (!clientIp) throw new RegistrationError(503, RETRY_MESSAGE);
        const { success } = await env.REGISTRATION_RATE_LIMITER.limit({ key: clientIp });
        if (!success) throw new RegistrationError(429, "Too many registration attempts from this network. Please try again in a minute.");
      }
      const values = await readSubmission(request);
      if (!env.MAILERLITE_API_TOKEN) throw new RegistrationError(503, RETRY_MESSAGE);
      // One deadline covers field lookup and saving. Never log tokens or answers.
      const signal = AbortSignal.timeout(12000);
      const api = async (url, options = {}) => {
        const response = await fetcher(url, {
          ...options,
          headers: { Authorization: `Bearer ${env.MAILERLITE_API_TOKEN}`, Accept: "application/json", "Content-Type": "application/json" },
          signal,
          // Cloudflare supports only "manual" and "follow". Reject 3xx below
          // rather than forwarding the Authorization header to a new host.
          redirect: "manual",
        });
        if (!response.ok) throw new RegistrationError(response.status === 429 ? 429 : 502, RETRY_MESSAGE);
        return response.json();
      };
      const fieldResponse = await api(`${API}/fields?limit=100`);
      if (!Array.isArray(fieldResponse.data)) throw new RegistrationError(503, RETRY_MESSAGE);
      const normalize = (text) => String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const fields = {};
      for (const [formKey, label] of Object.entries(FIELD_MAP)) {
        const matches = fieldResponse.data.filter((field) => normalize(field.name) === normalize(label));
        if (matches.length !== 1 || !matches[0].key) throw new RegistrationError(503, RETRY_MESSAGE);
        if (values[formKey]) fields[matches[0].key] = values[formKey];
      }
      // MailerLite upserts by email; group memberships are additive. Do not set
      // status or overwrite an unsubscribe, and do not claim email delivery.
      const result = await api(`${API}/subscribers`, {
        method: "POST",
        body: JSON.stringify({ email: values.email, fields, groups: [TEST_GROUP_ID] }),
      });
      const subscriber = result.data;
      if (!subscriber?.id || subscriber.email?.toLowerCase() !== values.email.toLowerCase()) throw new RegistrationError(502, RETRY_MESSAGE);
      if (!["active", "unconfirmed"].includes(subscriber.status)) {
        throw new RegistrationError(409, "We couldn't complete registration with this email address. Please contact KFSD for help.");
      }
      const pending = subscriber.status === "unconfirmed";
      return reply(200, {
        ok: true,
        status: pending ? "pending" : "registered",
        message: pending ? "Your details have been saved. Email confirmation is still pending; please check your inbox and spam folder." : "You're registered! Your details have been saved for the KFSD soft skills training.",
      });
    } catch (error) {
      if (error instanceof RegistrationError) {
        return reply(error.status, { ok: false, message: error.message, ...(error.errors ? { errors: error.errors } : {}) }, error.status === 429 ? { "Retry-After": "60" } : {});
      }
      return reply(503, { ok: false, message: RETRY_MESSAGE });
    }
  };
}

const worker = { fetch: (request, env) => createRegistrationHandler()(request, env) };
export default worker;
