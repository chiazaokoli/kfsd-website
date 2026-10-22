# KFSD registration → Kit

The website stays on GitHub Pages. The single-file Cloudflare Worker validates
the registration, upserts an active Kit subscriber, saves the form answers as
custom fields, and applies the **KFSD Demo Group** tag.

## Deploy in Cloudflare

1. Open **Workers & Pages → kfsd-demo-registration → Edit code**.
2. Copy the entire generated `registration-worker.mjs` file from this directory.
3. Replace the entire contents of Cloudflare's `worker.js` and click **Deploy**.
4. Keep `KIT_API_KEY` as a Production secret and `KIT_TAG_ID` as a Production
   variable. The event tag ID is `24884438`.
5. Visit `https://kfsd-demo-registration.yummydummy419.workers.dev/health`.
   It should return `"provider":"kit"` and `"configured":true`.
6. Submit the website form with an address you control. Confirm that the Kit
   subscriber is active, has the KFSD Demo Group tag, and contains every answer.

If the form reports a `K-...` reference code, it identifies the failed step
without exposing the API response: `K-C` is configuration, `K-S` is subscriber
saving, and `K-T` is tag assignment. A number at the end is Kit's HTTP status;
`N` is a network or response parsing failure and `R` is an unexpected response.

Cloudflare Access must stay off for this public endpoint. The Worker uses Kit
single opt-in by explicitly saving the subscriber in the active state. A website
success response means Kit saved and tagged the subscriber; it does not claim
that Kit sent an email.

## Kit field mapping

| Website answer | Kit field key |
| --- | --- |
| Email | `email_address` (subscriber property) |
| First name | `first_name` (subscriber property) |
| Last name | `last_name` |
| Phone | `phone` |
| Profession | `profession` |
| Company | `company` (omitted if blank) |
| Country | `country` |
| State | `state` |
| Attended before | `attended_kfsd_training_before` |
| Referral source | `how_did_you_hear_about_kfsd_soft_skills_training` |

Kit derives custom-field keys from their labels. If a label was created with a
different spelling, update its value in `FIELD_MAP` in
`src/registration-worker.mjs` before deploying.

## MailerLite rollback

The exact pre-migration MailerLite source and generated Worker are stored under
`backups/`. To restore MailerLite, paste the entire contents of
`backups/mailerlite-registration-worker.mjs` into Cloudflare and deploy it. The
existing `MAILERLITE_API_TOKEN` secret can remain in Cloudflare during the Kit
trial, so rollback requires no code reconstruction.

## Security and failure behavior

The default permitted browser origin is `https://chiazaokoli.github.io`. The
hidden honeypot, JSON-only endpoint, body limit, origin restriction, and server
validation provide basic filtering. They do not stop determined bots; add
Turnstile and rate limiting if spam becomes a concern. No answers, subscriber
IDs, provider errors, or credentials are logged or returned to the browser.

Subscriber creation and tag assignment are separate Kit API operations. Both
are idempotent: a retry updates the same email record and reapplies the same tag.
If tagging fails after the subscriber is saved, the browser receives a retryable
failure and a retry completes the tag assignment without creating a duplicate.

## Checks

Run `npm run build:worker`, `npm run test:registration`, `npm run lint`,
`npm run typecheck`, and the GitHub Pages production build.

Editable Worker source lives at `src/registration-worker.mjs` relative to this
directory. `npm run build:worker` creates the single-file
`registration-worker.mjs` for Cloudflare. Do not edit the generated file.

Phone validation is shared with the website and saves international E.164
numbers. The website lazy-loads the full phone validator only when needed.
`GET /location` uses Cloudflare metadata to suggest an editable country and
region without exposing the visitor's IP address or contacting Kit.
