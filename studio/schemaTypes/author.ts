import { defineType } from 'sanity';
export default defineType({ name: 'author', type: 'document', fields: [
  { name: 'name', type: 'string', validation: r => r.required() },
  { name: 'slug', type: 'slug', options: { source: 'name' }, validation: r => r.required() },
  { name: 'bio', type: 'text' },
  { name:'image',title:'Author portrait',type:'image',options:{hotspot:true},fields:[{name:'alt',title:'Image description',type:'string',validation:r=>r.required()}] },
] });
