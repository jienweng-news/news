# Service configuration — 2026-10-22

Founder supplied Sanity project `4k0o7q9m`, organization `onygzva5c`, dataset `production`, and GA4 measurement ID `G-WQMMLS9H2X`. These are configuration identifiers, not API credentials. Organization membership/permissions and GA4 property access are not independently verified.

Configured existing root .env (git-ignored, mode600), .env.example and the public deployment environment example in production.env.example. Existing Studio remains at studio/; do not create another clean-template Studio because it omits the publication schemas. Local reader uses Sanity mode; local analytics remain off. Production GA4 stays behind the existing consent implementation; do not add the unconditional gtag snippet separately or duplicate pageview tracking.

Read-only Sanity SDK check succeeded without a token, published perspective, dataset production: zero published article documents observed. This establishes public query access at check time, not article-schema correctness, publish rights, editor-reference existence, or correction/withdrawal acceptance. No document was created or modified. Studio build uses the supplied project/dataset; it does not deploy Studio or change CMS content.

Still missing: Vercel project connection, beehiiv publication/setup, verified public mailbox, Sanity editor reference and isolated publisher permissions, Dots handoff and independent verifier. No GA4 event, live publication, email or deployment was performed by recording these IDs.

Additional read-only application check: the real repository list and missing-article queries succeeded in en/zh/zh-cn; each list contained0articles and missing slugs returned null. This checks the live GROQ query paths without creating content. Preflight now reads the ignored root .env for local configuration while retaining its live-acceptance gates.
