import {newsletterReady} from './newsletter';
export function releaseReadiness(env:Record<string,string|undefined>){
 const checks=[
  {id:'cms',ready:env.CONTENT_MODE==='sanity'&&Boolean(env.SANITY_PROJECT_ID&&env.SANITY_DATASET),reason:'Real Sanity project and dataset required; fixtures cannot launch.'},
  {id:'origin',ready:env.SITE_URL==='https://tokenonair.com',reason:'Production canonical origin must match the purchased domain.'},
  {id:'newsletter',ready:newsletterReady(env),reason:'beehiiv language field, suppression, confirmation and Turnstile need verified setup.'},
  {id:'analytics',ready:/^G-[A-Z0-9]+$/.test(env.GA4_MEASUREMENT_ID||''),reason:'GA4 stream required; browser consent/event validation remains external acceptance.'},
  {id:'contact',ready:/^[^\s@]+@tokenonair\.com$/.test(env.PUBLIC_CONTACT_EMAIL||'')&&env.MAIL_VERIFIED==='1',reason:'Founder must verify public contact mailbox delivery.'},
  {id:'publishing',ready:env.AUTOMATION_ACCEPTANCE_VERIFIED==='1',reason:'Source terms, independent validator, Dots handoff, durable worker and lifecycle drills required.'},
  {id:'liveAcceptance',ready:env.LAUNCH_ACCEPTANCE_VERIFIED==='1',reason:'Browser/mobile/performance, commercial hosting, live CMS, restore and rollback evidence required.'},
  {id:'dependencyReview',ready:env.DEPENDENCY_REVIEW_VERIFIED==='1',reason:'Record disposition of remaining upstream dependency advisories before launch.'},
 ];return {ready:checks.every(c=>c.ready),checks};
}
