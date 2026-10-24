import {authorize,json,limitedText,Refused} from '../../workers/news/config';
import type {Coordinator} from './coordinator';
import type {ContinuousQueue} from './continuous';
export function coordinatorHandler(c:Coordinator,continuous:ContinuousQueue,collector:{checkpoints():unknown;context():unknown[]},token:string,enabled:boolean){
 return async(request:Request):Promise<Response>=>{
  try{
   const path=new URL(request.url).pathname;
   if(path==='/health'&&request.method==='GET')return json({service:'token-on-air-coordinator',ok:true,enabled,continuous:continuous.status()});
   authorize(request,token);if(request.headers.has('origin'))throw new Refused(403,'Browser requests refused');
   if(path==='/v1/sources'&&request.method==='GET')return json({checkpoints:collector.checkpoints(),leads:collector.context().length});
   if(path==='/v1/history'&&request.method==='GET')return json({runs:c.history()});
   const dispatch=path==='/v1/dispatch';
   if(request.method!=='POST'||(!dispatch&&path!=='/v1/tick'))return json({error:'Not found'},404);
   if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Refused(415,'JSON required');
   let body;try{body=JSON.parse(await limitedText(request,1024));}catch(e){if(e instanceof Refused)throw e;throw new Refused(400,'Invalid JSON');}
   if(!body||typeof body!=='object'||Array.isArray(body))throw new Refused(400,'JSON object required');
   if(dispatch){
    if(Object.keys(body).length)throw new Refused(400,'Empty heartbeat required');
    const result=continuous.activate();return json(result,result.state==='paused'?200:202);
   }
   if(Object.keys(body).some(k=>k!=='mode'))throw new Refused(400,'Only mode accepted');
   const result=await c.tick(body.mode);return json(result,result.state==='failed'?502:200);
  }catch(e){return json({error:e instanceof Refused?e.label:'Processing failed'},e instanceof Refused?e.status:502);}
 };
}
