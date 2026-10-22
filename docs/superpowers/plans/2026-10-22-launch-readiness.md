# Token on Air Launch Readiness Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans and TDD. Founder explicitly authorized all remaining launch development and previously chose native execution. Do not repeat design/execution approvals.

**Goal:** Build locally verifiable multilingual publication, discovery and controlled publisher, reader integrations and release checks; record external service acceptance separately.
**Architecture:** Existing Astro/Sanity site gains one multilingual story contract and locale-specific server-rendered pages. Subscriber writes stay in beehiiv behind a disabled-by-default server integration. A separate private SQLite-backed Node worker owns discovery/jobs and controlled Sanity publication, outside Vercel's ephemeral filesystem. Dots consumes/exported job packages without an invented Dots API. GA4 loads only after consent in configured production.
**Tech Stack:** Existing Astro/TypeScript/Sanity, Vitest; XML parser, Node SQLite, TS CLI runner as needed.
**Spec:** ../specs/2026-10-22-publication-launch-design.md, ../../plans/ai-crypto-publication-checklist.md, ../../operations/dots-editorial-brief.md.

## Global Constraints
- Token on Air; editor jienweng; no AI label or fictitious reporting/partnerships.
- `/en/`, `/zh/` (zh-Hant), `/zh-cn/` (zh-Hans); saved choice first, trusted Vercel CN→Simplified, TW/HK/MO→Traditional, other→English. Never redirect explicit locale URLs by location.
- One document/all three language variants validated atomically; independent locale URLs and slugs, shared dates/evidence/media/commercial status. Legacy English documents remain readable in English only.
- Fixtures labelled/noindex and forbidden in hosted environments; remote private preview remains disabled.
- No real email sending, live CMS writes, purchases or production deployment during local implementation. Real account IDs/access and explicit activation are external acceptance gates.
- Never pretend Dots has an API; private queue export/import is the implementable handoff until its tool connection is verified.

## Review Focus
- Partial translations never leak English into Chinese URLs; reciprocal article alternates use actual slugs.
- Personal root choice cannot contaminate cached locale pages; root307 private/no-store and trusted geo only.
- Outages retain503, missing content404, feed/search/sitemap contain published content only and escape untrusted text.
- Subscriber API cannot reactivate suppressed users, leak keys/emails, or claim confirmation before provider acceptance; no analytics before consent.
- Discovery and publisher handle malicious XML/URLs, prompt injection as data, replay/restart, invalid evidence and kill-switch/credential boundaries.

### Task 1: Multilingual content contract
**Files:** i18n.ts, content localized.ts/types/repository/sanity/fixtures, Studio article schema, tests/localized.test.ts.
**Interfaces:** Locale='en'|'zh'|'zh-cn'; normalizeLocalizedArticle(raw,locale,mode)→Article; repository optional locale args preserve legacy callers; localeSlugs links alternates. translations keys en/zh/zhCn hold title/slug/summary/body/disclosure; shared correction notes keyed the same way.
- [x] Write failing tests for complete three-version document, missing Chinese/no fallback, atomic invalid version hold, unsafe body rejection and locale-specific slugs.
- [x] Implement contract/schema and labelled translated fixtures; run all tests/check and commit.

### Task 2: Locale routes and SEO
**Files:** locale pages/components, BaseLayout, middleware, i18n helpers; tests/i18n.test.ts; HTTP launch smoke.
**Interfaces:** localePath, localeFromPath, chooseEntryLocale; root307; locale pages receive Locale; legacy routes temporary English redirects; explicit switch endpoint validates local targets and sets preference cookie.
- [x] Test saved/geo fallback, unsafe preference/redirect input, legacy redirects; expect RED.
- [x] Implement localized navigation, article UI, switches, canonical/hreflang/NewsArticle JSON-LD and legacy redirects. Keep preview English/private. Verify all routes/headers and commit.

### Task 3: Reader discovery
**Files:** search/feed/sitemap pure helpers + locale endpoints/pages; tests/discovery.test.ts.
**Interfaces:** buildFeed(cards,locale,siteUrl), buildSitemap(cards per locale), searchArticles(cards,q), published-only source repository.
- [x] Test XML/script escaping, locale links, empty search, query bounds and no preview cards; expect RED.
- [x] Implement server-rendered search, locale RSS and sitemap; endpoint errors503; add feed links and robots. Run tests/build/HTTP and commit.

### Task 4: Signup and analytics
**Files:** newsletter service/API/form, analytics consent client/component, config/env; tests/integrations.test.ts.
**Interfaces:** validateSignup and subscribe with injected fetch; provider sends welcome=false/reactivate=false and persists language custom field. Disabled/unverified provider returns503. GA4 production-only valid G-ID and explicit opt-in, clean page path no query/email.
- [x] Test malformed inputs, disabled provider, provider failure/no false success, no reactivation and exact locale preference payload; expect RED.
- [x] Implement accessible signup/error states, GA4 consent choices/revocation and allowlisted commercial/signup events. No live request; test with doubles, build/check and commit.

### Task 5: Private discovery and controlled publishing
**Files:** automation/* (sources, feed parser, network policy, queue, validation, publisher, CLI); tests/automation.test.ts.
**Interfaces:** disabled source registry, bounded safe feed parsing; durable queue unique source+item key, lease/retry/hold/published lifecycle; export Dots briefing, import validated candidate; explicit operator approval of evidence/rights gates; publish disabled by default, stable document ID and revision/idempotency, correction/withdrawal operations.
- [x] Test malformed/XXE XML, unsafe redirects/hosts/private addresses, 48h lookback, dedup/restart/replay, invalid/partial language evidence, kill-switch and publication idempotency; expect RED.
- [x] Implement worker and CLI with no public mutation endpoint, separate SQLite volume and scoped token; no live generation/publishing. Run tests/check/build and commit.

### Task 6: Release checks and external handoff
**Files:** CI, health endpoint, release/preflight/export runbooks, policy pages with only known facts, service evidence ledger, master checklist.
- [x] Add config/preflight tests for missing live IDs, fixture production rejection, disabled integrations and secret redaction; expect RED where new behavior needed.
- [x] Implement CI, diagnostics, quota/backup/restore/rollback instructions, staged acceptance commands and explicit unresolved live-account gates; verify local tests/check/build/public+private HTTP.
- [x] One fresh-context whole-change review; fix important findings RED→GREEN, record minors/rulings; commit/push existing draft PR. Do not declare production launched.

Local delivery and review are complete; external activation gates are explicitly documented in ../../operations/launch-readiness.md and ../../operations/2026-10-22-launch-review.md. Checked implementation steps do not claim production launch or live service verification.
