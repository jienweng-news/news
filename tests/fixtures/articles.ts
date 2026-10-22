export const rawArticle = (overrides: Record<string, unknown> = {}) => ({
  id: 'example-ai', slug: 'evaluating-ai-tools', title: 'A practical framework for evaluating AI tools',
  summary: 'A labelled development example of an evidence-led guide.', section: 'ai', format: 'guide',
  body: [{ _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'Compare capability, cost and the evidence behind each claim.', marks: [] }], markDefs: [] }],
  author: { name: 'Development sample', slug: 'sample-editor' }, publishedAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-01T10:00:00Z',
  sources: ['https://docs.astro.build/'], relationship: 'none', corrections: [], language: 'en', ...overrides,
});
