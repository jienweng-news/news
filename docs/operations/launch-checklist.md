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
- [ ] Real desktop/mobile keyboard/zoom/overflow and consent browser QA. T3 browser setup approved and completed. Initial live desktop/mobile390px overflow and consent decline/reopen checks passed; full keyboard/zoom and opt-in/revocation acceptance remain pending.

## Domains and delivery
- [x] tokenonair.com and www.tokenonair.com resolve to Vercel and previously passed HTTPS checks. www CNAME: d6ca6c9003ff43c3.vercel-dns-017.com.
- [x] Production configuration persisted in Vercel project token-on-air, team lai-jien-wengs-projects; Sanity4k0o7q9m/production, GA4 G-WQMMLS9H2X, Kit form10082025.
- [x] Final deployment dpl_CdsV1Fc9PMNrSXRYsxzXGotjZWWf,2026-10-22: both custom domains pass fresh HTTP checks below.
- [ ] Connect/verify repository-driven Vercel deployment; current release method is local prebuilt CLI deployment. No Git automation acceptance claimed.
- [x] Added .github/workflows/health.yml: public HTTP checks every6hours at minute23 plus manual dispatch, no provider secrets. It becomes scheduled only after merge to the default branch; activation has not occurred.
- [ ] Configure provider usage alerts and confirm GitHub scheduled runs after merge.
- [ ] Perform recorded rollback and private backup/restore drill. No production rollback or CMS restore has been attempted.

## Kit newsletter — owner setup required
- [x] Form numeric ID10082025 and public UID17c6e3f357 recorded.
- [x] Owner confirms confirmation email enabled and Auto-confirm unchecked. Test receipt and confirmation completed; unsubscribe/suppression acceptance remains pending.
- [x] Credentials present in Vercel Production (existence verified; sensitive values are not exportable). Kit Settings → Developer → V4 Keys → Add a new key; save as KIT_API_KEY in Vercel Production, sensitive. Never paste it into chat.
- [x] Turnstile site/secret variables present in Vercel Production (hostname/token acceptance still pending). Cloudflare Turnstile → Add widget, Managed, tokenonair.com and www.tokenonair.com, pre-clearance off; save Site key as PUBLIC_TURNSTILE_SITE_KEY and Secret key as TURNSTILE_SECRET_KEY (sensitive) in Vercel Production.
- [x] Kit V4 accepted the saved API key; form10082025 exists; created and verified custom field newsletter_language on2026-10-22 through an authenticated temporary Vercel check.
- [x] Owner confirms Kit sending domain verified on2026-10-22; public DMARC and Kit DKIM selector resolve. Actual inbox delivery remains separate acceptance.
- [ ] Complete mailing address/footer settings in Kit with the operator's actual details; no address invented.
- [ ] Authorized test: Kit accepted one signup for hello@tokenonair.com using the actual server signup implementation, with en persisted to newsletter_language. Owner confirmed inbox receipt and clicked confirmation on2026-10-22. Unsubscribe/suppression and browser Turnstile acceptance remain pending. No broadcast sent.
- [ ] Only after acceptance set KIT_SETUP_VERIFIED=1 and NEWSLETTER_ENABLED=1, redeploy and smoke-test live. Until then signup returns unavailable, never false success.
- [ ] Digest scheduling/content template: intentionally deferred until publication is stable; no campaign sent.

## Email DNS
- [x] Public MX resolves to mx.zoho.com / mx2.zoho.com / mx3.zoho.com; SPF includes zohomail.com (2026-10-22).
- [ ] Zoho DKIM: verify using the selector supplied by Zoho; selector not supplied here.
- [x] DMARC now resolves to v=DMARC1; p=none on2026-10-22. Kit cka._domainkey selector also resolves. These records do not prove real sender alignment or Kit dashboard verification.
- [x] Kit domain verified per owner; public DKIM/DMARC records present.

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
- Latest npm audit after targeted uuid11.1.1 override:14 inherited advisories (10high,4moderate,0critical); UUID advisory removed. Remaining roots include unpatched braces/sprintf-js in Studio/CLI paths. npm ls and TypeID roundtrip pass; Studio rebuild and full tests pass. Counts/severity propagation changed after re-audit; no major CMS downgrade applied. Dependency disposition remains a gate.
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


## News discovery follow-on
- [x] Implemented archive12/page, separate AI/Crypto RSS, actual author pages and related stories for all three editions. See news-feature-audit.md for the feature inventory and prioritized backlog.
- [x] Temporary Kit setup deployment dpl_FSkpicXqAHqbLSKX5Tvg5zrBebzV used saved credentials without export, created the language field and accepted the single authorized confirmation test. Expiring bearer guard; public domains were not promoted. Deployment removal confirmed by Vercel; local auth/config artifacts deleted.
- [x] Follow-on deployment dpl_9wktTR1nPgBxCcWUjLYHf7FdTvcX at https://token-on-j91ztu62h-lai-jien-wengs-projects.vercel.app. Both custom hosts pass scripts/check-live-discovery.mjs: new navigation/archive/feed/sitemap routes, invalid archive404, canonical first-page redirect, missing-author404 and health.
- [x]120 tests pass; Astro check61files zero errors/warnings/hints; worker/client checks, Studio build, Node/Vercel builds and local HTTP smoke pass.
- [x] Fresh review found no Critical/Important issue and one minor archive locale-context issue; fixed via RED/GREEN under resolve-all request. Post-deploy checks then caught Vercel streaming status issue on archive404; moved status/data loading into route frontmatter and verified live RED→GREEN. No deferred review minors.
