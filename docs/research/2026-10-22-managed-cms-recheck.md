# Managed CMS and cost recheck — 2026-10-22

## Recommendation

Keep Sanity Free for the existing Astro publication foundation; reconsider at measured archive/quota pressure or a specific need for custom CMS access control. CMS choice does not establish website CDN speed, RSS quality or SEO traction. Those depend on the frontend, caching, feeds and content.

## Current official evidence

- Payload Cloud new-project deployments are currently paused; existing projects continue. The old cloud-pricing URL redirects to the transition notice: https://payloadcms.com/payload-has-joined-figma
- Payload's free offering is MIT-licensed self-hosted software. The Vercel template uses Neon database and Vercel Blob storage. Those infrastructure services have separate quotas and billing; free code is not a free managed Payload cloud service. https://payloadcms.com/get-started and https://payloadcms.com/docs/production/deployment
- Sanity Free includes hosted content infrastructure, unlimited locales, 10,000 documents, two public datasets, 1 million API CDN requests/month, 250,000 API requests/month, 100GB assets and 100GB monthly bandwidth. Administrator/Viewer roles only; Growth lists $15/seat/month and 25,000 documents. Use the live pricing page over older community quota answers: https://www.sanity.io/pricing
- Drafts count toward document usage. Free quotas have hard restrictions; monitor usage before hitting limits. https://www.sanity.io/docs/platform-management/plans-and-payments and https://www.sanity.io/docs/help/understanding-quotas
- Sanity's CDN serves content queries; use fresh uncached reads during generation/regeneration. https://www.sanity.io/docs/content-lake/api-cdn
- Vercel Hobby is restricted to personal, non-commercial use. Commercial publication needs an appropriate plan. Provider selection is not paid-plan purchase approval. https://vercel.com/docs/plans/hobby
- Cloudflare Web Analytics is a possible free audience/performance tracker, not yet selected. Verify conversion/event needs rather than assuming feature parity with Plausible. https://developers.cloudflare.com/web-analytics/

## Archive implications

Illustrative model, not forecast: 20 unique stories/day with two separate locale documents gives 40 documents/day. A 10,000-document quota would cover about 250 days before other documents or retained drafts. Actual schema and output change this. Model quotas with the real bilingual implementation before committing to high-volume indefinite free operation. Do not delete publicly linked news solely to reset usage.

The five-minute feed scheduler, Dots integration, durable queue, private exception inbox and controlled publisher are separate from CMS storage. Neither selecting Sanity nor selecting Payload implements that pipeline.

## Founder cost preferences

Use Dots for generation and exclude generation charges from the current cash budget, as instructed. Do not infer Dots API availability or unlimited throughput. Use free analytics, provider undecided; Vercel is selected. No new paid services or deployment are authorized by this research.

## Bilingual clarification and approved direction

The archive example above assumes separate locale documents; bilingual content does not require that model. The founder approved field-level localization: one article document holding both English and Traditional Chinese. At 20 unique stories/day this uses roughly 20 published article documents/day, not 40, before retained drafts and other content. This reduces document-count growth, not necessarily bytes, bandwidth or generation workload. Verify Portable Text structure and attribute/document-size limits. Both languages share a publication lifecycle. Official reference: https://www.sanity.io/docs/studio/localization

## Payload self-hosting resources

For a Vercel-based Payload alternative: a separate Payload/Next.js backend project (Astro can remain the public frontend), compatible database such as managed Postgres, persistent upload storage such as Vercel Blob/R2/S3, and transactional email for account/password flows where required. Payload supplies job definitions/queue storage but a scheduler/runner must execute the 24/7 RSS and publishing jobs; Redis is not automatically required. Configure backups and restoration, migrations, least-privilege credentials, updates, logs, monitoring and cache invalidation. These are services to provision and maintain, not all separate physical machines. Official references: https://payloadcms.com/docs/production/deployment , https://payloadcms.com/docs/jobs-queue/overview , https://payloadcms.com/docs/upload/storage-adapters . No provider accounts, paid infrastructure or Payload migration were authorized or created.
