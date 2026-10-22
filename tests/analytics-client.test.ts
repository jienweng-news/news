import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';import vm from 'node:vm';
const source=readFileSync('frontend/public/scripts/analytics.js','utf8');
function harness(saved?:string,present=true,blockedStorage=false){
 const events=new Map<string,Function>();const actions=new Map<string,Function>();const scripts:any[]=[];const storage=new Map(saved?[['toa_analytics',saved]]:[]);
 const nodes=Object.fromEntries(['allow','decline','reset','close','save','toggle','card','status','dialog'].map(key=>[key,{hidden:false,checked:false,textContent:'',open:false,focus:()=>{},showModal(){this.open=true;},close(){this.open=false;},addEventListener:(_type:string,fn:Function)=>actions.set(key,fn)}]));
 const panel={dataset:{analyticsId:'G-TEST123',locale:'en',enabledLabel:'Enabled',disabledLabel:'Disabled'},querySelectorAll:()=>[nodes.allow,nodes.decline],querySelector:(selector:string)=>nodes[selector.replace('[data-analytics-','').replace(']','')]};
 const doc={referrer:'https://external.test/?email=private@example.com',cookie:'_ga=abc; _ga_TEST=xyz',querySelector:()=>present?panel:null,createElement:()=>({}),head:{append:(s:any)=>scripts.push(s)},addEventListener:(name:string,fn:Function)=>events.set(name,fn)};
 const win:any={};vm.runInNewContext(source,{window:win,document:doc,location:{origin:'https://tokenonair.com',href:'https://tokenonair.com/en/search/?q=reader@example.com',pathname:'/en/search/',hostname:'www.tokenonair.com',reload:()=>{}},URL,Date,localStorage:{getItem:(k:string)=>{if(blockedStorage)throw Error('blocked');return storage.get(k);},setItem:(k:string,v:string)=>{if(blockedStorage)throw Error('blocked');storage.set(k,v);},removeItem:(k:string)=>storage.delete(k)}});
 return{events,actions,scripts,storage,win,nodes,doc};
}
it('makes no Google request before consent or when no production panel exists',()=>{
 expect(harness().scripts).toEqual([]);expect(harness('denied').scripts).toEqual([]);expect(harness('granted',false).scripts).toEqual([]);
});
it('loads on opt-in, removes query identifiers and counts only actual signup acceptance',()=>{
 const h=harness();h.actions.get('allow')!();expect(h.scripts).toHaveLength(1);const page=h.win.dataLayer.map((a:any)=>Array.from(a)).find((a:any)=>a[1]==='page_view');expect(page[2].page_location).toBe('https://tokenonair.com/en/search/');expect(JSON.stringify(h.win.dataLayer)).not.toContain('reader@example.com');
 expect(h.win.dataLayer.map((a:any)=>Array.from(a)).filter((a:any)=>a[1]==='newsletter_signup')).toHaveLength(0);h.events.get('toa-signup-accepted')!();expect(h.win.dataLayer.map((a:any)=>Array.from(a)).filter((a:any)=>a[1]==='newsletter_signup')).toHaveLength(1);
 h.actions.get('reset')!();expect(h.storage.get('toa_analytics')).toBe('granted');
});

it('sets clean global defaults and clean context for every emitted event',()=>{const h=harness();h.actions.get('allow')!();h.events.get('toa-signup-accepted')!();const calls=h.win.dataLayer.map((a:any)=>Array.from(a));const config=calls.find((a:any)=>a[0]==='config');expect(config[2].page_location).toBe('https://tokenonair.com/en/search/');for(const call of calls.filter((a:any)=>a[0]==='event')){expect(call[2].page_location).toBe('https://tokenonair.com/en/search/');expect(call[2].page_referrer).toBe('https://external.test');}expect(JSON.stringify(calls)).not.toContain('private@example.com');});

it('dismisses the floating card after a choice and reopens preferences without changing consent',()=>{
 const h=harness('denied');expect(h.nodes.card.hidden).toBe(true);
 h.actions.get('reset')!();expect(h.nodes.dialog.open).toBe(true);expect(h.nodes.toggle.checked).toBe(false);
 h.actions.get('close')!();expect(h.nodes.dialog.open).toBe(false);expect(h.storage.get('toa_analytics')).toBe('denied');expect(h.scripts).toHaveLength(0);
});
it('revokes analytics from preferences and stops subsequent signup events',()=>{
 const h=harness('granted');h.actions.get('reset')!();expect(h.nodes.toggle.checked).toBe(true);
 h.nodes.toggle.checked=false;h.actions.get('save')!();expect(h.storage.get('toa_analytics')).toBe('denied');expect(h.nodes.dialog.open).toBe(false);
 const before=h.win.dataLayer.length;h.events.get('toa-signup-accepted')!();expect(h.win.dataLayer).toHaveLength(before);
 expect(h.doc.cookie).toContain('Max-Age=0');expect(h.doc.cookie).toContain('domain=tokenonair.com');
});
it('keeps a session choice usable when browser storage is blocked',()=>{
 const h=harness(undefined,true,true);h.actions.get('decline')!();expect(h.nodes.card.hidden).toBe(true);expect(h.scripts).toHaveLength(0);
 h.actions.get('reset')!();h.nodes.toggle.checked=true;h.actions.get('save')!();expect(h.scripts).toHaveLength(1);
});
