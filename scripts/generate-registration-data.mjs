import { mkdir, readFile, writeFile } from "node:fs/promises";
import { allCountries } from "country-region-data";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/max";

await mkdir("src/data", { recursive: true });
await mkdir("public/data/states", { recursive: true });
const countries = allCountries.map(([name, code]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name, "en"));
await writeFile("src/data/registration-countries.json", JSON.stringify(countries) + "\n");
await writeFile("src/data/phone-countries.json", JSON.stringify(getCountries().map((code) => ({ code, callingCode: getCountryCallingCode(code) }))) + "\n");
const groups = {};
for (const country of countries) {
  const states = allCountries.find((item) => item[1] === country.code)[2].map(([name, code]) => ({ code: code || name, name })).sort((a, b) => a.name.localeCompare(b.name, "en"));
  (groups[country.code[0]] ||= {})[country.code] = states;
  if (country.code === "NG") await writeFile("src/data/nigeria-states.json", JSON.stringify(states) + "\n");
}
for (const [letter, states] of Object.entries(groups)) await writeFile(`public/data/states/${letter}.json`, JSON.stringify(states) + "\n");
const notices = await Promise.all([readFile("node_modules/country-region-data/LICENSE.txt", "utf8"), readFile("node_modules/libphonenumber-js/LICENSE", "utf8")]);
await writeFile("public/data/registration-LICENSES.txt", `country-region-data\n\n${notices[0]}\n\nlibphonenumber-js\n\n${notices[1]}`);
