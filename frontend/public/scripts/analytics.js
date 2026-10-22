
 function cleanAnalyticsPath(url){return new URL(url).pathname;}
 const panel=document.querySelector('[data-analytics-id]');
 if(panel){
  const id=panel.dataset.analyticsId;let allowed=false;let loaded=false;
  const context=()=>({page_location:location.origin+cleanAnalyticsPath(location.href),page_referrer:document.referrer?new URL(document.referrer).origin:'',page_title:'Token on Air'});
  const scope=window;scope.dataLayer=scope.dataLayer||[];scope.gtag=function(){scope.dataLayer.push(arguments);};
  const card=panel.querySelector('[data-analytics-card]');
  const dialog=panel.querySelector('[data-analytics-dialog]');
  const toggle=panel.querySelector('[data-analytics-toggle]');
  const status=panel.querySelector('[data-analytics-status]');
  const buttons=()=>{card.hidden=true;status.textContent=allowed?panel.dataset.enabledLabel:panel.dataset.disabledLabel;};
  const remember=value=>{try{localStorage.setItem('toa_analytics',value);return localStorage.getItem('toa_analytics')===value;}catch{return false;}};
  const deny=()=>{
   const wasLoaded=loaded;allowed=false;const saved=remember('denied');buttons();
   if(wasLoaded){scope[`ga-disable-${id}`]=true;scope.gtag('consent','update',{analytics_storage:'denied'});}
   const domains=location.hostname.split('.');
   for(const row of document.cookie.split(';')){
    const name=row.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;
    document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`;
    for(let i=0;i<domains.length-1;i++)document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax; domain=${domains.slice(i).join('.')}`;
   }
   // Unload the already loaded Google library after withdrawal.
   if(wasLoaded&&saved)location.reload();
  };
  const load=()=>{scope[`ga-disable-${id}`]=false;allowed=true;buttons();if(loaded){scope.gtag('consent','update',{analytics_storage:'granted'});return;}loaded=true;scope.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});scope.gtag('set',context());scope.gtag('js',new Date());scope.gtag('config',id,{...context(),send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;document.head.append(script);scope.gtag('event','page_view',{page_location:location.origin+cleanAnalyticsPath(location.href),page_referrer:document.referrer?new URL(document.referrer).origin:'',page_title:'Token on Air',language:panel.dataset.locale});};
  card.hidden=false;
  try{const consent=localStorage.getItem('toa_analytics');if(consent==='granted')load();else if(consent==='denied')buttons();}catch{}
  panel.querySelector('[data-analytics-allow]')?.addEventListener('click',()=>{remember('granted');load();});
  panel.querySelector('[data-analytics-decline]')?.addEventListener('click',deny);
  panel.querySelector('[data-analytics-reset]')?.addEventListener('click',()=>{toggle.checked=allowed;status.textContent=allowed?panel.dataset.enabledLabel:panel.dataset.disabledLabel;dialog.showModal();});
  panel.querySelector('[data-analytics-close]')?.addEventListener('click',()=>dialog.close());
  panel.querySelector('[data-analytics-save]')?.addEventListener('click',()=>{dialog.close();if(toggle.checked){remember('granted');load();}else deny();});
  document.addEventListener('click',event=>{if(!allowed)return;const link=event.target?.closest('a[data-commercial-event]');if(!link)return;const name=link.dataset.commercialEvent;if(!['affiliate_click','sponsor_click','owned_project_click'].includes(name||''))return;const placement=link.dataset.placement;if(placement&&/^[a-z0-9_-]{1,64}$/.test(placement))scope.gtag('event',name,{...context(),placement,language:panel.dataset.locale});});
  document.addEventListener('toa-signup-accepted',()=>{if(allowed)scope.gtag('event','newsletter_signup',{...context(),language:panel.dataset.locale});});
 }

