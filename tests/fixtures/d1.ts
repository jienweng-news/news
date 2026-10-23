import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function testDB(){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync('workers/news/migrations/0001.sql','utf8'));
 const wrap=(sql:string,args:unknown[]=[]):any=>({bind:(...v:unknown[])=>wrap(sql,v),first:async()=>sqlite.prepare(sql).get(...args as any[])||null,all:async()=>({results:sqlite.prepare(sql).all(...args as any[])}),run:async()=>({meta:{changes:sqlite.prepare(sql).run(...args as any[]).changes}})});
 return {db:{prepare:(sql:string)=>wrap(sql),batch:async(statements:any[])=>{sqlite.exec('BEGIN');try{const r=[];for(const stmt of statements)r.push(await stmt.run());sqlite.exec('COMMIT');return r;}catch(e){sqlite.exec('ROLLBACK');throw e;}}} as any,sqlite};
}
