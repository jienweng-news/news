# Cloudflare publisher implementation plan

> Use superpowers:executing-plans; native implementation with one fresh-context review at completion.

**Goal:** Locally runnable free-tier Workers+D1 backend, deployable paused after account authentication.
**Architecture:** D1 jobs and per-source scheduling, Worker cron, bearer API, existing signed article validation, fixed Sanity target.
**Tech Stack:** TypeScript, Workers nodejs_compat, D1, Wrangler/Miniflare, Vitest.
**Spec:** docs/superpowers/specs/2026-10-23-cloudflare-publisher.md

## Global constraints
No paid plan, no secrets in code/chat, no public CMS mutations, no unconditional verifier passes. Existing public website unchanged. Preserve Node worker. Default pause and zero enabled sources. Owner-token fencing, bounded requests and replay recovery required.

### Task 1: Durable D1 jobs
Files: workers/news/migrations/0001.sql, workers/news/store.ts, tests/cloudflare-store.test.ts, package configuration.
Interfaces: D1Store enqueue, claim, owned, hold, published, lock, unlock, status; lease token per claim. SQL migrations shared by unit and real runtime checks.
- [ ] Write failing state tests (duplicate/restart, concurrent/expired claim, exhausted retry hold, stale-owner fence, publisher lock).
- [ ] Run tests: Expected RED missing implementation.
- [ ] Implement minimal indexed D1 schema/store; add pinned Wrangler/types.
- [ ] Run tests: Expected GREEN state transitions and lease ownership.
- [ ] Commit task.

### Task 2: Scheduled Worker and guarded Sanity publication
Files: workers/news/index.ts, config.ts, network.ts, sanity.ts, wrangler.jsonc, tests/cloudflare-worker.test.ts.
Interfaces: Env DB, service/owner/validation secrets, explicit enable/kill flags; API uses store from Task1. Reuse parser and signed validation without importing live SQLite.
- [ ] Write failing tests for auth/paused routes, feed bounds/redirects, source filtering, candidate validation, fixed Sanity writes/replay and lifecycle.
- [ ] Run tests: Expected RED missing implementation.
- [ ] Implement handlers with conservative one-source scheduled batches, role separation, leases and bounded bodies; expose no arbitrary writer-triggered discovery fetch.
- [ ] Run focused and existing tests/typecheck: Expected GREEN, no existing regressions.
- [ ] Commit task.

### Task 3: Runtime and deployment handoff
Files: scripts/check-cloudflare.mjs, docs/operations/cloudflare-worker.md, CI and root scripts.
Interfaces: real Wrangler bundle + Miniflare D1 migrations exercise Worker API; docs exact config/secrets/Cloudflare free-tier limitations.
- [ ] Run real runtime smoke before completing setup: Expected failure if bundle/runtime lacks D1/API wiring.
- [ ] Implement smoke covering actual D1 persistence, auth, paused cron, leased work, signed publish/replay with intercepted Sanity, source dates, correction/withdrawal, and bad input.
- [ ] Verify tests, typechecks, bundle, local runtime and existing frontend build/smoke: Expected pass.
- [ ] Check account access; provision/apply/deploy paused only if authenticated. Otherwise provide exact minimal login handoff; never claim deployed.
- [ ] Commit task, run one fresh-context review and fix important findings with RED/GREEN tests.

## Review focus
Free CPU budget/large feeds; stale claims and lock fencing; ambiguous remote writes; slug collision/replay/withdrawal; signed verifier separation; token leakage/CORS/body limits/redirect SSRF; migration defaults and persistent data; runtime differences versus Node; no invented account access or Dots execution.
