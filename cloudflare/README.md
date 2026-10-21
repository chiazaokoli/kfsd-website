# KFSD registration → MailerLite

The website stays on GitHub Pages. The single-file Worker receives the form,
validates it, and upserts the subscriber into **KFSD Demo Group**. The token stays
in Cloudflare's `MAILERLITE_API_TOKEN` secret. No MailerLite token is needed in
GitHub, the website, or these source files.

## Deploy in Cloudflare

1. Open **Workers & Pages → kfsd-demo-registration → Edit code**.
2. Open `registration-worker.mjs` in this directory and copy its entire contents.
3. Replace the entire Worker code with those contents. This generated file
   bundles the international phone validator; no packages need installing in
   Cloudflare. Copy the entire file, including its long lines.
4. Click **Deploy**. Keep the existing `MAILERLITE_API_TOKEN` secret in Production.
5. Visit `https://kfsd-demo-registration.yummydummy419.workers.dev/health`.
   The JSON should include `"service":"kfsd-registration"` and
   `"configured":true`. This checks that the code and secret are present; it does
   not validate the token or MailerLite group.
6. Submit the website form using an email address you control. Check the saved
   subscriber, group membership, and every field in MailerLite. An enabled
   group-join automation must be tested separately to confirm email delivery.

Cloudflare Access must stay off for this public endpoint. A website success
message means MailerLite returned a saved active subscriber, not that any email
was delivered. Unconfirmed subscribers receive a separate pending message.

## Mapping

| Website answer | MailerLite field key |
| --- | --- |
| Email | `email` (subscriber property) |
| First name | `first_name` and standard `name` |
| Last name | `last_name` |
| Phone | `phone` |
| Profession | `profession` |
| Company | `company` (omitted if blank) |
| Country | `country` |
| State | `state` |
| Attended before | `have_you_attended_kfsd_soft_skills_training_before` |
| Referral source | `how_did_you_hear_about_kfsd_soft_skills_training` |

The Worker resolves the exact group name using MailerLite's API; the user need
not find an ID. It refuses to guess if no group or multiple exact matches exist.
An optional Cloudflare text variable `MAILERLITE_GROUP_ID` skips that lookup.
`MAILERLITE_GROUP_NAME` overrides the demo name for a future event.

The default permitted browser origin is `https://chiazaokoli.github.io`.
For local development, set `ALLOWED_ORIGINS` to a comma-separated list containing
that origin and the exact local origin. CORS is a browser restriction, not an
authentication system. The hidden honeypot, JSON-only endpoint, body limit, and
server validation provide basic filtering; they do not stop determined bots.
Add Turnstile and a rate limiter before broad public promotion if spam becomes a
concern. No registration answers, subscriber IDs, or API errors are logged or
returned to the browser.

Re-registering updates the subscriber's shared fields and adds the group without
replacing other group memberships. No `status` is sent: existing unsubscribes are
not deliberately overridden. This is an email-list integration, not a separate
historical database of event registrations. The existing form promises
training-related use only; do not reuse these registrations for general marketing
without an appropriate separate opt-in.

## Checks

Run `npm run build:worker`, `npm run test:registration`, `npm run lint`,
`npm run typecheck`, and the GitHub Pages production build.
Tests mock MailerLite; they never create subscribers or send email.

Editable Worker source now lives in `src/registration-worker.mjs` relative to
this directory. `npm run build:worker` generates the single-file
`registration-worker.mjs`; the website production build runs this step too.
Do not edit the generated bundle directly in the repository.

The phone validator is shared with the website in
`../src/lib/registration-phone.ts`. It validates actual national numbering
patterns and the chosen calling code, then sends MailerLite an international
E.164 number. Existing international-number submissions remain supported.

The website imports the full phone validator on phone-field interaction or
submission, not on initial page load. A small generated calling-code table keeps
the code selector available immediately. Location detection starts only when
registration approaches the viewport. Dropdowns are anchored overlays rendered
outside the clipped form card; their option scrolling does not scroll the page.

`GET /location` returns Cloudflare's country and region suggestion to the
permitted website origin, without exposing the IP address or contacting
MailerLite. IP location can be approximate or reflect a VPN; all defaults remain
editable. If it fails or the old Worker is still deployed, the form falls back
to Nigeria. Country/state data comes from the MIT-licensed `country-region-data`
package. State lists are loaded in small groups by country initial; run
`npm run build:registration-data` to regenerate them. A manual entry remains
available for missing states, missing professions, or a failed state-data load.

Outbound requests must use `redirect: "manual"`: Cloudflare's runtime rejects
`"error"`, even though Node.js accepts it. The Worker treats redirects as failures
so the API token cannot be forwarded to another location.

If a request fails or times out, the form retains its values for retry. A timeout
can happen after MailerLite has saved the record; its email-based upsert avoids
creating a second subscriber on retry. Confirmation/reminder scheduling and
automation re-entry are configured in MailerLite.
