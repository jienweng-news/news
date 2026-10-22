# Private discovery and controlled publisher

Implemented local components: bounded RSS/Atom parsing, reviewed-source registry gate, pinned public-IPv4 HTTPS fetching with checked redirects, conditional polling/backoff, 48-hour lookback, durable SQLite queue, five-attempt retry limit, leases, private Dots work-package export, signed-candidate validation, idempotent Sanity create, revision-checked corrections, withdrawal and operator kill switch. No public CMS mutation endpoint exists.

**Current state: disabled, paused, zero enabled sources. No live CMS write or Dots connection has been verified.**

## Deployment boundary

The Astro reader site runs on Vercel. This Node22 worker requires a private durable disk for SQLite, separate secrets and a scheduler. Do not place the database in a Vercel function filesystem. A managed durable queue/database adapter is an alternative that still needs selection and verification; the worker has not been provisioned. Node22's SQLite API is experimental; run the tested Node version and keep backup/restore checks.

Use a private OS user/volume, directory permissions700, files600, and an environment file outside the repository. CLI uses umask077. Never supply SANITY_WRITE_TOKEN or VALIDATION_SECRET to Dots or the public frontend deployment. Sanity Free has no custom draft-only role; the publish token retains residual broad dataset permissions. Limit it to the selected project/dataset using available account roles, verify those permissions live, isolate/rotate it, and keep subscriber/contract records out of Sanity.

Commands, from repository root:

```sh
npm run automation -- status
npm run automation -- inbox
npm run automation -- poll
npm run automation -- export /private/work/job.json
npm run automation -- validate /private/work/candidate.json
npm run automation -- publish JOB_ID /private/work/candidate.json
npm run automation -- correct JOB_ID /private/work/correction.json
npm run automation -- withdraw JOB_ID
npm run automation -- hold JOB_ID
npm run automation -- retry JOB_ID
npm run automation -- release JOB_ID
npm run automation -- backup /private/backups/jobs.sqlite
npm run automation -- prune
```

`export` claims a five-minute job lease and writes discovery data/instructions, never credentials. Dots research must complete within that lease or an operator/worker must reclaim and re-export. An expired lease cannot publish. Long-running Dots scheduling/lease renewal still needs integration; no always-on Dots API or connector is assumed. The CLI reads process environment; source an operator-owned private environment file rather than pasting secrets into shell command arguments. Routine story publication is automatic once the independent verifier and handoff are connected; this does not add founder approval per article.

## Sources and network

Copy the researched registry into private operational configuration. For each source, record its reviewed terms and set `rights_status: reviewed`, `allowed_reuse: metadata-discovery`, `automation_enabled: true` only when permitted. Technical RSS availability is not a republication license. Keep original and resolved feed hosts; redirects to another host are denied until reviewed. Requests require HTTPS, no credentials/custom port/IP-literal destination, public IPv4 DNS answers and TLS hostname validation. DNS addresses are pinned for the connection; IPv6-only origins are currently unsupported. Compressed and decoded responses are bounded2MiB; XML entities/DOCTYPE are rejected. Individual malformed items are skipped, malformed feeds back off15minutes; ordinary polls are at least5minutes plus jitter. No article bodies are stored during discovery.

Poll scheduling is not installed. After acceptance, a private systemd timer or equivalent may call `poll` every minute; per-source due times enforce actual intervals. A separate worker exports queued jobs to the verified Dots tool connection. No social/newsletter distribution is enabled. Monitor source.last_success, last_error and next_poll, plus queued/processing age and held reasons. Keep model/throughput limits in the Dots account; no unlimited capacity is assumed.

## Candidate and independent verifier contract

A candidate JSON object contains:
- `article`: shared section/format/relationship/publishedAt/updatedAt/sources; `translations.en`, `.zh`, `.zhCn`, each with title, ASCII slug, summary, Portable Text body and localized disclosure when commercial; localized correction notes in shared corrections. All three must pass. Images are held until a separately approved asset/rights workflow exists.
- `evidence`:1–20 `{url, quote, contentHash}` entries. URLs must appear in article sources; excerpt length≤1000characters and hash is SHA256 of independently retrieved evidence. Excerpts are private; do not publish the work package or verifier notes.
- `report`: `{hash, checks, verifiedAt, signature}` from the independently controlled verifier. `hash` is SHA256 of canonical sorted-key JSON `{article,evidence}`. `checks` must set sourceRights, primaryEvidence, claimsVerified, translationConsistency, originalWording, duplicateCheck and relationshipVerified true. `signature` is HMAC-SHA256 over canonical `{hash,checks,verifiedAt}` using VALIDATION_SECRET. Maximum report age30minutes. Helper implementations are in automation/publisher.ts.

The writer cannot self-approve those booleans: unsigned, tampered and stale reports fail. A signature authenticates the verifier report; it does **not** prove factual truth by itself. Before activation, implement/connect and independently test a verifier that retrieves permitted primary evidence, verifies quotations/entities/dates/numbers, checks meaningful new developments versus duplicates, checks text overlap and translation terminology, classifies commercial relationships and excludes unsupported high-risk claims. This semantic verifier and its Dots/tool connection remain external integration work; do not sign unconditional pass reports or claim the local structural checks replace it. Deterministic numeric checks are additional safeguards, not translation validation.

Publisher chooses `story.<url fingerprint>` and the configured editor reference. It reconstructs a whitelist of public fields, never accepts arbitrary mutations or IDs, checks slug collisions, serializes publication through the durable queue lock and uses createIfNotExists. A retry after an uncertain write checks the existing content hash before deciding success. A changed payload requires the correction path. Failed validation and uncertain writes enter held state; after inspecting CMS/job evidence and correcting the candidate, an operator can explicitly `release JOB_ID`, then re-export/revalidate. Release resets attempts and is audited; published/withdrawn terminal records cannot be released. Editorial holds are never revived automatically. Exhausted crashed leases also become held. Corrections preserve every published locale slug (renames require a future redirect workflow) and first publication time, require a newer update and dated note, and patch the prior CMS revision. Withdrawals set publicationState=withdrawn; public queries exclude it. Public cache TTL is at most30seconds on currently cached routes; verify withdrawal disappearance after TTL and use the hosting purge control for urgent incidents. No immediate CDN purge is claimed.

## Retention and recovery

Run `prune` daily after operational approval: delete old queued/held metadata after30days; clear completed source payloads after30days while retaining minimal idempotency tombstones; retain audit events180days. Backups inherit those private retention requirements. Make daily SQLite snapshots with `backup`; keep them in access-controlled external storage. Restore into a separate staging volume, run inbox/status and replay/idempotency tests, and measure duration. Never claim the24-hour/4-hour recovery targets without a completed drill.

Kill switch: set AUTOMATION_KILL_SWITCH=1 or AUTOMATION_ENABLED=0 and stop worker/scheduler. This blocks poll/publish/correct/withdraw commands; emergency withdrawal therefore needs a deliberately authorized publisher action or the Sanity operator UI while routine automation remains stopped. Rotate compromised tokens, remove affected content, purge/verify caches, and record the incident. Do not unpause the entire worker just to issue an emergency action; use an isolated operator process with the necessary command scope.
