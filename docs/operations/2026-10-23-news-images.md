# Author and news imagery

User authorized production release and original branded editorial graphics on 2026-10-23. Prior verified release deployed as dpl_2AB79mpFC9JKdrEFvauEZHgyg4ar to tokenonair.com and www; public discovery checks passed.

## Implementation ledger
- Added optional Sanity author portrait/alt fields, public projection and validated normalized author image. No biography or photograph invented. Existing editor uses a first-party J monogram until a real portrait is supplied.
- Licensed article media retains priority. All published stories otherwise use a first-party, headline-specific 1200×630 PNG through a published-only locale/slug endpoint; no arbitrary text or remote image proxy. English original headline is used on shared artwork across editions; surrounding metadata/alt text remains localized. Failure responses are not cached; successful graphics cache for five minutes.
- Article hero, homepage lead, noncompact story lists and author archive display images. Added default OG image, article-specific OG/Twitter large-image cards, article author/image JSON-LD and author ProfilePage structured data.
- RED→GREEN: author portrait and image selection tests; actual PNG dimensions and published/missing/invalid route tests. Visual review revealed upstream font SVG serialization emitting NaN for floating coordinates; added a failing regression and direct finite-coordinate outline serialization. English headline no longer loses the last line. New rendering packages have no production audit advisories; pre-existing dependency advisories remain outside this change.
- Author page now has a portrait header, factual published-story count and responsive story grid; no placeholder biography.
- Impeccable detector: 41 advisory observations and one pre-existing heading accent warning. Existing approved Persona-inspired heading styling preserved.

## Outstanding owner content
Upload a real portrait and optional factual biography in the Sanity author editor for jienweng. The J image is a branded avatar, not a claimed photograph. Sanity Studio schema is implemented and built locally; a separately hosted Studio needs deployment before its editor exposes the new field.

## Existing launch blocker
Newsletter signup remains gated by its independent Turnstile/provider acceptance checks; image work does not enable it. No test email or newsletter broadcast sent.

## Fresh-context review
One independent final review found a homepage licensed-image caption regression. Restored attribution through a shared imageCaption helper, also used for newly introduced list thumbnails, with a RED→GREEN regression. Minor findings addressed: neutral crypto artwork instead of an Ethereum-specific motif; author hreflang advertises only editions represented by published story metadata. A supplied author portrait can be used as its social image; dedicated landscape author artwork remains optional future polish.

## Production acceptance
Deployed image code from Git SHA a82cb9be24bb9c90b1af2f3a7a9694a4d3d2e5c1 as dpl_6oj31e1DRJuDsQWpT7GoagQDi4yN (token-on-pq3w7v5h8-lai-jien-wengs-projects.vercel.app), aliased to tokenonair.com and www.tokenonair.com. Verified nine article editions with matching OG/Twitter PNG URLs, image/png MIME and decoded 1200×630 dimensions; all three author editions, avatar/default graphics and www health passed. Production desktop author browser loaded four content images with no horizontal overflow. Local final suite194/194, Astro check0 errors/warnings, frontend and Studio build pass. Existing public discovery checks passed. Production was deployed from the feature release; main remains the configured production branch and should be synchronized through PR3 before subsequent main releases.

## Sanity asset persistence — 2026-10-23

Owner requested every article graphic be attached to the Sanity article. Implemented in `caa4c49` and deployed Worker version `021f0c6f-28a3-41bf-add3-5ea4e531d666`, preserving live automation enabled, kill switch off, host-managed RSS (Worker RSS polling off).

- All three published article documents now have `mainImage` Sanity asset references, alt text, Token on Air credit, original editorial illustration rights, and generated asset/title provenance. The scheduled retry attached the first image; authenticated admin backfill attached the remaining two. No selected photos were overwritten.
- Public Sanity query verified all three `sanity.imageAsset` records and their PNG MIME type. Downloaded each asset from Sanity CDN and verified PNG signature and 1200×630 dimensions.
- HTTP checks passed for all nine localized article pages: visible article image, `og:image`, and `twitter:image` use the corresponding Sanity CDN asset.
- Compared publication date, editorial update date, title, slug, automation identity and source provenance with the pre-backfill snapshot; all unchanged. Sanity `_rev`/system update timestamps change naturally with image attachment.
- Future missing graphics are attached on the existing cron every fifth minute, one published job per tick. Failures back off for one hour so other posts can proceed. Manual photo replacements remain protected even if the headline later changes; only an asset matching its generated asset ID can be refreshed.
- Fresh review identified starvation and manual replacement ownership issues; both fixed with regression tests. Verification: 199 tests across 29 files; Worker TypeScript and real workerd/D1 smoke passed; Studio production build and whitespace check passed. Focused 19-test Worker suite rerun after the final test fixture refinement passed.
- Private acceptance artifacts are in `.private/public-repo-audit/sanity-image-backfill.json` and `sanity-images-verified.json`; no credentials recorded. Hosted Studio schema deployment remains separate; the existing `mainImage` field already displays these attached assets.

## Source-first variety and backfill — 2026-10-23

Owner selected source photos/charts first when reuse is permitted, with varied original illustrations otherwise. Production Vercel deployment `dpl_AY4BFk3nk2povEVeR7f5zGnsurzY` from Git `3a594901dc391941b7b1698ee33fbeb10523db0e` is READY and serves tokenonair.com. Worker version `a3f190c1-7804-4c8f-8e03-cd4517549611` preserves automation enabled/kill switch off and Worker RSS polling off.

Backfilled all three published Sanity mainImage fields:

- Forest mapping: original forest/plantation collage, 1200×630 PNG, asset `image-741e722dfd0dc485183d65132834988b1eac3a2b-1200x630-png`.
- Ultrasound research: original conceptual probe/acoustic-field illustration (not a patient scan), 1200×630 PNG, asset `image-92d98eaad93fe530e136bcb3b127b7e0675674d7-1200x630-png`.
- Ethereum: original unedited 2100×900 JPEG accompanying the source blog post, asset `image-a89f4f53dbcc50cea86d470fc25d3c8ab749bf78-2100x900-jpg`. Asset content hash matches the SHA1 of the original source bytes. Sanity CDN recompresses JPEG delivery, so delivered bytes are not claimed identical. Source and CC BY4.0 links appear in captions. Terms explicitly cover blog.ethereum.org non-code content unless marked otherwise; no contrary asset marking found.

Google blog images were located but not copied because reuse permission is not established; third-party satellite imagery has separate named owners. Future source images require a reviewed manifest entry. Unmatched future stories have three deterministic fallback compositions; the two generated bitmap illustrations are specific to these two current articles and not an unlimited automatic image-generation service.

Verification:205 tests/31files; frontend Astro check0diagnostics/build pass; Worker TypeScript and real workerd/D1 smoke pass; Studio build pass; Impeccable detector no findings. Fresh final review found nested caption/story anchors, fixed with failing→passing AST regression and full suite rerun. All nine localized pages verified visible and OG/Twitter Sanity images; all three real asset documents verified. Dates, title/slug and source/automation provenance match pre-image baseline. Production desktop author gallery and mobile article images decode with no horizontal overflow. Assets and built-in generation prompts recorded in `docs/design/2026-10-23-editorial-image-prompts.md`. Private backfill/acceptance files: `.private/public-repo-audit/source-first-image-backfill.json` and `source-first-images-verified.json`.

## PANews image correction — 2026-10-23

The owner rejected the blue PANews Flash News artwork on the Huang memory story. Inspection confirmed the RSS media URL is a generic banner. Audited all six published PANews stories and their matching article pages: five article bodies contain no image; one contains two. Logos, author portraits, recommendations, OG images and RSS media are excluded. The pipeline now follows only allowlisted PANews article redirects and selects the first allowlisted image embedded in that exact article body; otherwise it uses the Token on Air story illustration. Source charts preserve their full frame in article, lead and list placements. Version `source-first-v5` schedules generated PANews assets for correction while preserving manual selections. Public image captions omit PANews credit and permission text; other source image credits remain.

Production acceptance: Worker `f81aed4a-4d66-4163-8695-9c0921131dc3` is deployed with automation enabled, kill switch off and Worker RSS polling off. All six Sanity assets are version `source-first-v5`; five are story-specific illustrations and one is the first chart embedded in the exact source post. The three edition routes for each story (18 total) serve the matching Sanity hero and OG/Twitter image with no permission wording. Published dates remained unchanged. Native browser review confirms the Huang fallback and full chart frame. Vercel production deployment `dpl_37coVNm1Sxe74HYuviBPYgqxj5Mc` is READY. Tests231/231, frontend check72files0diagnostics and build pass.

Image variation and loading work (local, awaiting release): version `source-first-v6` adds crisp story-topic diagrams for semiconductor capacity, market flows, earth observation, medical imaging, crypto networks, AI systems, regulation and general technology. The source-image order remains the permitted source article image first; a Pexels photo is selected only when there is no already-approved source asset; the branded topic illustration remains the fallback. Pexels candidates use the Pexels API only, request landscape photos at least 1000px wide, and skip photo IDs already attached to published Sanity stories. The CMS source URL retains the photo ID for dedupe and links the visible photographer credit to the Pexels photo page. No generated disclosure or PANews permission caption is added.

The Worker needs the encrypted Cloudflare secret `PEXELS_API_KEY` before the source can be searched. Until it is present, the Worker uses the original branded fallback. Pexels API requests are bounded to one per image, with current image-retry cadence of one item per five minutes (12/hour) and safe fallback on absent key, quota/error response or no unused matching photo. Pexels documents a default 200 requests/hour and 20,000/month; a successful image refresh stops retrying the selected photo ID through Sanity source-URL inventory.

Article heroes and lead imagery now use Sanity CDN responsive `srcset` widths with automatic WebP/AVIF negotiation (`fit=max`, quality82). The first in-list image loads eagerly and only later images remain lazy; article hero keeps eager loading, synchronous decode hint and high fetch priority. A representative existing forest PNG measured 601,460 bytes as stored and 162,334 bytes as a 960px Sanity WebP response (73% smaller); original and social/OG assets are unchanged. Local visual renders show the distinct chip, capital-flow and forest-map scenes. Validation before final commit: targeted image/worker tests passed; full suite and production/browser checks to be recorded after release. Pexels integration, the v6 Worker backfill and live CDN/browser behavior remain pending until the key is saved and deployments are verified.
