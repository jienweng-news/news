import {expect,it,vi} from 'vitest';
import {Coordinator} from '../automation/n8n/coordinator';
import {ContinuousQueue} from '../automation/n8n/continuous';
import {coordinatorHandler} from '../automation/n8n/coordinator-http';
const token='t'.repeat(48);
function setup(processRun:()=>Promise<{state:string}>,enabled=true){
 const coordinator=new Coordinator(':memory:',processRun,enabled);
 const queue=new ContinuousQueue(()=>coordinator.tick('queue'),enabled);
 const handle=coordinatorHandler(coordinator,queue,{checkpoints:()=>[],context:()=>[]},token,enabled);
 return {handle,queue,close:async()=>{await queue.stop();coordinator.close();}};
}
const request=(path='/v1/dispatch',body:unknown={},headers:Record<string,string>={})=>new Request('http://coordinator'+path,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
it('acknowledges immediately while the real processor is still in flight',async()=>{
 let release!:(r:{state:string})=>void;let calls=0;const app=setup(async()=>{calls++;return new Promise(r=>release=r);});
 try{
  const response=await app.handle(request());expect(response.status).toBe(202);expect(await response.json()).toEqual({state:'started'});expect(calls).toBe(1);
  expect((await app.handle(request())).status).toBe(202);expect(calls).toBe(1);
  const stopping=app.queue.stop();release({state:'published'});await stopping;
 }finally{await app.close();}
});
it('requires bearer authentication, refuses browser origins and accepts only empty JSON',async()=>{
 let calls=0;const app=setup(async()=>{calls++;return {state:'idle'};});
 try{
  expect((await app.handle(request('/v1/dispatch',{}, {Authorization:''}))).status).toBe(401);
  expect((await app.handle(request('/v1/dispatch',{}, {Origin:'https://site.test'}))).status).toBe(403);
  for(const body of [{mode:'queue'},[],null])expect((await app.handle(request('/v1/dispatch',body))).status).toBe(400);
  expect((await app.handle(request('/v1/dispatch',{}, {'Content-Type':'text/plain'}))).status).toBe(415);
  expect((await app.handle(new Request('http://coordinator/v1/dispatch',{headers:{Authorization:'Bearer '+token}}))).status).toBe(404);
  expect(calls).toBe(0);
 }finally{await app.close();}
});
it('exposes only nonsensitive drain status and retains manual smoke ticks',async()=>{
 let calls=0;const app=setup(async()=>{calls++;return {state:'smoke-passed'};});
 try{
  const health=await app.handle(new Request('http://coordinator/health'));expect(health.status).toBe(200);const state=await health.json();expect(state).toMatchObject({ok:true,continuous:{running:false,leaseActive:false}});expect(JSON.stringify(state)).not.toContain(token);
  const smoke=await app.handle(request('/v1/tick',{mode:'smoke'}));expect(smoke.status).toBe(200);expect(await smoke.json()).toMatchObject({state:'smoke-passed'});expect(calls).toBe(1);
 }finally{await app.close();}
});
it('does not start work when the service is disabled or durably paused',async()=>{
 let calls=0;const disabled=setup(async()=>{calls++;return {state:'idle'};},false);
 try{const r=await disabled.handle(request());expect(r.status).toBe(200);expect(await r.json()).toEqual({state:'paused'});expect(calls).toBe(0);}finally{await disabled.close();}
 const paused=setup(async()=>{calls++;return {state:'needs-attention'};});
 try{
  await paused.handle(request());await vi.waitFor(()=>expect(paused.queue.status().running).toBe(false));await paused.handle(request());await vi.waitFor(()=>expect(paused.queue.status().running).toBe(false));expect(calls).toBe(1);
 }finally{await paused.close();}
});
