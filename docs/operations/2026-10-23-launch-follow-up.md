# Launch follow-up — 2026-10-23

Cloudflare Workers Free confirmed by owner. No upgrade/purchase performed. Actual CPU/quota dashboard telemetry remains unverified.

## News and monitoring

Three articles remain published, no held or processing jobs at the initial follow-up check, three dedicated services healthy, coordinator enabled and no persistent safety pause. Run history since launch includes3published,20idle and one earlier transient failed run; subsequent ticks succeeded. Current source cache546leads. Fresh diagnostics: Google AI and Grenade feed requests returned200 and robots allow their feed URLs; The Decoder robots disallows the feed, so the collector refuses it. This is not a claim that every feed poll succeeds.

Read-only launch monitoring is scheduled every6hours for48hours. Next first run2026-10-23T15:46:54.352Z/23:46MYT. Deadline2026-10-25T09:46:54.352Z; final run checks health then disables only that task. Task ID `scheduled-task:command:mcp:f97c50d8-bf07-42fa-9c0b-055499b5baf6:schedule-task:toa-launch-monitor-20261023`. Existing daily encrypted backup task remains separate and unchanged. Monitoring reports errors, held work, canonical-source duplicates, reader/feeds and backup ages without changing publication controls or sending mail. T3 availability is required for these scheduled reports.

Second source review covered17candidates. Four additional automated-collection restrictions now hold Blockworks, The Block, CoinDesk and Decrypt; actual host policy rebuilt. Five primary publication inputs remain,13additional metadata monitors,seven held overall. No additional publication permission invented. See source-review.md and machine-readable expansion report.

## Newsletter acceptance

Owner confirms actual postal address/footer configured privately in Kit. Stored API key/form10082025/language field are reachable server-side. API currently reports hello@tokenonair.com inactive, despite the earlier owner-reported confirmation click. A new owner-authorized confirmation request was accepted once by the actual subscribe implementation; this does not prove a fresh email was delivered. No repeated retry, broadcast, deleted subscriber or forced confirmation.

Turnstile client rendered on tokenonair.com; human attempt in T3 preview failed600010 (generic challenge failure). Separately, server Siteverify rejected the stored production secret with invalid-input-secret. Existing Cloudflare CLI login cannot manage Turnstile (authentication error on widget API). Owner asked to replace TURNSTILE_SECRET_KEY privately in Vercel from the matching Cloudflare widget Secret key. Do not expose keys or solve/bypass a CAPTCHA. Production signup remains disabled pending a valid secret, actual verification and lifecycle/suppression acceptance.

Temporary acceptance deployments are authenticated, fixed-action server-side checks using existing production secrets; neither custom-domain reader was promoted to them. No token or private provider data is committed. Both temporary deployments were removed after checks. The default project alias was restored to the existing reader deployment; custom domains still serve that verified reader. Local temporary bearer files were removed.

## GA4 acceptance

Real incognito production browser: zero Google requests before opt-in; one page_view collection request returned204 after explicit opt-in for G-WQMMLS9H2X. Page location/referrer were sanitized and advertising storage/signals disabled. Withdrawing through the actual privacy dialog reloaded the page; fresh document had zero Google requests and no GA cookies. One transient browser context cookie-access error occurred during reload; fresh navigation passed. This proves browser consent/request behavior, not GA4 property reporting, enhanced-measurement configuration or retention settings.

## Verification

Four source-policy regressions were observed failing before holds, then passed. Host runtime confirms18monitors/5publicationinputs/7held; latest tick idle, no safety pause. Full suite184tests/26files passed. Runtime host policy and health checked; automation/Worker typechecks run separately. No product frontend changes were needed for these operational checks.

Final public check10:03UTC: reader health200, Worker enabled, exactly3published jobs and5enabled publication sources. All3language feeds returned200 with3items each. Public signup remains disabled; no activation flag or key was guessed.
