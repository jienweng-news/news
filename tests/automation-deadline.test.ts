import {it,expect,vi,afterEach} from 'vitest';
import {EventEmitter} from 'node:events';
vi.mock('node:dns/promises',()=>({lookup:vi.fn()}));
vi.mock('node:https',()=>({request:vi.fn()}));
import {lookup} from 'node:dns/promises';import {request} from 'node:https';import {safeFetch} from '../automation/network';
afterEach(()=>vi.restoreAllMocks());
it('cancels stalled DNS at the absolute deadline',async()=>{
 vi.mocked(lookup).mockImplementation(()=>new Promise(()=>{}) as any);
 await expect(safeFetch('https://example.org/news',new Set(['example.org']),{},0,AbortSignal.timeout(20))).rejects.toThrow();
 expect(request).not.toHaveBeenCalled();
});
it('destroys a slowly streaming request at the absolute deadline',async()=>{
 vi.mocked(lookup).mockResolvedValue([{address:'8.8.8.8',family:4}] as any);let destroyed=false;
 vi.mocked(request).mockImplementation((_url:any,options:any,callback:any)=>{
  const req:any=new EventEmitter();const res:any=new EventEmitter();res.statusCode=200;res.headers={};let timer:any;
  req.end=()=>{callback(res);timer=setInterval(()=>res.emit('data',Buffer.from('x')),2);};
  req.destroy=(error:any)=>{destroyed=true;clearInterval(timer);req.emit('error',error);};
  if(options.signal)options.signal.addEventListener('abort',()=>req.destroy(new Error('Aborted')),{once:true});return req;
 });
 await expect(safeFetch('https://example.org/news',new Set(['example.org']),{},0,AbortSignal.timeout(25))).rejects.toThrow();expect(destroyed).toBe(true);
});
