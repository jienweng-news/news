# Token on Air Newsroom Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans with TDD. Native execution and the visual direction are already founder-approved; this plan makes that approved slice executable.

**Goal:** Apply the chosen newsroom identity and deliver working AI/Crypto section navigation without requiring external accounts.
**Architecture:** Keep existing normalized Sanity/fixture repository and preview protections. Derive an ordered newsroom model, render reusable story lists, and add section routes using the same repository. No new runtime dependencies.
**Tech Stack:** Existing Astro 7, TypeScript and Vitest.
**Spec:** ../specs/2026-10-22-publication-launch-design.md; ../../design/2026-10-22-token-on-air-visual-direction.md; frontend/PRODUCT.md.

## Global Constraints
- Token on Air; tagline “Understand what’s next.”; public editor credit `jienweng` without invented human review or AI disclosure.
- Original red/black/warm-white Persona-inspired direction; comfortable upright article body; no game assets.
- Label fixtures and keep production fixture rejection and private-preview isolation intact.
- No deployment, mail, CMS writes or analytics. Three-language routing/CMS localization and signup integration remain subsequent slices, not simulated controls.
- Preserve existing article URLs in this slice; section routes `/ai/` and `/crypto/` can later redirect to locale equivalents.

## Review Focus
- Equal topic prominence when one topic dominates incoming stories.
- Sorting by publication time without mutating repository input or promoting drafts.
- CMS errors return 503 while genuine empty sections return 200.
- Long headlines, narrow viewports and absent media preserve readable content.
- Preview controls, fixture labels and commercial disclosures remain available and truthful.

### Task 1: Newsroom composition
**Files:** frontend/src/lib/content/newsroom.ts; tests/newsroom.test.ts.
**Interfaces:** consumes ArticleCard[]; produces composeNewsroom(articles): {lead, latest, sections:{ai,crypto}, analysis}; selectSection(articles, section) returns sorted cards. Only normalized public cards are passed, with defensive preview exclusion.
- [x] Write tests for descending publication dates, input immutability, topic isolation, equal section keys, empty content and preview exclusion; analysis selects analysis format.
- [x] Run `npm test -- tests/newsroom.test.ts`; expect RED from missing module.
- [x] Implement selectors and run whole test suite; expect GREEN. Commit task.

### Task 2: Branded newsroom and section pages
**Files:** layout, homepage, new SectionPage/StoryList components and ai/crypto routes, ArticleMeta, config, .env.example, global.css; self-hosted licensed display font; tests/config.test.ts; scripts/check-newsroom.mjs.
**Interfaces:** consumes Task 1 model and existing repository. SectionPage receives Section; StoryList receives cards. Existing public and preview article routes remain intact.
- [x] Add config test expecting Token on Air default and HTTP smoke assertions for new section routes, editor credit, semantic navigation, fixture/noindex labels and working story links.
- [x] Run config test and smoke against existing local server; expect RED for old name and missing sections.
- [x] Implement approved identity, self-host licensed condensed type, reuse repository and 503 handling, add section links and editor attribution; no fake signup/language controls.
- [x] Run full tests/check/build and HTTP smoke; expect GREEN. Commit task.

### Task 3: Verification and handoff
**Files:** docs/operations/branded-newsroom.md; frontend/DESIGN.md; master checklist and PRODUCT status.
- [x] Document completed behavior and remaining locale/automation/signup/GA4 work, including unavailable visual verification if host still blocks browser.
- [x] Run final test/check/build and public/private HTTP smoke, one fresh-context review, fix important findings with RED→GREEN; retain review evidence in ledger. Commit task.
