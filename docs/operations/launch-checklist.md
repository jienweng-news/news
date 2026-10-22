# Token on Air launch checklist

Updated 2026-10-22. This distinguishes a deployed reader site from an operational publication. Do not mark external acceptance complete merely because code/tests pass.

## Reader website
- [x] Astro/Sanity reader site, approved Persona visual direction, full-width masthead/newsletter/footer.
- [x] English, Traditional Chinese and Simplified Chinese routes, edition selection, search, RSS, sitemap and canonical links.
- [x] Custom newsletter form and accessible native language dropdown; no Kit embed dependency.
- [x] Consent code: floating first-visit card, equal allow/decline controls, native preferences dialog and footer reopening. Basic GA4 remains unloaded before opt-in; withdrawal stops events and clears applicable GA cookies.
- [x] About, editorial policy, contact, advertising, privacy, terms and disclaimer pages. Privacy includes Bahasa Malaysia text; this does not add a Malay news edition.
- [x] Public contact hello@tokenonair.com: owner confirms Zoho send/receive works, 2026-10-22. MAIL_VERIFIED=1 in Vercel Production.
- [ ] Final policy/operator review: confirm legal operating identity and actual provider retention settings. Pages describe supplied facts, not a claim of legal certification.
- [ ] Real desktop/mobile keyboard/zoom/overflow and consent browser QA. T3 preview is blocked by host AppArmor; HTTP and script tests are separate evidence.

## Domains and delivery
- [x] tokenonair.com and www.tokenonair.com resolve to Vercel and previously passed HTTPS checks. www CNAME: d6ca6c9003ff43c3.vercel-dns-017.com.
- [x] Production configuration persisted in Vercel project token-on-air, team lai-jien-wengs-projects; Sanity4k0o7q9m/production, GA4 G-WQMMLS9H2X, Kit form10082025.
- [x] Final deployment dpl_CdsV1Fc9PMNrSXRYsxzXGotjZWWf,2026-10-22: both custom domains pass fresh HTTP checks below.
- [ ] Connect/verify repository-driven Vercel deployment; current release method is local prebuilt CLI deployment. No Git automation acceptance claimed.
- [ ] Configure an external uptime monitor for /api/health and provider usage alerts. No monitoring service account supplied.
- [ ] Perform recorded rollback and private backup/restore drill. No production rollback or CMS restore has been attempted.

## Kit newsletter — owner setup required
- [x] Form numeric ID10082025 and public UID17c6e3f357 recorded.
- [x] Owner confirms confirmation email enabled and Auto-confirm unchecked. Real lifecycle test remains pending.
- [ ] Kit Settings → Developer → V4 Keys → Add a new key; save as KIT_API_KEY in Vercel Production, sensitive. Never paste it into chat.
- [ ] Cloudflare Turnstile → Add widget, Managed, tokenonair.com and www.tokenonair.com, pre-clearance off; save Site key as PUBLIC_TURNSTILE_SITE_KEY and Secret key as TURNSTILE_SECRET_KEY (sensitive) in Vercel Production.
- [ ] Create/verify Kit custom field key newsletter_language. Existing implementation accepts en, zh, zh-cn, all. No live field verification yet.
- [ ] Kit Settings → Email → Verified Sending Domains: verify tokenonair.com with exact Kit-provided DNS records in Cloudflare; CNAMEs DNS only. Keep Zoho MX/SPF intact. Set sender hello@tokenonair.com and verify sender address.
- [ ] Complete mailing address/footer settings in Kit with the operator's actual details; no address invented.
- [ ] Authorized test inbox: submit custom form, receive confirmation, confirm, verify selected language, unsubscribe, then ensure suppressed contact is not reactivated. Also reject invalid/replayed Turnstile tokens.
- [ ] Only after acceptance set KIT_SETUP_VERIFIED=1 and NEWSLETTER_ENABLED=1, redeploy and smoke-test live. Until then signup returns unavailable, never false success.
- [ ] Digest scheduling/content template: intentionally deferred until publication is stable; no campaign sent.

## Email DNS
- [x] Public MX resolves to mx.zoho.com / mx2.zoho.com / mx3.zoho.com; SPF includes zohomail.com (2026-10-22).
- [ ] Zoho DKIM: verify using the selector supplied by Zoho; selector not supplied here.
- [ ] DMARC: _dmarc.tokenonair.com returned ENOTFOUND on 2026-10-22. Add the provider-guided record after checking sender alignment; avoid inventing reporting inboxes or replacing an existing policy.
- [ ] Kit sender authentication: pending owner setup above.

## Analytics
- [x] G-WQMMLS9H2X configured, URL query/fragment removed from custom events, ad signals disabled, consent behavior unit tested.
- [ ] In GA4 verify property ownership; review data retention and disable enhanced measurement that could collect form/search contents or duplicate custom events.
- [ ] Verify one real pageview after opt-in and no Google request before opt-in; test decline, reopening and revocation; verify accepted signup only after Kit is active. Requires browser/property access.

## Newsroom and 24/7 publishing
- [x] Sanity public dataset reads work; honest empty states when no articles exist.
- [x] Private queue, source registry, duplicate detection, publish/correct/withdraw commands and independent signed-validation gate implemented and locally tested.
- [ ] Sanity editor record for jienweng, deployed/private Studio access and scoped worker write credential.
- [ ] First original, source-attributed multilingual stories with licensed media. No inventory fabricated to fill the design.
- [ ] Live publication → correction → withdrawal checked in pages/search/RSS/sitemap after cache TTL.
- [ ] Dots connection: owner has only the ChatGPT app interface; no server API/webhook was supplied. This is not a verified 24/7 backend. Choose a supported callable integration or an explicit manual handoff before connecting it.
- [ ] Independent semantic verifier, source permissions/terms review, and durable private worker hosting/scheduler. All source polling and publishing remain disabled.
- [ ] Backup/restore, restart/replay/duplicate-prevention and kill-switch drills on real hosting.

## Verification record
- Consent RED: four new/updated test failures before implementation; GREEN: six analytics-client tests and113 total tests pass.
- Terms/disclaimer RED: built HTTP smoke returned404; GREEN: all new routes return200 in built local smoke.
- Browser: preview_open failed explicitly with AppArmor sandbox error. No visual/browser acceptance claimed.
- Public DNS: Zoho MX/SPF and www CNAME verified; DMARC absent as above.
- Node build, Astro check (56files, no errors/warnings/hints), automation/client checks, Studio build and built HTTP smoke pass.
- Fresh public Sanity count:0 published article documents.
- npm audit:16 inherited transitive advisories (7high,9moderate,0critical), concentrated in Sanity Studio/CLI dependencies. Suggested fix is a Sanity major downgrade, not applied blindly. Dependency disposition remains a launch gate.
- Final fresh review (GPT-6-astra): one Important analytics withdrawal/storage-write defect fixed with failing-then-passing regression; no Critical/Minor findings. Final suite114/114; analytics7/7.
- Vercel production deployment: dpl_CdsV1Fc9PMNrSXRYsxzXGotjZWWf, https://token-on-gtg6bcd90-lai-jien-wengs-projects.vercel.app; public aliases https://tokenonair.com and https://www.tokenonair.com.
- Fresh live checks passed on both hosts: HTTPS root redirect, all three homepages, terms/disclaimer/privacy/contact pages, public contact mailto, Malay privacy section, consent markup/latest script, RSS, sitemap, health, and disabled signup503 with accepted:false. No subscriber created or mail sent.
- Project Node version aligned to22.x; function output is nodejs22.x. Secrets/activation flags were not enabled by the deployment.

## Execution decisions and limits
- Subsequent owner choices supersede stale original spec wording: retain three locales and existing deployment. Reversing this choice would require scope changes.
- Finish accessible work without inventing account acceptance or publisher identity; activation stays gated.
- Publish owner-confirmed Zoho address; a mistaken owner confirmation would require correcting contact delivery.
- Include Malay privacy text, not a fourth news edition, based on Malaysian regulator guidance; owner/legal language review remains needed. Reference: https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2025/01/A-Quick-Guide-to-PRIVACY-NOTICE.pdf .
- Reviewer exclusions remain gates: real browser keyboard/zoom/cookies; GA event delivery/settings/retention; Kit confirmation/suppression/sender; legal sufficiency/operator identity; autonomous Dots publishing. CLI/HTTP verifies deployment endpoints but does not establish these external behaviors.
- Failed browser-storage writes retain denial in the current page without a reload into an old grant. Persistence across later navigation is not guaranteed if the browser refuses storage writes.
- No deferred review minors. Impeccable regex scan found0 anti-patterns and37 design-token advisories; parsed visual checks did not run. Existing sidecar drift was not repaired as an unrelated change.
