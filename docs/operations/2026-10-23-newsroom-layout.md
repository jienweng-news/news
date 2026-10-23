# Newsroom layout production acceptance

Owner selected a magazine-style newsroom preserving current red/black identity.

Release: Vercel `dpl_CRKuGbEpHMN9pL2gn3gQixrVx45A`, production READY from Git `5f702c796ec5993aa83182f25e07de62af10de6d`, https://tokenonair.com and www alias.

Changes: compact masthead; lead headline before image; two smaller supporting image stories; slim latest-headlines rail; publication date/time in localized UTC format; compact AI/Crypto rows. Topic/archive/search lists use image/text rows. Mobile navigation scrolls within its row; news columns collapse to two plus full-width rail at1100px, then one at760px. Images remain existing Sanity assets with source/license links outside story anchors. No CMS content, Worker, signup or analytics settings changed.

Verification:
- RED→GREEN selection and timestamp tests; full207 tests across32files pass.
- Astro check70files:0errors/warnings/hints; frontend build and whitespace check pass.
- Fresh review no blocking findings. Fixed minor topic-row specificity and homepage section hover contrast; verified topic headlines27px in browser.
- Local actual browser1440,850,390,320 layouts no page overflow; tablet rail spans both columns;320px nav scrolls internally.
- Production1440 and320browser: all newsroom images decoded, two supporting stories, no nested anchors, valid dateTime/UTC labels and no horizontal overflow.
-21 HTTP routes across en/zh/zh-cn(home, AI, Crypto, archive, search, author, RSS)200; home/listing markers and all three image asset identities verified. www home200.
- Chinese DOM/text/timestamps correct. This host browser lacks CJK fallback glyphs (pre-existing); CJK glyph appearance is not claimed visually verified. Native Chinese-capable browser/system fonts remain the existing fallback arrangement.
- Impeccable global-sheet scan reports pre-existing accent/type-ramp advisories; scoped news layout preserves identity, uses neutral1px column separation, and documents the new hierarchy in frontend/DESIGN.md.

Private acceptance: `.private/public-repo-audit/newsroom-layout-http-checks.json`; deployment metadata in `newsroom-layout-deployment.json`.
