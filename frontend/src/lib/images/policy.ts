export interface ImagePlan{url:string;alt:string;credit:string;license:string;sourceUrl?:string;licenseUrl?:string;kind:'source'|'illustration'}
// Media reuse is reviewed per asset. RSS/OG availability alone is not permission.
export const imageVersion='source-first-v2';
const ethereumSource='https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay';
export function imagePlan(sourceUrl:string|undefined,slug:string,revision:string,title:string):ImagePlan{
 if(sourceUrl===ethereumSource)return {url:'https://blog.ethereum.org/images/eth-org.jpeg',alt:'Ethereum Foundation blog illustration accompanying the Hoodi upgrade postponement',credit:'Ethereum Foundation',license:'CC BY 4.0 · Unmodified',sourceUrl:ethereumSource,licenseUrl:'https://creativecommons.org/licenses/by/4.0/',kind:'source' as const};
 const illustration=sourceUrl==='https://deepmind.google/blog/beyond-tree-cover-mapping-the-worlds-forest-types/'?'forest-typology-v2':sourceUrl==='https://research.google/blog/empowering-frontline-maternal-care-with-ai-assisted-ultrasound/'?'ultrasound-research-v2':undefined;
 const url=illustration?`https://tokenonair.com/editorial/${illustration}.png`:`https://tokenonair.com/api/images/en/${slug}.png?revision=${encodeURIComponent(revision)}&version=${imageVersion}`;
 const alt=illustration==='forest-typology-v2'?'Conceptual editorial collage of natural forest and plantation rows; not the research map':illustration==='ultrasound-research-v2'?'Conceptual illustration of a handheld ultrasound probe and acoustic field; not a patient scan':title;
 return {url,alt,credit:'Token on Air',license:'Original editorial illustration · © Token on Air',kind:'illustration' as const};
}
