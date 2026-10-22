import { defineType } from 'sanity';
export default defineType({ name: 'author', type: 'document', fields: [
  { name: 'name', type: 'string', validation: r => r.required() },
  { name: 'slug', type: 'slug', options: { source: 'name' }, validation: r => r.required() },
  { name: 'bio', type: 'text' },
] });
