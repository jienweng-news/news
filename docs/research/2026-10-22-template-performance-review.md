# Astro Template and Version Review

Observed: 2026-10-22. This is a research snapshot, not a production performance certification.

## Recommendation recorded in the plan

Use Sanity's official Astro starter as the integration reference and create an original newsroom layout. Refer to AstroNews for dense editorial hierarchy and The Magazine News for a calmer reading experience. Bookworm Light is an inspectable free alternative, but requires Sanity and newsroom adaptation. No paid template is purchased or approved for source-code reuse.

Target Astro 7 after validating the Sanity integration, Portable Text, host adapter, runtime and production build together. Resolve compatible versions and commit the lockfile at implementation time; do not use this snapshot as a permanent version pin.

## Version findings

Direct repository manifest fetches confirmed:

- Bookworm Light template version `4.0.3` pins Astro `7.0.3`, MDX `7.0.0` and React integration `6.0.0`. Its public demo HTML instead reports Astro `6.1.9`.
- Sanity official starter frontend declares Astro `^6.1.6`, Vercel adapter `^10.0.8` and `@sanity/astro` `^3.3.1`. Its public demo reports Astro `6.4.8`. A caret range is not an exact deployed or lockfile version.
- AstroNews and The Magazine News listings advertise Astro 7. Paid source manifests were not available for inspection, and their demo HTML had no generator version marker. Exact versions remain unverified.

The Sanity reference configuration uses server output and a Vercel adapter, but does not itself prove production ISR/invalidation is configured. The publication must implement and verify its chosen cache strategy.

Bookworm's source includes React, search, MDX and optional tag-manager tooling. Package presence does not show how much JavaScript ships on a particular route; inspect actual built assets before removing or adopting dependencies.

## Astro 6 versus Astro 7 performance evidence

Astro's June 22, 2026 release announcement reports 15–61% faster builds in its own benchmark suite, run on an Apple M4 Pro MacBook Pro with 48 GB memory. Examples include Astro documentation, roughly 6,313 pages, from 114.54 to 73.53 seconds, and astro.build, roughly 308 pages, from 62.70 to 24.24 seconds.

These are vendor-reported build measurements, not measurements of our site or a guarantee of reader performance. Astro 7 documents a new compiler/Markdown pipeline and stable route caching; the listed platform CDN cache providers are experimental at the time reviewed. A provider's production support and purge semantics must be checked before adoption.

For this Sanity/Portable Text publication, Markdown-heavy build gains do not directly establish faster article delivery. Avoid full-site rebuilds per story, and measure fresh publication, cold/warm rendering, delivered browser assets and cache invalidation separately.

## Direct public-demo delivery check

Raw data: [JSON evidence](2026-10-22-template-delivery-check.json).

Workload: each public homepage requested three times sequentially per site; sites tested concurrently from this workspace with Python urllib. Requests used `Accept-Encoding: identity` and a consistent user agent. No browser JavaScript was executed. Responses were capped at 3,000,000 bytes; all observed homepage and directly requested script bodies were below that cap.

Observed values, decimal kB:

- AstroNews: 81.2 kB HTML; 46.6 kB observed executable script text; 47 image elements; response-header time 560–1,178 ms, median 576 ms.
- The Magazine News: 37.2 kB HTML; 9.9 kB observed executable script text; 13 image elements; response-header time 74–243 ms, median 75 ms.
- Bookworm Light: 32.7 kB HTML; 16.7 kB observed executable script text; 11 image elements; response-header time 20–138 ms, median 20 ms.
- Sanity starter: 7.9 kB HTML; no executable script text observed by this method; three image elements; response-header time 286–494 ms, median 298 ms.

Script measurement adds inline executable script text and directly referenced script-file bytes. It excludes JSON data scripts, imported module graphs, dynamic loads, event-handler attributes, CSS, fonts, images and runtime network activity. It is not total JavaScript transfer, executed JavaScript, compressed payload or total page weight. Image element counts are not image download counts.

Response-header timing includes connection setup and server/network delays. Hosting, cache state and content differ; sample size is three and samples are not independent enough to support statistical claims. Do not rank framework speed, CDN quality or build versions from these timings. The tiny Sanity sample is not equivalent to a finished news homepage.

AstroNews delivered executable JavaScript despite the listing's broad zero-runtime-JavaScript wording. The observed script amount alone does not establish poor performance.

## What was not verified

- No mobile/desktop Lighthouse, LCP, INP, CLS, execution-time or complete transfer benchmark.
- No paid-source code, exact package lockfile or license audit.
- No same-content, same-host comparison of Astro 6 versus 7.
- No RSS freshness, real editorial workflow or CMS failure test on the paid templates.
- No automatic browser visual check: T3 preview failed with the host's AppArmor sandbox restriction. HTTP fetches succeeded; they are not a substitute for browser execution.

Before implementation purchases, obtain source/license access and test the chosen production build with representative content, fonts, images, analytics and sponsor placement. The master checklist defines provisional budgets and the release evidence required.

## Primary sources

- [Official Sanity Astro starter](https://github.com/sanity-io/sanity-template-astro-clean)
- [Sanity frontend manifest](https://github.com/sanity-io/sanity-template-astro-clean/blob/main/frontend/package.json)
- [Sanity frontend configuration](https://github.com/sanity-io/sanity-template-astro-clean/blob/main/frontend/astro.config.mjs)
- [Bookworm manifest](https://github.com/themefisher/bookworm-light-astro/blob/main/package.json)
- [Bookworm configuration](https://github.com/themefisher/bookworm-light-astro/blob/main/astro.config.mjs)
- [AstroNews listing](https://astro.build/themes/details/astronews-news-magazine-astro-website-theme/) and [demo](https://astronews.madethemes.com/)
- [The Magazine News listing](https://astro.build/themes/details/the-magazine-news/) and [demo](https://themagazinenews.pages.dev/)
- [Bookworm demo checked](https://bookworm-light-astro.vercel.app/)
- [Sanity demo checked](https://template-astro-clean.sanity.build/)
- [Astro 7 announcement](https://astro.build/blog/astro-7/)
- [Astro caching](https://docs.astro.build/en/guides/caching/)
