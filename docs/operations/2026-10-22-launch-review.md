# Launch implementation review — 2026-10-22

Fresh-context read-only review covered bbbf23c..f4d7509. No Critical findings; five Important findings were reproduced and fixed in one pass:

1. Missing translated bodies/disclosures inherited root English content. Localized fields now must be supplied independently, and cannot override shared metadata.
2. Corrections could change slugs. They now preserve every published edition URL; renaming requires a future redirect workflow.
3. Studio did not detect legacy English versus translated English slug collisions. Studio and publisher now share one collision query including both formats.
4. Held jobs could not recover. An explicit audited operator release is now available; terminal states stay protected, exhausted leases and failed validations hold safely.
5. GA4 sanitized URLs only on pageviews. Global configuration and every custom event now use clean URL/referrer context.

Each issue has a regression observed RED before its fix and GREEN after. Stable-URL corrections and single-write publication replay have positive controls. Final local suite:102 passing tests, zero Astro diagnostics, automation TypeScript and client syntax checks, Node build and built public/private/locale HTTP checks. Studio and Vercel adapter builds use test project IDs; they do not establish live CMS acceptance. Node SQLite remains experimental in the pinned runtime.

Deferred minor: Chinese pages still have some English accessibility/navigation labels. Browser acceptance remains required.

Decisions and limits:
- Service IDs/access were requested but unavailable. Live CMS/provider confirmation/suppression acceptance remains required; otherwise service delivery/lifecycle can fail.
- Real GA4 network payloads need staging checks; VM tests establish our code behavior only. Incorrect provider behavior could leak metadata or miss conversions.
- Actual Vercel caching/trusted-country headers need deployment tests. Local HTTP/build checks cannot rule out wrong entry locale or stale content at the edge.
- Dots tool connection and independent semantic evidence verifier remain unimplemented/inactive. A signed report proves its origin, not factual truth; unsafe automation must remain paused until those integrations are verified.
- Browser/mobile/accessibility/performance remain open because preview_open is AppArmor-blocked; layout/reader defects may remain.
- Actual SaaS roles/token permissions remain unverified; dataset-level write credentials may be broader than desired.
- Dependency audit retains16 advisories (7high,9moderate); compatible overrides reduced the original20 without forced framework downgrades. Exploitability/upstream resolution still needs a documented release decision.
- Private queue is SQLite outside Vercel's ephemeral functions; provision a durable worker host or supply a managed queue adapter before24/7 activation.
- Signup uses server-validated Turnstile instead of an in-memory serverless limiter. Add the site/secret configuration and verify abuse controls before enabling signup.

The release-readiness command correctly blocks activation. No deployment, live mail, CMS write, automatic source polling or Dots run was performed.
