# Newsroom Layout Implementation Plan

> Execute natively using superpowers:executing-plans and TDD; one fresh final review.

**Goal:** Make the existing publication scan and feel like a news platform.
**Architecture:** Existing Astro components, newsroom composition, scoped CSS and localized timestamp helper; no dependencies or new CMS fields.
**Spec:** ../specs/2026-10-23-newsroom-layout-design.md

## Tasks
- [x] 1. RED→GREEN composition/timestamp tests. Add bounded supporting selection, accurate localized timestamps and reusable story metadata. Commit.
- [x] 2. Implement approved front-page hierarchy and row-based listings. Preserve image credits/links; add navigation and responsive behavior within existing identity. Verify frontend checks/build and actual desktop/mobile/Chinese rendering, empty and long-headline states. Commit.
- [x] 3. Fresh final review; fix important findings, run full tests, deploy production, HTTP/browser verify and record evidence. Push existing linked PR3 without merging.

## Constraints and review focus
No fake stories, dates, live reporting or invented market numbers. No changes to CMS article data, newsletter activation, Worker automation or analytics consent. Preserve selected source images and source/license links. Never nest image-credit links in story anchors. Match DOM/focus reading order across breakpoints. Sparse content should not produce invented filler. No new dependencies.

Ledger: task1 observed failing supporting-selection/missing timestamp helper tests then GREEN. Task2 207tests/32files pass, Astro check0diagnostics and build pass. Desktop1440 and mobile390 layouts/images measured without overflow; Chinese DOM text/date localized correctly, but the host browser lacks Chinese system glyphs (pre-existing), so rendered CJK glyph quality is not claimed verified. Fresh final review found no blockers; minor topic-row specificity and pale hover contrast addressed. Impeccable scan reports legacy side-tab and type-ramp documentation advisories in the existing global sheet; no broad design-system repair attempted.

Production acceptance: Vercel READY,21routes+www pass; actual desktop1440/mobile320 all news images decode and nooverflow/nestedlinks. Deployment/evidence recorded in docs/operations/2026-10-23-newsroom-layout.md.
