for(const form of document.querySelectorAll('[data-newsletter-form]')){
 form.addEventListener('submit',async event=>{
  event.preventDefault();const button=form.querySelector('button[type=submit]');const status=form.querySelector('[data-signup-status]');button.disabled=true;status.textContent='';
  try{const body=new URLSearchParams();for(const [key,value]of new FormData(form))if(typeof value==='string')body.set(key,value);const response=await fetch(form.action,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body});const result=await response.json();if(!response.ok||result.accepted!==true)throw new Error();status.textContent=form.dataset.success;document.dispatchEvent(new CustomEvent('toa-signup-accepted'));form.reset();}catch{status.textContent=form.dataset.error;}finally{button.disabled=false;if(window.turnstile)window.turnstile.reset();}
 });
}
