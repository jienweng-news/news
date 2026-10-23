import sharp from 'sharp';
import opentype from 'opentype.js';
import fontData from '../../assets/barlow-condensed-bold.ttf?inline';
import logo from '../../assets/editorial-logo.svg?raw';
const bytes=Buffer.from(fontData.split(',')[1],'base64');
const font=opentype.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
type Subject='semiconductors'|'markets'|'earth-observation'|'healthcare'|'crypto-network'|'ai-systems'|'policy'|'technology';
function outline(path:opentype.Path){
 const keys:Record<string,string[]>={M:['x','y'],L:['x','y'],Q:['x1','y1','x','y'],C:['x1','y1','x2','y2','x','y'],Z:[]};
 const d=path.commands.map(c=>c.type+(keys[c.type]||[]).map(k=>{const value=(c as unknown as Record<string,number>)[k];if(!Number.isFinite(value))throw new Error('Invalid font outline');return Math.round(value*100)/100;}).join(' ')).join('');
 return `<path d="${d}"/>`;
}
function headlinePaths(title:string){
 const words=title.slice(0,220).split(/\s+/);let size=68,lines:string[]=[];
 for(;size>=32;size-=4){lines=[];let line='';for(const word of words){const next=line?`${line} ${word}`:word;if(line&&font.getAdvanceWidth(next,size)>800){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);if(lines.length*size*1.08<=320)break;}
 return lines.slice(0,4).map((line,i)=>outline(font.getPath(line,60,280+i*size*1.08,size))).join('');
}
function subjectFor(text:string,section:'ai'|'crypto'):Subject{
 const value=text.toLowerCase();
 if(/forest|satellite|earth observation|land cover|climate|ecosystem|wildfire|habitat|biodiversity/.test(value))return 'earth-observation';
 if(/ultrasound|medical|healthcare|clinical|patient|diagnos|hospital|biomedical/.test(value))return 'healthcare';
 if(/semiconductor|memory chip|\bhbm\b|wafer|chip capacity|chip supply|foundry|gpu|processor/.test(value))return 'semiconductors';
 if(/etf|market value|market cap|outflow|inflow|funding round|trading|gold price|interest rate|bond yield|stock market/.test(value))return 'markets';
 if(/bitcoin|\bbtc\b|\beth\b|crypto|blockchain|token|wallet|defi|dex|stablecoin|on-chain|protocol|bridge/.test(value))return 'crypto-network';
 if(/sec |regulat|legislation|policy|court|compliance|lawmakers|bill |sanction/.test(value))return 'policy';
 if(/ai model|language model|\bllm\b|artificial intelligence|machine learning|ai agent|model release/.test(value))return 'ai-systems';
 if(/funding|acquisition|merger|company|business|revenue|startup|investment/.test(value))return 'markets';
 return section==='crypto'?'crypto-network':'technology';
}
const scenes:Record<Subject,{label:string;accent:string;art:string}>= {
 semiconductors:{label:'SILICON / MEMORY',accent:'#28a8a1',art:'<path d="M965 284h86v86h-86z" fill="#171717" stroke="#f7f3e8" stroke-width="3"/><path d="m965 284 43-31 86 0-43 31m0 86 43-31v-86m-129 0v-30m16 30v-30m16 30v-30m16 30v-30m16 30v-30m16 146v22m-80-22v22m16-22v22m16-22v22m16-22v22m16-22v22M935 300h30m-30 16h30m-30 16h30m-30 16h30m121-48h29m-29 16h29m-29 16h29m-29 16h29" fill="none" stroke="#f7f3e8" stroke-width="3"/><path d="M978 300h60v54h-60z" fill="#28a8a1" opacity=".9"/><path d="M990 311h36m-36 12h36m-36 12h36" stroke="#171717" stroke-width="3"/>'},
 markets:{label:'CAPITAL / FLOWS',accent:'#e3a643',art:'<g fill="#171717" stroke="#f7f3e8" stroke-width="4"><circle cx="960" cy="322" r="46"/><circle cx="1095" cy="322" r="46"/></g><path d="M1008 303h57m-13-13 13 13-13 13m-57 39h-57m13-13-13 13 13 13" fill="none" stroke="#c92032" stroke-width="7"/><path d="M944 322h32m103 0h32" stroke="#e3a643" stroke-width="4"/><circle cx="960" cy="322" r="9" fill="#e3a643"/><circle cx="1095" cy="322" r="9" fill="#e3a643"/><path d="M940 408h175" stroke="#e3a643" stroke-width="3"/>'},
 'earth-observation':{label:'EARTH / OBSERVATION',accent:'#6f9e67',art:'<path d="M910 286 961 251 1014 266 1063 242 1134 270 1161 319 1138 364 1084 379 1033 408 978 387 929 361 901 326z" fill="#6f9e67"/><path d="m918 292 45 20 27-34 47 16 23-27 60 20m-199 39 56-12 33 26 51-28 78 22m-182 37 46-35 47 31 39-34 48 17m-132-94 5 115m42-108 5 121m42-120 3 116m38-100 2 80" fill="none" stroke="#f7f3e8" stroke-width="3"/><circle cx="1128" cy="254" r="16" fill="#171717" stroke="#e3a643" stroke-width="4"/><path d="m1120 244 18 20m0-20-18 20" stroke="#f7f3e8" stroke-width="2"/>'},
 healthcare:{label:'HEALTH / IMAGING',accent:'#6da9c6',art:'<rect x="925" y="248" width="205" height="154" rx="5" fill="#171717" stroke="#f7f3e8" stroke-width="3"/><path d="M948 366q18-56 37 0t37 0 37 0 37 0" fill="none" stroke="#6da9c6" stroke-width="5"/><path d="M956 287h143m-143 17h105m-105 17h67" stroke="#f7f3e8" stroke-width="3" opacity=".8"/><path d="M1140 275v88m-28-44h56" stroke="#c92032" stroke-width="8"/>'},
 'crypto-network':{label:'NETWORK / PROTOCOL',accent:'#a17aca',art:'<g stroke="#f7f3e8" stroke-width="4" fill="none"><path d="m935 315 58-48 59 33 61-56m-178 71 57 45 60-60 61 58m-119-91v93m59-60 2 60m59-118v123"/></g><g fill="#171717" stroke="#c92032" stroke-width="5"><circle cx="935" cy="315" r="11"/><circle cx="993" cy="267" r="11"/><circle cx="1052" cy="300" r="11"/><circle cx="1113" cy="244" r="11"/><circle cx="993" cy="360" r="11"/><circle cx="1052" cy="300" r="11"/><circle cx="1113" cy="357" r="11"/></g><path d="M1000 330 1018 300h34l18 30-18 30h-34z" fill="#a17aca" stroke="#f7f3e8" stroke-width="3"/><path d="M1018 316h34m-34 14h34" stroke="#171717" stroke-width="3"/>'},
 'ai-systems':{label:'MODEL / COMPUTE',accent:'#28a8a1',art:'<g stroke="#f7f3e8" stroke-width="3" opacity=".75"><path d="m938 266 80 40m-80 40 80-40m0 0 72-45m-72 45 72 46m-72-46 0 93m72-138v184"/></g><g fill="#171717" stroke="#28a8a1" stroke-width="5"><circle cx="938" cy="266" r="12"/><circle cx="938" cy="346" r="12"/><circle cx="1018" cy="306" r="17"/><circle cx="1090" cy="261" r="12"/><circle cx="1090" cy="352" r="12"/><circle cx="1090" cy="399" r="12"/></g><path d="M1043 314v31m-15-15h30" stroke="#c92032" stroke-width="5"/>'},
 policy:{label:'RULES / MARKETS',accent:'#e3a643',art:'<path d="M944 245h137l34 34v128H944z" fill="#171717" stroke="#f7f3e8" stroke-width="3"/><path d="M1081 245v37h34m-143 13h98m-98 20h112m-112 20h86m-86 20h112m-112 20h71" stroke="#e3a643" stroke-width="4"/><path d="m967 375 18-16 19 8 24-24" fill="none" stroke="#c92032" stroke-width="5"/>'},
 technology:{label:'TECH / INDUSTRY',accent:'#6da9c6',art:'<path d="M932 390V301l39-28v117m0 0V255l42-27v162m0 0v-96l43-25v121m0 0v-61l40-23v84" fill="#171717" stroke="#f7f3e8" stroke-width="4"/><path d="M930 406h176" stroke="#6da9c6" stroke-width="5"/><circle cx="1147" cy="277" r="25" fill="none" stroke="#c92032" stroke-width="5"/><path d="M1147 241v72m-36-36h72" stroke="#c92032" stroke-width="3"/>'}
};
export function editorialSvg(title:string,section:'ai'|'crypto',summary=''){
 const source=`${title} ${summary}`;const subject=subjectFor(source,section),scene=scenes[subject];
 const variant=[...source].reduce((n,c)=>(n+c.charCodeAt(0))%3,0),dark=variant===1;
 const labelPath=outline(font.getPath(scene.label,60,590,22));
 const ornament=variant===0?'<path d="M0 0h1200v14H0z" fill="#c92032"/>':variant===1?'<path d="M0 0h1200v190H0z" fill="#171717"/><path d="m804 0 396 0v205l-226-18z" fill="#c92032"/>':'<path d="M0 0h1200v190H0z" fill="#c92032"/><path d="M770 0h430v190H850z" fill="#171717"/>';
 const svg=`<svg data-composition="${variant}" data-subject="${subject}" xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${dark?'#171717':'#f7f3e8'}"/>${ornament}${logo.replace('width="560" height="300"','x="60" y="32" width="230" height="123"')}<path d="M886 211h292v226H886z" fill="${variant===1?'#f7f3e8':'#171717'}"/><path d="M886 211h292v5H886z" fill="${scene.accent}"/>${scene.art}<g fill="${dark?'#f7f3e8':'#171717'}">${headlinePaths(title)}${labelPath}</g><path d="M60 548h1080" stroke="${dark?'#f7f3e8':'#171717'}" stroke-width="2"/><path d="m1055 568 83-5v29l-83 5z" fill="#c92032"/></svg>`;
 return svg;
}
export async function renderEditorialImage(title:string,section:'ai'|'crypto',summary=''){return sharp(Buffer.from(editorialSvg(title,section,summary))).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer();}
