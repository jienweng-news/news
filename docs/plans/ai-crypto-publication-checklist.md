# AI and Crypto Publication — Business and Delivery Checklist

Updated: 2026-10-22. Multilingual reader site and private worker components implemented locally on `feat/editorial-foundation`; live service activation and browser acceptance remain pending. See [launch readiness](../operations/launch-readiness.md) and [private automation](../operations/automation.md).

Selected stack: **Astro + Sanity native SaaS + Google Analytics 4 standard**, with a managed website host. Technical reference: Sanity's official Astro starter. Selected visual direction: the founder-approved [Persona-inspired newsroom](../design/2026-10-22-token-on-air-visual-direction.md). Earlier structural references remain AstroNews for newsroom composition and The Magazine News for comfortable reading. Paid template code is not selected or purchased.

Design: [Launch specification](../superpowers/specs/2026-10-22-publication-launch-design.md). Evidence: [Template/version review](../research/2026-10-22-template-performance-review.md).

## How to use this checklist

This is the master business and delivery checklist; each implementation phase receives a smaller engineering plan before coding. Phase numbers are execution order. Track evidence beside completed items; checked boxes mean a decision or result exists, not that a vendor advertises the feature.

- **P0:** required for production launch. **P1:** first 90 days. **P2:** later, only with demonstrated demand.
- **Founder:** audience, brand, editorial approval and commercial decisions. **Engineering:** implementation and operations. One person may hold both roles, but must still own each deliverable.
- Items have stable IDs for issues and review comments. When blocked, record the missing input and continue independent work in the current phase.
- Local fixtures and previews can proceed with configurable defaults. Production requires real branding, accounts, original reporting and accurate policy/contact information.
- The earlier 6–8 week launch window and 120–200 engineering hours assumed a small single-language publication. Re-estimate for bilingual routing, content, search, feeds, SEO and editorial review before using these figures for scheduling or budgeting.

## Decisions already recorded

- [x] D01 — Cover both AI and crypto, with distinct sections and substantive overlap coverage.
- [x] D02 — Support affiliates, future sponsors/advertising, and clearly labelled founder-project publication.
- [x] D03 — Select Astro and Sanity managed SaaS; the founder subsequently replaced the paid Plausible proposal with a free-analytics requirement; GA4 standard is now founder-selected. No self-hosted CMS selected.
- [x] D04 — Inspect PANews, Grenade and BlockTempo RSS by direct HTTP fetch and XML parsing.
- [x] D05 — Check template source versions and public-demo delivery; retain raw evidence and measurement limitations.
- [x] D06 — Founder selected both audiences: builders/founders/technology users and investors/market followers. Geographic focus: global coverage with a Taiwan/Asia lens. Founder confirmed an editorial mix of 40% practical AI/crypto coverage and 60% markets, funding and industry developments; this is a format mix; AI-versus-crypto coverage is founder-confirmed as source-driven without a fixed topic quota.
- [x] D07 — Founder selected English, Traditional Chinese and Simplified Chinese for launch (D25 supersedes the initial two-language choice). Every qualifying story will publish in all three variants through the selected automated workflow. Locale-release timing and failed-translation handling remain to be specified.
- [x] D08 — Founder selected global AI/crypto coverage with a Taiwan/Asia lens; add substantive regional context without limiting international reporting.
- [x] D09 — Founder selected the independent media brand **Token on Air**. Domain: `tokenonair.com`, purchased according to the founder’s confirmation. Registrar access, DNS, TLS and hosting connection remain unverified; domain purchase does not establish brand clearance. The founder confirmed `Token on Air` as the shared brand for both English and Traditional Chinese editions, with a Traditional Chinese tagline rather than a separate Chinese brand name. The founder selected the taglines **Understand what’s next.** (English) and **看懂科技下一步。** (Traditional Chinese). Visual direction confirmed: an original Persona-inspired newsroom, with a red/black/warm-white palette, expressive display type and calm article body text. See [visual direction](../design/2026-10-22-token-on-air-visual-direction.md). Local implementation includes the approved Cutout logo and newsroom; browser verification remains pending.
- [x] D10 — Founder explicitly selected AI-written articles with automatic website publication, without routine per-article human approval. Pipeline design must replace the earlier draft-only proposal: permitted source discovery → evidence-linked original generation → automated validation → controlled publication; failed checks hold the item. Publish source attribution; use editor credit `jienweng` without an AI-generated label, per founder instruction. Source rights, source allowlist, source-driven throughput bounds, model/spend caps and corrections ownership remain open. Operation is confirmed as 24/7. This authorizes the planned website workflow, not deployment, purchasing, or external newsletter/social sends.
- [x] D11 — Founder prefers higher, source-driven output rather than a four-story daily target, with freshness as a priority. No daily numeric cap or unlimited spending was approved. Proposed operating targets: check permitted feeds every five minutes where source limits allow; prioritize fresh unique developments and aim to publish within 10–15 minutes of discovery after checks pass. Measure source publication, discovery and website-publication timestamps separately. Founder confirmed 24/7 operation. Catch-up/backlog policy and budget caps remain open.
- [x] D12 — Founder selected Vercel hosting, free analytics instead of paid Plausible, and Dots for AI generation (exclude generation charges from the current cash budget per founder instruction). Dots is now identified as ChatGPT dots; account access, supported tool connection, limits and integration remain unverified. Do not assume a callable inference API or unlimited throughput. GA4 standard is now founder-selected; event implementation and production verification remain pending. CMS was re-evaluated: current recommendation remains Sanity Free; Payload Cloud new deployments are paused. See [CMS research](../research/2026-10-22-managed-cms-recheck.md).
- [x] D13 — Founder approved one bilingual Sanity article document per unique story, with localized English/Traditional Chinese/Simplified Chinese fields, shared sources/media and separate public locale URLs. Validate Portable Text structure, attribute/size limits, slug uniqueness and atomic bilingual publishing before implementation acceptance. Retained drafts and non-article documents still count toward quotas.
- [x] D14 — After reviewing Payload self-hosting requirements, founder confirmed continuing with Sanity managed CMS. Start with Free within verified quotas and access constraints; no Payload migration. The one-document bilingual model remains subject to schema validation. Paid upgrades require a separate decision.
- [x] D15 — Founder selected Google Analytics 4 standard as the free primary audience/conversion tracker, replacing paid Plausible. Track article/section/language and commercial clicks/signup success without sending emails, tokens or sensitive query strings. Property/data-stream setup, consent behavior, preview exclusions and event validation remain pending. No tracking is installed or verified by this decision alone.
- [x] D16 — Founder clarified Dots means OpenAI ChatGPT dots, the always-on agent, rather than a third-party generation API. Official documentation supports ongoing work, schedules and connected plugins; this thread has no verified Dots connection. Proposed integration: durable source queue → dot pulls jobs via an authenticated supported connection → researches/writes/validates all three locales → submits structured content to a controlled publisher. Do not invent a callable Dots inference API, guaranteed five-minute execution or unlimited plan capacity. Founder confirmed an existing dot in ChatGPT. Connection mechanism, publication permissions and throughput remain to be tested; this thread has not accessed or configured it.
- [x] D17 — Founder selected source-driven AI-versus-crypto coverage rather than a fixed topic ratio. Keep both sections equally prominent; rank unique developments by relevance, freshness and evidence, and measure source/topic balance over time. The 40% practical / 60% markets-funding-industry mix remains a separate rolling editorial target. Add primary AI sources so the initial crypto-heavy feeds do not dictate the whole publication.
- [x] D18 — Founder selected newsletter signup at launch, with digest sending deferred until the publishing operation is stable. Launch signup must support confirmation, unsubscribe/suppression and truthful states; no issue distribution is enabled by this decision. Managed email provider is now beehiiv Free; sender address and cadence/start date remain open.
- [x] D19 — Founder selected beehiiv Free for launch subscriber collection and later newsletter delivery. Keep Astro as the publication website and subscriber data in beehiiv. Account/publication setup, confirmation and unsubscribe behavior, API/form integration, language-preference support and sender-domain authentication remain to be verified. No paid upgrade or newsletter issue sending is authorized by selection.
- [x] D20 — Founder approved signup language choices English, Traditional Chinese, Simplified Chinese or all three (D25 expands the earlier both-language choice), preselected from the current page language and changeable by the subscriber. Verify beehiiv Free can persist and expose the preference for later delivery, without treating multi-language preference as duplicate subscriber records. Preferences must not imply authorization to send before the digest is enabled.
- [x] D21 — Founder selected the exact editor credit `jienweng`, rejected the proposed “Token on Air Desk” byline and requested no AI-generated disclosure. Render the person as editor (not a fabricated reporter or a claim of per-article human review). Retain source links, corrections and separate affiliate/sponsor/owned-project disclosures. Do not invent biography, credentials or reporting activity.
- [x] D22 — Founder selected a fixed source list and requested additional sources. Curated 25 feed inputs (original three plus 22 additions), each HTTP/XML verified with entries in the saved check. See [fixed source list](../research/2026-10-22-fixed-source-list.md) and [raw metadata](../research/source-checks/2026-10-22-fixed-sources.json). Sources are discovery candidates pending per-source terms/limits checks, not licensed republication inputs or running jobs. New sources require approval; Anthropic page-watch and blocked/unverified endpoints remain separate.
- [x] D23 — Founder selected i18n with English fallback and region-aware root entry. D25 supersedes the original two-route mapping: `/en/`, `/zh/` Traditional and `/zh-cn/` Simplified; CN → Simplified, TW/HK/MO → Traditional, other/unknown → English. Explicit locale URLs and saved user choices take precedence. Use trusted approximate Vercel IP-country headers, no GPS; root uses private/no-store temporary redirects, while locale pages have independent cache keys/canonicals and reciprocal hreflang. Planned, not implemented.
- [x] D24 — Founder selected a 48-hour startup discovery lookback. Consider eligible source items from the previous 48 hours on first activation; prioritize newest developments and deduplicate before generation. Source feeds may expose less than 48 hours of history; do not claim complete recovery from a rotating feed. Preserve actual event/source dates and do not present older items as breaking. Recovery after longer downtime needs a separate bounded backlog policy.
- [x] D25 — Founder approved three launch variants: `/en/` English, `/zh/` Traditional Chinese (`zh-Hant`), `/zh-cn/` Simplified Chinese (`zh-Hans`). Root first-entry selects CN → Simplified, TW/HK/MO → Traditional, other/unknown → English; saved choices and explicit locale paths take precedence. All three variants live in one story document, subject to rich-text/size/schema validation. Check regional terminology, entities, figures and correction consistency; do not rely only on character conversion. Extend locale feeds/search/SEO and newsletter preferences accordingly. This supersedes earlier two-version scope and CN→Traditional root routing.
- [x] D26 — Founder selected Zoho Mail Forever Free for custom-domain business/contact email on tokenonair.com. Verify regional free-plan availability during signup; current advertised limits are one domain, up to five users and 5 GB per user, without IMAP/POP/ActiveSync. Recommended initial public address: hello@tokenonair.com (address selection pending). Account creation, domain verification, mailbox creation, Cloudflare DNS MX/SPF/DKIM and DMARC configuration, and authorized delivery checks remain pending. Use exact region-specific records from the Zoho Admin Console. This is contact email; beehiiv remains the newsletter provider, with digest sending deferred. No account, DNS change or mail delivery is verified by this decision.

Still proposed: one founder/operator; no reader accounts or paid memberships at launch. Vercel is founder-selected; its commercial plan and purchase remain unapproved. Astro ISR remains the proposed delivery approach. Astro 7 is the target subject to a compatible Sanity/adapter production build. These are not silently approved purchases or market decisions.

## Phase 0 — Business brief, budget and implementation scope

**Priority:** P0. **Owner:** Founder, with Engineering for feasibility. **Dependencies:** none. **Outputs:** approved scope, provider budget, reviewed launch design.

- [x] B01 — Audience groups and geography confirmed: builders/founders/technology users plus investors/market followers; global coverage with a Taiwan/Asia lens. Founder confirmed 40% practical AI/crypto coverage and 60% markets, funding and industry developments. Track unique stories rather than counting each translation twice; the founder subsequently confirmed source-driven AI-versus-crypto coverage without a fixed topic quota.
- [x] B02 — Launch variants confirmed: English, Traditional Chinese and Simplified Chinese. Preserve source language independently from publication language; every qualifying story will publish in all three variants through the selected automated workflow in one localized article document; translation checks and failure handling require implementation.
- [ ] B03 — Apply the selected brand `Token on Air`; connect the founder-purchased domain `tokenonair.com` to hosting and verify DNS/TLS, and supply genuine author identity/biography, contact address and ownership details. Product configuration still uses `News` as a development label.
- [ ] B04 — List founder-owned projects and how their relevance and ownership will be disclosed.
- [ ] B05 — Assign editorial and engineering owners, weekly availability, launch-content capacity and incident contact.
- [ ] B06 — Approve a monthly cash ceiling. Initial planning ceiling: $150/month for infrastructure/automation, excluding labor and legal/accounting; validate against actual quotes.
- [ ] B07 — Obtain current quotes for commercial frontend hosting, Sanity entitlements, GA4 standard entitlements, email, domain, recovery/export storage and automation execution and recovery storage. AI generation is provided through Dots and excluded from this budget by founder instruction; verify its supported tool connection, account access and throughput separately. Record recurring versus usage costs and hard caps.
- [ ] B08 — Build a six-month cash worksheet including zero revenue, observed revenue, founder labor, a 20% implementation contingency, and a stop-spending threshold.
- [x] B09 — Founder approved the launch specification and template recommendation on 2026-10-22. Foundation tasks are in [the implementation plan](../superpowers/plans/2026-10-22-editorial-foundation.md); foundation implemented locally and pushed in draft PR #1; later phases remain open.

**Exit evidence:** one written business brief and budget; named owners; concrete launch design reviewed. Branding and accounts may remain configurable during local development, but must be resolved before Phase 5 exit.

## Phase 1 — Template, versions and editorial foundation

**Priority:** P0. **Owner:** Engineering; Founder reviews editorial usability. **Dependencies:** B09. **Outputs:** reproducible local project, Sanity schemas, authenticated preview, first staging article.

### Foundation and compatibility

- [ ] F01 — Review the official Sanity starter's current source, reuse license, framework requirements and environment variables. Use its integration patterns; no paid theme source may be copied without a suitable license.
- [ ] F02 — Validate Astro 7 with compatible `@sanity/astro`, Portable Text, React integration and host-adapter versions. Record exact resolved versions and runtime in a committed lockfile and setup notes. If compatibility fails, record a tested fallback rather than force-upgrading.
- [ ] F03 — Run type check and production build before adding newsroom features. Verify a published Sanity article, licensed image and preview flow on the candidate host.
- [x] F04 — Configure separate public content reads and private preview credentials. Reject fixture-content mode in production; local samples must be visibly labelled.
- [ ] F05 — Locally implemented selected Persona-inspired newsroom (home, topic pages and article identity; see docs/operations/branded-newsroom.md); browser visual acceptance remains open. Use an original editorial layout: lead story, compact latest list, AI/Crypto sections and readable article pages. Refer to AstroNews for hierarchy and The Magazine News for restraint; final layout is not chosen by demo timing alone.
- [ ] F06 — Add no client framework, carousel, animation library or tag manager without a reader-facing reason. A dependency in `package.json` does not prove it is shipped to readers; verify the built bundles.

### Sanity content and permissions

- [x] F07 — Define article, author, category, affiliateOffer, campaign, project and siteSettings schemas; use Portable Text and Sanity media references with license/credit/alt fields.
- [x] F08 — Require article section, format, unique slug, title, summary, body, byline, publication/update dates, source links for news, and relationship disclosure when applicable.
- [x] F09 — Keep subscriber details, contracts, confidential notes, raw feed inboxes and job logs outside Sanity Free public documents. Published fields are public even if the website hides them.
- [x] F10 — Implement manual publishing, correction entries and withdrawal. Document that Studio validation is not CMS-enforced draft-only access for a privileged token.
- [ ] F11 — Verify available Sanity roles against the chosen plan. Free's Administrator/Viewer model does not satisfy a separate Editor or draft-only automation role; resolve an upgrade or different access design before requiring either.
- [x] F12 — Authenticate preview, set `private, no-store` and `noindex`, and exclude preview from analytics. Do not treat an unlisted URL or `robots.txt` as authentication.
- [ ] F13 — Demonstrate create → preview → publish → correct → withdraw. Test anonymous draft/API access, invalid content, duplicate slugs and missing media without leaking secrets.

- [ ] F14 — Extend the current single-language foundation for English/Traditional Chinese/Simplified Chinese: one article document with localized English/Traditional Chinese/Simplified Chinese title, slug, summary and body fields; per-locale validation status, shared media/evidence, synchronized correction tracking and locale-aware rendering. Three-language schema, normalization and routes are implemented locally; live representative-document validation remains pending.

**Local evidence:** [foundation operations](../operations/editorial-foundation.md). F02/F03/F11/F13 remain open because provider/staging/manual live checks are incomplete. Preview has local authentication only; remote preview is deliberately disabled until durable limiting exists.

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

- [ ] R13 — Add locale-aware URLs, language switching, translated navigation, per-language feeds/search and self-canonical/hreflang metadata for reviewed translations only. Use confirmed `/en/`, `/zh/` (Traditional) and `/zh-cn/` (Simplified) routes; root-only first entry selects CN→Simplified, TW/HK/MO→Traditional, other/unknown→English, respecting saved language choice and explicit paths. Keep `zh-Hant`/`zh-Hans` metadata, private/no-store temporary root redirects and cacheable locale routes. Do not link to missing translations.

**Exit evidence:** publication propagation timings and invalidation tests pass; all three valid feeds and search reflect publication/withdrawal; no drafts in public discovery; cache keys match actual host behavior.

## Phase 3 — Analytics, newsletter and commercial components

**Priority:** P0 foundation; campaigns activate only after actual agreements. **Owner:** Engineering + Founder. **Dependencies:** Phase 2; email provider chosen before N02. **Outputs:** working reader conversions and correctly labelled commercial surfaces.

### Measurement

- [ ] A01 — Configure the founder-selected GA4 standard property/web data stream for the production domain only, with appropriate consent behavior and safe URL handling. Exclude local/test/authenticated preview traffic. Verify the desired events and mark business outcomes as key events deliberately; do not double-count automatic and custom events. Keep local/test/preview traffic out; analytics failure must not prevent reading, navigation or signup.
- [ ] A02 — Implement `affiliate_click`, `sponsor_click`, `owned_project_click` and `newsletter_signup` with non-sensitive article, section, partner/campaign/project and placement IDs.
- [ ] A03 — Fire signup success after the email provider accepts the request. Count confirmed subscribers separately in the email provider; do not label requests as confirmed opt-ins.
- [ ] A04 — Test each event with mouse/keyboard navigation, blocked scripts and repeated navigation; avoid double counts and exclude emails, tokens and sensitive query strings.
- [ ] A05 — Define a reporting dictionary: audience/pageviews and supported key events in GA4; opt-ins/delivery/unsubscribes in email; approved commissions/clawbacks in affiliate dashboards; booked/collected sponsor revenue in commercial records.
- [ ] A06 — Document measurement limits: pageviews are not verified viewable ad impressions; RSS requests are not subscribers; blocked analytics creates gaps. Do not promise a returning-user metric the selected tool cannot reliably supply.

### Newsletter

- [ ] N01 — Set up founder-selected beehiiv Free and verify confirmed opt-in, suppression, export, API/form access, language-preference handling, current quotas and terms. Provider choice is complete; live capability checks remain open.
- [ ] N02 — Add English/Traditional Chinese/Simplified Chinese/all-three preference, defaulting to the page language and editable before submission; verify provider persistence and later delivery segmentation. Build server-side signup validation, abuse limits, safe provider errors, duplicate handling and accessible success/error states. Protect secrets and avoid duplicate local personal-data storage.
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
- [ ] E05 — Initial fixed discovery list is researched and technically verified: [25 feeds](../research/2026-10-22-fixed-source-list.md), including AI labs, crypto primary sources and Taiwan newsrooms. Complete per-source terms/limits checks and add carefully approved regulatory/governance evidence when needed; do not confuse a technically working feed with licensed reuse or operational ingestion.
- [ ] E06 — Maintain the confirmed 40% practical / 60% markets-funding-industry editorial mix, measured across unique stories. Establish a capacity target of source-driven automatic briefs rather than a fixed daily story count, with fresh unique developments ahead of backlog. Weekly analysis and digest capacity remain to be set. Do not relax evidence checks to increase volume.
- [ ] E07 — Write factual About, editorial policy, corrections, contact, privacy and Advertise pages; disclose ownership and commercial relationships. Founder supplies missing business facts before launch.
- [ ] E08 — Prepare distribution per article: newsletter inclusion, relevant social/community post draft, consistent campaign tags and internal links. Choose channels based on actual target readers; do not publish/send automatically.
- [ ] E10 — Implement the confirmed three-variant coverage policy: every qualifying story gets English, Traditional Chinese and Simplified Chinese versions, with automated terminology/entity/number/source checks and synchronized corrections/disclosures. Measure unique stories separately from language versions. Specify publication timing and partial-language failure behavior; hold failing versions rather than treating translation generation as verified accuracy.
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

## Phase 7 — RSS discovery, AI writing and controlled automatic publication

**Priority:** required before launching the founder-selected automated editorial operation; website foundation and discovery work can proceed independently. **Owner:** Engineering + founder as corrections/escalation owner. **Dependencies:** approved automation design, stable publication/correction/withdrawal flow, approved source terms, private storage/auth design and resolved CMS publish permissions. **Outputs:** private discovery/exception inbox and evidence-linked AI articles that automatically publish only after defined checks. Local discovery/queue/publisher controls are implemented, disabled by default; independent semantic verifier, Dots connection and live lifecycle acceptance remain open.

### Verified discovery inputs, observed 2026-10-22

- PANews: `https://www.panewslab.com/rss.xml?lang=en&type=NORMAL%2CNEWS%2CVIDEO`; HTTP 200, 100 items, declares English but sample has mixed-language titles. Preserve query parameters.
- Grenade: `https://grenade.tw/rss` → `https://grenade.tw/feed/`; HTTP 200, 20 items, declares Traditional Chinese.
- BlockTempo: `https://www.blocktempo.com/rss` → `https://www.blocktempo.com/feed/`; HTTP 200, 10 items, declares Traditional Chinese.

These are rotating feed windows, not archive counts or a republishing license. Recheck endpoints and permitted use before activating ingestion.

- [ ] I01 — Specify a separate private source/job database and authenticated editor inbox. Keep subscriber records in email SaaS and secrets in the hosting secret store.
- [ ] I02 — Source model: original/resolved URL, language hint, topic, permitted use, enable state, fetch validators, poll interval and last success/error.
- [ ] I03 — Item/cluster/job models: external GUID/normalized link, title, minimum permitted metadata, dates, language, fingerprint, claim/primary-source notes, attempts, next retry and stable idempotency key. Set an explicit retention period before ingestion.
- [ ] I04 — Poll at a proposed five-minute cadence where source terms and limits permit, with conditional requests, jitter, timeout, response-size limits and bounded retry/backoff. Record source-publication, discovery, processing and website-publication timestamps. Target 10–15 minutes from discovery to publication after checks pass; source delays are outside platform control. Monitor queue age and timeouts; use the confirmed 48-hour startup lookback, prioritize newest eligible items and account for feed windows shorter than 48 hours. Define source-specific staleness and extended-outage recovery policy before activation.
- [ ] I05 — Restrict outbound hosts and validate redirects/IP destinations; disable XML external entities; sanitize content and treat embedded instructions as untrusted data.
- [ ] I06 — Deduplicate retries without suppressing distinct developments; cluster related coverage and preserve source links and per-item language. Quarantine malformed items without blocking the other feeds.
- [ ] I07 — Design the AI-writing workflow with original wording, visible source attribution and editor credit `jienweng`, without an AI-generated label. Require retrievable evidence for factual claims, named entities, dates and numbers; independently validate source/claim consistency, duplicates and source-text overlap. Hold failed or unsupported items; a second model opinion is not proof of truth. Full-text copies or translations require suitable rights. Define permitted formats, high-risk exclusions and confidence-independent publication criteria in the automation spec.
- [ ] I08 — Verify actual Sanity capabilities and separate the writer from the controlled publisher. Writer output cannot choose arbitrary document IDs, destinations or CMS mutations. The publisher validates approved job state and uses the least privilege available; document residual credential risks and verify permissions live.
- [ ] I09 — Implement narrowly scoped publication requests after successful checks, idempotent state transitions, founder-approved burst/concurrency and daily model/spend limits, audit evidence and an operator kill switch. Define automatic correction/withdrawal handling and owner escalation. Do not expose a general CMS mutation endpoint or log secrets/confidential source text.
- [ ] I10 — Test replay, restart, mixed languages, missing GUIDs, changed URLs/dates, unsafe redirects, malformed XML, model instructions, quota exhaustion and individual-source outage.

**Exit evidence:** usable exception inbox; repeated polling/retries create no duplicate articles; valid articles publish automatically and invalid/evidence-deficient ones are held; corrections/withdrawal, kill switch, credential boundaries and spend limits are demonstrated with failure cases. No automatic newsletter/social distribution is implied.

## Deferred features and their entry conditions

**Priority:** P2. These are backlog conditions, not launch tasks.

- Reader accounts/bookmarks: repeated reader demand with a specific retention use case.
- Memberships/paid research: demonstrated willingness to pay and sustainable original output.
- Additional languages beyond English, Traditional Chinese and Simplified Chinese: expand only after the three-variant workflow is sustainable and review capacity exists.
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

## 2026-10-22 implementation update

Locally implemented: three-language story validation and routes, language choice/root routing, reciprocal article SEO, search/RSS/sitemap, truthful policy pages, disabled beehiiv/Turnstile signup adapter, production-consent GA4, durable private discovery/publishing CLI, health/preflight and CI checks. See the launch-readiness runbook for exact evidence and external gates. Existing unchecked launch items still require live service, rights, browser or operational acceptance; local code does not automatically complete them. Dots connection and independent semantic verifier are not implemented/verified by the signed-report interface.
