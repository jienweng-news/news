# Kit signup connection

Founder selected Kit with the website's own newsletter design. Public embed reference:
`https://token-on-air.kit.com/17c6e3f357/index.js`, UID `17c6e3f357`.
Sender/contact address supplied by founder: `hello@tokenonair.com`.
Neither embed availability, confirmation settings nor sender delivery/authentication has been verified. Public script fetch returned a403 Cloudflare verification page. No embedded Kit JavaScript is loaded on the website.

## Pending provider setup

1. Obtain numeric form ID from Kit form editor URL or authenticated forms API; the public hexadecimal UID cannot be passed as the API form ID.
2. Enable confirmation email and disable auto-confirm. Verify actual confirmation lifecycle with an owner-approved test mailbox before enabling public signup.
3. Create a subscriber custom field with key `newsletter_language`; values sent are `en`, `zh`, `zh-cn`, `all`. Verify that Kit stores the chosen value and that recipient filters use it.
4. Configure Kit V4 API key privately in Vercel, never in chat or committed files. Server environment name: `KIT_API_KEY`.
5. Configure Cloudflare Turnstile site/secret for intended website hostnames, preserving existing abuse checks. No secrets go to the client except the public site key.
6. Verify suppression behavior for cancelled/bounced/complained contacts, existing subscribers and duplicate submissions. The server explicitly creates new subscribers inactive and rejects suppressed states before field/form mutations. Form opt-in behavior still depends on verified Kit settings.
7. Verify sender mailbox and Kit sending-domain DNS records independently of Zoho mailbox records. Supplying an address is not delivery verification. `MAIL_VERIFIED=0` remains until verified.

Environment: `KIT_FORM_ID`, `KIT_LANGUAGE_FIELD=newsletter_language`, `KIT_API_KEY`, `KIT_SETUP_VERIFIED=0`, `NEWSLETTER_ENABLED=0`, `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`. Keep setup/enabled flags0 until end-to-end acceptance. `KIT_FORM_UID` is a reference only.

## Server behavior

Kit API V4 server-only requests: POST subscribers with state inactive; PUT language field; POST subscriber to selected form. One8second overall timeout, no redirects, matching subscriber ID/email, accepted states and persisted language checked. No automatic reactivation, raw provider errors or returned subscriber identity exposed. Success means provider acceptance, not confirmation or guaranteed delivery. No digest/broadcast sends are implemented here.

Sources: https://developers.kit.com/api-reference/subscribers/create-a-subscriber ; https://developers.kit.com/api-reference/subscribers/update-a-subscriber ; https://developers.kit.com/api-reference/forms/add-subscriber-to-form ; https://help.kit.com/en/articles/2502655-the-confirmation-email
