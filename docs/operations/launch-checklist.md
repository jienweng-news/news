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
- [ ] Record final deployment and fresh HTTP verification below.
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
- Terms/disclaimer RED: built HTTP smoke returned404; GREEN record added after final check.
- Browser: preview_open failed explicitly with AppArmor sandbox error. No visual/browser acceptance claimed.
- Public DNS: Zoho MX/SPF and www CNAME verified; DMARC absent as above.
- Final build/review/deployment evidence: pending this execution.
