# Continuous news processing — 2026-10-24

The owner selected continuous sequential processing while retaining every existing publication check. The next story now starts immediately after publication or a confirmed hold; the five-minute per-story wait is removed. Source RSS checkpoint intervals are unchanged. One-minute n8n heartbeats authorize75seconds of continuous work; idle work wakes on its next heartbeat. Durable queue state remains internal for recovery and duplicate protection.

Live acceptance: after a verified encrypted snapshot and one fresh review, updated only the dedicated coordinator and existing toa-queue workflow. Actual consecutive run gaps were3milliseconds each; real n8n heartbeats renewed the session, all three services were healthy, coordinator controls empty, and all locale RSS plus reader health returned200. The initial live drain retained held outcomes; a new article was not claimed from those held runs. All289tests and both typechecks pass. Two reviewer-reproduced shutdown races were fixed with regressions before rollout.

Existing frontend changes, Worker/source rights, held jobs, launch-monitor and daily backup schedules were preserved. Private rollback workflow export and local encrypted snapshot remain available. No secret, password or subscriber data appears in this record.

## Execution ledger

# SDD ledger — plan: docs/superpowers/plans/2026-10-24-continuous-ingestion.md
Pre-flight: Task1 ContinuousQueue activation/status/stop is consumed by Task2 handler/main; signatures agree.
Ruling: Owner's explicit selection of continuous processing with checks authorizes implementation and dedicated live rollout; no repeated approval — heartbeat implementation details are recorded builder calls — cost: idle discovery may wait up to one minute and disabled n8n work may finish its current story before stopping.
Ruling: Retain durable private queue internally for crash safety/deduplication; remove artificial per-story timer delay rather than discarding work state — cost: leads can still wait while one prior story is genuinely processing.
Task 1: complete (commits 0a69922..146a534, tests: npm test -- tests/n8n-continuous.test.ts tests/n8n-coordinator.test.ts →    Duration  1.37s (transform 167ms, setup 0ms, import 296ms, tests 760ms, environment 0ms))
Task 2: complete (commits 146a534..c3a53f0, tests: npm test →    Duration  16.02s (transform 1.12s, setup 0ms, import 5.62s, tests 3.05s, environment 5ms))
Final review: fresh GPT-6-Astra high, task toa-continuous-final-review-20261024-v1, Critical0/Important2/Minor0. Important shutdown findings reproduced: cleanup started after HTTP drain; manual disconnected tick could outlive resource cleanup.
Final: fixed stop-too-late — real subprocess incomplete-HTTP/SIGTERM regression started processor2 before cleanup RED, immediate stopping/cleanup and request guards GREEN; suite289/289.
Final: fixed manual-work shutdown — coordinator.stop regression missing method RED, tracking all Coordinator executions/rejecting new ticks and awaiting them before storage closure GREEN; suite289/289. No second reviewer dispatched.
Final: Ruling: reviewer excluded live rollout/heartbeats/publication — executor must verify dedicated activation and actual consecutive live run timestamps after deployment — cost: live behavior depends on host/provider availability.
Final: Ruling: reviewer excluded unchanged editorial/model accuracy and source rights — retain existing evidence, signature, translation, duplicate and image gates; this change does not certify article accuracy — cost: those checks remain fallible.
Final: Ruling: reviewer excluded unrelated frontend/.vercelignore/docs-email edits — preserve them without incorporating into this rollout — cost: those pre-existing changes are not covered by this review.
Final verification: all289tests, both automation/Worker typechecks and whitespace check pass. Compiled coordinator image smoke in network-isolated disposable container with synthetic secrets: health200/disabled dispatch200/unauthenticated401; clean shutdown. Initial smoke fixture lacked fake agent token and ran with mismatched UID; corrected fixture only, no production secret access.

Live rollout: local encrypted snapshot2026-10-24T05:42:46.427Z verified isolated restore2workflows/172runs/749leads and credential matches; offsite copy not claimed. Stopped dedicated n8n, confirmed no running coordinator row/controls, recreated only coordinator, imported only toa-queue into its existing project and published current version; restarted n8n. No Worker/source-policy/held-job/backup-schedule change.
Live verification: queue active with one-minute /v1/dispatch heartbeat and manual-only inactive smoke. Initial heartbeat202 at05:49:39UTC. Actual n8n heartbeat05:50:20 renewed session beyond its initial75seconds. Consecutive coordinator run gaps3ms/3ms/3ms; only one current processor and controls empty. All3dedicated services healthy; reader health and en/zh/zh-cnRSS200. Snapshot published31/held89/processing1/queued55; first continuous-mode stories held by existing gates, no new publication claimed for those held stories.
