# Kit signup connection

Founder selected Kit with the website's own newsletter design. Public embed reference:
`https://token-on-air.kit.com/17c6e3f357/index.js`, UID `17c6e3f357`.
Sender/contact address supplied by founder: `hello@tokenonair.com`.
Founder supplied numeric form ID `10082025` (editor URL https://app.kit.com/forms/designers/10082025/edit) and confirmed confirmation email enabled with auto-confirm disabled. These settings are owner-reported; actual signup, sender delivery/authentication and confirmation lifecycle remain unverified. Public script fetch returned a403 Cloudflare verification page. No embedded Kit JavaScript is loaded on the website.

## Pending provider setup

1. Numeric form ID10082025 has been supplied. The public hexadecimal UID remains a reference only.
2. Enable confirmation email and disable auto-confirm. Verify actual confirmation lifecycle with an owner-approved test mailbox before enabling public signup.
3. Create a subscriber custom field with key `newsletter_language`; values sent are `en`, `zh`, `zh-cn`, `all`. Verify that Kit stores the chosen value and that recipient filters use it.
4. Configure Kit V4 API key privately in Vercel, never in chat or committed files. Server environment name: `KIT_API_KEY`.
5. Configure Cloudflare Turnstile site/secret for intended website hostnames, preserving existing abuse checks. No secrets go to the client except the public site key.
6. Verify suppression behavior for cancelled/bounced/complained contacts, existing subscribers and duplicate submissions. The server explicitly creates new subscribers inactive and rejects suppressed states before field/form mutations. Form opt-in behavior still depends on verified Kit settings.
7. Verify sender mailbox and Kit sending-domain DNS records independently of Zoho mailbox records. Supplying an address is not delivery verification. Founder confirmed Zoho send/receive on2026-10-22; MAIL_VERIFIED=1. Kit domain authentication remains unverified.

Environment: `KIT_FORM_ID`, `KIT_LANGUAGE_FIELD=newsletter_language`, `KIT_API_KEY`, `KIT_SETUP_VERIFIED=0`, `NEWSLETTER_ENABLED=0`, `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`. Keep setup/enabled flags0 until end-to-end acceptance. `KIT_FORM_UID` is a reference only.

## Server behavior

Kit API V4 server-only requests: POST subscribers with state inactive; PUT language field; POST subscriber to selected form. One8second overall timeout, no redirects, matching subscriber ID/email, accepted states and persisted language checked. No automatic reactivation, raw provider errors or returned subscriber identity exposed. Success means provider acceptance, not confirmation or guaranteed delivery. No digest/broadcast sends are implemented here.

Sources: https://developers.kit.com/api-reference/subscribers/create-a-subscriber ; https://developers.kit.com/api-reference/subscribers/update-a-subscriber ; https://developers.kit.com/api-reference/forms/add-subscriber-to-form ; https://help.kit.com/en/articles/2502655-the-confirmation-email


## Where to get the remaining values

- Kit Settings → Developer → V4 Keys → Add a new key. Name it Token on Air website and save directly in Vercel Production as KIT_API_KEY (sensitive).
- Cloudflare Turnstile → Add widget. Name Token on Air newsletter, Managed mode, hostnames tokenonair.com and www.tokenonair.com, no pre-clearance. Site key → PUBLIC_TURNSTILE_SITE_KEY; Secret key → TURNSTILE_SECRET_KEY (sensitive).
- Vercel: https://vercel.com/lai-jien-wengs-projects/token-on-air → Settings → Environment Variables → Production. Leave both activation flags0 until the real lifecycle test.
- Kit Settings → Email → Verified Sending Domains → tokenonair.com. Add exact provider records in Cloudflare DNS, set CNAMEs DNS-only and Validate. Do not remove Zoho mail records.

Sources checked2026-10-22: https://help.kit.com/en/articles/9902901-kit-api-overview ; https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/ ; https://help.kit.com/en/articles/2502558-verify-your-domain-to-optimize-your-deliverability .


2026-10-22 acceptance update: owner confirms Kit domain verified. An authenticated temporary Vercel deployment accessed the stored API key server-side, verified form10082025, created newsletter_language and invoked the actual subscribe implementation once for owner-authorized hello@tokenonair.com. Provider accepted the request and persisted en. Inbox receipt/confirmation and unsubscribe/suppression remain unverified; public signup flags remain0. Temporary deployment and local bearer artifacts were removed after the check. This was one test signup, not a broadcast.

Owner confirmed receipt and completion of the confirmation link on2026-10-22. Actual inbox delivery and confirmation are now owner-verified. Browser Turnstile and unsubscribe/suppression acceptance remain pending; no second test email was sent.
