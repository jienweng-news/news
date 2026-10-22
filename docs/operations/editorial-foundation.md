# Editorial foundation operations

## Local setup

Use Node >=22.23.4 and npm 11. `npm ci` installs the locked workspaces. Copy `.env.example` to the root `.env`; run `npm run dev` for visibly labelled sample articles. No hosted service or subscription is created.

Set `CONTENT_MODE=sanity`, `SANITY_PROJECT_ID` and `SANITY_DATASET` to read published content from an existing public Sanity dataset. No token is used for public reads. `npm run dev:studio` maps those public IDs into Studio's environment. Login through Sanity in the browser; never paste credentials into documentation or commit an .env.

## Manual editorial workflow

1. Create a genuine author with a name and slug.
2. Create an article, assign AI or Crypto, choose format, and write an original body.
3. Add primary evidence for news, accurate publication/update dates, and explicit commercial disclosure when relevant. Media requires alt text, credit and license notes.
4. Review in Studio. Publish manually with a trusted account; no automation writes are enabled.
5. For corrections preserve original publication time, update modification time and add a dated correction note.
6. Unpublish to withdraw. Cache invalidation and live host propagation are a later phase, not verified by this foundation.

Sanity Free's Administrator/Viewer roles do not supply a separate Editor or an enforceable draft-only bot role. Studio validation improves the workflow but privileged API writes can bypass it. Never store subscriber details, contracts, confidential notes, feed queues or private rates in published documents. Published data is public.

## Verification boundaries

`npm test` exercises configuration, content validation, public/draft separation and schema rules. A Studio build with `SANITY_PROJECT_ID=testproject SANITY_DATASET=production` verifies bundling only; those identifiers are test values, not an account. Live CMS author/publish/correct/withdraw and hosting behavior remain pending real service access. Browser/Lighthouse evidence must not be inferred from HTTP checks.
