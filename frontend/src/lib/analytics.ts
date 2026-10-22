export function analyticsEnabled(appEnv:string,contentMode:string,id?:string):boolean{return appEnv==='production'&&contentMode==='sanity'&&/^G-[A-Z0-9]+$/.test(id||'');}
export function cleanAnalyticsPath(url:string):string{return new URL(url,'https://tokenonair.com').pathname;}
