# AI and Crypto Publication — Launch Design

Date: 2026-10-22
Status: architecture selected; concrete launch design ready for review before product implementation.

## Intent and selected direction

The founder selected Astro + Sanity native SaaS after comparing it with Next.js + Payload. Plausible SaaS supplies publication analytics. The product covers AI and crypto news, practical guides/reviews, affiliate relationships, later advertising/sponsorships, and clearly disclosed founder-owned projects.

The launch should produce a usable editorial publication with complete article HTML, useful discovery, RSS, and measurable reader conversions. It should not require an account to read, use copied competitor stories as inventory, or depend on unreviewed model output.

English is the working launch language, not a founder-confirmed market decision. Use `News` as a temporary configuration value for the name. Branding, contact details, domain, service accounts, and spending limits remain configurable launch inputs. Do not invent a legal entity, partner relationship, subscriber count, or published reporting.

## Delivery boundaries

1. Astro renders the public website on a managed host.
2. Sanity hosts editorial content, licensed media, and Studio. Do not provision a self-hosted CMS.
3. Plausible measures traffic and specific conversions; approved revenue remains in partner/payment records.
4. A managed email provider, selected before newsletter implementation, owns subscriptions, consent state, delivery and suppression.
5. Source polling and private editorial triage are a separate later service. Keep its state outside Sanity Free's public dataset.

Proposed frontend host: Vercel, using Astro's documented ISR adapter. Commercial production requires a suitable commercial plan. Do not buy a plan or deploy production as part of design work. A provider change must meet the same freshness, preview isolation and recovery acceptance requirements.

## Launch scope and page behavior

- `/`: lead story, latest reporting, clearly separated AI and Crypto streams, guides/reviews, newsletter call to action, and optional labelled sponsorship. Empty sections use honest empty states.
- `/ai/` and `/crypto/`: published section listings with path-based pagination. Format/topic filters run in an optional client island and may preserve state in query parameters without changing cached server HTML; the Astro ISR adapter does not include query parameters in its cache key.
- `/articles/[slug]/`: headline, summary, author, original publication and modification dates, accessible body, sources, corrections, disclosures, related coverage, and licensed media credits.
- `/authors/[slug]/`: biography and published articles. No invented credentials.
- `/guides/`: guides/reviews with clear dates and tested-versus-researched methodology.
- `/projects/`: founder-owned projects, prominently labelled; no fabricated product claims.
- `/search/`: search a published-content index with section filtering and clear no-results behavior.
- `/newsletter/`: description, signup and clear submission/error states; do not show a working-success state without provider acceptance.
- `/about/`, `/editorial-policy/`, `/corrections/`, `/privacy/`, and `/advertise/`: factual operational information; incomplete founder details must block production launch, not be silently invented.
- `/rss.xml`, `/ai/rss.xml`, `/crypto/rss.xml`: latest 50 matching published articles, stable IDs, valid dates, canonical links, escaped descriptions, and an absolute self URL.
- `/sitemap.xml` and `/robots.txt`: canonical published pages and discovery links; previews excluded. RSS alone is not the search indexing strategy.

Visual direction: an editorial layout with strong typography, readable article widths, restrained section accents, mobile-first navigation and reserved image dimensions. Use text labels and metadata to distinguish sections and commercial content; do not rely only on color. No ticker or market-price widgets at launch.

## Template references, versions and performance

Use Sanity's official Clean Astro starter as the integration reference, not as a finished newsroom. Develop an original layout using AstroNews's lead/latest/section hierarchy and The Magazine News's restrained reading design as references. Bookworm Light is a free fallback reference. Paid theme code requires verified licensing; no purchase is authorized by template selection.

Target Astro 7 only after a compatible Sanity/Portable Text/host-adapter production build and preview test. Pin the resolved compatible versions and runtime in the implementation lockfile. The inspected Sanity starter declares Astro `^6.1.6`; Bookworm pins `7.0.3`, while their public demos report `6.4.8` and `6.1.9` respectively. Paid themes advertise Astro 7 but exact dependencies are unverified.

Astro's reported 15–61% build speedup is a vendor benchmark, not a promise about this site's reader speed. The direct-demo measurements omit browser execution and complete dependency graphs; use them as research only. Full findings and raw data are in [the template review](../../research/2026-10-22-template-performance-review.md).

Benchmark the actual production build on home, AI section, article, review and search with representative content, the same host/test profile and at least three runs per route. Record version/commit/tool details, medians and ranges. Proposed release lab targets: mobile LCP ≤2.5 seconds, CLS ≤0.1, Total Blocking Time ≤200 ms. TBT is not field INP. Proposed article initial compressed budgets: executable JavaScript ≤100 kB including analytics, CSS ≤50 kB, hero image ≤200 kB. Count imported chunks, CSS, fonts and images; script-tag bytes alone are insufficient. Record approved exceptions and test a realistic sponsor placement.

After enough field traffic exists, monitor p75 LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1 by route/device. No samples means unknown. Optimize images, fonts and scripts rather than promising a template's advertised Lighthouse score. Browser performance testing remains pending because the research environment's browser sandbox was blocked.

## Content contract

Public articles contain: ID; unique slug; title; summary; AI/Crypto section; news/analysis/guide/review/announcement format; Portable Text body; author references; source URLs; event date where relevant; first publication and modification dates; language; rights-cleared media; SEO fields; corrections; and explicit commercial relationship (`none`, `affiliate`, `sponsored`, or `owned-project`) with accompanying disclosure.

Sanity document types: article, author, category, affiliateOffer, campaign, project, and siteSettings. Media uses Sanity asset references and separate credit/license fields.

Published offers contain public merchant/destination identifiers, active dates and disclosure. Published campaigns contain only public sponsor labels, assets and placement windows. Contracts, rates, confidential contacts and subscriber details never become published Sanity documents.

Slugs must be unique across articles. Changes create explicit permanent redirects; never silently break a published URL. Invalid dates, missing authors, empty bodies, missing sources for news, or absent required disclosures block the normal publishing workflow. Rendering must safely handle legacy invalid documents and log a non-sensitive error rather than emit broken structured data.

## Editorial access and automation

Start with manual publishing by a trusted founder. Sanity Free includes Administrator and Viewer, not dedicated Editor/Contributor roles. Studio validation and custom actions improve workflow but do not make a privileged API token draft-only.

Preview is server-authenticated, returns `Cache-Control: private, no-store`, is `noindex`, and never exposes a read/write token in browser bundles. Unauthenticated preview requests are rejected. API access to published data is intentionally public on Free; drafts require authorized access.

Do not add automation writes in the first milestone. The later ingestion service must validate model output, set drafts explicitly, and never expose a general mutation endpoint. If CMS-enforced draft-only automation or contributor separation is a requirement, resolve Sanity's actual role/token capability and plan before enabling it; application checks alone are insufficient against token compromise.

Sanity Free's history is limited. Editorial correction records and scheduled exports are necessary; do not promise an enterprise audit trail.

## Rendering, cache freshness and recovery

Use on-demand rendering with managed ISR for article, homepage, section and feed responses. Use static rendering for policy pages when their content source permits it. Exclude search query results, preview and form endpoints from shared ISR unless their cache keys and behavior are separately verified.

A signed Sanity webhook invokes a server-only invalidation endpoint. Validate the signature over the raw request body before acting; reject unsigned/incorrect payloads, apply request size/rate limits, and derive affected paths from validated document identity rather than accepting arbitrary URLs. Store the signing secret privately.

For publish/edit/withdrawal, invalidate the article, home, matching section, guides/author/project pages when relevant, all affected feeds, sitemap, and search index. Use a fresh published-content read during regeneration to avoid rebuilding a page from stale CMS API-CDN data. A fallback 60-second expiration helps recovery but is not a hard freshness guarantee: stale-while-revalidate may serve an older response while regeneration runs.

Acceptance target: publish, correction and withdrawal reflected across affected public routes within two minutes during normal operation on the selected host. Test warm and cold caches, webhook retries, changed slugs, deleted/withdrawn documents and Sanity outages. Measure propagation rather than claiming instantaneous publication. Serve cached public articles during transient backend errors where safe; urgent withdrawal needs an explicit purge/removal operation and verification.

Without Sanity credentials, local development uses clearly labelled fixture content through the same public-content interface. Fixture content must never be presented as real reporting or accidentally deployed to production. Production build/configuration rejects a fixture-content mode.

## Search

Generate an index only from published article IDs, title, summary, section, slug and dates. No draft/private field may enter the index. For a small archive, use a client-loaded static index refreshed with publication; measure its size and introduce a dedicated backend when payload or relevance becomes a demonstrated problem. Search is not allowed to trigger whole-site builds per article. Hosting of the refreshed index must fit the publication/invalidation flow before this milestone is accepted.

## Analytics and commercial measurement

Use one primary audience tracker: Plausible, enabled only with a configured production domain. No tracker on previews, tests or local development. Do not install several overlapping analytics SDKs by default.

Events:

- `newsletter_signup`: provider accepted the subscription request; this is not a confirmed subscriber count.
- `affiliate_click`: outbound link activation, with article ID, AI/Crypto section, partner ID and placement.
- `sponsor_click`: activation of a labelled campaign link, with campaign ID and placement.
- `owned_project_click`: activation of a founder-project link, with project ID and placement.

Never include email addresses, personal IDs, tokens, or sensitive URL query strings. A blocked/unavailable analytics script must not stop navigation, subscription or reading. Test keyboard activation and avoid double-counting clicks across navigation.

Confirmed opt-ins, unsubscribe and delivery statistics come from the email provider. Approved commissions and clawbacks come from affiliate reports. Sponsor delivery reports must distinguish measured clicks, pageviews and actual viewable ad impressions; do not call a pageview an impression measurement unless the inventory is instrumented accordingly. RSS downloads are not subscriber counts, and off-site RSS readership is not fully captured by website JavaScript analytics.

Use real-user performance monitoring from the selected host or Cloudflare separately from conversion measurement. Add PostHog only if product funnels/replay are actually needed, with the associated performance and privacy decisions reviewed then.

## Newsletter and commercial delivery

Select a managed provider before implementing the signup integration. Validate email server-side, rate-limit submissions, use configured origin protection, and preserve unsubscribe/suppression through the provider. Return generic safe responses and accessible error messages. Do not send newsletters or contacts during development.

Affiliate links need visible disclosure before the first commercial link and `rel="sponsored"`; apply `noopener` for new tabs. Sponsors and owned projects are labelled in listings and articles. Expired offers/campaigns do not render as active. Do not sell placements or display real partner logos until those relationships exist.

## Source ingestion milestone

The supplied PANews, Grenade and BlockTempo feeds remain discovery sources. Preserve the original and redirected URLs; detect per-item language rather than trusting feed-level labels. Add verified AI primary sources before claiming balanced coverage.

Private ingestion stores minimal permitted metadata, durable idempotency keys, fetch validators and retry state. Use timeouts, size caps, safe XML parsing and outbound host restrictions, including validation after redirects. Link related coverage into clusters; an editor verifies primary evidence before preparing an original draft. Do not automatically translate and republish competitor articles.

The worker is not part of the first public-site foundation. It gets a separate private storage/authentication design and implementation plan before development.

## Operations and launch gates

- Pin compatible Astro, host-adapter, Sanity and analytics dependencies after checking their current documentation.
- Verify the production host's commercial terms and costs; Sanity Free and frontend/analytics/email hosting are separate bills and quotas.
- Alert at proposed 70% and 85% Sanity quota consumption; do not count raw RSS data toward editorial storage.
- Schedule editorial exports plus asset recovery and demonstrate restoration in staging. Targets: maximum 24-hour data loss and four-hour restoration, subject to demonstrated provider capabilities.
- CI runs type checks, build, semantic integration tests and critical publication/browser flows. Tests exercise permissions, cache behavior and external failures rather than mirror static markup.
- Release requires accurate branding/contact/policies, original reviewed launch articles, rights-cleared media, working source links, RSS/sitemap validation, disclosures, accessible mobile reading, and verified conversion events.
- Deploy previews before production, retain rollback instructions, and monitor publication failures and stale feeds independently of website uptime.

## Incremental implementation sequence

Phase IDs and completion evidence are maintained in the [master checklist](../../plans/ai-crypto-publication-checklist.md). Business decisions are Phase 0; manual content preparation proceeds alongside engineering; public launch does not depend on automated feed ingestion.

1. Foundation: Astro project, Sanity schemas/Studio, content adapter with labelled local fixtures, article rendering, private preview and configuration validation.
2. Discovery and delivery: homepage/sections/authors/guides, RSS/sitemap, redirects, search, ISR webhook integration and propagation tests.
3. Commercial measurement: Plausible goals, public affiliate/sponsor components, owned-project pages and provider-backed newsletter signup.
4. Operations and launch: CI, exports/restore drill, monitoring, original editorial inventory, policies and production acceptance.
5. Private ingestion: approved source registry, queue/inbox, clustering and draft assistance; resolve least-privilege CMS capabilities before enabling writes.

Each milestone gets a scoped implementation plan with exact interfaces and verification commands after review of this design. The business checklist remains `docs/plans/ai-crypto-publication-checklist.md`.

## Source documentation

- Astro rendering: https://docs.astro.build/en/guides/on-demand-rendering/
- Astro Vercel adapter, ISR and preview: https://docs.astro.build/en/guides/integrations-guide/vercel/
- Astro RSS: https://docs.astro.build/en/recipes/rss/
- Sanity plan capabilities: https://www.sanity.io/pricing
- Sanity authentication/drafts: https://www.sanity.io/docs/http-reference/doc
- Sanity quotas: https://www.sanity.io/docs/platform-management/plans-and-payments
- Plausible conversion events: https://plausible.io/docs/goal-conversions
- Vercel commercial hosting terms: https://vercel.com/legal/terms
