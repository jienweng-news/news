// n8n authorizes a short, renewable processing session without retaining a long workflow execution.
export class ContinuousQueue {
 private pending:Promise<void>|undefined;
 private leaseUntil=0;
 private stopping=false;
 constructor(private tick:()=>Promise<{state:string}>,private enabled:boolean,private now=Date.now){}
 activate():{state:'paused'|'running'|'started'}{
  if(!this.enabled||this.stopping)return {state:'paused'};
  this.leaseUntil=this.now()+75000;
  if(this.pending)return {state:'running'};
  const pending=this.drain();this.pending=pending;
  void pending.then(()=>{if(this.pending===pending)this.pending=undefined;});
  return {state:'started'};
 }
 status(){return {running:!!this.pending,leaseActive:this.enabled&&!this.stopping&&this.now()<this.leaseUntil};}
 private async drain(){
  try{
   while(!this.stopping&&this.now()<this.leaseUntil){
    const result=await this.tick();
    if(!['published','held'].includes(result?.state))return;
    // Let incoming heartbeats and shutdown signals run even when a job finishes immediately.
    await new Promise<void>(resolve=>setImmediate(resolve));
   }
  }catch{/* A later heartbeat may retry; Coordinator retains its durable safety pause where required. */}
 }
 async stop(){this.stopping=true;this.leaseUntil=0;await this.pending;}
}
