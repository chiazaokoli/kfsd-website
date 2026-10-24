"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import countries from "../data/registration-countries.json";
import nigeriaStates from "../data/nigeria-states.json";
import phoneCountryData from "../data/phone-countries.json";
import RegistrationSelect from "./RegistrationSelect";
import RegistrationToast from "./RegistrationToast";

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const endpoint = assetPrefix
  ? "https://kfsd-demo-registration.yummydummy419.workers.dev"
  : "https://kfsdsoftskills.smart-okolichiaza.workers.dev";
const companyOptions = ["-", "NIQS", "NICE", "NSE", "NIOB", "APWEN", "NISTRUCTE", "YEFON", "NIQS FOUNDATION", "Other"];
const referralOptions = ["-", "NIQS, NIOB, NSE, NISTRUCTE, YEFON, APWEN, CORBIN, COREN", "KFSD Alumni", "Social Media (Facebook, LinkedIn, Instagram)", "Impact Leaders Club", "Enactus", "DSN Network", "Whatsapp", "Word of mouth", "AIN", "MEK NextGen Innovators"];
const professionOptions = ["Student", "Teacher / Educator", "Engineer", "Architect", "Quantity surveyor", "Surveyor", "Construction professional", "Healthcare professional", "IT / Technology professional", "Business owner / Entrepreneur", "Civil servant", "Finance / Accounting professional", "Legal professional", "Researcher / Academic", "Job seeker", "Other"];
const phoneCountries = phoneCountryData.map(({ code }) => code);
let phoneTools: Promise<typeof import("../lib/registration-phone")> | undefined;
const loadPhoneTools = () => phoneTools ||= import("../lib/registration-phone").catch((error) => { phoneTools = undefined; throw error; });
const countryOptions = countries.map(({ code, name }) => ({ value: code, label: name }));
const phoneOptions = phoneCountryData.map(({ code, callingCode }) => {
  const name = countries.find((country) => country.code === code)?.name || ({ AC: "Ascension Island", TA: "Tristan da Cunha" } as Record<string, string>)[code] || code;
  return { value: code, label: `${name} (+${callingCode})`, shortLabel: `+${callingCode}` };
}).sort((a, b) => a.label.localeCompare(b.label, "en"));
const failureMessage = "We couldn't confirm your registration. Your answers are still here. Please try again shortly.";
type Selections = { company: string; attended: string; referral: string; country: string; state: string; profession: string; phoneCountry: string };
type StateOption = { code: string; name: string };

function TextField({ name, label, error, ...props }: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label htmlFor={`${name}-input`}>{label}<input id={`${name}-input`} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} {...props} />{error && <small id={`${name}-error`}>{error}</small>}</label>;
}

export default function RegistrationForm() {
  const router = useRouter();
  const [selections, setSelections] = useState<Selections>({ company: "", attended: "", referral: "", country: "NG", state: "", profession: "", phoneCountry: "NG" });
  const [phoneInput, setPhoneInput] = useState("");
  const [stateData, setStateData] = useState<{ country: string; states: StateOption[]; failed: boolean }>({ country: "NG", states: nigeriaStates, failed: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ message: string; error: boolean } | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: "success" | "error"; id: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const phoneEdit = useRef(0);
  const touched = useRef({ country: false, state: false, phone: false });
  const detectedRegion = useRef<{ country: string; code?: string; name?: string } | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const statesLoading = stateData.country !== selections.country;
  const states = statesLoading ? [] : stateData.states;
  const countryName = countries.find(({ code }) => code === selections.country)?.name || "";

  useEffect(() => {
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const detect = () => {
    timeout = setTimeout(() => controller.abort(), 7000);
    fetch(`${endpoint}/location`, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("Location unavailable");
      return response.json();
    }).then((location) => {
      if (controller.signal.aborted || !countries.some(({ code }) => code === location.countryCode)) return;
      detectedRegion.current = { country: location.countryCode, code: location.regionCode, name: location.region };
      setSelections((current) => {
        const country = touched.current.country ? current.country : location.countryCode;
        const region = country === "NG" && !touched.current.state ? nigeriaStates.find((state) => state.code === location.regionCode || state.name === location.region)?.name : undefined;
        return { ...current, country, state: region || (country === current.country ? current.state : ""), phoneCountry: !touched.current.phone && phoneCountries.includes(location.countryCode) ? location.countryCode : current.phoneCountry };
      });
    }).catch(() => { /* Nigeria remains an editable fallback when detection is unavailable. */ }).finally(() => clearTimeout(timeout));
    };
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); detect(); } }, { rootMargin: "400px" });
    if (formRef.current) observer.observe(formRef.current);
    return () => { observer.disconnect(); clearTimeout(timeout); controller.abort(); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const country = selections.country;
    let current = true;
    const timeout = setTimeout(() => controller.abort(), 8000);
    const promise: Promise<StateOption[]> = country === "NG" ? Promise.resolve(nigeriaStates) : fetch(`${assetPrefix}/data/states/${country[0]}.json`, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("States unavailable");
      return response.json();
    }).then((data) => {
      if (!Array.isArray(data[country])) throw new Error("States unavailable");
      return data[country];
    });
    promise.then((items) => {
      if (!current) return;
      setStateData({ country, states: items, failed: false });
      const region = detectedRegion.current;
      const match = region?.country === country ? items.find((state) => state.code === region.code || state.name === region.name) : undefined;
      if (match && !touched.current.state) setSelections((current) => current.country === country && !current.state ? { ...current, state: match.name } : current);
    }).catch(() => { if (current) setStateData({ country, states: [], failed: true }); }).finally(() => clearTimeout(timeout));
    return () => { current = false; clearTimeout(timeout); controller.abort(); };
  }, [selections.country]);

  function updateSelection(name: keyof Selections, value: string) {
    if (name === "country" || name === "state") touched.current[name] = true;
    if (name === "state") touched.current.country = true;
    if (name === "phoneCountry") { touched.current.phone = true; phoneEdit.current++; }
    setSelections((current) => name === "country" ? { ...current, country: value, state: "", phoneCountry: !touched.current.phone && phoneCountries.includes(value) ? value : current.phoneCountry } : { ...current, [name]: value });
    setErrors((current) => ({ ...current, [name]: "", ...(name === "country" ? { state: "" } : {}), ...(name === "phoneCountry" ? { phone: "" } : {}) }));
  }

  function updatePhone(raw: string) {
    touched.current.phone = true;
    const edit = ++phoneEdit.current;
    setPhoneInput(raw);
    if (raw.trim().startsWith("+")) {
      loadPhoneTools().then(({ inferPhoneCountry }) => {
        const country = inferPhoneCountry(raw);
        if (edit === phoneEdit.current && country) setSelections((current) => ({ ...current, phoneCountry: country }));
      }).catch(() => {});
    }
    setErrors((current) => ({ ...current, phone: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("country", countryName);
    data.set("countryCode", selections.country);
    if (selections.profession === "Other") data.set("profession", String(data.get("professionOther") || "").trim());
    if (selections.state === "Other / not listed") data.set("state", String(data.get("stateOther") || "").trim());
    const required = ["email", "firstName", "lastName", "phone", "profession", "country", "state", "attended", "referral"];
    const nextErrors: Record<string, string> = {};
    for (const field of required) if (!String(data.get(field) || "").trim()) nextErrors[field] = "Please complete this field.";
    const email = String(data.get("email") || "").trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    inFlight.current = true;
    setSubmitting(true);
    let phone;
    try {
      const tools = await loadPhoneTools();
      const country = phoneInput.trim().startsWith("+") ? tools.inferPhoneCountry(phoneInput) || selections.phoneCountry : selections.phoneCountry;
      phone = tools.validateRegistrationPhone(phoneInput, country);
      data.set("phoneCountry", country);
    }
    catch { inFlight.current = false; setSubmitting(false); setStatus({ error: true, message: "Phone validation could not load. Please check your connection and try again." }); return; }
    if (!phone.ok) nextErrors.phone = phone.error;
    if (statesLoading) nextErrors.state = "Please wait for the state list to load.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      inFlight.current = false;
      setSubmitting(false);
      setStatus(null);
      setToast({ message: "Please correct the highlighted fields and try again.", kind: "error", id: Date.now() });
      return;
    }
    data.set("email", email);
    if (phone.ok) data.set("phone", phone.number);
    inFlight.current = true;
    setSubmitting(true);
    setStatus(null);
    setToast(null);
    try {
      const response = await fetch(`${endpoint}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok || result.ok !== true || !["registered", "pending"].includes(result.status)) {
        if (result.errors && typeof result.errors === "object") {
          const serverErrors: Record<string, string> = {};
          for (const field of [...required, "company", "phoneCountry"]) if (typeof result.errors[field] === "string") serverErrors[field] = result.errors[field];
          setErrors(serverErrors);
          if (Object.keys(serverErrors).length) {
            setToast({ message: "Please correct the highlighted fields and try again.", kind: "error", id: Date.now() });
            return;
          }
        }
        throw new Error(typeof result.message === "string" ? result.message : failureMessage);
      }
      const message = typeof result.message === "string" ? result.message : "Your registration details have been saved.";
      if (result.status === "registered") {
        router.push("/welcome");
        return;
      }
      setStatus({ message, error: false });
      setToast({ message, kind: "success", id: Date.now() });
      form.reset();
      setPhoneInput("");
      setSelections((current) => ({ ...current, company: "", attended: "", referral: "", state: "", profession: "" }));
    } catch (error) {
      setStatus({ error: true, message: error instanceof Error && error.name === "Error" ? error.message : failureMessage });
    } finally { inFlight.current = false; setSubmitting(false); }
  }

  const select = (name: keyof Selections, label: string, options: React.ComponentProps<typeof RegistrationSelect>["options"], placeholder: string, searchable = false) => <RegistrationSelect name={name} label={label} options={options} placeholder={placeholder} value={selections[name]} error={errors[name]} searchable={searchable} inlineSearch={name === "country" || name === "profession"} onChange={(value) => updateSelection(name, value)} />;

  return <>
    <form ref={formRef} id="registration-form" className="registration-form" onSubmit={handleSubmit} onInput={(event) => { const name = (event.target as HTMLInputElement).name; const field = name === "professionOther" ? "profession" : name === "stateOther" ? "state" : name; if (field && errors[field]) setErrors((current) => ({ ...current, [field]: "" })); }} noValidate>
      <fieldset className="registration-fields" disabled={submitting} aria-busy={submitting}>
        <div className="form-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
        <TextField name="email" label="Email" error={errors.email} type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} />
        <div className="form-row">
          <TextField name="firstName" label="First name" error={errors.firstName} type="text" autoComplete="given-name" placeholder="Your first name" maxLength={200} />
          <TextField name="lastName" label="Last name" error={errors.lastName} type="text" autoComplete="family-name" placeholder="Your last name" maxLength={200} />
        </div>
        <div className="phone-field"><label htmlFor="phone-input">Phone</label><div className="phone-input-row">
          <RegistrationSelect label="Phone country code" name="phoneCountry" options={phoneOptions} placeholder="Code" value={selections.phoneCountry} onChange={(value) => updateSelection("phoneCountry", value)} searchable compact />
          <input id="phone-input" name="phone" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="Your phone number" maxLength={40} value={phoneInput} aria-invalid={Boolean(errors.phone || errors.phoneCountry)} aria-describedby={errors.phone || errors.phoneCountry ? "phone-error" : undefined} onFocus={() => { void loadPhoneTools().catch(() => {}); }} onChange={(event) => updatePhone(event.target.value)} onBlur={() => { if (!phoneInput.trim()) return; const edit = phoneEdit.current; loadPhoneTools().then(({ validateRegistrationPhone, inferPhoneCountry }) => { if (edit !== phoneEdit.current) return; const country = phoneInput.trim().startsWith("+") ? inferPhoneCountry(phoneInput) || selections.phoneCountry : selections.phoneCountry; const result = validateRegistrationPhone(phoneInput, country); if (result.ok) setPhoneInput(result.national); else setErrors((current) => ({ ...current, phone: result.error })); }).catch(() => {}); }} />
        </div>{(errors.phone || errors.phoneCountry) && <small id="phone-error">{errors.phone || errors.phoneCountry}</small>}</div>
        {select("profession", "Profession", professionOptions, "Select your profession", true)}
        {selections.profession === "Other" && <TextField name="professionOther" label="Your profession" error={errors.profession} placeholder="Enter your profession" maxLength={200} />}
        {select("company", "Company", companyOptions, "-")}
        <div className="form-row">
          {select("country", "Country", countryOptions, "Select your country", true)}
          {stateData.failed && !statesLoading ? <TextField name="state" label="State or region" error={errors.state} placeholder="Your state or region" maxLength={200} /> : <RegistrationSelect name="state" label="State or region" options={[...new Set(states.map((state) => state.name)), ...(!states.length && !statesLoading ? ["Not applicable"] : []), "Other / not listed"]} placeholder={statesLoading ? "Loading states…" : "Select your state"} value={selections.state} error={errors.state} searchable inlineSearch disabled={statesLoading} onChange={(value) => updateSelection("state", value)} />}
        </div>
        {selections.state === "Other / not listed" && <TextField name="stateOther" label="Your state or region" error={errors.state} placeholder="Enter your state or region" maxLength={200} />}
        {select("attended", "Have you attended KFSD soft skills training before?", ["Yes", "No", "Not sure"], "Select an answer")}
        {select("referral", "How did you hear about KFSD soft skills training?", referralOptions, "-")}
        <button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Reserve My Free Spot"}</button>
      </fieldset>
      <p className="form-reassurance">Your details will only be used for this training.</p>
      {status?.error && <p className="form-status is-error" role="alert">{status.message}</p>}
    </form>
    {toast && <RegistrationToast key={toast.id} message={toast.message} kind={toast.kind} onClose={dismissToast} />}
  </>;
}
