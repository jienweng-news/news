# Bold footer, body links and feed audit

Owner requested a bolder footer without its jienweng credit, current news ingestion checks, PANews reachability/fresh images, and working links in article bodies. Native execution, TDD, one fresh final review.

Design: preserve approved red/black identity; large footer tagline and wordmark, clear publication/topic/feed navigation; remove editor credit only from footer. Preserve article bylines. Convert approved citation URLs/Markdown into real Portable Text links for future stories and safe existing article rendering. No invented destinations, source body/image rights or forced publication of failed checks.

- [x] 1. Add failing body-link tests; implement safe allowlisted inline citation handling in writer output and legacy presentation. Existing article text and dates preserved. Test/build and commit.
- [x] 2. Refine footer with large tagline and grouped links; verify desktop/mobile and preserve consent/newsletter states. Commit.
- [ ] 3. Record PANews feed/terms review, audit ingestion issues, apply only source use selected by owner with verified robots/rights. Fresh final review; test, deploy affected services, verify production and push linked PR3.

Initial evidence: PANews feed HTTP200,100items,478068bytes; latest2026-10-23T11:54:12Z with media. TermsII2.2/2.4 require authorization for commercial rewriting/reuse and images. Source stays out of automated derivation; any metadata lead route must retain primary evidence/verification requirements. No publisher contact authorized.

Owner subsequently explicitly confirmed PANews commercial article/image reuse permission. Registry records owner-confirmed permission, not independently obtained license. Licensed-report evidence is scoped only to PANews-discovered jobs and requires attributed claims; other source jobs cannot use it as primary evidence. Image reuse requires reviewed/active policy and fixed PANews uploads host. Fresh final review found two gate gaps; RED→GREEN regressions fixed both. Additional RED→GREEN fixes prioritize source publication date across RSS batches and hold stale queued stories before generation. Final219tests/35files pass; frontend check0diagnostics/build, automation+Worker typechecks and real workerd/D1 smoke pass. Footer desktop1440/mobile320 inspected with nooverflow. Deployment/real feed acceptance pending.
