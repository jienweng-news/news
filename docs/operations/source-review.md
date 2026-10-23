# Source review and accumulation — 2026-10-23

Owner setup is complete. Current audit observed 662 RSS metadata entries dated within48hours across24successful feeds; a16z's old feed redirects to an unreviewed a16zfrontier.com domain and is held. These are leads, not662 independent or approved stories. The machine-readable audit is docs/research/source-checks/2026-10-23-source-review.json. Raw source bodies stay out of Git.

Initial publication inputs: Ethereum Foundation, Bitcoin Core, Google Research, Google AI and Google DeepMind. Review is scoped to metadata discovery, original attributed factual reporting and private evidence checks. Google access respects its Terms and current robots instructions; Google retains copyright. This review does not grant a general license to copy articles, images, branding or media. Ethereum non-code material is CC BY4.0 unless marked otherwise: preserve author/Foundation attribution, source/license links and indication of translation/adaptation. Bitcoin Core website source carries MIT conditions; this workflow does not reproduce substantial source material.

Other accessible sources remain private metadata leads, without approved article-body derivation. Their licenses have not been established. PANews explicitly requires consent for commercial rewriting; BlockTempo requires written consent for commercial use/modification/distribution. Both are held from automated derivation and ongoing monitoring until an appropriate arrangement exists. No publisher was contacted, and no permission was invented. Technical RSS access is not proof of a commercial reuse license.

## Overlap and conflict handling

Canonical source URLs deduplicate hard (tracking parameters removed). Identical meaningful normalized headlines create related lead groups, not proof that two reports are identical. Keep differing URLs and source names; compare actual claims, timestamps and primary evidence before publishing one original story. Cross-language differences require semantic review, not lexical deletion. A material update is not suppressed merely because it shares a topic with earlier coverage.

A current acceptance case is Ethereum's October22 postponement of the Hoodi upgrade, superseding the older October16 schedule for October26. The older date must not be reported as a confirmed future activation. A new date remains unset. Research includes approved linked primary notices; a newer authoritative correction prevails, and unresolved material conflicts hold the job.

## Collection and capacity

Many actual feeds exceed64KiB: Ethereum~532KB, OpenAI~802KB, arXiv~795KB and Google Research~78KB. Collection/parsing runs on the existing host under bounded HTTPS/DNS deadlines, response-size limits and checked redirects. Only reviewed-source metadata enters D1 in batches <=50items and60KB. Monitor-only metadata remains in the private host lead cache. Conditional requests, durable poll checkpoints,15-minute error backoff, per-source context caps and robots refresh prevent repeated full downloads and high-volume feeds crowding out other sources. The Worker retains validation, role separation, owned leases and durable quarantine.

References: https://ethereum.org/terms-of-use/ ; https://github.com/bitcoin-core/bitcoincore.org/blob/master/LICENSE ; https://policies.google.com/terms ; https://www.panewslab.com/en/user-agreement ; https://www.blocktempo.com/terms-of-use/ . Decisions reflect reviewed scope, not legal advice or a guarantee of permissions. Unknown sources stay out of automatic article generation.

## Second pass — 2026-10-23, 10:00UTC

Reviewed all17additional source candidates; findings and exact reference pages are in `docs/research/source-checks/2026-10-23-source-expansion-review.json`. No extra publication inputs were enabled where rights remain unresolved. arXiv metadata is explicitly CC0, while full-paper licenses vary; license/version checks and preprint labeling are needed before expanding full article generation from papers. This is the strongest next expansion candidate.

Blockworks, The Block, CoinDesk and Decrypt have explicit automated-collection restrictions. Their ongoing monitoring is now disabled pending permission; they were already disabled as article inputs. This leaves five approved publication sources,13additional private metadata monitors and seven held sources overall. Existing private lead records remain subject to the existing seven-day retention; they are not newly licensed for article generation. Host collection was rebuilt with this policy and coordinator re-enabled; Worker publication-source enablement remains five.

Privacy policies, vendor product agreements and repository licenses must not be treated as blanket publisher licenses. The correct Unchained publisher is Laura Shin Media at unchainedcrypto.com; unrelated unchained.com terms do not apply. No publisher was contacted and no permission inferred from an inaccessible page.

References checked: https://blockworks.com/terms ; https://www.theblock.co/terms-service ; https://www.coindesk.com/terms ; https://decrypt.co/terms-of-service ; https://info.arxiv.org/help/license/index.html .
