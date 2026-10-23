import sharp from 'sharp';
import opentype from 'opentype.js';
import fontData from '../../assets/barlow-condensed-bold.ttf?inline';
import logo from '../../assets/editorial-logo.svg?raw';
const bytes=Buffer.from(fontData.split(',')[1],'base64');
const font=opentype.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
// Serialize finite outline coordinates directly: upstream SVG rounding can emit NaN.
function outline(path:opentype.Path){
 const keys:Record<string,string[]>={M:['x','y'],L:['x','y'],Q:['x1','y1','x','y'],C:['x1','y1','x2','y2','x','y'],Z:[]};
 const d=path.commands.map(c=>c.type+(keys[c.type]||[]).map(k=>{
  const value=(c as unknown as Record<string,number>)[k];if(!Number.isFinite(value))throw new Error('Invalid font outline');return Math.round(value*100)/100;
 }).join(' ')).join('');return `<path d="${d}"/>`;
}
function headlinePaths(title:string){
 const words=title.slice(0,220).split(/\s+/);let size=76,lines:string[]=[];
 for(;size>=40;size-=4){
  lines=[];let line='';
  for(const word of words){const next=line?`${line} ${word}`:word;if(line&&font.getAdvanceWidth(next,size)>1060){lines.push(line);line=word;}else line=next;}
  if(line)lines.push(line);if(lines.length*size*1.1<=300)break;
 }
 return lines.slice(0,6).map((line,i)=>outline(font.getPath(line,60,280+i*size*1.1,size))).join('');
}
export function editorialSvg(title:string,section:'ai'|'crypto'){
 const icon=section==='ai'
 ? '<rect x="932" y="54" width="150" height="116" rx="6" fill="none" stroke="#f7f3e8" stroke-width="5"/><path d="M958 112h98m-49-36v72m-96-50h20m-20 30h20m152-30h25m-25 30h25" stroke="#f7f3e8" stroke-width="5"/>'
 : '<g fill="none" stroke="#f7f3e8" stroke-width="5"><circle cx="971" cy="91" r="28"/><circle cx="1050" cy="134" r="28"/><path d="m995 104 31 17m-78 36-18 20m133-104 18-20"/></g>';
 const label=section==='ai'?'ARTIFICIAL INTELLIGENCE':'CRYPTO';
 const labelPath=outline(font.getPath(label,60,590,24));
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f7f3e8"/><path d="M0 0h1200v208L0 178z" fill="#171717"/><path d="m804 0 396 0v205l-226-18z" fill="#c92032"/>${logo.replace('width="560" height="300"','x="60" y="32" width="230" height="123"')}${icon}<g fill="#171717">${headlinePaths(title)}${labelPath}</g><path d="M60 548h1080" stroke="#171717" stroke-width="2"/><path d="m1055 568 83-5v29l-83 5z" fill="#c92032"/></svg>`;
 return svg;
}

export async function renderEditorialImage(title:string,section:'ai'|'crypto'){return sharp(Buffer.from(editorialSvg(title,section))).png().toBuffer();}
