# Persist news images in Sanity

User explicitly requested all article images be stored in Sanity. Native execution in existing worktree.

1. Add RED→GREEN tests for admin-only attachment, published job/hash identity, first-party asset upload, revision-fenced mainImage patch, no overwrite of chosen images and idempotent retries.
2. Implement a small Worker media service. Only fetch rendered PNGs from the fixed tokenonair.com published-image endpoint via Sanity Assets API; never expose Sanity token, accept arbitrary URLs, or patch prose/publication dates. Store asset reference, alt, credit, rights and generated-title provenance. Reuse image when already current. Refresh only first-party generated images after headline changes.
3. Add bounded automatic retry on the existing minute cron every fifth minute, one published job per tick, respecting automation kill switch and shared publisher lock. Failed image attachment must not hold or republish a story.
4. Verify tests/typechecks/Worker runtime smoke; deploy with existing live flags preserved. Backfill only the three current published stories through authenticated admin route. Query Sanity to verify real asset documents and article references; verify all locale lead/OG images use the Sanity CDN. Commit and record evidence. No new email or author portrait invented.

Review fixes: record generated asset ID so manually replaced assets are preserved after title corrections; exclude failed jobs for one hour before selecting candidates so later posts cannot be starved. Both have regression coverage.
