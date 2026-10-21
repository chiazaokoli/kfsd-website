import { build } from "esbuild";
import { readFile } from "node:fs/promises";

const phoneLicense = await readFile("node_modules/libphonenumber-js/LICENSE", "utf8");

await build({
  entryPoints: ["cloudflare/src/registration-worker.mjs"],
  outfile: "cloudflare/registration-worker.mjs",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  legalComments: "eof",
  banner: { js: `// Generated Worker: copy this ENTIRE file into Cloudflare's worker.js editor.\n// Keep MAILERLITE_API_TOKEN in Cloudflare Secrets. Source: cloudflare/src/registration-worker.mjs\n// Rebuild with npm run build:worker. No external imports are needed.\n/* libphonenumber-js license:\n${phoneLicense}\n*/` },
});
