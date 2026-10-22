import { defineType } from 'sanity';
export default defineType({ name: 'campaign', title: 'Public sponsor placements', type: 'document', description: 'Public details only. Store contracts and commercial records elsewhere.', fields: [
  { name: 'sponsor', type: 'string', validation: r => r.required() },
  { name: 'label', type: 'string', initialValue: 'Sponsored', validation: r => r.required() },
  { name: 'destination', type: 'url', validation: r => r.required().uri({ scheme: ['https'] }) },
  { name: 'active', type: 'boolean', initialValue: false },
  { name: 'startsAt', type: 'datetime' },{ name: 'endsAt', type: 'datetime' },
] });
