
 function cleanAnalyticsPath(url){return new URL(url).pathname;}
 const panel=document.querySelector('[data-analytics-id]');
 if(panel){
  const id=panel.dataset.analyticsId;let allowed=false;let loaded=false;
  const scope=window;scope.dataLayer=scope.dataLayer||[];scope.gtag=function(){scope.dataLayer.push(arguments);};
  const buttons=()=>{panel.querySelectorAll('[data-analytics-allow],[data-analytics-decline]').forEach(e=>e.hidden=true);panel.querySelector('[data-analytics-reset]').hidden=false;};
  const load=()=>{allowed=true;buttons();if(loaded){scope.gtag('consent','update',{analytics_storage:'granted'});return;}loaded=true;scope.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});scope.gtag('js',new Date());scope.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;document.head.append(script);scope.gtag('event','page_view',{page_location:location.origin+cleanAnalyticsPath(location.href),page_referrer:document.referrer?new URL(document.referrer).origin:'',page_title:'Token on Air',language:panel.dataset.locale});};
  try{const consent=localStorage.getItem('toa_analytics');if(consent==='granted')load();else if(consent==='denied')buttons();}catch{}
  panel.querySelector('[data-analytics-allow]')?.addEventListener('click',()=>{try{localStorage.setItem('toa_analytics','granted');}catch{}load();});
  panel.querySelector('[data-analytics-decline]')?.addEventListener('click',()=>{try{localStorage.setItem('toa_analytics','denied');}catch{}buttons();});
  panel.querySelector('[data-analytics-reset]')?.addEventListener('click',()=>{allowed=false;scope.gtag('consent','update',{analytics_storage:'denied'});try{localStorage.removeItem('toa_analytics');}catch{}for(const row of document.cookie.split(';')){const name=row.split('=')[0].trim();if(name.startsWith('_ga'))document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`;}location.reload();});
  document.addEventListener('click',event=>{if(!allowed)return;const link=event.target?.closest('a[data-commercial-event]');if(!link)return;const name=link.dataset.commercialEvent;if(!['affiliate_click','sponsor_click','owned_project_click'].includes(name||''))return;const placement=link.dataset.placement;if(placement&&/^[a-z0-9_-]{1,64}$/.test(placement))scope.gtag('event',name,{placement,language:panel.dataset.locale});});
  document.addEventListener('toa-signup-accepted',()=>{if(allowed)scope.gtag('event','newsletter_signup',{language:panel.dataset.locale});});
 }

