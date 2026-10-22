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
