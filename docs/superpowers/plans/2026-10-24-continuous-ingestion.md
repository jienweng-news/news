# Continuous News Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Process the next news story immediately after the prior story finishes, retaining all publication checks.
**Architecture:** Authenticated one-minute n8n heartbeats refresh a75second coordinator drain lease. One drain invokes existing Coordinator.tick sequentially and exits on idle/failure/pause or lease expiry; graceful shutdown waits for in-flight work.
**Tech Stack:** TypeScript, Node22, SQLite, existing n8n2.44.6/Docker.
**Spec:** docs/superpowers/specs/2026-10-24-continuous-ingestion-design.md

## Global Constraints
- One story/model task in flight; no verification, source-policy or image requirement bypass.
- Existing manual tick and smoke remain; no paid change, secret rotation, newsletter send, new schedule or held-job release.
- Preserve existing worktree edits and dedicated service/data boundaries; production rollout is already authorized.

## Review Focus
- Overlapping heartbeat/manual requests must never start concurrent processors.
- Stopped heartbeats or shutdown must not close resources under an active story or start new work after expiry.
- Idle, ordinary failures and malformed outcomes must not cause a hot loop.
- Unconfirmed hold/durable safety pause must stop further claims across heartbeats and restarts.
- n8n requests acknowledge quickly and inactive/manual smoke behavior remains intact.

### Task 1: Lease-bound sequential drain
**Files:** Create automation/n8n/continuous.ts; tests/n8n-continuous.test.ts.
**Interfaces:** ContinuousQueue(tick:()=>Promise<{state:string}>, enabled:boolean, now?:()=>number), activate() acknowledgement, status() nonsensitive activity, stop():Promise<void>.
- [ ] Add failing behavior tests for immediate published/held progression, one loop across overlapping heartbeats, paused configuration, expiry/refresh, stop waiting for in-flight work, thrown/error/idle/unexpected outcomes and real coordinator single-flight/safety pause integration. Expected: tests fail because the implementation is missing.
- [ ] Implement75second refreshed lease, sequential ticks and event-loop fairness; stop safely without changing coordinator verification. Run npm test -- tests/n8n-continuous.test.ts tests/n8n-coordinator.test.ts. Expected: all pass.
- [ ] Commit this task's files.

### Task 2: Authenticated heartbeat service/workflow integration
**Files:** Create automation/n8n/coordinator-http.ts; tests/n8n-continuous-http.test.ts. Modify automation/n8n/coordinator-main.ts; automation/n8n/server.ts; deploy/n8n/workflows.json; tests/n8n-coordinator.test.ts; docs/operations/n8n.md.
**Interfaces:** coordinatorHandler exposes authenticated POST /v1/dispatch with empty JSON only, existing tick/history/sources and public nonsensitive health. Main shares the same Coordinator with ContinuousQueue. Shutdown waits for dispatcher stop then closes resources; server accepts asynchronous cleanup.
- [ ] Add failing real-handler tests for authorization, body/method/origin refusal, asynchronous ack, overlapping requests, manual smoke compatibility and health. Add workflow assertions: queue /v1/dispatch, one-minute heartbeat, bounded fast HTTP request; smoke retains manual /v1/tick, exports inactive. Expected: newly required behavior fails.
- [ ] Implement handler/main/server integration and update workflow/runbook. Run npm test; npm run check:automation; npm run check:worker; git diff --check. Expected: complete green suite/typechecks.
- [ ] Commit only this task's changes.

After code tasks: one fresh reviewer reads this spec/plan and the complete task diff; fix important findings once using TDD and rerun suite. Then roll out only dedicated coordinator/n8n: stop n8n triggering, wait for current coordinator run to finish, prepare/build coordinator, import/update only queue workflow and republish it using installed CLI, restart dedicated services, observe immediate consecutive starts and public responses. Preserve activation flags, source rights, existing held work and separate schedules. Record exact live evidence and limitations in operations docs and ledger.
