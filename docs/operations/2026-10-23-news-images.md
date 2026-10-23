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
