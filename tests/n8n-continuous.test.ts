import {expect,it,vi} from 'vitest';
import {ContinuousQueue} from '../automation/n8n/continuous';
import {Coordinator} from '../automation/n8n/coordinator';
const deferred=<T>()=>{let resolve!:(value:T)=>void;const promise=new Promise<T>(r=>resolve=r);return {promise,resolve};};
it('starts the next published or held story immediately and stops when idle',async()=>{
 const states=['published','held','idle'];const seen:string[]=[];
 const queue=new ContinuousQueue(async()=>{const state=states.shift()!;seen.push(state);return {state};},true);
 expect(queue.activate().state).toBe('started');
 await vi.waitFor(()=>expect(queue.status().running).toBe(false));
 expect(seen).toEqual(['published','held','idle']);await queue.stop();
});
it('refreshes a heartbeat without overlapping processors',async()=>{
 const pending=deferred<{state:string}>();let calls=0,active=0,maxActive=0;
 const queue=new ContinuousQueue(async()=>{calls++;active++;maxActive=Math.max(maxActive,active);const result=calls===1?await pending.promise:{state:'idle'};active--;return result;},true);
 queue.activate();expect(queue.activate().state).toBe('running');expect(queue.activate().state).toBe('running');expect(calls).toBe(1);
 pending.resolve({state:'published'});await vi.waitFor(()=>expect(queue.status().running).toBe(false));expect(calls).toBe(2);expect(maxActive).toBe(1);await queue.stop();
});
it('never starts a processor when disabled',async()=>{
 let calls=0;const queue=new ContinuousQueue(async()=>{calls++;return {state:'published'};},false);
 expect(queue.activate().state).toBe('paused');expect(calls).toBe(0);await queue.stop();
});
it('finishes the current story but starts no new work after heartbeat expiry',async()=>{
 let now=0,calls=0;const pending=deferred<{state:string}>();const queue=new ContinuousQueue(async()=>{calls++;return pending.promise;},true,()=>now);
 queue.activate();now=75000;pending.resolve({state:'published'});await vi.waitFor(()=>expect(queue.status().running).toBe(false));expect(calls).toBe(1);await queue.stop();
});
it('allows the next story when a heartbeat renews an expiring session',async()=>{
 let now=0,calls=0;const pending=deferred<{state:string}>();const queue=new ContinuousQueue(async()=>{calls++;return calls===1?pending.promise:{state:'idle'};},true,()=>now);
 queue.activate();now=70000;queue.activate();now=80000;pending.resolve({state:'held'});await vi.waitFor(()=>expect(queue.status().running).toBe(false));expect(calls).toBe(2);await queue.stop();
});
it('waits for in-flight work during shutdown and refuses later heartbeats',async()=>{
 let calls=0,stopped=false;const pending=deferred<{state:string}>();const queue=new ContinuousQueue(async()=>{calls++;return pending.promise;},true);
 queue.activate();const stopping=queue.stop().then(()=>{stopped=true;});await Promise.resolve();expect(stopped).toBe(false);expect(queue.activate().state).toBe('paused');
 pending.resolve({state:'published'});await stopping;expect(stopped).toBe(true);expect(calls).toBe(1);expect(queue.status().running).toBe(false);
});
it.each(['idle','failed','paused','needs-attention','unexpected'])('does not hot-loop on %s results',async state=>{
 let calls=0;const queue=new ContinuousQueue(async()=>{calls++;return {state};},true);queue.activate();await vi.waitFor(()=>expect(queue.status().running).toBe(false));expect(calls).toBe(1);await queue.stop();
});
it('contains thrown failures and permits the next heartbeat to retry',async()=>{
 let calls=0;const queue=new ContinuousQueue(async()=>{calls++;if(calls===1)throw Error('unavailable');return {state:'idle'};},true);
 queue.activate();await vi.waitFor(()=>expect(queue.status().running).toBe(false));queue.activate();await vi.waitFor(()=>expect(queue.status().running).toBe(false));expect(calls).toBe(2);await queue.stop();
});
it('respects the real coordinator single-flight and durable safety pause',async()=>{
 let calls=0;const pending=deferred<{state:string}>();const coordinator=new Coordinator(':memory:',async()=>{calls++;return pending.promise;},true);
 const queue=new ContinuousQueue(()=>coordinator.tick('queue'),true);queue.activate();await expect(coordinator.tick('smoke')).rejects.toThrow('busy');
 pending.resolve({state:'needs-attention'});await vi.waitFor(()=>expect(queue.status().running).toBe(false));queue.activate();await vi.waitFor(()=>expect(queue.status().running).toBe(false));expect(calls).toBe(1);await queue.stop();coordinator.close();
});
