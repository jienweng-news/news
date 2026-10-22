# AI and Crypto Publication — Business and Implementation Checklist

Date: 2026-10-22. Status: Astro + Sanity + Plausible selected by the founder; launch design prepared for review; implementation has not started.

## 1. Agreed purpose and planning assumptions

Build an independent publication covering AI and crypto: timely news, original analysis, practical guides, and tested product reviews. Earn through relevant affiliates, future advertising and sponsorships, and introduce the founder's own projects with clear ownership labels.

Working assumptions: one founder/editor plus engineering help; English-first publication; one brand with distinct AI and Crypto sections; no reader accounts or paid subscription at launch. Language, market, staffing, and budget remain founder decisions, not established facts. The schedule below assumes a part-time editor and one experienced developer; revise after scope and budget approval.

Success means repeat readers, a growing opted-in newsletter, useful original content, attributable revenue, and publishing that does not depend on copying competitors. A high article count alone is not success.

- [ ] Confirm target reader: proposed starting audience is builders and technology users evaluating AI tools and digital-asset infrastructure.
- [ ] Confirm launch language and primary geography; the supplied feeds include substantial Traditional Chinese coverage.
- [ ] Confirm brand/domain, founder availability, engineering capacity, and monthly cash ceiling.
- [ ] Confirm which owned projects may be featured and their connection to the audience.
- [ ] Approve the product design before coding; split implementation into the milestones below.

## 2. Source audit and sourcing strategy

Direct HTTP fetches and XML parsing succeeded for all three sources on 2026-10-22. These are point-in-time observations, not availability guarantees or permission to republish.

- PANews: https://www.panewslab.com/rss.xml?lang=en&type=NORMAL%2CNEWS%2CVIDEO — HTTP 200; 100 items; declares `en`; sample includes both English and Chinese titles. Useful for discovery across news and AI/business stories. Preserve configured query parameters.
- Grenade: https://grenade.tw/rss — redirects to https://grenade.tw/feed/; HTTP 200; 20 items; declares `zh-TW`. Sample includes practical crypto guides. Useful for regional context and product/topic discovery.
- BlockTempo: https://www.blocktempo.com/rss — redirects to https://www.blocktempo.com/feed/; HTTP 200; 10 items; declares `zh-TW`. Sample includes crypto infrastructure and technology reporting.

Feed item counts are observed windows, not total archive sizes. A daily-only poll could miss stories when a short feed rotates rapidly.

- [ ] Register these URLs, final URLs, language hints, topic coverage, fetch interval, rights status, and last-success time in the source registry.
- [ ] Review each publisher's terms and permitted feed use before enabling production storage; store minimum discovery metadata by default, with configurable retention.
- [ ] Do not republish article bodies, translations, images, or videos without appropriate rights. An RSS URL does not establish a reuse license.
- [ ] Add primary AI sources: official company research/release blogs, model documentation, open-source project releases, and research papers; verify exact feed endpoints before activation.
- [ ] Add primary crypto sources: project announcements, governance proposals, release repositories, protocol documentation, and relevant regulator announcements.
- [ ] For each publishable story, record primary evidence, original publisher links, event date, publication date, claim notes, and verification status.
- [ ] Detect language per item; preserve source language and record translation separately. Treat translated text as an aid to verification.
- [ ] Configure a proposed 15-minute poll, subject to publisher limits; use conditional requests when supported, jitter, retry backoff, and failure alerts.
- [ ] Classify feed text as untrusted data: ignore instructions inside it, sanitize markup, disable XML external entities, cap response sizes, and restrict outbound fetching to approved public hosts.

## 3. Positioning and editorial products

Recommended positioning: useful reporting and practical evaluation for readers choosing tools and understanding emerging technology. Keep AI and crypto distinct; cover their overlap only when the connection is substantive.

- [ ] Establish AI and Crypto navigation, each with news, analysis, and guides; use tags for narrower topics rather than numerous empty categories.
- [ ] Define four launch formats: short sourced news brief, original explainer, tested guide/review, and weekly digest.
- [ ] Prepare an initial backlog of 12 durable pieces: six AI and six crypto, chosen around reader problems rather than affiliate payout.
- [ ] Start with a capacity target of one or two verified briefs per weekday, one substantial original piece per week, and one weekly newsletter; reduce volume if verification falls behind.
- [ ] Define review methodology: actual use, dated observations, limitations, pricing check date, alternatives, and affiliate relationship.
- [ ] Add author profiles, about/contact, corrections process, editorial standards, and ownership disclosures.
- [ ] Keep sponsorship approval separate from editorial conclusions; sponsors cannot purchase favorable independent reviews.
- [ ] Label owned-project coverage prominently and distinguish product announcements from independent reporting.
- [ ] Track corrections and preserve original publication dates when updating articles.

## 4. Business model and revenue sequence

### Phase A — Audience and affiliates

Affiliate guides can create commercial value before display ads become meaningful, but revenue depends on qualified intent, partner approval, and actual conversions.

- [ ] Evaluate relevant wallet/hardware-wallet partners and AI software programs; verify current program availability, supported countries, payout terms, refund/clawback rules, and restrictions directly.
- [ ] Choose at most three initial partners that the team can evaluate credibly.
- [ ] Store destination URLs, merchant identity, relationship disclosure, active dates, and last verification date centrally.
- [ ] Put plain-language affiliate disclosure before the first commercial link; mark paid links `rel="sponsored"` and use `noopener` when opening a new tab.
- [ ] Track clicks by article and placement using non-sensitive identifiers; reconcile commissions with partner reports rather than treating clicks as sales.
- [ ] Schedule recurring checks of broken links, offer changes, discontinued products, and stale reviews.

### Phase B — Direct sponsorships

- [ ] Prepare a media kit using measured audience geography, newsletter delivery/clicks, traffic, sample coverage, and available inventory.
- [ ] Offer a small inventory: one newsletter sponsor, one clearly labelled site placement, and separately labelled sponsored content.
- [ ] Define deliverables, dates, cancellation terms, editorial boundaries, reporting, and campaign identifiers before selling.
- [ ] Price initial campaigns experimentally using actual audience and fulfillment cost; do not promise impressions or conversions without evidence.
- [ ] Set a gate for selling: four consecutive reliable newsletter sends, working campaign reporting, and a clear target audience. Subscriber count alone is insufficient.

### Phase C — Display ads and owned products

- [ ] Add reserved ad containers only when expected net revenue justifies performance, consent, and operational overhead.
- [ ] Verify current ad-network eligibility and policies before applying; no acceptance or RPM assumption is guaranteed.
- [ ] Measure layout shifts, page speed, reader complaints, and revenue per session before expanding inventory.
- [ ] Give owned projects a dedicated project page and tagged announcements; measure qualified referrals and outcomes separately from cash publication revenue.
- [ ] Consider paid research/tools only after interviews and repeated demand; memberships, wallets, token launches, and trading execution are outside launch scope.

## 5. Economics, budget, and measurement

The following numbers are illustrative assumptions in USD, not current vendor quotes, partner offers, forecasts, or promised returns. Replace them with actual offers and observed conversion data.

Revenue model:

- Display ads = monetized pageviews / 1,000 × net page RPM. At 50,000 monetized pageviews and an assumed $5 net RPM: $250/month.
- Affiliate revenue = eligible outbound clicks × purchase conversion × approved net commission. At 500 clicks × 2% × $20: $200/month.
- Sponsorship = booked placements × realized price, less fulfillment costs. At one placement × $300: $300 gross/month.
- Combined example: $750 gross/month before operating costs, taxes, labor, refunds, and partner adjustments. This combines hypothetical inputs, not a prediction that these channels will become available together.
- Downside: $0 revenue while the audience develops; limit spending so the business can tolerate that outcome.
- Break-even = fixed monthly costs / contribution margin, with founder labor reported separately. Do not count unpaid founder time as zero economic cost.

- [ ] Collect live quotes for application hosting, managed database/backups, object storage, email, analytics, and AI usage before procurement.
- [ ] Set an initial proposed infrastructure/automation cash cap of $150/month, excluding labor and legal/accounting; validate whether quotes support it.
- [ ] Set separate editorial and engineering budgets; estimate implementation as roughly 120–200 engineering hours before multiplying by an agreed rate.
- [ ] Reserve 20% of the approved implementation budget for integration issues and rework; reconcile estimates after milestone 1.
- [ ] Maintain a six-month cash-runway worksheet using zero-revenue, modest-revenue, and observed-performance cases.
- [ ] Track engaged sessions, returning readers, subscribers by acquisition channel, newsletter clicks/unsubscribes, affiliate clicks and approved commissions, sponsorship receipts, correction rate, and editorial time per piece.
- [ ] Define events: `newsletter_signup`, `affiliate_click`, `sponsor_click`, and `owned_project_click`; document parameters and exclude personal or secret data.
- [ ] Separate confirmed opt-ins from form submissions; email opens are directional because privacy tooling affects them.
- [ ] Review business metrics monthly and source/editorial quality weekly. Pause weak affiliate pages instead of scaling low-value output.

## 6. Selected platform and delivery

Selected after the documented comparison: Astro for the public publication, Sanity native SaaS for editorial content and Studio, and Plausible SaaS for audience/conversion analytics. Start with Sanity Free for a trusted founder-operated editorial workflow, with Growth budgeted when private datasets, dedicated Editor roles, or scheduled drafts are required. Plausible is a separate paid service, not an included Sanity feature.

Use managed frontend hosting. Vercel is the proposed first host because Astro documents its ISR adapter, on-demand invalidation, and preview bypass; commercial production requires an appropriate paid plan. No account, subscription, deployment, domain, or spend is created by this plan. Cloudflare remains an alternative if its Astro adapter and purge behavior satisfy the same acceptance checks.

Use on-demand rendered article/discovery/feed routes with host-backed caching and publication-triggered invalidation. Do not rely on full-site builds for every story, and do not confuse Sanity API-CDN freshness with page-cache freshness. Proposed normal publication target: article, section, homepage and feeds reflect a publish/correction/withdrawal within two minutes, verified on the chosen host. Time-based stale-while-revalidate alone does not guarantee that target.

Sanity Free has public datasets and limited roles. Published operational documents are public even when the website does not link them. Keep private source inboxes, ingestion job state, sponsor contracts, subscriber details and confidential notes outside it. Use a separate private managed database for ingestion when that milestone starts; do not provision Postgres for public articles. Only public sponsor labels and offer metadata belong in published editorial documents.

- [x] Select Astro + Sanity native SaaS + Plausible for the launch architecture.
- [ ] Validate current framework/adapter compatibility, hosting quotes, and Sanity/Plausible entitlements before installation and procurement.
- [ ] Implement public search over a published-content index; defer a search cluster until measured need.
- [ ] Isolate ingestion/job state in a private service with retention limits; never store raw feed archives in Sanity by default.
- [ ] Use Sanity media storage/CDN for licensed publication assets and a managed email provider for subscriber delivery.
- [ ] Start without reader login, live market feeds, personalization, public comments, or paid subscriptions.
- [ ] Separate staging and production configuration and protect drafts from page caches and analytics.
- [ ] Read the detailed launch design in `docs/superpowers/specs/2026-10-22-publication-launch-design.md` before implementation planning.

## 7. Content and commercial data model

- [ ] `Article`: stable ID, slug, section, format, title, summary, body, author, source references, source/event dates, publication/update dates, draft/review/published status, SEO metadata, canonical URL, licensed media, content language, disclosures, corrections, and optional sponsor/owned-project relationship.
- [ ] `Source`: configured URL, resolved URL, permitted-use notes, language hint, tags, HTTP validators, polling interval, last success, error state, and enable/disable control.
- [ ] `SourceItem`: source ID, external GUID/link, normalized URL, title, minimum permitted excerpt, source date/language, fetched time, fingerprint, primary-evidence links, and workflow state.
- [ ] `StoryCluster`: related source items, topic, editorial angle, verification notes, and linked draft. Distinguish duplicate coverage from separate developments.
- [ ] `Author`, `Category`, `Tag`, and `Media`: explicit authorship, navigation, topic metadata, image attribution, license, and alt text.
- [ ] `AffiliateOffer`: merchant, approved destination, disclosure, availability dates, tracking identifier, verification date, and inactive state.
- [ ] `Campaign`: sponsor, labelled placements, time window, approved assets, commercial status, and aggregate reporting.
- [ ] `Job`: type, stable idempotency key, attempt count, next attempt, status, error summary, and timestamps; never store secrets in error logs.
- [ ] Store subscriber consent and unsubscribe state in the email provider; avoid a redundant local personal-data store unless needed.

## 8. Editorial automation and publishing rules

- [ ] Implement: fetch → parse → normalize → language detection → deduplicate/cluster → editor shortlist → primary-source verification → AI-assisted draft → human review → publish → distribute.
- [ ] Default every automated draft to unpublished. The trusted draft service must reject publish requests. Sanity Free does not enforce a separate draft-only automation role; use application checks and trusted credentials initially, or upgrade before requiring CMS-enforced privilege separation.
- [ ] Require an assigned editor, source references, verified key claims, commercial disclosure where applicable, and rights-cleared media in the trusted publishing workflow; verify privileged API bypass risks separately.
- [ ] Model draft/review/published/archived editorial states; distinguish UI workflow checks from enforceable CMS permissions and persist explicit corrections without promising an enterprise audit trail.
- [ ] Use narrow automation credentials, validated structured model output, token/spend limits, and bounded retries.
- [ ] Preserve a unique source-item key across retries; let an editor merge cross-publisher duplicates rather than silently discard distinct reporting.
- [ ] Quarantine malformed items without losing the rest of a feed; record feed failures without stopping all ingestion.
- [ ] Make withdrawal and correction propagate to cached article pages, feeds, and discovery pages.

## 9. Implementation milestones and acceptance checklist

Planning estimate: 6–8 weeks for a small launch under the staffing assumptions above. Milestone numbers below retain the original business-checklist grouping, not strict execution order. Implement the public foundation/discovery first, commercial measurement and operations next, and private ingestion last, following the launch design. Calendar ranges are initial estimates and will be revised for that sequence. Each becomes its own implementation plan after design review; the selected architecture is recorded, while the concrete launch design still needs review before product code.

### Milestone 0 — Founder decisions and design, week 1

- [ ] Resolve language, audience, brand, budget, ownership, stack, and editorial policy decisions in sections 1–6.
- [ ] Define homepage, section, article, guide/review, newsletter, and owned-project page requirements.
- [ ] Approve the written design and select the first independently shippable implementation milestone.
- [ ] Record verified dependency versions, provider quotes, and source-use decisions before implementation planning.

Acceptance: one agreed scope, an operating owner, and a feasible monthly budget; no unresolved launch-critical assumptions.

### Milestone 1 — Editorial foundation, weeks 1–2

Proposed files: `studio/schemaTypes/{article,author,affiliateOffer,campaign}.ts`; `studio/sanity.config.ts`; `src/pages/articles/[slug].astro`; `src/lib/sanity/{client,queries,article}.ts`; `tests/publishing.integration.test.ts`.

- [ ] Configure Astro, Sanity Studio/schema deployment, media references, environment validation, and a protected staging preview.
- [ ] Implement author/article/media schemas, authenticated preview, editorial validation and corrections. Verify actual plan permissions: Free does not supply a dedicated Editor role or an enforceable draft-only bot role. Keep publishing manual and automation credentials behind the trusted worker; upgrade if stronger role separation is required.
- [ ] Render published articles as complete HTML; keep draft preview authenticated and excluded from public caching/indexing.
- [ ] Test anonymous draft access, trusted-worker draft validation, missing required evidence, slug collisions, and publication/withdrawal behavior; document that a compromised privileged Sanity token may bypass application checks.
- [ ] Verify staging can publish and withdraw a sample article with accurate dates and byline.

Acceptance: an editor can create, preview, publish, correct, and withdraw an article; public clients cannot retrieve drafts through pages or APIs; remaining plan-level permission limits are explicit.

### Milestone 2 — Reader experience and discoverability, weeks 2–3

Proposed files: `src/pages/{index,ai/index,crypto/index,search}.astro`; `src/pages/{rss.xml,ai/rss.xml,crypto/rss.xml,sitemap.xml}.ts`; `src/pages/api/revalidate.ts`; `src/lib/seo/article.ts`; `tests/discovery.integration.test.ts`.

- [ ] Build responsive homepage, sections, article template, author pages, search, related links, and policy/contact pages.
- [ ] Implement canonical metadata, social cards, Article/NewsArticle structured data, XML sitemap, RSS, and redirects for changed slugs.
- [ ] Keep feeds and search limited to published content; escape XML and sanitize rendered rich text.
- [ ] Add publication-triggered invalidation and a fallback cache TTL; target published changes visible within two minutes under normal conditions.
- [ ] Verify keyboard navigation, readable mobile layouts, empty/error states, and reserved media dimensions.
- [ ] Test article HTML without client JavaScript, feed XML validity, publication freshness, withdrawal propagation, and draft exclusion.

Acceptance: complete crawlable article HTML, working discovery routes, and publication/withdrawal reflected within the stated target.

### Milestone 3 — Source inbox and draft assistance, weeks 3–4

Proposed files: `services/ingestion/src/{sources,fetch,parse,normalize,dedupe,jobs,draft}.ts`; private database migrations; `services/ingestion/tests/ingestion.integration.test.ts`.

- [ ] Add the three verified feed configurations and approved AI primary sources.
- [ ] Build conditional fetching, redirect validation, scheduling, durable job state, idempotency, retries, and failure visibility.
- [ ] Show source links, per-item language, clustering, and verification notes in an authenticated private inbox, separate from Sanity Free public documents.
- [ ] Add structured draft assistance after source verification; enforce draft-only output and a configurable daily spend limit.
- [ ] Test replayed jobs, absent GUIDs, changed timestamps, mixed languages, duplicates, malformed XML, unsafe redirects, embedded instructions, timeouts, and recovery after restart.
- [ ] Confirm one failing source does not block others and normal draft-service requests cannot publish; test and document the underlying CMS token permissions separately.

Acceptance: repeated imports do not create repeated items or publications; all three feeds populate a usable inbox; drafts require human approval.

### Milestone 4 — Newsletter and commercial foundation, weeks 4–5

Proposed files: `src/pages/api/newsletter.ts`; `src/lib/newsletter/provider.ts`; `studio/schemaTypes/{affiliateOffer,campaign}.ts`; `src/components/{Disclosure,AffiliateLink,SponsorSlot,Analytics}.astro`; `tests/commercial.integration.test.ts`.

- [ ] Integrate confirmed newsletter opt-in, unsubscribe/suppression, delivery errors, rate limits, and digest preparation with human send approval.
- [ ] Implement affiliate offer management, disclosures, sponsored link attributes, and campaign placement scheduling.
- [ ] Add Plausible audience/conversion goals with section, article, partner and placement identifiers. Fire signup success only after provider acceptance and distinguish it from confirmed opt-in. Keep email delivery and approved affiliate revenue in their source systems.
- [ ] Test expired offers, inactive campaigns, missing disclosures, unknown destination URLs, duplicate signups, unsubscribe handling, and analytics without personal data.
- [ ] Document manual campaign fulfillment and attribution limits; avoid building billing automation for the first sponsor.

Acceptance: a reader can subscribe and unsubscribe; approved commercial placements render with disclosure; expired placements disappear; measured events match test interactions.

### Milestone 5 — Launch readiness and operations, weeks 5–6

Proposed files: `.github/workflows/ci.yml`; `tests/e2e/publication.spec.ts`; `docs/operations/{publishing,restore,incident,response-to-corrections}.md`; provider-specific deployment configuration after selection.

- [ ] Run type checks, lint, build, integration tests, and critical browser flows in CI against an isolated test database.
- [ ] Add uptime/error monitoring, job failure alerts, editorial export schedules, secret rotation guidance, and cost alerts. Alert on Sanity quotas before hard caps; propose warnings at 70% and 85%.
- [ ] Export Sanity editorial data and licensed assets, then demonstrate restoration to a staging dataset; separately restore the private ingestion database when it exists. Record actual recovery time and data-loss window.
- [ ] Set proposed recovery targets of 24-hour maximum data loss and four-hour restoration; confirm provider support and revise if infeasible.
- [ ] Test deployment rollback, failing email provider, feed outage, absent images, cache invalidation failures, and publication permission abuse.
- [ ] Seed at least 12 substantive launch pieces, with both verticals represented; verify every affiliate destination and source attribution.
- [ ] Configure Plausible goals/Search Console and verify sitemap submission; treat indexing and ad approval as external outcomes, not launch guarantees.
- [ ] Perform mobile accessibility/performance checks; use lab checks initially and validate real-user performance once sufficient traffic exists.

Acceptance: editorial workflow works end to end; restore and rollback are demonstrated; source/rights/disclosure review is complete; an owner can handle alerts and corrections.

### Milestone 6 — First 90 days of operation, weeks 7 onward

- [ ] Interview five target readers and adjust topic priorities based on repeated needs.
- [ ] Send the weekly newsletter consistently and measure return readership and confirmed subscriber acquisition.
- [ ] Review affiliate click-to-approved-sale data before adding partners or expanding review content.
- [ ] Prepare a sponsor media kit once actual audience data and delivery reliability exist.
- [ ] Run one small direct sponsorship pilot and report delivery honestly.
- [ ] At days 30, 60, and 90, review costs, founder workload, original-content quality, returning audience, confirmed subscribers, and collected revenue.
- [ ] Continue, narrow the audience, change formats, or pause spending based on those reviews. Define numeric growth targets after the first 30-day baseline rather than inventing forecasts today.

## 10. Explicitly deferred work

- [ ] Reconsider multilingual publishing after one language has a sustainable workflow; preserve language fields now without building full translation infrastructure.
- [ ] Reconsider accounts/bookmarks only after returning readers request them.
- [ ] Reconsider premium research after validating willingness to pay.
- [ ] Reconsider live market data only with a clear reader use case and licensed provider budget.
- [ ] Reconsider a search service, personalization, or community once the basic publication has measured constraints.
- [ ] Reconsider programmatic ad integrations once traffic and realistic economics justify their overhead.

## 11. Operating ownership and review cadence

- [ ] Founder/editor owns positioning, source verification, corrections, partner acceptance, and publishing approval.
- [ ] Engineering owner owns permissions, deployment, recovery, monitoring, ingestion reliability, and dependency updates.
- [ ] Commercial owner, initially the founder, owns partner terms, disclosures, campaign delivery, and revenue reconciliation.
- [ ] Weekly: review publishing throughput, source failures, corrections, and subscriber feedback.
- [ ] Monthly: review revenue received, attribution limits, infrastructure spend, labor, partner quality, and project referrals.
- [ ] Quarterly: review positioning, content mix, commercial conflicts, and whether deferred features have evidence supporting them.

## 12. Evidence and references

Feed observations were checked by direct HTTP requests and Python XML parsing on 2026-10-22. No feed body or publisher image was copied into the project.

- [PANews supplied feed](https://www.panewslab.com/rss.xml?lang=en&type=NORMAL%2CNEWS%2CVIDEO)
- [Grenade resolved feed](https://grenade.tw/feed/)
- [BlockTempo resolved feed](https://www.blocktempo.com/feed/)
- [Sanity pricing and plan permissions](https://www.sanity.io/pricing)
- [Sanity Astro integration](https://www.sanity.io/docs/astro)
- [Astro Vercel ISR adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/)
- [Plausible conversion goals](https://plausible.io/docs/goal-conversions)
- [Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Astro RSS](https://docs.astro.build/recipes/rss/)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies): paid links should be qualified; scaled content created primarily to manipulate rankings is prohibited. Original usefulness and accurate reporting remain editorial requirements regardless of whether AI assists drafting.

Vendor documentation supports technical feasibility, not the illustrative financial assumptions. No publisher licensing, affiliate acceptance, advertising eligibility, or revenue has been established by this plan.
