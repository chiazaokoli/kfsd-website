# Registration Worker rollback copies

`mailerlite-registration-worker.source.mjs` is the editable MailerLite source.
`mailerlite-registration-worker.mjs` is the generated single-file Worker that
can be pasted directly into Cloudflare.

To restore MailerLite instantly, copy the entire contents of
`mailerlite-registration-worker.mjs` into Cloudflare's `worker.js`, deploy it,
and leave the existing `MAILERLITE_API_TOKEN` secret in place.

These files are snapshots. Do not regenerate or edit them during Kit changes.
