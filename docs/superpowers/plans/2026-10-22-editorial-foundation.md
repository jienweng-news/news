# Editorial Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. Execution method is selected at handoff; no child agents have been started.

**Goal:** Deliver a locally runnable Astro publication foundation with Sanity schemas, complete article HTML, and authenticated draft preview.

**Architecture:** One Astro frontend and a separate Sanity Studio workspace, both in this repository. Public content and private preview use separate repository methods behind a normalized article contract. Local fixtures support development without credentials and are visibly labelled; production rejects fixture configuration.

**Tech Stack:** TypeScript, Astro 7.4.2, `@astrojs/vercel` 11.0.16, `@sanity/astro` 3.5.1, `astro-portabletext` 1.0.1, Sanity SaaS/Studio, npm workspaces, Vitest. Resolve remaining compatible versions explicitly at setup and retain the lockfile.

**Spec:** [Approved launch design](../specs/2026-10-22-publication-launch-design.md). Covers master checklist F01–F04 and F07–F13 plus an initial layout shell for F05. Live credentials, live editorial lifecycle and host verification remain external acceptance steps when service access exists.

## Global Constraints

- Develop an original layout using AstroNews's lead/latest/section hierarchy and The Magazine News's restrained reading design as references.
- Paid theme code requires verified licensing; no purchase is authorized by template selection.
- Start with manual publishing by a trusted founder.
- Fixture content must never be presented as real reporting or accidentally deployed to production.
- Production build/configuration rejects a fixture-content mode.
- Preview is server-authenticated, returns `Cache-Control: private, no-store`, is `noindex`, and never exposes a read/write token in browser bundles.
- Unauthenticated preview requests are rejected.
- Contracts, rates, confidential contacts and subscriber details never become published Sanity documents.
- No tracker on previews, tests or local development.
- Do not add automation writes in the first milestone.
- UI validation is not an enforceable draft-only CMS role; document Sanity Free permission limits.
- Preserve the approved performance budgets; full browser benchmarking belongs to the later release phase.

## Review Focus

1. An adapter deploy may use a different environment from local builds: explicit APP_ENV and host deployment environment must prevent production fixtures (Task 1).
2. Privileged client configuration may make draft data appear public: public queries explicitly select published documents and never inherit preview credentials (Task 2).
3. External API writes may bypass Studio validation: reject malformed articles and unsafe URLs at the public normalization boundary (Tasks 2–3).
4. Slugs, missing references and CMS outages must not become misleading empty-success pages: distinguish missing content from upstream failure (Tasks 2 and 4).
5. A preview cookie may be forged, expired, or shared through caching: verify signatures/expiration and apply no-store to every preview response, including errors (Task 5).

## Scope and environment contract

This phase does not deploy production, purchase services, ingest feeds, send mail, track analytics, create sponsors, or implement public search/RSS/cache invalidation. Those have explicit later phases. The homepage is a functional latest-article shell; the final multi-section composition follows in discovery work.

Registry metadata checked on 2026-10-22: Astro 7.4.2 requires Node >=22.23.4, available here; npm is 10.9.9. Sanity Astro 3.5.1 explicitly accepts Astro 7, and Vercel adapter 11.0.16 requires Astro 7. Package peer compatibility is preliminary evidence, not a passing production build.

Environment: `APP_ENV=local|staging|production`, `CONTENT_MODE=fixture|sanity`, `SITE_URL`, `PUBLIC_SITE_NAME`, `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_READ_TOKEN`, `PREVIEW_ACCESS_KEY`, and `PREVIEW_SIGNING_SECRET`. Defaults: local, fixture, http://localhost:4321 and News. All tokens are server-only; .env.example contains blank secret values. Production requires Sanity mode, an absolute HTTPS site URL and nonempty CMS IDs. Host-detected production also enforces production rules even if APP_ENV is omitted or mis-set. Missing preview secrets disable preview rather than preventing public reading.

Local commands: `npm run dev`, `npm run dev:studio`, `npm run check`, `npm test`, `npm run build`, `npm run preview`. A production build for local fixture preview is permitted only in local APP_ENV; production deployment is not.

## File ownership

- Root: `package.json`, `package-lock.json`, `.gitignore`, `.env.example`, `vitest.config.ts`, `README.md` — workspace/scripts/setup.
- Frontend: `frontend/astro.config.mjs`, `frontend/tsconfig.json`, `frontend/package.json`; `frontend/src/lib/config.ts`; `frontend/src/lib/content/{types,normalize,repository,sanity,fixtures}.ts`.
- Rendering: `frontend/src/layouts/BaseLayout.astro`; `frontend/src/components/{ArticleBody,ArticleMeta,Disclosure,FixtureBanner}.astro`; `frontend/src/styles/global.css`; `frontend/src/pages/index.astro`; `frontend/src/pages/articles/[slug].astro`; `frontend/src/pages/404.astro`.
- Preview: `frontend/src/lib/preview/session.ts`; `frontend/src/pages/preview/index.astro`; `frontend/src/pages/api/preview/{session,logout}.ts`; `frontend/src/pages/preview/articles/[slug].astro`; `frontend/src/middleware.ts`.
- Studio: `studio/package.json`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/schemaTypes/{index,article,author,category,affiliateOffer,campaign,project,siteSettings}.ts`.
- Verification: `tests/{config,content,schema,preview}.test.ts`; `tests/fixtures/articles.ts`; `scripts/check-foundation.mjs`; `docs/operations/editorial-foundation.md`.

### Task 1: Reproducible workspace and deployment-safe configuration

**Consumes:** environment contract above. **Produces:** `readConfig(env: Record<string, string | undefined>): AppConfig` in `frontend/src/lib/config.ts`. AppConfig has appEnv, contentMode, siteUrl, siteName, optional Sanity IDs/token, and previewEnabled; private secrets never serialize to public props.

- [x] Establish the root/frontend/studio workspace manifests and Vitest runner so a failing configuration test can execute. Pin the four verified packages; resolve and pin remaining compatible packages and record license/runtime checks without copying unverified template code.
- [x] Add `tests/config.test.ts`: default local fixture succeeds; APP_ENV production plus fixture throws; VERCEL_ENV production plus local/fixture throws; production HTTP site URL throws; Sanity mode without IDs throws; no preview secrets yields previewEnabled false.
- [x] Run `npm test -- tests/config.test.ts`; expect failure because readConfig is absent.
- [x] Implement readConfig and Astro/Studio environment wiring. Configure server output, adapter, TypeScript and root scripts. Preserve existing docs/assets and keep secrets/build artifacts out of git.
- [x] Run the configuration tests and `npm run check`; expect passing tests/type checks. Record resolved dependency/runtime versions in README and commit the task.

### Task 2: Public article contract and isolated content access

**Consumes:** AppConfig. **Produces:** `Article`, `ArticleCard`, `ContentRepository`, `createContentRepository(config: AppConfig): ContentRepository`. Repository methods: `listPublished(): Promise<ArticleCard[]>`, `getPublished(slug: string): Promise<Article | null>`, `getPreview(slug: string): Promise<Article | null>`; getPreview only available to authenticated server routes. `ContentUnavailableError` distinguishes upstream failure.

Article fields: id, slug, title, summary, section (`ai|crypto`), format (`news|analysis|guide|review|announcement`), Portable Text body, author `{name,slug,bio?}`, publishedAt, updatedAt, source URLs, optional media `{url,alt,credit,license}`, corrections, relationship (`none|affiliate|sponsored|owned-project`), optional disclosure, fixture flag, and previewOnly flag. ArticleCard omits body/corrections.

`normalizeArticle(raw: unknown, mode: "published" | "preview" = "published"): Article` validates required fields, dates, section/format, source links for news and relationship disclosure. Accept only http/https external links; reject executable URL schemes. Published normalization rejects draft IDs; authenticated preview normalization may accept them and must flag the result as preview-only. Invalid documents are omitted from listings and fail closed on detail routes, with a safe diagnostic.

- [x] Add `tests/content.test.ts` for valid AI/crypto fixtures, missing author/body, invalid dates, missing news sources, unsafe links, commercial disclosure and malformed reference rejection. Mock clients to assert public query uses published perspective with no preview token, draft IDs cannot normalize as public, missing article returns null, and CMS errors throw ContentUnavailableError.
- [x] Run `npm test -- tests/content.test.ts`; expect missing contracts/repository failures.
- [x] Implement types/normalization, labelled local fixtures, public Sanity reader and separate server preview reader using the current supported SDK APIs. Rendered samples describe editorial formats, not invented current events or affiliations.
- [x] Run configuration/content tests; expect all pass. Check no browser-accessible module exports private clients/tokens; commit the task.

### Task 3: Studio schemas and trusted manual editing

**Consumes:** article contract. **Produces:** seven registered Sanity document schemas and a Studio that builds with matching field names; `studio/schemaTypes/index.ts` exports schemaTypes. No workflow claims exceed actual permissions.

- [x] Add `tests/schema.test.ts`: required fields match Article contract; title/slug/section/author/body/date validation rejects omissions; news requires evidence; commercial relationships require disclosure; media credit/license is validated when media exists. Verify slug uniqueness validation against a mocked query, including draft/published IDs belonging to the same article.
- [x] Run `npm test -- tests/schema.test.ts`; expect absent schemas/validators to fail.
- [x] Define article, author, category, affiliateOffer, campaign, project and siteSettings. Use public-only campaign/offer fields, safe links and correction entries. Wire Studio project/dataset via environment with clear missing-configuration output.
- [x] Run schema/content tests and `npm run build --workspace studio` with valid test project identifiers; expect a build without live mutations. Document create/preview/publish/correct/withdraw and Free-plan role/API-bypass limits. Commit the task.

### Task 4: Public article HTML and editorial shell

**Consumes:** ContentRepository and Article. **Produces:** `/`, `/articles/[slug]/` and `/404`; reusable BaseLayout, ArticleBody, ArticleMeta, Disclosure and FixtureBanner. Article route returns 404 for unknown slug and 503 for backend failure; invalid content produces a safe unavailable response, never draft content.

- [x] Add public smoke assertions to `scripts/check-foundation.mjs`: GET both fixture article routes and check title, body, byline, sources and dates in raw HTML; unknown slug returns 404; fixture notice exists in local mode; no preview token or analytics scripts appear; non-none relationship displays disclosure. Assertions use stable semantic elements/data attributes rather than full HTML snapshots.
- [x] Run the smoke script against the pre-rendering implementation; expect missing routes or assertions to fail.
- [x] Implement responsive original typography/layout, Portable Text rendering, safe links, canonical metadata, visible fixture banner, homepage latest list, accessible focus styles and empty states. Use no paid source or fabricated content. Retain space for later sponsor components without rendering fake sponsors.
- [x] Run `npm run check`, `npm test`, `npm run build`; start `npm run preview -- --host 127.0.0.1`, then `npm run verify:foundation`; expect all semantic smoke assertions pass. Verify real upstream 503 handling with a controlled mock/integration check. Stop the preview process and commit the task.

### Task 5: Authenticated draft preview and foundation handoff

**Consumes:** ContentRepository.getPreview and private preview env values. **Produces:** session creation/logout, authenticated preview article page, and operations evidence. `createPreviewSession(secret: string, now: number): Promise<string>` and `verifyPreviewSession(value: string, secret: string, now: number): Promise<boolean>` use Web Crypto HMAC, a random session nonce, versioned payload and 15-minute expiry.

POST `/api/preview/session` receives the access key in the body, checks same-origin and body-size limit, then issues an HttpOnly SameSite=Strict signed cookie, Secure on HTTPS. Do not put access keys in URLs or persist them in localStorage. Rate-limit repeated failures with host-compatible storage or leave remote preview disabled until supported; a local in-memory limiter is not a production security guarantee. POST logout clears the cookie. Authenticate before invoking getPreview; middleware forces no-store/noindex on all `/preview` and `/api/preview` responses including errors. Public article queries never use this session.

- [x] Add `tests/preview.test.ts`: valid session works for 15 minutes; expired/tampered/malformed sessions fail; absent key/secrets disables login; cross-origin submission is rejected; unauthenticated preview never calls getPreview; all errors include no-store/noindex. Test logouts and verify the response never echoes supplied secrets.
- [x] Run preview tests; expect failures before session/routes exist.
- [x] Implement session helpers, login form, session/logout endpoints, preview article rendering and header enforcement. Keep credentials in private server code and preview content out of public responses.
- [x] Extend smoke checks for unauthenticated rejection, valid local session, expiry/tamper failure, cookie/header attributes and safe logout. With no Sanity token, use labelled draft fixtures only locally; a live draft test remains pending until configured.
- [x] Run `npm run check`, `npm test`, `npm run build` and production-preview smoke checks; expect pass. Inspect built public assets for secrets. Record browser checks as unverified if T3's host sandbox remains unavailable; do not invent Lighthouse or live-CMS results.
- [x] Update operations notes with setup commands, actual tests, service inputs still needed, and live acceptance steps. Check off only proven master checklist items; commit and hand back the runnable foundation.

## Phase completion versus live acceptance

Local completion means build/type/tests/HTTP smoke checks pass using labelled fixtures, Studio builds, and production fixture rejection is verified. Live acceptance additionally requires authenticated Sanity project access, real publish/correct/withdraw/preview, and selected-host behavior. Neither account setup nor a deployment is inferred from passing local tests. Do not mark the entire master Phase 1 complete while live acceptance is pending.

## Self-review

- Scope: foundation only; later RSS/search/invalidation, Plausible and newsletter plans remain separate.
- Contracts: repository methods, article field names, configuration and preview helpers are defined before consumers.
- Failure coverage: environment mismatch, public draft leakage, malformed content, 404/503 distinction and forged/expired preview sessions have owning tasks.
- External dependencies: live Sanity and host checks are explicit pending acceptance, not silently simulated success.
- Execution: recommend native execution for this tightly coupled foundation; independent review may follow the implementation. Founder selected native execution; all five tasks implemented locally. Live Sanity/host acceptance and final review are tracked separately.

## Execution evidence

Native implementation on `feat/editorial-foundation`. Local configuration, repository, schema, page and preview tests, Astro diagnostics, Node build and HTTP smoke checks passed. See [operations evidence](../../operations/editorial-foundation.md). Checkboxes indicate local implementation/verification; the account-dependent live checks in the task text and completion section remain pending, as does real browser performance testing.
