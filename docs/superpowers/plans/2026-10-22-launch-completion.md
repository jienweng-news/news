# Launch completion implementation plan

> Use superpowers:executing-plans inline; one fresh final review.

**Goal:** Finish the authorized reader-site launch work and record verified account gates without enabling unverified integrations.
**Architecture:** Existing Astro/Sanity/Vercel site, native consent UI, server-only Kit integration. No new frontend dependency.
**Spec:** docs/superpowers/specs/2026-10-22-publication-launch-design.md plus subsequent founder decisions recorded in docs/operations/launch-readiness.md and this conversation.
**Tech stack:** Existing pinned Astro, Sanity, TypeScript, native browser dialog.

## Global constraints
Preserve approved Persona styling, English/Traditional/Simplified editions and editor jienweng. No fabricated reporting, legal identity, delivery acceptance or live CMS writes. Deployment/push are already authorized. Missing credentials or owner facts remain explicit launch gates.

## Review focus
- Revoking analytics after a granted session must stop events and clear applicable GA cookies.
- Reopening preferences must not silently change consent; Escape must dismiss without saving.
- Blocked storage must not prevent a visitor from reading or making a session choice.
- Policy claims must match actual collection and disabled newsletter state.
- Deployment must preserve secrets and fail-closed integration gates.

### Task 1: Consent controls
- [ ] Add failing browser-script tests for dismiss/reopen, saved consent, revocation and storage failures. Run targeted Vitest; expect new assertions to fail.
- [ ] Implement a nonblocking floating consent card and native preferences dialog; persistent footer control, equal allow/decline, localized current status and close. Preserve basic opt-in analytics, sanitize URLs and clear host/domain GA cookies on revocation.
- [ ] Run npm test and npm run check:client; expect all pass. Commit.

### Task 2: Reader policies and account checklist
- [ ] Add Terms and disclaimer pages in three editions, footer discovery and clear privacy/storage explanation. Use supplied facts, leave unverified account settings in operations docs.
- [ ] Extend HTTP smoke to request new routes; run before adding routes and expect404, then after build expect200.
- [ ] Reconcile launch-readiness and maintain launch-checklist.md with done/blocked and evidence. Check provider config and public DNS without exposing secrets.
- [ ] Run checks/tests/Node build/local HTTP smoke/Studio build. Commit.

### Task 3: Review and production verification
- [ ] Run fresh review once; fix important findings with RED/GREEN tests.
- [ ] Build Vercel output and deploy, with existing integration gates preserved. Verify custom-domain pages, feeds, policies, health and blocked signup.
- [ ] Push PR3 and record deployment/test evidence and precise external blockers in checklist. Commit final documentation.
