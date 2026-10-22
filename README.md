# News — AI and crypto publication

An Astro publication with a separate Sanity Studio workspace. The brand is a configurable development placeholder. The foundation includes labelled local samples; these are not current reporting.

## Requirements and setup

Node 22.23.4 or newer. Run `npm ci` from the repository root (the initial install uses npm 11 to avoid an npm 10 peer-resolver crash). Copy `.env.example` to `.env` and keep actual secrets out of git.

- `npm run dev` — public site on loopback port 4321.
- `npm run dev:studio` — Studio, after setting a real Sanity project/dataset.
- `npm run check` — Astro/TypeScript diagnostics.
- `npm test` — behavior tests.
- `npm run build` — local Node server build; Vercel uses its own adapter when `VERCEL` is set.
- `npm run preview` — local built server on loopback (default port 4321; refuses all-interface binding).
- `npm run verify:foundation` — HTTP smoke checks against a running local built server.

The approved foundation targets Astro 7.4.2, Vercel adapter 11.0.16, Sanity integration 3.5.1 and Portable Text 1.0.1. Exact resolved dependencies live in `package-lock.json`. Package metadata compatibility is not equivalent to a deployment test.

## Service boundaries

No hosting, Sanity project, analytics subscription, email service or partner account is created by running the local site. Fixture mode is rejected for remote deployments. Remote preview remains disabled until a durable rate limiter and live Sanity access are configured.

See the [approved design](docs/superpowers/specs/2026-10-22-publication-launch-design.md), [foundation plan](docs/superpowers/plans/2026-10-22-editorial-foundation.md) and [business checklist](docs/plans/ai-crypto-publication-checklist.md).

## Multilingual launch implementation

Local editions: `/en/`, `/zh/` (Traditional), `/zh-cn/` (Simplified), with section/article pages, search, RSS, sitemap and language switching. `npm run verify:local` exercises the built reader site and private previews without live credentials. `npm run check:automation` checks the separate worker, `npm run check:client` checks browser scripts, `npm run automation -- status` shows its paused private queue, and `npm run preflight` lists redacted production gates.

See [launch setup and acceptance](docs/operations/launch-readiness.md), [private worker](docs/operations/automation.md) and [review record](docs/operations/2026-10-22-launch-review.md). Newsletter/GA4 require verified configuration; the independent semantic verifier, Dots connection and live operations remain external integration work. Nothing is deployed or publishing automatically by default.
