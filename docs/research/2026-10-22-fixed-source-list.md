# Token on Air fixed source list — 2026-10-22

Selected for discovery research: 25 RSS/Atom feeds (22 additions to the founder’s original three). All 25 returned HTTP 200, parsed as XML and contained entries in the saved check. These observations are point-in-time, not uptime, freshness or licensing guarantees. No live ingestion or publication was enabled.

Raw endpoint/redirect/format/validator evidence: [source checks](source-checks/2026-10-22-fixed-sources.json). Only minimal metadata is saved, not article bodies or images.

## Use and trust rules

- Fixed allowlist: the agent can propose a new source but cannot automatically enable it. A source’s linked evidence may be consulted; fetching/scraping new hosts requires the appropriate separate allowlist/terms decisions.
- Official organizations are authoritative about their announcements, not independent proof that benchmarks, adoption or investment claims are true. Attribute claims and confirm material figures.
- Newsrooms are discovery inputs. Find supporting primary evidence, cluster duplicate coverage and write original articles; do not translate or closely paraphrase the source as the publication’s own report.
- Filter sponsored posts, partner announcements, opinions and affiliate reviews rather than treating every feed item as news.
- Public RSS availability is not a license to republish article text/images or permission for every automated commercial use. Terms review remains pending for each source before live activation.
- Publication/discovery timestamps differ. Do not label the initial feed archive as breaking news or blindly import its full window. Proposed polling is five minutes for news, 15 minutes for slower research/release feeds and 60 minutes for arXiv, subject to source limits and validators.
- Keep the original source language independent of English/Traditional Chinese publication. Both output versions live in one bilingual article document.
- Avoid credentialed/paywalled content and bypasses. Feed redirects must be allowlisted and resolved destinations/IPs checked in the future worker.

## Selected feeds

### AI — official organizations

- **OpenAI** — [RSS feed](https://openai.com/news/rss.xml); en; proposed 5-minute polling. Official announcements; vendor claims need attribution.
- **Google DeepMind** — [RSS feed](https://deepmind.google/blog/rss.xml); en; proposed 5-minute polling. Decode gzip responses before XML parsing.
- **Google AI** — [RSS feed](https://blog.google/technology/ai/rss/); en; proposed 5-minute polling. Follow canonical redirect; relevance-filter broad Google coverage.
- **Google Research** — [RSS feed](https://research.google/blog/rss/); en; proposed 15-minute polling. Research results are not equivalent to available products.
- **Microsoft Research** — [RSS feed](https://www.microsoft.com/en-us/research/feed/); en; proposed 15-minute polling. Filter AI-relevant research; attribute company claims.
- **NVIDIA** — [RSS feed](https://blogs.nvidia.com/feed/); en; proposed 5-minute polling. Vendor source; benchmarks and partner claims need context.

### AI — mixed organization/community publishing

- **Hugging Face** — [RSS feed](https://huggingface.co/blog/feed.xml); en; proposed 15-minute polling. Verify author organization; community posts are not official lab announcements.

### Crypto — official organizations

- **Ethereum Foundation** — [RSS feed](https://blog.ethereum.org/feed.xml); en; proposed 5-minute polling. Distinguish testnet announcements from mainnet activation.
- **Bitcoin Core** — [RSS feed](https://bitcoincore.org/en/rss.xml); en; proposed 15-minute polling. Software releases; do not imply endorsement of investments.

### Crypto — investor/vendor research

- **a16z crypto** — [RSS feed](https://a16zcrypto.com/feed/); en; proposed 15-minute polling. Investor perspective; disclose source interest, distinguish opinion and data.
- **Chainalysis** — [RSS feed](https://www.chainalysis.com/blog/feed/); en; proposed 15-minute polling. Attribute research estimates and limitations; do not invent certainty.

### AI — newsrooms

- **TechCrunch AI** — [RSS feed](https://techcrunch.com/category/artificial-intelligence/feed/); en; proposed 5-minute polling. Discovery/attribution; locate primary evidence; no text/image reuse assumed.
- **The Decoder** — [RSS feed](https://the-decoder.com/feed/); en; proposed 5-minute polling. Discovery/attribution; locate primary evidence.

### Crypto — international and regional newsrooms

- **CoinDesk** — [RSS feed](https://www.coindesk.com/arc/outboundfeeds/rss/); en; proposed 5-minute polling. Discovery only pending terms review; syndication is not licensed.
- **The Block** — [RSS feed](https://www.theblock.co/rss.xml); en; proposed 5-minute polling. No paywall bypass; use accessible primary evidence.
- **Decrypt** — [RSS feed](https://decrypt.co/feed); en; proposed 5-minute polling. Filter news from sponsored content; discovery is not reuse permission.
- **Unchained** — [RSS feed](https://unchainedcrypto.com/feed/); en; proposed 5-minute polling. Distinguish reporting, commentary and sponsored pieces.
- **Blockworks** — [ATOM feed](https://blockworks.co/feed); en; proposed 5-minute polling. Atom feed; allow only verified redirect to blockworks.com.
- **PANews** — [RSS feed](https://www.panewslab.com/rss.xml?lang=en&type=NORMAL%2CNEWS%2CVIDEO); mixed; proposed 5-minute polling. Preserve query; actual item languages can differ from feed declaration.

### Taiwan — technology/business newsrooms

- **iThome Taiwan** — [RSS feed](https://www.ithome.com.tw/rss); zh-Hant; proposed 5-minute polling. Use /rss, not /latest/rss (HTML); filter AI/crypto relevance.
- **INSIDE** — [RSS feed](https://www.inside.com.tw/feed/rss); zh-Hant; proposed 5-minute polling. Filter relevant technology/business items; distinguish sponsored posts.
- **TechOrange** — [RSS feed](https://buzzorange.com/techorange/feed/); zh-Hant; proposed 5-minute polling. Verified canonical redirect to techorange.com/feed/; filter relevant items.

### Taiwan — crypto newsrooms

- **Grenade** — [RSS feed](https://grenade.tw/rss); zh-Hant; proposed 5-minute polling. Filter reviews/affiliate/promotional material; no inherited commercial claims.
- **BlockTempo** — [RSS feed](https://www.blocktempo.com/rss); zh-Hant; proposed 5-minute polling. Discover and verify primary evidence; filter sponsored material.

### Research discovery — selective, not a news firehose

- **arXiv cs.AI** — [RSS feed](https://rss.arxiv.org/rss/cs.AI); en; proposed 60-minute polling. Research queue only; preprints not necessarily peer-reviewed; do not create one news article per paper.

## Held and excluded inputs

- **Anthropic News:** keep https://www.anthropic.com/news as a page-watch candidate. The tested `/news/rss.xml` returned 404; do not invent an official feed or silently substitute a third-party mirror. A compliant watcher needs its own implementation/terms review.
- **Coinbase:** the tested blog RSS endpoint returned 403. Not enabled; no access-control bypass.
- **iThome:** `/latest/rss` served HTML; the verified XML feed is https://www.ithome.com.tw/rss .
- **DeepMind:** gzip decoding is required for the observed response even when identity encoding was requested. The XML parsed after decoding.
- **Blockworks:** the checked `.co/feed` redirects to `.com/feed`, with Atom entries.
- **Hugging Face:** verify article author identity/repository/model links; domain membership does not make a community article a lab announcement.

## Activation evidence still needed

Source terms/permitted storage, actual feed polling limits, duplicate and relevance filters, primary-source extraction, startup lookback, source health alerts and controlled-publisher checks. A verified feed is discovery evidence, not a passed automated-publishing test.
