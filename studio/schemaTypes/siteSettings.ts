import { defineType } from 'sanity';
export default defineType({ name: 'siteSettings', type: 'document', fields: [
  { name: 'name', type: 'string', validation: r => r.required() },
  { name: 'description', type: 'text' },
  { name: 'contactUrl', type: 'url', validation: r => r.uri({ scheme: ['https'] }) },
] });
