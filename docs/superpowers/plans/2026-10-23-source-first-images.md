# Source-first Images Implementation Plan

> Required execution: superpowers:executing-plans, native implementation with TDD and one fresh final review.

**Goal:** Backfill varied, source-first imagery into all existing Sanity articles.
**Architecture:** Explicit reviewed-source manifest, topic illustrations as first-party static assets, versioned Worker-managed image attachment. Existing source/slug identity and revision fences remain mandatory.
**Tech Stack:** Astro, Sharp, Sanity Assets API, Cloudflare Worker/D1.
**Spec:** ../specs/2026-10-23-source-first-images-design.md

## Global constraints
No new dependencies, source permissions, emails, payments or publication dates invented. Preserve selected photos. Only fixed reviewed HTTPS image URLs accepted; no caller-supplied upload URLs. Existing automation flags and retries preserved.

## Tasks and ledger
- [x] 1. Add failing tests for original-source selection, title-specific illustration selection, and versioned refresh while preserving manual replacements. Implement source manifest and image selection/metadata. Commit after tests pass.
- [x] 2. Generate and inspect forest and ultrasound illustrations; save project assets. Extend deterministic fallback with distinct compositions, verify PNG outputs and frontend build. Commit.
- [x] 3. Final fresh review, fix important findings; deploy frontend then Worker; backfill three records. Verify real assets, original-source credits, nine page/OG checks and unchanged dates/provenance. Record acceptance and push PR branch.

## Review focus
- Manual replacement carrying old managed fields must not be replaced.
- Source images must retain source/license attribution at every placement.
- Upload/download only fixed trusted media URLs, with bounded asset formats.
- Backfill version cannot cause repeated uploads on each cron tick.
- Illustrations must not claim to show actual study data or patient scans.

Ruling: use generated bitmap assets for two existing Google stories; preserve code-rendered artwork for unmatched future stories. The supplied Google source pages do not establish image reuse rights, while Ethereum terms explicitly cover blog images unless otherwise marked.

Task verification: observed RED tests for refresh/source selection, optional attribution links, and fallback variants; GREEN 205 tests across31files, frontend Astro check0diagnostics, frontend/Studio builds, Worker TypeScript+real runtime smoke pass. Fresh review found nested homepage attribution anchors; fixed with AST regression (observed RED→GREEN) and reran full suite. Image assets inspected; optimized PNG palette output.

Production acceptance complete: all three real Sanity assets attached, nine localized page/OG checks pass, author/mobile browser images decoded with no overflow, dates and provenance unchanged. See docs/operations/2026-10-23-news-images.md for deployment IDs and evidence.
