# KFSD registration → MailerLite

The website stays on GitHub Pages. The single-file Worker receives the form,
validates it, and upserts the subscriber into **KFSD Demo Group**. The token stays
in Cloudflare's `MAILERLITE_API_TOKEN` secret. No MailerLite token is needed in
GitHub, the website, or these source files.

## Deploy in Cloudflare

1. Open **Workers & Pages → kfsd-demo-registration → Edit code**.
2. Open `registration-worker.mjs` in this directory and copy its entire contents.
3. Replace the starter Worker code with those contents. This file is plain
   JavaScript with no imports or packages to install.
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

Run `node --test cloudflare/registration-worker.test.mjs`, `npm run lint`,
`npm run typecheck`, and the GitHub Pages production build.
Tests mock MailerLite; they never create subscribers or send email.

If a request fails or times out, the form retains its values for retry. A timeout
can happen after MailerLite has saved the record; its email-based upsert avoids
creating a second subscriber on retry. Confirmation/reminder scheduling and
automation re-entry are configured in MailerLite.
