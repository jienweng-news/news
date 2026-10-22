# AI and Crypto Publication — Business and Delivery Checklist

Updated: 2026-10-22. Product implementation has not started.

Selected stack: **Astro + Sanity native SaaS + Plausible SaaS**, with a managed website host. Technical reference: Sanity's official Astro starter. Visual references: AstroNews for newsroom composition; The Magazine News for a simpler reading experience. Paid template code is not selected or purchased.

Design: [Launch specification](../superpowers/specs/2026-10-22-publication-launch-design.md). Evidence: [Template/version review](../research/2026-10-22-template-performance-review.md).

## How to use this checklist

This is the master business and delivery checklist; each implementation phase receives a smaller engineering plan before coding. Phase numbers are execution order. Track evidence beside completed items; checked boxes mean a decision or result exists, not that a vendor advertises the feature.

- **P0:** required for production launch. **P1:** first 90 days. **P2:** later, only with demonstrated demand.
- **Founder:** audience, brand, editorial approval and commercial decisions. **Engineering:** implementation and operations. One person may hold both roles, but must still own each deliverable.
- Items have stable IDs for issues and review comments. When blocked, record the missing input and continue independent work in the current phase.
- Local fixtures and previews can proceed with configurable defaults. Production requires real branding, accounts, original reporting and accurate policy/contact information.
- The proposed 6–8 week launch window and 120–200 engineering hours are initial estimates for a small publication, excluding later ingestion automation. Re-estimate after the foundation phase; do not treat them as commitments.

## Decisions already recorded

- [x] D01 — Cover both AI and crypto, with distinct sections and substantive overlap coverage.
- [x] D02 — Support affiliates, future sponsors/advertising, and clearly labelled founder-project publication.
- [x] D03 — Select Astro, Sanity managed SaaS and Plausible; no self-hosted CMS.
- [x] D04 — Inspect PANews, Grenade and BlockTempo RSS by direct HTTP fetch and XML parsing.
- [x] D05 — Check template source versions and public-demo delivery; retain raw evidence and measurement limitations.

Still proposed: English-first; one founder/editor; no reader accounts or paid memberships at launch; Vercel commercial hosting with Astro ISR. Astro 7 is the target subject to a compatible Sanity/adapter production build. These are not silently approved purchases or market decisions.

## Phase 0 — Business brief, budget and implementation scope

**Priority:** P0. **Owner:** Founder, with Engineering for feasibility. **Dependencies:** none. **Outputs:** approved scope, provider budget, reviewed launch design.

- [ ] B01 — Confirm primary reader and geography. Starting hypothesis: builders and technology users evaluating AI tools and digital-asset infrastructure.
- [ ] B02 — Confirm launch language; supplied feeds include Traditional Chinese and mixed-language items. Preserve source language even if publication is English.
- [ ] B03 — Set brand, domain, genuine author identity/biography, contact address and ownership details. Keep `News` only as a development label.
- [ ] B04 — List founder-owned projects and how their relevance and ownership will be disclosed.
- [ ] B05 — Assign editorial and engineering owners, weekly availability, launch-content capacity and incident contact.
- [ ] B06 — Approve a monthly cash ceiling. Initial planning ceiling: $150/month for infrastructure/automation, excluding labor and legal/accounting; validate against actual quotes.
- [ ] B07 — Obtain current quotes for commercial frontend hosting, Sanity entitlements, Plausible, email, domain, recovery/export storage and optional AI usage. Record recurring versus usage costs and hard caps.
- [ ] B08 — Build a six-month cash worksheet including zero revenue, observed revenue, founder labor, a 20% implementation contingency, and a stop-spending threshold.
- [ ] B09 — Review the launch specification and template recommendation; record any scope changes before converting Phase 1 into coding tasks.

**Exit evidence:** one written business brief and budget; named owners; concrete launch design reviewed. Branding and accounts may remain configurable during local development, but must be resolved before Phase 5 exit.

## Phase 1 — Template, versions and editorial foundation

**Priority:** P0. **Owner:** Engineering; Founder reviews editorial usability. **Dependencies:** B09. **Outputs:** reproducible local project, Sanity schemas, authenticated preview, first staging article.

### Foundation and compatibility

- [ ] F01 — Review the official Sanity starter's current source, reuse license, framework requirements and environment variables. Use its integration patterns; no paid theme source may be copied without a suitable license.
- [ ] F02 — Validate Astro 7 with compatible `@sanity/astro`, Portable Text, React integration and host-adapter versions. Record exact resolved versions and runtime in a committed lockfile and setup notes. If compatibility fails, record a tested fallback rather than force-upgrading.
- [ ] F03 — Run type check and production build before adding newsroom features. Verify a published Sanity article, licensed image and preview flow on the candidate host.
- [ ] F04 — Configure separate public content reads and private preview credentials. Reject fixture-content mode in production; local samples must be visibly labelled.
- [ ] F05 — Use an original editorial layout: lead story, compact latest list, AI/Crypto sections and readable article pages. Refer to AstroNews for hierarchy and The Magazine News for restraint; final layout is not chosen by demo timing alone.
- [ ] F06 — Add no client framework, carousel, animation library or tag manager without a reader-facing reason. A dependency in `package.json` does not prove it is shipped to readers; verify the built bundles.

### Sanity content and permissions

- [ ] F07 — Define article, author, category, affiliateOffer, campaign, project and siteSettings schemas; use Portable Text and Sanity media references with license/credit/alt fields.
- [ ] F08 — Require article section, format, unique slug, title, summary, body, byline, publication/update dates, source links for news, and relationship disclosure when applicable.
- [ ] F09 — Keep subscriber details, contracts, confidential notes, raw feed inboxes and job logs outside Sanity Free public documents. Published fields are public even if the website hides them.
- [ ] F10 — Implement manual publishing, correction entries and withdrawal. Document that Studio validation is not CMS-enforced draft-only access for a privileged token.
- [ ] F11 — Verify available Sanity roles against the chosen plan. Free's Administrator/Viewer model does not satisfy a separate Editor or draft-only automation role; resolve an upgrade or different access design before requiring either.
- [ ] F12 — Authenticate preview, set `private, no-store` and `noindex`, and exclude preview from analytics. Do not treat an unlisted URL or `robots.txt` as authentication.
- [ ] F13 — Demonstrate create → preview → publish → correct → withdraw. Test anonymous draft/API access, invalid content, duplicate slugs and missing media without leaking secrets.

**Exit evidence:** compatible locked dependencies; passing production build; staging publication lifecycle; anonymous requests cannot read drafts; Founder can edit without changing code. Proposed file boundaries are in the launch specification; fix them in the Phase 1 engineering plan.

## Phase 2 — Reader experience, fresh delivery, search and RSS

**Priority:** P0. **Owner:** Engineering. **Dependencies:** Phase 1. **Outputs:** complete public discovery and measured publishing propagation.

- [ ] R01 — Build homepage, AI/Crypto section fronts, articles, authors, guides/reviews and founder-project pages. Handle empty sections, absent media, long titles and mobile navigation honestly.
- [ ] R02 — Add stable canonical URLs, author/date metadata, social cards, appropriate Article/NewsArticle JSON-LD, breadcrumbs and related coverage.
- [ ] R03 — Preserve old slugs with permanent redirects; test changed/deleted/withdrawn articles and real 404 responses.
- [ ] R04 — Configure host-backed ISR/caching for published pages; isolate preview, newsletter endpoints and user-specific responses. Use path-based pagination; never depend on ignored query parameters for cached server content.
- [ ] R05 — Add a signature-verified Sanity publication webhook. Validate raw body, document identity, allowed paths and request limits; never accept arbitrary purge destinations.
- [ ] R06 — Invalidate changed article, home, section, relevant author/guide/project pages, RSS, sitemap and search index. Read fresh published data during regeneration to avoid rebuilding from stale CMS-CDN content.
- [ ] R07 — Use a 60-second fallback expiration with explicit invalidation. Verify normal publication/correction/withdrawal within two minutes across affected routes; a timer alone is not proof.
- [ ] R08 — Implement `/rss.xml`, `/ai/rss.xml` and `/crypto/rss.xml` with the latest 50 matching published articles, stable IDs, absolute canonical URLs, valid dates and escaped text.
- [ ] R09 — Add XML sitemap, `robots.txt`, feed discovery links and conditional responses where supported. Never include drafts, private previews or internal source inbox items.
- [ ] R10 — Implement a published-only search index covering ID, title, summary, section, URL and dates; refresh it without rebuilding the whole website. Provide accessible no-results states.
- [ ] R11 — Test webhook retries, warm/cold caches, CMS outage, expired/invalid signature, cached 404 before a new article, changed slugs and urgent withdrawal/purge.
- [ ] R12 — Validate RSS/XML and structured data, and verify article title/body/links exist in HTML without browser JavaScript. A feed-reader's poll schedule remains outside our control.

**Exit evidence:** publication propagation timings and invalidation tests pass; all three valid feeds and search reflect publication/withdrawal; no drafts in public discovery; cache keys match actual host behavior.

## Phase 3 — Analytics, newsletter and commercial components

**Priority:** P0 foundation; campaigns activate only after actual agreements. **Owner:** Engineering + Founder. **Dependencies:** Phase 2; email provider chosen before N02. **Outputs:** working reader conversions and correctly labelled commercial surfaces.

### Measurement

- [ ] A01 — Configure Plausible for the production domain only. Keep local/test/preview traffic out; analytics failure must not prevent reading, navigation or signup.
- [ ] A02 — Implement `affiliate_click`, `sponsor_click`, `owned_project_click` and `newsletter_signup` with non-sensitive article, section, partner/campaign/project and placement IDs.
- [ ] A03 — Fire signup success after the email provider accepts the request. Count confirmed subscribers separately in the email provider; do not label requests as confirmed opt-ins.
- [ ] A04 — Test each event with mouse/keyboard navigation, blocked scripts and repeated navigation; avoid double counts and exclude emails, tokens and sensitive query strings.
- [ ] A05 — Define a reporting dictionary: audience/pageviews and goals in Plausible; opt-ins/delivery/unsubscribes in email; approved commissions/clawbacks in affiliate dashboards; booked/collected sponsor revenue in commercial records.
- [ ] A06 — Document measurement limits: pageviews are not verified viewable ad impressions; RSS requests are not subscribers; blocked analytics creates gaps. Do not promise a returning-user metric the selected tool cannot reliably supply.

### Newsletter

- [ ] N01 — Select a managed provider based on confirmed opt-in, suppression, export, API, expected send volume, pricing and sponsor reporting needs; record its actual terms.
- [ ] N02 — Build server-side signup validation, abuse limits, safe provider errors, duplicate handling and accessible success/error states. Protect secrets and avoid duplicate local personal-data storage.
- [ ] N03 — Verify confirmation, unsubscribe, suppression and delivery failure handling using test recipients only. Distribution requires an approved issue and audience.
- [ ] N04 — Prepare one weekly AI/Crypto digest format with source attribution and optional labelled sponsor area; record acquisition channel tags consistently.

### Commercial presentation

- [ ] C01 — Implement centrally managed offer destinations, active dates, public merchant identity and review/verification dates.
- [ ] C02 — Add visible affiliate disclosure before the first commercial link; mark paid links `rel="sponsored"` and new-tab links with `noopener`.
- [ ] C03 — Label sponsored articles/placements and owned-project coverage in listings and detail pages. No fabricated partners, endorsements, testimonials or performance claims.
- [ ] C04 — Reserve dimensions for future ad/sponsor placements. Expired campaigns and unavailable offers must disappear or become clearly inactive; keep ad networks disabled initially.
- [ ] C05 — Record partner acceptance, territories, payout/clawback terms and product-evaluation evidence before activating any affiliate offer; begin with at most three relevant partners.

**Exit evidence:** reader subscription/unsubscribe works; all configured goals match test interactions; inactive commercial content is handled; actual relationships and public disclosures agree.

## Phase 4 — Editorial inventory, sourcing and distribution

**Priority:** P0. **Owner:** Founder/editor. **Dependencies:** can run alongside Phases 1–3. **Outputs:** original launch inventory and sustainable publishing cadence.

- [ ] E01 — Select initial topics by audience need, not commission size. Prepare 12 substantive launch pieces, six AI and six crypto, with a mixture of reporting and durable guides/reviews.
- [ ] E02 — Maintain headline, angle, section, format, author, primary evidence, event date, rights notes, review status and planned distribution for each piece.
- [ ] E03 — Verify claims against primary sources, attribute secondary reporting, and distinguish actual hands-on tests from research-based explanations. Preserve original publication dates in corrections.
- [ ] E04 — Review RSS source terms before automated storage or reuse. Do not copy article bodies, translations, images or videos without appropriate permission.
- [ ] E05 — Add verified primary AI sources: official research/release blogs, documentation, repositories and papers. Add primary crypto protocol/governance/regulatory sources; do not mistake three crypto-heavy feeds for balanced AI sourcing.
- [ ] E06 — Establish a capacity target of one or two verified weekday briefs, one substantial original piece weekly and one weekly digest; lower volume if verification becomes a bottleneck.
- [ ] E07 — Write factual About, editorial policy, corrections, contact, privacy and Advertise pages; disclose ownership and commercial relationships. Founder supplies missing business facts before launch.
- [ ] E08 — Prepare distribution per article: newsletter inclusion, relevant social/community post draft, consistent campaign tags and internal links. Choose channels based on actual target readers; do not publish/send automatically.
- [ ] E09 — Interview five prospective readers and record problems, preferred formats and reasons to return. Use this to revise the initial backlog.

**Exit evidence:** 12 reviewed originals with both verticals represented; source/rights records; truthful policies; manageable editorial calendar and prepared first newsletter.

## Phase 5 — Performance, recovery and production launch

**Priority:** P0. **Owner:** Engineering + Founder. **Dependencies:** Phases 1–4. **Outputs:** verified release, rollback/restore evidence and operating dashboard.

### Same-workload performance acceptance

Public demos are research evidence, not release benchmarks. Test our production build with the same content, images, fonts, host region, cache state and analytics configuration. Record exact dependency versions, tested commit, URLs, tool versions and raw reports.

- [ ] P01 — Benchmark home, AI section, article, review and search at mobile width with at least three runs per template. Report medians and ranges for Lighthouse lab metrics, request/transfer sizes and script execution. Include cold/warm delivery timings separately.
- [ ] P02 — Set provisional mobile targets: lab LCP ≤2.5 seconds, CLS ≤0.1 and Lighthouse Total Blocking Time ≤200 ms under a documented fixed test profile. Lab TBT is not field INP; do not claim these thresholds are measured results today.
- [ ] P03 — Provisional compressed initial-route budgets: executable JavaScript ≤100 kB, CSS ≤50 kB and hero image ≤200 kB for a representative article; include analytics in totals. Record font/image payload and imported chunks rather than only script-tag bytes. Review justified exceptions explicitly.
- [ ] P04 — Optimize responsive images, hero prioritization, below-fold lazy loading, font subsets and reserved media/ad space. Check long-body readability and keyboard/touch navigation at 360 px without horizontal scrolling.
- [ ] P05 — Repeat article/home performance with one realistic labelled sponsor placement enabled. If later ad scripts exceed the budget, measure their revenue/reader impact before enabling them broadly.
- [ ] P06 — Once enough real traffic exists, monitor p75 LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 by route/device; insufficient samples mean unknown, not passing.

### Operations and release

- [ ] O01 — Add CI checks for types, production build, content/permission tests, RSS validity and critical reader/publishing flows. Secrets must not appear in output or browser assets.
- [ ] O02 — Monitor site availability, publish-webhook failures, stale feeds, email errors and spend. Propose quota warnings at 70% and 85%; verify each provider exposes usable data/alerts.
- [ ] O03 — Schedule Sanity editorial exports and licensed asset recovery; restore into staging and record actual duration/data-loss window. Target ≤24 hours lost and ≤4 hours restoration, subject to the successful drill.
- [ ] O04 — Demonstrate deploy rollback and urgent article removal; document operator commands, responsibility and escalation for a stale-cache or compromised-token incident.
- [ ] O05 — Confirm paid commercial hosting, configured domain/TLS, production CMS/project IDs, email settings, analytics domain and accurate brand/contact details. Do not deploy fixtures or enable visual editing on public production pages.
- [ ] O06 — Connect Search Console, validate canonical sitemap submission and feed links; indexing, rankings and advertising approval remain external outcomes.
- [ ] O07 — Perform end-to-end launch rehearsal: publish → view → RSS/search discovery → affiliate event → signup → confirmation/unsubscribe → correction → withdrawal.
- [ ] O08 — Founder signs off original content, disclosures and business facts; Engineering records passing release checks, rollback version and alert ownership.

**Exit evidence:** a release record containing commit, production/config checks, performance reports, restore/rollback results and remaining accepted limitations. No production launch on the basis of template marketing scores.

## Phase 6 — First 90 days and revenue validation

**Priority:** P1. **Owner:** Founder/commercial, Engineering supports measurement. **Dependencies:** Phase 5; sponsorship gate below. **Outputs:** audience baseline, reconciled revenue and evidence-based next investment.

- [ ] G01 — At day 30 establish the baseline: engaged reading proxy supported by the tracker, qualified search/referral traffic, confirmed subscribers, newsletter clicks/unsubscribes, editorial hours and cash spend. Set numeric growth goals from this baseline.
- [ ] G02 — Review topics and acquisition sources weekly; refresh genuinely useful guides and remove or correct stale offers. Do not expand low-value automated inventory to chase page counts.
- [ ] G03 — Reconcile affiliate clicks with approved net commissions monthly, including refunds/clawbacks; track partner/product quality and qualified reader intent.
- [ ] G04 — After four reliable weekly issues and a defined audience, prepare a media kit with actual geography, traffic, subscriber/delivery/click data and sample placements.
- [ ] G05 — Sell one direct-sponsor pilot only after defining price, dates, deliverables, reporting, editorial boundaries and cancellation terms. Offer one newsletter slot, one labelled site placement, or a separately labelled sponsored article.
- [ ] G06 — Evaluate programmatic ads using current eligibility, realistic net RPM, performance/consent workload and expected revenue; activate only when the economics justify it.
- [ ] G07 — Track owned-project qualified referrals separately from publication revenue. Keep ownership disclosure independent of campaign performance.
- [ ] G08 — At days 30, 60 and 90 compare audience/conversions, revenue received, labor and runway; continue, narrow scope, change formats or pause spending based on evidence.

### Financial model to fill with actual data

All example values below are illustrative USD inputs, not vendor quotes, partner promises or forecasts. Revenue may stay at zero during audience development.

- Ads: monetized pageviews / 1,000 × net page RPM. Example: 50,000 / 1,000 × $5 = $250/month.
- Affiliates: eligible clicks × purchase conversion × approved net commission. Example: 500 × 2% × $20 = $200/month.
- Sponsorships: sold placements × realized price minus fulfillment costs. Example: one $300 placement gives $300 gross before costs.
- Combined example: $750 gross before labor, operating costs, tax and adjustments; channels may not become available together.
- Contribution: collected revenue minus variable costs. Break-even revenue = fixed monthly costs / contribution-margin ratio. Keep cash break-even and economic break-even including founder labor distinct.

## Phase 7 — Private RSS inbox and draft assistance

**Priority:** P1 after manual publishing is proven; not a public-launch dependency. **Owner:** Engineering + editor. **Dependencies:** stable publication workflow, approved source terms, private storage/auth design and resolved CMS write permissions. **Outputs:** private discovery inbox; reviewed drafts, never automatic publication.

### Verified discovery inputs, observed 2026-10-22

- PANews: `https://www.panewslab.com/rss.xml?lang=en&type=NORMAL%2CNEWS%2CVIDEO`; HTTP 200, 100 items, declares English but sample has mixed-language titles. Preserve query parameters.
- Grenade: `https://grenade.tw/rss` → `https://grenade.tw/feed/`; HTTP 200, 20 items, declares Traditional Chinese.
- BlockTempo: `https://www.blocktempo.com/rss` → `https://www.blocktempo.com/feed/`; HTTP 200, 10 items, declares Traditional Chinese.

These are rotating feed windows, not archive counts or a republishing license. Recheck endpoints and permitted use before activating ingestion.

- [ ] I01 — Specify a separate private source/job database and authenticated editor inbox. Keep subscriber records in email SaaS and secrets in the hosting secret store.
- [ ] I02 — Source model: original/resolved URL, language hint, topic, permitted use, enable state, fetch validators, poll interval and last success/error.
- [ ] I03 — Item/cluster/job models: external GUID/normalized link, title, minimum permitted metadata, dates, language, fingerprint, claim/primary-source notes, attempts, next retry and stable idempotency key. Set an explicit retention period before ingestion.
- [ ] I04 — Poll at a proposed 15-minute cadence subject to source limits, with conditional requests, jitter, timeout, response-size limits and bounded retry/backoff.
- [ ] I05 — Restrict outbound hosts and validate redirects/IP destinations; disable XML external entities; sanitize content and treat embedded instructions as untrusted data.
- [ ] I06 — Deduplicate retries without suppressing distinct developments; cluster related coverage and preserve source links and per-item language. Quarantine malformed items without blocking the other feeds.
- [ ] I07 — Editor selects an original angle and verifies primary evidence before draft assistance. Translated competitor text is research input, not publishable inventory.
- [ ] I08 — Resolve CMS-enforced draft-only permission requirements against actual Sanity capabilities. A privileged token behind application checks still carries publish risk; do not claim upgrading automatically solves this without verification.
- [ ] I09 — Implement validated draft-only service requests, spend limits and audit summaries; prohibit general mutation/publish endpoints. Never log secrets or confidential source text.
- [ ] I10 — Test replay, restart, mixed languages, missing GUIDs, changed URLs/dates, unsafe redirects, malformed XML, model instructions, quota exhaustion and individual-source outage.

**Exit evidence:** usable private inbox; repeated polling creates no duplicate jobs/articles; editor retains publishing control; permission limits and spend behavior demonstrated.

## Deferred features and their entry conditions

**Priority:** P2. These are backlog conditions, not launch tasks.

- Reader accounts/bookmarks: repeated reader demand with a specific retention use case.
- Memberships/paid research: demonstrated willingness to pay and sustainable original output.
- Full multilingual editions: one language's workflow is sustainable and translation review is staffed.
- Live market data: a reader use case, licensed provider and operating budget.
- Dedicated search/personalization/community: measured limitation in the simpler experience.
- PostHog/replay/experiments: a product decision that requires them; no duplicate tracking by default.

## Review cadence and evidence rules

Weekly: source quality, corrections, editorial workload, newsletter feedback and technical failures. Monthly: revenue received, commercial attribution limits, partner quality, quota usage and runway. Quarterly: positioning, language expansion and deferred feature demand.

Keep dated evidence distinct from current procurement checks. Do not interpret a fast demo as a framework/CDN ranking, a declared package range as a deployed version, or an SDK dependency as shipped browser JavaScript. Record unresolved requirements and accepted limits in the release record; do not replace them with a checked box.

## References

- [Launch design](../superpowers/specs/2026-10-22-publication-launch-design.md)
- [Template/version findings and raw measurements](../research/2026-10-22-template-performance-review.md)
- [Sanity starter](https://github.com/sanity-io/sanity-template-astro-clean)
- [Astro 7 release and benchmark conditions](https://astro.build/blog/astro-7/)
- [Astro Vercel ISR adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/)
- [Astro route caching](https://docs.astro.build/en/guides/caching/)
- [Astro RSS](https://docs.astro.build/en/recipes/rss/)
- [Sanity plans](https://www.sanity.io/pricing) and [quota behavior](https://www.sanity.io/docs/platform-management/plans-and-payments)
- [Plausible conversion goals](https://plausible.io/docs/goal-conversions)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
