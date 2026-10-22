# News feature audit — 2026-10-22

The publication has a working multilingual reader site, but0 published Sanity articles at the last verified query. Content and reliable publishing are the main launch gap; adding UI cannot substitute for them.

## Approved additions implemented in this pass
- Path-based archive,12 stories/page, newest-first with deterministic tie ordering. Empty page1 remains usable; malformed or out-of-range pages404. Canonical first page is /en/archive/ (and zh/zh-cn equivalents).
- Separate AI/Crypto RSS feeds per edition; each filters its items and identifies its own feed URL. Links are in the footer and section pages.
- Author pages derived from actual published article records. Unknown authors404; only supplied biographies render. Article bylines link to the relevant author; editor credit remains jienweng.
- Up to3 related published stories, prioritizing the same section, excluding the current article/drafts. Optional related-list failure does not suppress an available article.
- Archive pages and known author URLs included in sitemap. No synthetic author profiles or news inventory.

## Existing reader capabilities
Three editions, region-aware first visit, language preference, article HTML, dates/updates, sources, correction notes, commercial disclosures, search, RSS/sitemap, basic structured data/canonicals/hreflang, newsletter form, opt-in analytics, privacy preferences, About/editorial/privacy/terms/disclaimer/contact/advertising pages.

## Next useful product work, ranked
1. Publish the first substantive original stories and verify correction/withdrawal propagation. Readers need current inventory before more navigation.
2. Connect a supported Dots handoff or callable generation service, independent verification and durable worker hosting. ChatGPT UI access alone is not a server API. Keep automation off until lifecycle/replay tests pass.
3. Complete Kit confirmation, unsubscribe/suppression and browser Turnstile acceptance; then enable signup. Digest scheduling follows stable publication, with segmentation by newsletter_language.
4. Improve article sharing previews: article-specific Open Graph images/type and matching social metadata. Use licensed article media or a real branded fallback, not fabricated story imagery.
5. Add topic/tag pages and guide/review collections when inventory supports useful groupings. Avoid empty taxonomy pages.
6. Add reader utilities such as copy-link/share controls and multilingual reading-time estimates; these are conveniences after core discovery.
7. Connect Search Console and verify indexing, search referrals and content freshness; configure actual GA4 retention/enhanced measurement and conversion checks.
8. Before monetization, add an actual rate card and sponsorship inquiry workflow based on measured audience; no invented traffic claims, partners or ad inventory.

## Features deliberately deferred
Comments/community (moderation and abuse handling), accounts/bookmarks (identity/data lifecycle), market tickers (data licensing/freshness), paywalls (payments/tax/access), push notifications and unbounded trending rankings. None is needed to make the initial news site useful.

## Operational gates
See launch-checklist.md for credentials, sender authentication, CMS writes, browser QA, legal/operator facts, monitoring, backup/restore, rollback and Git deployment status. Supplied production secrets are sensitive and cannot be exported; a placeholder export is not usable credential evidence. Public DNS and owner attestations do not prove actual mail delivery.

## Pre-backfill audit — 2026-10-22 14:34 UTC

Vercel CLI inspected production deployment dpl_9wktTR1nPgBxCcWUjLYHf7FdTvcX: Ready, both custom domains attached. Fresh HTTP checks passed for36 localized reader/policy pages, robots, sitemap and health; unknown article and private preview returned404. Existing discovery smoke passed both hosts, including malformed archive URLs, feeds and missing authors. Search deliberately has no canonical; it is a non-indexed utility. Evidence: docs/research/source-checks/2026-10-22-pre-backfill-audit.json. These checks establish status and metadata, not rendered visual/accessibility or actual article acceptance.

Read-only bounded feed discovery found695 distinct URLs within48hours across25 feeds, all HTTP200. PANews100, Grenade7, BlockTempo10. Counts reflect feed windows and include research papers/vendor announcements; they are neither verified news nor695 unique events. Full metadata snapshot is private at .private/audit/source-snapshot.json; no article bodies copied and no CMS writes performed. Feed access does not change source rights approvals or enable polling.

### Findings before backfill
- Blocking: no verified scoped Sanity writing connection/editor record; no live story lifecycle acceptance.
- Blocking for autonomous operation: Dots is only available through ChatGPT UI; no callable generator, independent semantic verifier or durable worker has been connected.
- Date integrity: feed queue retains source publishedAt and queue created_at, but publicationDocument drops those provenance timestamps. A backfill needs separate sourcePublishedAt, discoveredAt and importedAt fields; site publishedAt must describe actual first publication here. Preserve dates on corrections and make source time clearly labelled if displayed.
- Date parsing: Atom updated currently substitutes for missing published, so updates can look like fresh first publication. Explicit timestamp provenance and missing/ambiguous-date handling need coverage before unattended ingestion.
- Hosting resilience: HomePage/SectionPage still set failure status in nested components. The earlier archive issue shows Vercel streaming can commit headers first; move data/status handling to routes and verify an outage response before calling outage handling complete.
- Browser checks remain blocked by AppArmor. Turnstile, consent interactions and responsive visual QA are not passed.

Recommended initial backfill: reviewed original multilingual summaries from the last48hours, source-driven selection, cluster duplicate events before drafting, retain source timestamps in UTC, publish using actual site timestamps, then verify article/search/feed/sitemap and correction/withdrawal propagation. Start with a small checked batch; do not publish the entire feed dump or enable24/7 operation from this metadata probe.
