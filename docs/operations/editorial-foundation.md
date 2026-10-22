# Editorial foundation operations

## Local setup

Use Node >=22.23.4 and npm 11. `npm ci` installs the locked workspaces. Copy `.env.example` to the root `.env`; run `npm run dev` for visibly labelled sample articles. No hosted service or subscription is created.

Set `CONTENT_MODE=sanity`, `SANITY_PROJECT_ID` and `SANITY_DATASET` to read published content from an existing public Sanity dataset. No token is used for public reads. `npm run dev:studio` maps those public IDs into Studio's environment. Login through Sanity in the browser; never paste credentials into documentation or commit an .env.

## Manual editorial workflow

1. Create a genuine author with a name and slug.
2. Create an article, assign AI or Crypto, choose format, and write an original body.
3. Add primary evidence for news, accurate publication/update dates, and explicit commercial disclosure when relevant. Media requires alt text, credit and license notes.
4. Review in Studio. Publish manually with a trusted account; no automation writes are enabled.
5. For corrections preserve original publication time, update modification time and add a dated correction note.
6. Unpublish to withdraw. Cache invalidation and live host propagation are a later phase, not verified by this foundation.

Sanity Free's Administrator/Viewer roles do not supply a separate Editor or an enforceable draft-only bot role. Studio validation improves the workflow but privileged API writes can bypass it. Never store subscriber details, contracts, confidential notes, feed queues or private rates in published documents. Published data is public.

## Verification boundaries

`npm test` exercises configuration, content validation, public/draft separation and schema rules. A Studio build with `SANITY_PROJECT_ID=testproject SANITY_DATASET=production` verifies bundling only; those identifiers are test values, not an account. Live CMS author/publish/correct/withdraw and hosting behavior remain pending real service access. Browser/Lighthouse evidence must not be inferred from HTTP checks.

## Private local preview

Set independent random `PREVIEW_ACCESS_KEY` and `PREVIEW_SIGNING_SECRET` values of at least 32 characters in the uncommitted root .env. In Sanity mode also supply a private read token with access to drafts, never a general write token. Open `/preview/` through localhost or loopback, enter the local access key, and use `/preview/articles/your-slug/`. Sessions expire in 15 minutes; logout clears the browser cookie. Stateless session cookies cannot be individually revoked; rotating the signing secret invalidates all of them.

Preview is deliberately disabled outside local APP_ENV, on Vercel deployments, and for non-loopback request origins/raw Host headers. The supported dev and built-preview commands bind to loopback; the built-preview runner rejects non-loopback HOST values. Host validation is defense in depth, not proof of the client connection origin; do not expose a preview-enabled server through a remote proxy. Local failed logins are limited to five per five minutes across the process. This is not a distributed limiter and does not enable remote preview. A remotely accessible shared editor preview requires a separate durable access design before activation.

Astro's early form-origin check runs before middleware and cannot attach the required preview privacy headers. The application instead applies an app-wide origin/fetch-site guard in middleware, then the preview handlers additionally require an exact Origin. `security.allowedDomains` limits trusted host/forwarded headers to loopback locally and configured site/provider hosts when deployed. Future mutation endpoints must retain this guard; signed server webhooks may omit browser Origin and must authenticate independently.

## Foundation verification recorded 2026-10-22

- All five foundation tasks have local implementations; live acceptance is still pending. Final fresh-context review found two Important issues; both were reproduced and fixed with regressions. The final suite has 67 passing tests.
- Vitest covers configuration, normalization/repository isolation, Studio schemas, page404/503 handling, signed-session validation and preview HTTP helpers.
- Astro check and the local Node production build run successfully; Studio bundles with test IDs, without a live mutation.
- `APP_ENV=production npm run build` rejects fixture content as expected.
- The built Node server's public HTTP smoke covers home, AI/Crypto articles, source/date/author/fixture markup and missing/draft404s.
- Authenticated built-server smoke covers private draft content, ownership disclosure, no-store/noindex, invalid sessions, expiry, cross-origin rejection and logout cookie clearing.
- Public built assets were scanned for the test-only secret sentinels; no sentinels were found. This is a targeted check, not an exhaustive security certification.
- T3 browser initialization failed because the host blocks its sandbox through AppArmor. Browser layout, interactive accessibility and Lighthouse/field performance remain unverified.

For the authenticated HTTP smoke, use a running local Node build with matching test-only preview environment and `SMOKE_PREVIEW=1`, plus `SMOKE_BASE_URL` pointing to that server. The smoke checks never require production credentials.

## Still needed for live acceptance

A real Sanity project/dataset and authenticated editor access; actual preview read token; publish/correct/withdraw exercise against real reviewed content; deployment-host permission and cache tests; production branding/domain; and browser performance/accessibility checks. No cloud deployment, analytics subscription, email sending or feed automation has been performed.

## Independent review and accepted limits

The fresh-context reviewer found no Critical issues, two Important issues and one Minor issue. Important fixes reject calendar overflow/timezone-free dates and restrict local preview listening/Host handling. Regression tests were observed failing before fixes, then the 67-test suite, Astro check, local production build and authenticated/raw-Host HTTP smoke passed. The remaining Minor issue is the homepage lead action text “Read the guide” for every format; format-aware wording is deferred to discovery work.

Implementation decisions and their practical costs:

- Local Node adapter enables built-server testing; Vercel remains the remote adapter. Cost: local results cannot prove remote cache/deployment behavior.
- Remote preview remains disabled until durable limiting/access is designed. Cost: editors cannot use a shared remote draft preview yet.
- npm 11 was used for initial resolution because npm 10 crashed in its peer resolver. Cost: a newer setup tool is needed for reproducible dependency changes.
- Seven document types implement the seven types enumerated in the design, correcting the plan's earlier count of eight. Cost: any additional taxonomy type needs a later explicit schema change.
- App-wide origin middleware replaces Astro's early form response so preview rejections receive privacy headers. Cost: future mutation routes must preserve that origin policy; signed webhooks need independent authentication.
- RSS, search, redirects and publication cache refresh belong to the next discovery phase. Cost: this foundation is not a production news delivery system yet.
- Analytics/newsletter activation and full commercial placements belong to the later measurement phase. Cost: no real conversions, sends, ads or commissions are tracked here.
- Live CMS permissions/lifecycle and Vercel behavior lack account/deployment evidence. Cost: production acceptance remains open.
- Browser layout/accessibility and lab/field performance are not verified. Cost: HTTP/type/test success does not exclude visual or performance defects.
