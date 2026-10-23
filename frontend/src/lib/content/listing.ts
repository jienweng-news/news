import type {ArticleCard} from './types';
// Resolve data and HTTP semantics in the route, before Astro starts streaming its children.
export async function resolveListingPage(load:()=>Promise<ArticleCard[]>,cacheable=false){
 try{return {articles:await load(),unavailable:false,status:200,cacheControl:cacheable?'public, max-age=0, s-maxage=30':'no-store'};}
 catch{return {articles:[] as ArticleCard[],unavailable:true,status:503,cacheControl:'no-store'};}
}
