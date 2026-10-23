# News activation — 2026-10-23

Current live news service: https://tokenonair.com/en/ . This record supersedes historical paused/empty-state notes for the news workflow. Newsletter signup remains separately gated; no new email or broadcast was sent.

## Verified operating state

- Owner account setup complete. Dedicated n8n/coordinator/Codex containers healthy; editor is loopback-only. Queue workflow published with a five-minute schedule; synthetic smoke stays inactive. Coordinator enabled, Worker enabled/kill-switch off, Worker XML polling off. Exactly five reviewed article sources enabled: Ethereum, Bitcoin Core, Google Research, Google AI and DeepMind.
- First real collector accumulated539fresh leads across22monitors; the-decoder is in bounded policy/fetch backoff. Only approved-source metadata enters the publisher queue. Initial broader feed audit observed662leads from24feeds, not662verified stories.
- Ethereum postponement story publicly published at2026-10-23T07:45:17.512Z; source date2026-10-22. Google Research AI ultrasound story published by the real n8n workflow at07:51:09.250Z; source date2026-10-21T16:23:53Z. Each has English/Traditional/Simplified editions and editor jienweng. Original source timestamps remain distinct from actual site publication dates.
- Real acceptance checks:18article/home/archive/author/combined+cryptoRSS routes,12AI/crypto article+sectionRSS checks, plus search/sitemap/health passed. Desktop1280px/mobile390px article had no horizontal overflow, correct NewsArticle metadata/citations and no Google requests under previously declined consent. These are actual checks, not a full accessibility/performance certification.
- Latest publisher Worker version549a2b00-55d5-441a-ac3d-b10020c627ae. Existing Vercel reader needed no new deployment; it reads Sanity at runtime.

## Operating safeguards

Leads accumulate with conditional requests and durable checkpoints. Canonical URL deduplication is strict; similar titles are grouped without destructive merging. Research compares related primary notices and recent published stories. Newer authoritative corrections supersede old schedules; unresolved material conflicts, evidence/date/number discrepancies and failed independent checks hold the job. No automatic release of held content. Only a separate verifier's signed candidate reaches Sanity.

PANews and BlockTempo commercial rewrite restrictions hold both sources. a16z's redirect to a new unreviewed domain is held. Other17sources provide private metadata leads only; unknown licenses are not treated as permission to copy articles or media. See source-review.md.

## Runtime integration correction

First publication exposed Sanity's documented dotted-ID access rule: `story.<hash>` is private even in a public dataset. Changed all new publication/lifecycle identities to root-level `story-<hash>`. Added authenticated admin repair using the existing signed identity, revision fence and an atomic CMS copy/delete; content, slugs and dates are preserved. The first story was migrated successfully and verified unauthenticated. Regression tests first failed, then passed; safe retry and hash mismatch refusal are covered. No public credential was introduced.

## Verification and backups

Full suite180/180; automation and Worker type checks passed. Real workerd/D1 smoke passed migrations/restart/auth/concurrent claims/signed publish-replay/correction/withdrawal/owned holds/host ingestion. Frontend build and built local public/private/locale/discovery/state HTTP smoke passed. Local runtime tests intercept CMS; live publications above are separate evidence.

The single fresh-context review found no Critical and one Important incomplete-backup defect. A failing regression reproduced it; capture, manifest and restore now require all three databases and credential entries before success/retention pruning. Revised live restore verified2workflows/5run records/539leads and matching private files. Earlier encrypted245351byte backup uploaded to the private Drive folder; size, parent and shared=false verified. Local backup daily02:15MYT; T3/Drive fresh off-server backup daily, next2026-10-24T15:26:51MYT. Separate recovery key is held encrypted in Cloudflare. See n8n-backups.md. Full remote host-loss recovery has not been rehearsed.

Actual Cloudflare billing plan and measured request CPU remain unverified: dashboard needs owner login and OAuth lacks billing-read scope. No purchase/upgrade performed. Larger XML parsing is on the existing host; bounded metadata design targets documented Free limits. Codex requires valid existing account allowance/authentication and the host to stay online.

Deferred minor: durable URL-keyed intake currently preserves one source label per canonical URL; a future multi-feed provenance table would retain all labels. Current fixed feeds have distinct hosts and the audit observed no exact URL overlap. Standalone grouping already retains multiple source names.

## Scheduled-run observation

A timer overlapped manual CLI acceptance and was refused409 by the single-flight coordinator. Manual CLI stdout, coordinator history, D1 and public CMS confirmed the actual second publication; n8n's main process can mark a sidecar CLI execution crashed while that CLI completes. The isolated07:55:20Z scheduled tick completed at07:56:17Z and published the DeepMind forest-map story at07:56:15.246Z. All3stories/3editions/section feeds passed18HTTPchecks. n8n successful runs are soft-deleted with save-on-success=none; raw soft-deleted rows retain stale running/crashed status. deletedAt plus installed lifecycle code confirmed this is retention behavior, not an active stuck run.

## Owner controls

Open n8n privately at http://localhost:5678 on this server. The queue workflow is `toa-queue`; use its execution view and coordinator history together, since standalone CLI test processes are not tracked reliably by n8n's main process. Unpublish the queue to stop future ticks, then allow any in-flight job to finish before changing coordinator/Worker flags. The synthetic `toa-smoke` must remain unpublished. Do not release held jobs until their evidence/CMS state is inspected.

`node scripts/start-n8n.mjs` deliberately restores paused coordinator defaults during an update. After tests/health/source checks, enable NEWSROOM_ENABLED=1 in the private compose environment and recreate only coordinator; check the Worker enabled/kill-switch flags and existing queue publication state separately. Do not reimport workflow definitions during a routine update: imports reset their committed inactive state. Keep secrets out of editor text and public repository files.
