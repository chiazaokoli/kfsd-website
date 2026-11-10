import { build } from "esbuild";
import { readFile } from "node:fs/promises";

const phoneLicense = await readFile("node_modules/libphonenumber-js/LICENSE", "utf8");

await build({
  entryPoints: ["cloudflare/src/mailerlite-staging-worker.mjs"],
  outfile: "cloudflare/mailerlite-staging-worker.mjs",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  legalComments: "eof",
  banner: { js: `// MailerLite test Worker. Never deploy this file over the live Kit Worker.\n/* libphonenumber-js license:\n${phoneLicense}\n*/` },
});
