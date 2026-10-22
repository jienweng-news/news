# Launch readiness and service acceptance

Local implementation is not production activation. Run `npm run preflight` for redacted missing-config checks; `-- --require-ready` exits nonzero unless all operator attestations are set. Attestations document evidence; setting a flag is not evidence itself.

## Reader site

Routes: `/en/`, `/zh/` (Traditional), `/zh-cn/` (Simplified), each with AI/Crypto sections, article detail, search, RSS, About, editorial policy, privacy, Contact and Advertise. Root307 honors saved language, then trusted Vercel country(CN→Simplified, TW/HK/MO→Traditional), otherwise English. Root is private/no-store; explicit locale URLs are never region-redirected. Legacy English URLs redirect temporarily. Article alternate links use actual edition slugs; one document validates all three copies. Legacy English-only records remain English-only. Article bodies, dates, evidence, disclosures and corrections are rendered server-side.

Public homepage/article/feed/sitemap TTL30seconds where enabled; search/preview/errors remain no-store. Sanity public client bypasses its CDN for fresh origin data. This provides bounded refresh rather than an unverified publish webhook. Test corrections and withdrawals after TTL; hosting purge remains an operator action. No live CDN measurements or propagation guarantee is asserted.

## Account setup still needed

1. Sanity: project `4k0o7q9m` / dataset `production` configured; public reads verified with0published articles (see service-configuration.md). Still verify editor reference for jienweng, verified public published reads and isolated write token. Configure Studio, publish a test multilingual story in staging, correct it with notes, withdraw it, and verify pages/search/feed/sitemap. One article document stores all editions; validate actual document byte/attribute limits with representative long copy.
2. Vercel: import repository with the frontend workspace as project root (including workspace sources outside it), use the workspace install/build settings and verify the generated `.vercel/output` directory, APP_ENV=production, CONTENT_MODE=sanity, SITE_URL=https://tokenonair.com, VERCEL=1 through the deployment environment. Confirm adapter output/config against the selected project settings; commercial usage requires suitable hosting terms. No plan purchase/deployment performed. Connect DNS/TLS only after staging verification. Keep write/validation secrets on private worker only.
3. beehiiv: confirm Free API entitlement, create language custom field, configure sender authentication, verify double opt-in/suppression/export with test contacts. Set BEEHIIV_SETUP_VERIFIED=1 only after those checks. Add Turnstile site/secret keys and hostname allowlist, then enable signup. Provider requests explicitly use double_opt_override=on, reactivate_existing=false, send_welcome_email=false. Digest sending remains deferred. No live send has been performed.
4. GA4: founder supplied `G-WQMMLS9H2X`, now configured in environment examples and local settings. Property ownership and event delivery remain unverified. Disable enhanced measurement/form/search/outbound capture that could duplicate the custom events or collect query/form content. Validate consent accept/decline/revocation, one pageview and allowed commercial/signup events in a staging production-config test; filter test traffic. Basic consent implementation makes no Google request before opt-in. Ad storage/signals/personalization are disabled. Page location omits query/fragment and referrer is reduced to origin. No live event has been verified.
5. Zoho: founder handles account/domain verification, region-specific MX/SPF/DKIM, DMARC and authorized delivery tests. Set PUBLIC_CONTACT_EMAIL and MAIL_VERIFIED only after delivery works. No public email address is invented while setup is pending.
6. Private worker: follow automation.md. Provision durable private storage/scheduling, review source terms, connect Dots and independent semantic verifier; test restarts/replay/kill switch/quotas. Source polling and publishing are off by default.

## Local and CI verification

```sh
npm ci
npm test
npm run check
npm run check:automation
npm run check:client
npm run build
npm run verify:local
SANITY_PROJECT_ID=testproject SANITY_DATASET=production npm run build --workspace studio
npm run preflight
```

CI runs tests/checks/builds plus built public/private/locale HTTP checks, without live credentials. `verify:local` creates ephemeral loopback preview secrets; it does not send mail or write CMS data. `check-newsroom-states` uses an in-memory Sanity double only within a child process, checking empty200, outage503/noindex/no-store, media attribution and sponsorship labels. Add real browser measurements separately; AppArmor currently blocks the collaborative browser.

Health: `/api/health` reports reader-service content availability with no credential/project identifiers, no-store/noindex; a CMS outage gives503. Set a monitor after deployment. Monitor publish queue ages, source errors, signup failures, CMS quotas and Vercel usage; arrange provider warning thresholds around70%/85% when supported. Health success does not imply Dots, email or analytics is operational.

## Backup, rollback and release gates

Export Sanity dataset and licensed assets to private external storage using authenticated Sanity tooling; restore into a separate staging dataset and measure lost-data window and restore time. Back up private SQLite via its backup command, then restore to an isolated volume and prove no duplicate publication on replay. Target24hours maximum loss /4hours restore is unverified until drilled. Exporting credentials or protected publisher notes into public documents is forbidden.

Before launch: verify real About/contact/ownership facts and policy retention; original licensed inventory and three-language quality; publishing/correction/withdrawal→page/search/RSS/sitemap; signup→confirmation→unsubscribe/suppression; analytics consent and events; browser keyboard/mobile/overflow; compressed JS≤100kB CSS≤50kB hero≤200kB; fixed-profile mobile lab LCP≤2.5s CLS≤0.1 TBT≤200ms, three runs per template. These are targets, not measured results. Record tested commit, URLs, raw reports and accepted exceptions.

Use Vercel's existing deployment rollback control to restore the last verified commit and inspect health/pages; verify that content corrections/withdrawals remain safe across rollback. No rollback deployment or CDN purge has been attempted here. Launch requires recorded evidence and owner signoff, not flags alone.

Dependency audit: inherited Studio/CLI transitive packages have unresolved upstream advisories, including packages with no patched release at verification. Compatible path-to-regexp/js-yaml/smol-toml overrides reduce known exposures; preserve pinned Astro/Sanity versions. Do not force-downgrade the CMS/adapter based on npm audit's suggested major-version changes. Keep Studio/worker private and record remaining advisory disposition before production. CI syntax checks do not establish exploitability or clearance.

Primary implementation references checked2026-10-22: https://developers.beehiiv.com/api-reference/subscriptions/create ; https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ ; https://developers.google.com/tag-platform/security/guides/consent ; https://docs.astro.build/en/guides/integrations-guide/vercel/ .

Final review fixes: omitted localized bodies/disclosures now fail closed; locale copies cannot override shared metadata; Studio/publisher share legacy-aware slug checks; corrections preserve existing locale URLs; held jobs have explicit audited release and exhausted leases hold; all analytics events/config use sanitized URL/referrer context. Browser a11y labels that remain English in Chinese editions are a deferred minor.
