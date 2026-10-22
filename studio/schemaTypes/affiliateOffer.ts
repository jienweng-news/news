import { defineType } from 'sanity';
export default defineType({ name: 'affiliateOffer', title: 'Public affiliate offers', type: 'document', fields: [
  { name: 'merchant', type: 'string', validation: r => r.required() },
  { name: 'destination', type: 'url', validation: r => r.required().uri({ scheme: ['https'] }) },
  { name: 'disclosure', type: 'text', validation: r => r.required() },
  { name: 'active', type: 'boolean', initialValue: false },
  { name: 'startsAt', type: 'datetime' },{ name: 'endsAt', type: 'datetime' },{ name: 'verifiedAt', type: 'datetime' },
] });
