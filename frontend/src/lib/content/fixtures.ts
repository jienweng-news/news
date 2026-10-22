import type { Section } from './types';
const paragraph = (key: string, value: string) => ({ _type: 'block', _key: key, style: 'normal', markDefs: [], children: [{ _type: 'span', _key: `${key}-span`, text: value, marks: [] }] });
function sample(id: string, title: string, section: Section, summary: string) {
  return { id, slug: id, title, summary, section, format: 'guide',
    translations: {en:{disclosure:undefined as string|undefined,title,slug:id,summary,body:[paragraph('sample-en','This is development sample content, not current reporting or a product recommendation.')]},zh:{disclosure:undefined as string|undefined,title:section==='ai'?'如何評估 AI 工具':'了解錢包託管',slug:id,summary:'開發示範內容，並非即時報導或產品推薦。',body:[paragraph('sample-zh','這是開發示範內容，並非即時報導或產品推薦。')]},zhCn:{disclosure:undefined as string|undefined,title:section==='ai'?'如何评估 AI 工具':'了解钱包托管',slug:id,summary:'开发示例内容，并非实时报道或产品推荐。',body:[paragraph('sample-zhcn','这是开发示例内容，并非实时报道或产品推荐。')]}},
    body: [paragraph('intro', 'This is development sample content. It demonstrates the publication format and is not current reporting or a product recommendation.'), paragraph('method', section === 'ai' ? 'A useful AI tool review should explain the task tested, the evidence gathered, cost assumptions and limitations. Separate a hands-on test from a summary of vendor claims.' : 'A useful wallet guide should distinguish custody models, recovery responsibilities and the evidence behind security claims. The publication does not handle funds or recovery phrases.'), paragraph('review', 'Every published story needs an accountable editor, accurate sources and a clear correction process.')],
    author: { name: 'Development sample', slug: 'sample-editor', bio: 'Placeholder author for local development only.' },
    publishedAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-01T10:00:00Z', language: 'en', sources: ['https://www.sanity.io/docs/'], corrections: [], relationship: 'none', fixture: true };
}
export const fixtureArticles = [sample('evaluating-ai-tools', 'How we evaluate AI tools', 'ai', 'A clear method for separating useful capabilities from untested claims.'), sample('understanding-wallet-custody', 'Understanding wallet custody', 'crypto', 'An editorial outline for explaining ownership, recovery and responsibility.')];
export const fixtureDraft = { ...sample('unpublished-example', 'Unpublished editorial example', 'ai', 'This draft is visible only in authenticated local preview.'), id: 'drafts.unpublished-example', relationship: 'owned-project', disclosure: 'Development-only ownership disclosure example. No project or commercial relationship is being promoted.' };

fixtureDraft.translations.en.body = [paragraph('draft-note','This draft is visible only in authenticated local preview.')];
fixtureDraft.translations.en.disclosure = fixtureDraft.disclosure;
fixtureDraft.translations.zh.disclosure = '開發用專案揭露範例。';
fixtureDraft.translations.zhCn.disclosure = '开发用项目披露示例。';
