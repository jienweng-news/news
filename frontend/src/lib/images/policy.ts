export interface ImagePlan{url:string;alt:string;credit:string;license:string;sourceUrl:string;originalImageUrl?:string;licenseUrl?:string;provider?:'pexels'|'commons';kind:'source'}
// Media reuse is reviewed per asset. RSS/OG availability alone is not permission.
export const imageVersion='source-first-v8-topic-relevance';
export const rejectedImageSources=[
 'https://commons.wikimedia.org/wiki/File:Artificial_Intelligence_%26_AI_%26_Machine_Learning.jpg',
 'https://commons.wikimedia.org/wiki/File:Artificial_Intelligence,_AI.jpg',
 'https://commons.wikimedia.org/wiki/File:STOCK_MARKET_(4522934717).jpg',
 'https://commons.wikimedia.org/wiki/File:Crypto_Winter-_The_Crypto_Winter_of_2022.jpg',
 'https://commons.wikimedia.org/wiki/File:Crypto_Winter_-_Frozen_Cryptocurrencies.jpg',
 'https://commons.wikimedia.org/wiki/File:NASDAQ_stock_market_display.jpg',
 'https://commons.wikimedia.org/wiki/File:Rack_for_FPGA_BiXBiT.jpg',
 'https://commons.wikimedia.org/wiki/File:Cryptocurrency_Regulation_%26_Laws.jpg',
 'https://commons.wikimedia.org/wiki/File:IBMPortableModularDataCenter3.jpg',
 'https://commons.wikimedia.org/wiki/File:Internet_Archive_Googly_Eyes_03.jpg',
 'https://commons.wikimedia.org/wiki/File:Market_centre_in_Tokyo_stock_exchange.jpg',
 'https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay',
] as const;
export function imagePlan(sourceUrl:string|undefined,_slug:string,_revision:string,title:string):ImagePlan|undefined{
 void sourceUrl;
 void title;
 return undefined;
}
