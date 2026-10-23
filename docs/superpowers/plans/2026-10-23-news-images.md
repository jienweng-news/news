# News images and author profiles

Implement natively in the existing worktree. User approved production deployment and original branded fallback graphics on 2026-10-23.

## Design
Keep the approved red, ink and cream newsroom identity. Every published story gets a lead image and social image. Licensed Sanity media takes priority; missing media uses a first-party branded editorial graphic, with a published-story-only PNG endpoint and cache headers. No arbitrary remote image proxy or free-text rendering endpoint. Author profiles accept a supplied portrait, show an explicitly branded initials fallback otherwise, and never invent a biography or portrait. Add large-image Open Graph/Twitter metadata and article image structured data. Keep preview content out of public image generation.

## Tasks
1. Deploy the previously verified Git commit to production, smoke-test all editions.
2. RED tests: author image normalization rejects unsafe URLs; shared story image selection and metadata choose licensed media or absolute branded PNG; image endpoint refuses unknown locales/slugs/drafts and returns PNG on published content. Implement author schema/projection/type, image helper and rendering endpoint; verify tests.
3. Integrate author profile/header and byline avatar, image-bearing lists and hero, OG/Twitter tags, article structured data. Verify typecheck, full tests, build, HTTP image dimensions, desktop/mobile actual pages.
4. Commit scoped changes, mirror to the existing PR branch, deploy Git commit to production, verify public URLs and image MIME/dimensions/metadata. Record pending real author portrait and any remaining launch blockers.

## Verification
No source copying or invented rights. Fallback artwork is first-party and labelled as illustration. Public PNG endpoint resolves only actual published stories, bounds slug/locale, escapes XML and handles CMS failures without caching failures. Production deploy preserves disabled signup until its existing acceptance gates pass.
