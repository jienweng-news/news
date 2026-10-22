import { defineType } from 'sanity';
export default defineType({ name: 'category', type: 'document', fields: [
  { name: 'title', type: 'string', validation: r => r.required() },
  { name: 'slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() },
  { name: 'section', type: 'string', options: { list: ['ai','crypto'] }, validation: r => r.required() },
] });
