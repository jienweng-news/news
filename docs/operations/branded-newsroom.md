# Branded newsroom — local implementation

Implemented 2026-10-22 on the existing foundation:
- Token on Air masthead, approved red/black/paper direction, self-hosted OFL Barlow Condensed Bold.
- Latest-publication lead, latest headlines, equally prominent AI/Crypto sections; analysis appears when matching stories exist.
- `/ai/` and `/crypto/` topic pages; existing `/articles/:slug/` URLs retained.
- `jienweng` credited as editor, without claiming per-story human review. Fixture identity and private-preview warnings retained.
- Existing source, correction and commercial-disclosure rendering retained.

Run `npm run dev`; labelled samples render without CMS credentials. `npm test`, `npm run check`, `npm run build`, then `npm run preview`; `node scripts/check-newsroom.mjs` and `npm run verify:foundation` verify a running fixture site. Override SMOKE_BASE_URL for another local port. Private smoke additionally uses SMOKE_PREVIEW=1 plus test-only preview secrets shared with the loopback server; it sends no email and performs no CMS writes.

Evidence: 70 Vitest tests pass; Astro check zero diagnostics; Node-adapter build passes; built HTTP smoke verifies home, topic isolation, article links, editor credit, fixture/noindex labels and private-preview protections. Existing production fixture rejection tests still pass. This is not live Sanity, Vercel, signup, delivery or performance verification.

Remaining: English/Traditional/Simplified localized schema and rendering, `/en/` `/zh/` `/zh-cn/` root negotiation and hreflang, RSS/search, cache lifecycle, GA4 consent/events, beehiiv signup, controlled source ingestion and Dots publication, live CMS lifecycle, deployment and operational checks. Zoho account setup is being handled by the founder; no mailbox or DNS activation claimed here.

Browser limitation: T3 preview_open returned: “This host blocks the sandbox T3's browser runs in (AppArmor on Ubuntu 23.10+).” Screenshots, real mobile layout, keyboard navigation and rendered contrast/overflow remain unverified. The local implementation is reviewable; visual launch acceptance remains open.

Final review: fresh read-only reviewer found two important omissions, fixed with built integration RED→GREEN: homepage image credit/license and commercial relationship labels on lead/listings. `node scripts/check-newsroom-states.mjs` additionally verifies genuine empty responses (200) versus mocked CMS outages (503/noindex/no-store), without a live CMS. Deferred minor findings: section-page stories use h3 below h1; the earlier visual-direction document retains an outdated pending-implementation sentence. The operations status here is authoritative for this slice.
