# Cloudflare Workers + D1 publisher

The website stays on Vercel; this separate Worker replaces the need for a paid Railway host. Cloudflare Free is the target. No automatic upgrade or paid fallback is configured. This is a publication backend, not an AI model: Dots/generation and independent semantic verification still need actual authenticated tool connectivity.

## Implemented boundaries

- D1 stores feed metadata/jobs, source checkpoints, owner-fenced job leases and a serialized publisher lock. Metadata is private, not published through Sanity.
- Cron polls one reviewed due feed each minute; per-source minimum interval5minutes. With25 continuously due sources a sweep takes at least25minutes, not5minutes per source. Daily pruning runs00:07UTC. Paused cron performs no database writes or external requests.
- Conservative free-runtime budget: feed response at most64KiB,50fresh items, three redirects and10seconds network timeout. Oversized feeds fail explicitly and back off15minutes. Large original sources may need smaller official feeds or another bounded ingestion strategy; they are not silently truncated.
- Only destinations in the committed source registry may be fetched. Same registered-host redirect checks apply. Unlike the private Node fetcher, this runtime does not pin DNS addresses; no arbitrary URL-fetch endpoint is exposed.
- Feed inserts use one atomic JSON-table insert, keeping50-item batches below D1 Free's per-invocation query limit. Durable locale/slug reservations belong to one job even after uncertain writes or withdrawal; do not remove reservations solely because a CMS call timed out.
- Initial imports use real site publication time plus separate sourcePublishedAt/discoveredAt/importedAt provenance. Corrections preserve source provenance/site date/slugs and use CMS revisions. Unknown remote outcomes are replayed against CMS identity/hash, never blind duplication.
- Bearer-only API, no cookies/CORS, reject browser Origin on mutations. Limit JSON bodies64KiB and CMS responses256KiB. No secrets, evidence or raw provider errors in public health/logs.
- All migrations seed disabled/unreviewed sources; both global flags start paused. No verifier or live CMS acceptance is implied by deployment.

## Free plan constraints

Workers Free currently has100krequests/day and10msCPU per invocation. D1 Free has5million rows read/day,100krows written/day and5GB aggregate storage. Cron entries share the account limit. Network wait is not CPU work, but XML parsing and validation are; local workerd tests cannot certify production CPU compliance. Start paused, measure real CPU with a small reviewed source/candidate and keep the free plan. If it exceeds limits, reduce batch/input size or stop; do not upgrade silently. Indexes also consume written-row quota. Existing account workloads share allowances.

Sources verified2026-10-23:
https://developers.cloudflare.com/workers/platform/limits/
https://developers.cloudflare.com/workers/platform/pricing/
https://developers.cloudflare.com/d1/platform/pricing/
https://developers.cloudflare.com/workers/configuration/cron-triggers/

## Local verification

From repository root:

    npm ci
    npm test
    npm run check:worker
    npm run verify:worker
    npm run dev:worker

verify:worker builds with Wrangler and executes the bundled Worker in real workerd with Miniflare/D1: migrations/defaults, paused cron, bearer authentication, restart persistence, concurrent claim ownership, signed publication/replay, source/site dates, correction and withdrawal. Sanity traffic is intercepted locally; no content or email is sent. The Miniflare5 compatibility converter does not retain legacy d1Persist, so the smoke explicitly supplies resourcePersistencePath and recreates the runtime to prove persistence.

## Account setup and paused deployment

1. Sign in, without exposing tokens:

       npx wrangler login --device --browser=false --scopes account:read user:read workers:write workers_scripts:write d1:write workers_tail:read
       npx wrangler whoami

2. In the intended account, verify Workers Free and D1 Free; do not upgrade. If multiple accounts are listed, select the owner-confirmed account via CLOUDFLARE_ACCOUNT_ID in your private environment. Create the database:

       npx wrangler d1 create token-on-air-news

3. For a new account, replace account_id/database_id in workers/news/wrangler.jsonc with the actual returned IDs. The current configuration points to the owner-authorized live resources recorded below. Apply migrations only to the dedicated database:

       npx wrangler d1 migrations apply DB --remote --config workers/news/wrangler.jsonc
       npx wrangler deploy --config workers/news/wrangler.jsonc

4. Keep AUTOMATION_ENABLED=0 and AUTOMATION_KILL_SWITCH=1. Verify public /health200 and missing credentials401/503 on protected endpoints. Record actual URL/version/account ID, never secret values. Worker secrets are set through the dashboard or interactive prompts (not command arguments):

       npx wrangler secret put ADMIN_TOKEN --config workers/news/wrangler.jsonc
       npx wrangler secret put WRITER_TOKEN --config workers/news/wrangler.jsonc
       npx wrangler secret put SANITY_WRITE_TOKEN --config workers/news/wrangler.jsonc
       npx wrangler secret put VALIDATION_SECRET --config workers/news/wrangler.jsonc

Use different high-entropy32+character admin and writer credentials. VALIDATION_SECRET is shared only with an independently controlled verifier, never the writer/Dots. SANITY_WRITE_TOKEN stays only on this publishing Worker, not Vercel frontend. Set SANITY_EDITOR_ID to the verified jienweng author document; do not invent its ID. This backend only targets4k0o7q9m/production.

## API contract

All responses no-store. Authorization: Bearer credential. POST requires application/json and no Origin header; do not embed credentials in client JavaScript. Configure a server-side tool/connector for Dots and test reachability before scheduling.

- GET /health: public liveness only; does not prove CMS readiness.
- GET /v1/status: admin; counts and per-source checkpoint/error state, no content/secrets.
- POST /v1/jobs/claim {}: writer; one jobId, leaseToken, leaseUntil, untrusted metadata item and instructions, or {job:null}. Five-minute leases, max5attempts. A signed report does not remove the lease requirement.
- POST /v1/jobs/<64hexid>/publish {leaseToken,candidate}: writer; candidate is the article/evidence/independent report contract in automation.md. Wrong/stale owners cannot change another claim; invalid owned candidates held. Successful replay requires matching content hash and a fresh verifier report.
- POST /v1/jobs/<id>/correct {candidate}: admin; preserve stored publishedAt/slugs, newer updatedAt, dated correction. Signed verifier contract applies. CMS revision guards and hash replay recovery.
- POST /v1/jobs/<id>/withdraw {}: admin; CMS withdrawal then D1 tombstone. Retry reconciles uncertain remote outcomes; no resurrection.
- POST /v1/jobs/<id>/release {}: admin; held jobs only; inspect CMS before release after ambiguous writes.

Status401 unauthorized,403browser origin,409state/lease/conflict,413oversize,415content type,422candidate invalid,503paused/unconfigured,502provider/runtime failure. No generation endpoint or unconditional verification signer exists.

## Activation and recovery

Review reuse terms individually, then enable only the reviewed source rows using authenticated D1 administration. Do not bulk-enable the research inventory. Independently verify Sanity scope, author record, evidence quality, translation and overlap checks; verify Dots/tool reachability without sharing CMS/verifier credentials. Run a small authorized original backfill batch and live publish/correct/withdraw/cache checks before unattended operation. Enable flags only after acceptance; redeploying committed defaults pauses the worker again.

D1 idempotency tombstones remain; queued/held metadata30days, audit180days. Keep account-controlled exports and test restoring to a separate database; no completed backup drill is claimed. Use Cloudflare D1 Time Travel/export features according to the actual account's free retention limits. For incident response pause both flags and stop the scheduled task. No immediate CDN purge is implemented here; reader TTL remains30seconds where cached.

## Verification record — 2026-10-23

Initial134unit tests and Worker/Node typechecks pass. Actual bundled workerd+D1 smoke passes, including restart persistence and signed CMS lifecycle with intercepted outbound requests. Runtime smoke caught Workers rejecting redirect:error; corrected to manual redirects with refusal. Account login attempted at owner's request; embedded Cloudflare device verification returned403, and authorization expired without completion. No live D1/Worker/account plan change or CMS write is claimed. Deployment ID remains the explicit all-zero placeholder until actual account provisioning.

Final review found two issues:50 individual enqueue calls exceeded the free invocation query budget, and an unknown remote outcome could release serialization before a delayed commit. Both have RED/GREEN regressions; atomic bulk insertion and durable per-job slug reservations fix them. Reservations intentionally survive failed jobs/withdrawals; inspect CMS state before any manual cleanup.


## Live paused deployment — 2026-10-23

- Account:0a331a6d9344739d7031cce3d413fd96; selected automatically because OAuth lists exactly one account.
- D1:token-on-air-news, c8711b3a-a05f-4df4-b6dc-078ffefd4ae0, APAC; migrations0001/0002/0003 applied successfully. Existing unrelated my-hub database was not modified.
- Worker:https://token-on-air-news.reallyhat.workers.dev ; original version05be53bc-d5f7-405f-aec1-e2ac9e510fd4, active secret-update version d84660e8-7e6e-4731-a079-715ade8a58b5.
- Device authorization subsequently succeeded. No paid subscription, upgrade or billing write performed. OAuth deliberately lacks billing-read permission, so existing account subscription labels could not be independently queried; confirm the actual Free plan in the owner dashboard before enabling workloads. No free-throughput/CPU acceptance is claimed from paused checks.
- Separate high-entropy admin/writer secrets installed. Local service credentials retained only in ignored .private/cloudflare/service-credentials.json, mode600 under directory700; never in Git/chat/frontend. Sanity write and independent verifier secrets are not installed.
- Fresh live checks via curl:health200/no-store, unauthenticated status401, writer-to-admin status401, admin status200 with enabled:false/zerojobs/25disabledsources, authenticated claim503 while paused. Plain Python urllib was blocked by Cloudflare1010; curl succeeded. No secret values printed.
-136unit tests, Worker/Node typechecks, Astro62files without diagnostics, Node build/local HTTP smoke and real workerd+D1 smoke pass. Runtime smoke includes50-item scheduled RSS ingestion/deduplication; local CMS entirely intercepted. Fresh review's P1/P2 findings both fixed with RED/GREEN regressions.
- Still required:owner sets SANITY_WRITE_TOKEN privately in Worker settings, verified jienweng editor reference, independent verifier connection, actual Dots reachability/credential handoff, reviewed sources, production CPU measurements, original content and lifecycle/backfill acceptance. Automation remains disabled and kill switch enabled.
