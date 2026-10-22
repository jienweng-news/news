import { defineType } from 'sanity';
export default defineType({ name: 'project', type: 'document', fields: [
  { name: 'title', type: 'string', validation: r => r.required() },
  { name: 'slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() },
  { name: 'description', type: 'text', validation: r => r.required() },
  { name: 'ownershipDisclosure', type: 'text', validation: r => r.required() },
  { name: 'url', type: 'url', validation: r => r.uri({ scheme: ['https'] }) },
] });
