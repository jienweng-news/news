# AI and Crypto Publication — Launch Design

Date: 2026-10-22
Status: launch design approved by the founder on 2026-10-22 ("apporveand move on"); native foundation implementation authorized and completed locally; live acceptance pending.

## Intent and selected direction

The founder selected Astro + Sanity native SaaS after comparing it with Next.js + Payload. The founder subsequently selected Google Analytics 4 standard for free analytics, superseding paid Plausible. The product covers AI and crypto news, practical guides/reviews, affiliate relationships, later advertising/sponsorships, and clearly disclosed founder-owned projects.

The launch should produce a usable editorial publication with complete article HTML, useful discovery, RSS, and measurable reader conversions. It should not require an account to read, use copied competitor stories as inventory, or depend on unreviewed model output.

English and Traditional Chinese are founder-confirmed launch languages. The current implementation remains English-only; bilingual support requires a follow-on design and implementation. The founder selected the independent media brand **Token on Air**, with `tokenonair.com` purchased according to the founder’s confirmation. Registrar access, DNS, TLS and hosting connection remain unverified; brand clearance remains unverified. The founder confirmed `Token on Air` as the shared brand for both language editions, using a Traditional Chinese tagline rather than a separate Chinese name. The founder selected the taglines **Understand what’s next.** (English) and **看懂科技下一步。** (Traditional Chinese). The founder selected the Persona-inspired newsroom visual direction; implementation and browser verification remain pending. The implementation still uses `News` as a temporary configuration value until branding is applied. Contact details, domain connection, service accounts, and spending limits remain launch inputs. Do not invent a legal entity, partner relationship, subscriber count, or published reporting.

## Audience decision

The founder selected both builders/founders/technology users and investors/market followers. Geographic focus is global AI/crypto coverage with a Taiwan/Asia lens. Translation coverage/review staffing and the balance between practical and market coverage remain undecided; no priority between these audience groups is assumed approved.

## Bilingual launch decision

Provide English and Traditional Chinese reader experiences. The founder confirmed both English and Traditional Chinese versions for every qualifying story. Use one shared automated editorial operation with linked language versions, AI-generated translations with automated evidence/terminology checks and synchronized corrections/disclosures; unresolved translations are held. Define release timing and partial-language failure behavior in the automation plan; bilingual coverage does not imply unverified versions are published.

The follow-on discovery plan must define locale codes and URLs, translation-group identity, per-language slugs/navigation/search/RSS, self-canonical and hreflang metadata, and behavior for unavailable translations. Never expose an unreviewed translation or a language-switch link to a missing page. Re-estimate delivery and content workload; the earlier single-language estimates are not a bilingual commitment.

## Delivery boundaries

1. Astro renders the public website on a managed host.
2. Sanity hosts editorial content, licensed media, and Studio. Do not provision a self-hosted CMS.
3. GA4 measures traffic and configured events/key events; approved revenue remains in partner/payment records.
4. A managed email provider, selected before newsletter implementation, owns subscriptions, consent state, delivery and suppression.
5. Source polling and private editorial triage are a separate later service. Keep its state outside Sanity Free's public dataset.

Founder-selected frontend host: Vercel, using Astro's documented ISR adapter. Commercial production requires a suitable commercial plan. Do not buy a plan or deploy production as part of design work. A provider change must meet the same freshness, preview isolation and recovery acceptance requirements.

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

Visual direction: the founder-approved [Persona-inspired newsroom](../../design/2026-10-22-token-on-air-visual-direction.md), with an original red/black/warm-white palette, cutout-style masthead, condensed display headlines, angled section treatments and a dark latest-headlines column. Retain a lead/latest/section news hierarchy, calm upright article body text, readable widths, mobile-first navigation and reserved image dimensions. Use text labels and metadata to distinguish sections and commercial content; do not rely only on color. No ticker or market-price widgets at launch.

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

The implemented foundation supports manual publishing by a trusted founder. The founder now selected automatic AI-written website publication as the target operation; that separate subsystem is not implemented. Sanity Free includes Administrator and Viewer, not dedicated Editor/Contributor roles. Studio validation and custom actions improve workflow but do not make a privileged API token draft-only.

Preview is server-authenticated, returns `Cache-Control: private, no-store`, is `noindex`, and never exposes a read/write token in browser bundles. Unauthenticated preview requests are rejected. API access to published data is intentionally public on Free; drafts require authorized access.

Do not add automation writes in the first milestone. The later ingestion service must validate model output and evidence, then use a separate controlled publisher after checks pass; never expose a general mutation endpoint. Resolve actual role/token capabilities before enabling publish credentials. Application checks alone do not prevent misuse of a compromised privileged token.

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

Use Google Analytics 4 standard as the founder-selected primary audience tracker, enabled only with a configured production domain and appropriate consent behavior. Configure the following desired custom events; mark intended business outcomes as key events and avoid duplicate automatic/custom tracking. Sanitize page URLs and event parameters before collection. No tracker on previews, tests or local development. Do not install several overlapping analytics SDKs by default.

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

Private ingestion stores minimal permitted metadata, durable idempotency keys, fetch validators and retry state. Use timeouts, size caps, safe XML parsing and outbound host restrictions, including validation after redirects. Link related coverage into clusters; the writing service prepares an original attributed draft and an independent validation stage checks factual claims against retrievable evidence before a controlled publisher can publish. Failed checks hold the item; model confidence alone does not establish accuracy. Do not automatically translate and republish competitor articles.

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

Phase IDs and completion evidence are maintained in the [master checklist](../../plans/ai-crypto-publication-checklist.md). Business decisions are Phase 0; content preparation can proceed alongside engineering; launching the founder-selected automatic editorial operation requires the separately specified ingestion, validation and publication subsystem.

1. Foundation: Astro project, Sanity schemas/Studio, content adapter with labelled local fixtures, article rendering, private preview and configuration validation.
2. Discovery and delivery: homepage/sections/authors/guides, RSS/sitemap, redirects, search, ISR webhook integration and propagation tests.
3. Commercial measurement: supported free-tracker conversions, public affiliate/sponsor components, owned-project pages and provider-backed newsletter signup.
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


## Founder editorial decisions — 2026-10-22

The founder confirmed 40% practical AI/crypto coverage and 60% markets, funding and industry developments. This is an editorial-format balance, separate from the AI-versus-crypto topic balance; measure unique stories rather than counting translations twice.

The founder explicitly selected AI-written articles with automatic website publication and no routine per-article human approval, superseding the earlier draft-only proposal. Target workflow: permitted RSS discovery → evidence-linked original writing → independent automated validation → controlled publication. Hold items that fail checks. Require source attribution, editor credit `jienweng` (no AI-generated label per founder instruction), deduplication, translation consistency, daily/spend limits, audit evidence, a kill switch, and a corrections/escalation owner. Automated checks reduce risk but do not guarantee accuracy. Full-text republication, close paraphrases and translations of source articles require appropriate rights; feed availability is not a license. Daily volume, source allowlist, model/budget and risk scope remain unresolved. This requires a separate automation design/implementation plan; no live automation exists yet. Newsletter/social sends and deployment remain separate actions.


### Freshness and throughput decision

The founder prefers higher, source-driven publication rather than four unique stories per day, and prioritizes timely coverage. Proposed targets, pending implementation measurements: poll approved feeds every five minutes where source limits permit, then aim to publish valid original stories within 10–15 minutes of discovery. This is not a promise of end-to-end latency from the underlying event: source publication/feed delays are external. Track source, discovery and publication times separately; prioritize fresh clusters, deduplicate overlapping reporting, update existing stories for material changes, and avoid presenting stale startup/backlog items as breaking news. No unlimited spend or numeric daily cap is approved. The founder confirmed 24/7 automatic website publishing. Source-specific lookback/staleness rules, burst/concurrency limits, alerts/escalation ownership and budget remain open.


### Cost and provider preferences

The founder selected Dots for AI generation and asked to exclude its generation charges from the current cash budget; its identity/API/access/throughput remain unverified. The founder selected Vercel hosting and free analytics, superseding paid Plausible. The founder selected GA4 standard; property/data-stream setup and event verification remain pending. Sanity Free remains the CMS recommendation after a current official-source recheck; Payload Cloud new deployments are paused. See ../../research/2026-10-22-managed-cms-recheck.md for evidence, quota constraints and commercial-hosting limitations. No paid plan purchase or deployment is authorized by this preference update.


### Bilingual content-model decision

The founder approved a single bilingual Sanity article document per unique story, using localized fields for English and Traditional Chinese titles, slugs, summaries and rich-text bodies, and shared source/media references. Emit separate locale URLs, search records, feeds and SEO metadata without duplicating the CMS article document. Validate Portable Text localization, attribute/document-size limits, locale slug uniqueness and a publish transaction that requires both languages to pass checks. Both locales share a publication lifecycle; if either fails, hold publication rather than publish an unverified translation. Draft copies and other document types remain quota usage. Sanity documents both field-level and document-level localization: https://www.sanity.io/docs/studio/localization . No Payload migration is selected; the founder’s self-hosting question is comparative research.


### CMS reconfirmation

After reviewing Payload infrastructure requirements, the founder explicitly reconfirmed continuing with Sanity managed CMS, initially Free within verified quotas and access constraints. No Payload migration is planned. This does not approve a paid upgrade or deployment.


### Dots identity and integration direction

The founder clarified that Dots is OpenAI ChatGPT dots, the always-on agent. Official documentation describes ongoing responsibilities, schedules and connected plugins: https://learn.chatgpt.com/docs/dots , https://learn.chatgpt.com/docs/dots/getting-started , https://learn.chatgpt.com/docs/dots/controls . It does not establish this account’s access, a website-callable Dots inference API or a five-minute execution guarantee.

Proposed architecture: a durable private discovery queue that records feed freshness independently of agent availability; the dot pulls/claims jobs over an authenticated supported tool connection, researches primary evidence and produces both locale versions; it submits structured articles to a controlled publisher that validates schema, job identity, sources and idempotency, then writes one bilingual Sanity article. Keep Sanity credentials inside the publisher. Dot permissions/automatic action review and connection availability require live verification. Do not schedule or claim a running dot from this Codex thread. Preserve queued jobs and alert on stalls rather than silently substituting a paid inference API. A ready-to-configure brief is at ../../operations/dots-editorial-brief.md .


### Topic-balance decision

The founder selected source-driven AI-versus-crypto coverage, without a fixed daily topic quota. Both sections retain equal navigation prominence. Prioritize fresh relevant unique developments with adequate evidence, while monitoring source concentration. The 40/60 practical-versus-markets/funding/industry mix is a separate rolling target. Add primary AI sources rather than treating the initial crypto-heavy feeds as representative of all technology news.


### Newsletter launch decision

The founder selected newsletter signup at launch and digest sending later, once publishing is stable. Implement provider-backed signup, confirmation, unsubscribe/suppression and accessible feedback. The founder selected beehiiv Free; account/publication setup, API/form integration, sender identity and digest start date remain open. Do not represent subscriber collection as authorization to send an issue automatically.


### Newsletter provider decision

Founder selected beehiiv Free for launch signup, retaining Astro for the website and keeping subscriber data in the email provider. Verify current plan entitlements, confirmation/unsubscribe/suppression, export, language-preference handling, signup integration and sender-domain authentication before production. Current pricing evidence: https://www.beehiiv.com/pricing . Selection does not authorize a paid upgrade or sending an issue; digest distribution remains deferred.


### Newsletter language preference

Founder approved English, Traditional Chinese or both choices at signup. Preselect the current page language, allow the subscriber to change it, and persist the preference in beehiiv subject to verified Free-plan field/segmentation capabilities. One subscriber choosing both is not two subscriber records. Sending remains deferred.


### Editor credit decision

The founder selected the exact public editor name `jienweng`, rejected “Token on Air Desk” and requested no AI-generated disclosure. Use an editor relationship and visible editor label rather than implying human authorship, personal reporting or per-article human review. Preserve source attribution, corrections and commercial disclosures. Biography and credentials must come from the founder; do not invent them.


### Fixed discovery inputs

The founder selected a fixed source list and requested expansion. The curated list is ../../research/2026-10-22-fixed-source-list.md , with 25 HTTP/XML-verified feeds in ../../research/source-checks/2026-10-22-fixed-sources.json . This adds 22 sources to the original three and balances primary AI/crypto evidence with international and Taiwan newsrooms. Per-source automated-use terms and operational checks remain pending. Sources are not automatically enabled, and new feeds require approval. Page-watch candidates and blocked endpoints remain outside active ingestion.


### Locale URLs and first-visit selection

Founder confirmed Astro i18n routes `/en/` and `/zh/`. `/zh/` is the existing Traditional Chinese edition, using `lang="zh-Hant"` and matching hreflang metadata rather than changing to Simplified Chinese based on country. At `/` only, use a valid saved manual preference first, then trusted Vercel geolocation: country CN or TW selects `/zh/`; other or absent country selects `/en/`. IP geography is approximate and can reflect a VPN/proxy. No GPS or precise-location permission is needed. Explicit locale paths always win and never geo-redirect.

Implement root selection using temporary redirects with `private, no-store` to prevent a user's choice/region being shared through a cached root response. Keep language-specific pages independently cacheable with self-canonicals, reciprocal `en`/`zh-Hant` hreflang and an appropriate x-default. Both versions must remain discoverable through language links and locale sitemaps, without relying on geolocation or user-agent-specific content. Persist manual switches and link to the same article in the other locale. Verify source trust for Vercel headers and local no-geolocation fallback. Official references: https://docs.astro.build/en/guides/internationalization/ , https://vercel.com/docs/headers/request-headers , https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages .


### Startup lookback and Chinese-script proposal

Founder confirmed a 48-hour initial discovery lookback, processing freshest eligible items first with deduplication and accurate event/source dates. A rotating feed may contain fewer than 48 hours; do not infer completeness. Extended-outage recovery remains a bounded policy to define.

The founder asked whether to add Simplified Chinese for China in addition to Traditional Chinese for Taiwan. Recommended, not yet confirmed: retain `/zh/` for Traditional (`zh-Hant`), add `/zh-cn/` for Simplified (`zh-Hans`), and retain `/en/` English. Use root-only CN → Simplified and TW → Traditional, with explicit locale URLs/saved user choices preceding geography. Consider HK/MO Traditional as part of confirmation. All three variants can live in one localized article document; validate language-specific terminology, entity names, metadata, rich-text limits and publication failure policy rather than relying on blind character conversion. Add self-canonicals, reciprocal language/script hreflang, locale feeds/search and newsletter preference mapping if confirmed. Three output variants do not require three CMS article documents, but increase bytes and validation workload.


### Confirmed three-variant launch — supersedes earlier bilingual and locale sections

The founder approved English, Traditional Chinese and Simplified Chinese for every qualifying story. Store all three variants as localized fields in one Sanity article document, subject to validated rich-text/attribute/document-size limits. Use `/en/` (en), `/zh/` (zh-Hant), `/zh-cn/` (zh-Hans). Root-only first-entry selection: saved explicit preference, then CN→Simplified; TW/HK/MO→Traditional; other/unknown→English. Explicit locale URLs always win. Preserve private/no-store temporary root selection and independently cacheable locale pages with self-canonicals and reciprocal hreflang.

All three publication variants must pass checks before shared publication. Synchronize corrections and verify regional terminology, entities, numbers, source links and disclosures; do not assume character conversion is sufficient. Extend search, feeds, metadata, navigation, language switching and the private publisher schema to all three. Signup choices become English, Traditional Chinese, Simplified Chinese or all three, defaulting to page locale and persisted once per subscriber (provider capability pending). This decision supersedes earlier two-language descriptions and CN→Traditional routing. The original mockup still demonstrates two variants; production design validation must cover Simplified Chinese too. Confirmed startup lookback remains 48 hours.

### Contact email decision — Zoho Free

Founder selected Zoho Mail Forever Free for business/contact email on tokenonair.com, subject to regional availability. Advertised free limits: one custom domain, up to five users, 5 GB per user; IMAP/POP/ActiveSync are excluded. Signup, domain ownership verification, mailbox creation, region-specific MX/SPF/DKIM and DMARC configuration, and authorized delivery verification remain pending. Recommended public address hello@tokenonair.com is not yet confirmed or created. beehiiv remains the newsletter provider; this decision does not enable digest sending. Sources: https://www.zoho.com/mail/zohomail-pricing.html and https://www.zoho.com/mail/help/adminconsole/email-hosting-setup.html .
