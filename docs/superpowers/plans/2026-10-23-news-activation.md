# Source accumulation and activation implementation plan

> Use superpowers:executing-plans for native implementation, TDD and one final fresh-context review.

Goal: collect reviewed sources, reconcile related/conflicting reports, and activate the verified news workflow.
Architecture: host feed collection → bounded authenticated D1 metadata ingestion → related primary research → three-edition writer → separate verifier → signed publisher.
Spec: docs/superpowers/specs/2026-10-23-news-activation.md
Constraints: private credentials; no paid services; source-specific policy; existing kill switch/lease ownership; correct original/site dates; no newsletter sending; no merge.

### Task 1: Accumulate feeds and source decisions
Interfaces: fixed source registry; canonical FeedItem; authenticated /v1/ingest accepting reviewed-source metadata; durable host polling checkpoints; related-lead grouping.
- Write/run failing tests for canonical duplicates versus similar stories, unreviewed/wrong-host ingestion, oversized/stale/fabricated fingerprints, bounded chunks, polling backoff and conditional requests. Expected: RED.
- Implement host collector, endpoint, source policy report and safe launch subset; disable large XML parsing on the Free Worker while retaining pruning. Expected: tests GREEN.
- Commit and record source audit results (not copyrighted article bodies).
Verification: npm test -- tests/news-intake.test.ts tests/cloudflare-worker.test.ts

### Task 2: Related primary evidence and real dry-run
Interfaces: collector context consumed by production pipeline; fixed research schema; source policy/attribution; immutable test-only dry-run config.
- Write/run failing tests for related approved evidence, unapproved context/URL refusal, duplicate and contradiction instructions, license attribution, real dry-run never writing/claiming/holding, and recent-claim review. Expected: RED.
- Implement source-bounded related context and dry-run CLI, preserve signed verification, then run real-source generation/verification in the private agent. Expected: GREEN; actual acceptance recorded, failures held honestly.
- Commit task.
Verification: npm test -- tests/news-intake.test.ts tests/news-acceptance.test.ts tests/n8n-pipeline.test.ts tests/n8n-coordinator.test.ts

### Task 3: Backup, activation and operating checks
Interfaces: private backup/isolated restore; approved source registry+D1 synchronization; n8n queue publication and coordinator flags.
- Build a consistent private backup and isolated restore check without interrupting unrelated services. Expected: restored DB counts and matching required private key material; no secret output.
- Check current Cloudflare capacity evidence and recorded limits. Apply reviewed source decisions; run real-source acceptance and final review before publishing anything. Activate only the verified subset; retain unresolved sources in report. Expected: real statuses and owner controls verified.
- Verify first authorized content publication and reader routes/date/source/RSS behavior if all gates pass; otherwise preserve pause and record the concrete failure. Update checklist and commit.
Verification: npm test; npm run check:automation; npm run check:worker; npm run verify:worker; deployed HTTP/queue/CMS checks.

## Review Focus
Review ingest authorization, host/source/date/fingerprint validation, duplicate grouping false positives, independent facts and superseding notices, dry-run side-effect isolation, polling deadlines/overlap/backoff, license attribution and approval scope, backup consistency/secret handling, and activation evidence. Do not invent a source license, billing status, successful live editorial test or off-server backup.
