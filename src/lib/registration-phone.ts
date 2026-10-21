import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";

export function inferPhoneCountry(raw: string) {
  return parsePhoneNumberFromString(raw, { extract: false })?.country;
}

export function validateRegistrationPhone(raw: string, country: string) {
  if (!getCountries().includes(country as CountryCode)) return { ok: false as const, error: "Choose a country calling code." };
  if (!raw.trim()) return { ok: false as const, error: "Enter your phone number." };
  if (raw.length > 40 || !/^[+\d\s().-]+$/.test(raw)) return { ok: false as const, error: "Enter a valid phone number for the selected country code." };
  const parsed = parsePhoneNumberFromString(raw, { defaultCountry: country as CountryCode, extract: false });
  if (!parsed?.isValid()) return { ok: false as const, error: "Enter a valid phone number for the selected country code." };
  if (parsed.countryCallingCode !== getCountryCallingCode(country as CountryCode)) return { ok: false as const, error: "Choose the country code that matches your phone number." };
  return { ok: true as const, number: String(parsed.number), national: parsed.formatNational(), country: parsed.country || country };
}
