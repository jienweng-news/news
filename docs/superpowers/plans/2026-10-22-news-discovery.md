# News discovery implementation plan

> Use executing-plans inline and one fresh final review.

**Goal:** Resolve fixable launch issues and add the founder-approved archive, section RSS, author pages and related coverage.
**Spec:** Founder approved this bounded design in chat on2026-10-22: retain Persona styling; three locales; only actual published content and supplied author bios. Existing launch spec and launch-checklist remain constraints.
**Architecture:** Reuse public repository and server-rendered Astro components; pure selection helpers, path pagination, no new client dependency.

## Global constraints
No fabricated articles/bios, no activation of unverified Kit/Dots integrations, no secrets in output. Preserve private preview isolation and actual locale URLs. Push/deploy already authorized.

## Review focus
Archive invalid/out-of-range pages must404; empty archive page1 must200. No duplicate items under equal dates. Section RSS self URL and items must match section. Unknown author must404 without fabricated bio. Related-content failure must not take down an otherwise available article. Credentials must not be exposed or mistaken for usable exports.

### Task 1: Dependency and account audit
- [ ] Inspect live env names, DNS and advisories; record evidence and account gates.
- [ ] Apply only a compatible targeted uuid fix; verify typeid roundtrip and Studio build, full tests. Commit.

### Task 2: News discovery
- [ ] Write failing pure-function tests for pagination, invalid pages, deterministic order, related exclusions and section RSS identity; run Vitest RED.
- [ ] Implement helpers and routes: /[locale]/archive/, /[locale]/archive/[page]/, /[locale]/authors/[slug]/ and /[locale]/[section]/rss.xml. Add author links, related stories and discoverable archive/feeds; localize labels.
- [ ] Add built HTTP checks for pages, invalid routes, author404 and section feed filtering; verify Node build and smoke, full tests/checks. Commit.

### Task 3: Review and release
- [ ] Fresh final review, fix important findings via RED/GREEN.
- [ ] Vercel build/deploy, verify all new live routes on both hosts, update feature/launch checklist and push PR3.
