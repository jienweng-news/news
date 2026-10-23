import {readFileSync} from 'node:fs';
export interface Source{id:string;url:string;resolved_url?:string;automation_enabled:boolean;rights_status:string;allowed_reuse:string;proposed_poll_minutes:number;monitoring_enabled?:boolean;content_hosts?:string[]}
export function loadSources(path:string):Source[]{const rows=JSON.parse(readFileSync(path,'utf8')).sources;if(!Array.isArray(rows))throw new Error('Invalid source registry');return rows;}
export function sourceHosts(source:Source):Set<string>{return new Set([...([source.url,source.resolved_url].filter(Boolean).map(url=>new URL(url!).hostname)),...(source.content_hosts||[])]);}
export function activeSource(source:Source):boolean{return source.automation_enabled===true&&source.rights_status==='reviewed'&&source.allowed_reuse==='metadata-discovery';}
