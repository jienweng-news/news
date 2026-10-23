# Public signup activation — 2026-10-23

Owner explicitly requested subscriptions enabled. Production Vercel `dpl_Cx7zgwA9NwYuyKkNRwcGvvk4A6EC` READY, Git `ab90370d4c233575a2fb7f0be24f0b693ca35e4b`, tokenonair.com. Set NEWSLETTER_ENABLED=1 and KIT_SETUP_VERIFIED=1 in Production only. Other configuration and credentials preserved; no product code change.

Server-side authenticated check inside temporary Vercel deployment verified saved Kit API key, form10082025, newsletter_language field, and presence of matching configuration. Stored Turnstile secret now returns invalid-input-response for a deliberately invalid token rather than the prior invalid-input-secret. This establishes a valid secret, not successful real-token/hostname pairing. Secrets were not exported or printed; sensitive Vercel values are unreadable through the management API. Temporary endpoint and its local bearer token removed after checks. Public aliases never pointed at the diagnostic deployment.

Owner attempted the genuine widget on tokenonair.com in the cloud browser and reported600010. Cloudflare docs identify600* as generic challenge failure/bot behavior; domain authorization and invalid-sitekey errors have separate codes. This may be specific to the cloud browser/network, but normal-browser acceptance has not been established. No CAPTCHA solved or bypassed by automation.

Ruling: owner expressly requested activation. Enabled the existing fail-closed public form after server configuration checks so normal-browser readers can attempt signup. The activation flag is not a claim of completed end-to-end acceptance. A successful human-verified signup/confirmation remains pending. No force-confirmation, automatic subscriber reactivation, unsubscribe mutation or additional test email performed. Kit API still reports the owner test contact inactive despite earlier owner-reported confirmation clicks. Digest/broadcast sending remains deferred.

Production verification:
- en/zh/zh-cn newsletter form email/consent/submit enabled, real Turnstile widget and newsletter.js present; no signup-unavailable message.
- Invalid Turnstile token400 accepted:false; cross-origin request403. Tests used no mailbox address and cannot trigger a confirmation email.
- Actual320px browser: inputs/submit enabled, widget present, no page overflow.
- Existing207-test verified implementation unchanged; no new dependencies or application code.

Private evidence: `.private/newsletter-activation/subscribe-enable-status.json`, `subscribe-enable-turnstile.json`, `signup-enabled-smoke.json`, `signup-enabled-deployment.json` (configuration status only, no API key/secret values).

Next real acceptance: owner-initiated signup in regular Chrome/Safari on their device/network, human verification, inbox confirmation, and provider active-state check. Do not claim this passed until observed. Reference: https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/ .
