import type { APIRoute } from 'astro';
import {safeLocaleTarget,localeFromPath} from '../../lib/i18n';
export const POST:APIRoute=async({request,cookies})=>{
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 const target=safeLocaleTarget((await request.formData()).get('target'));
 if(!target)return new Response('Invalid destination',{status:400});
 cookies.set('toa_locale',localeFromPath(target),{path:'/',httpOnly:true,sameSite:'lax',secure:new URL(request.url).protocol==='https:',maxAge:31536000});
 return new Response(null,{status:303,headers:{Location:target,'Cache-Control':'private, no-store'}});
};
