# n8n newsroom implementation

Spec: docs/superpowers/specs/2026-10-23-n8n-newsroom.md
Execution: native, TDD, one final fresh-context review.
Global constraints: no existing container changes; no public unclaimed editor; secrets private; source policy and worker pause gates remain; no live publishing or emails during acceptance.

### Task 1: Bounded Codex agent
Interfaces: fixed smoke/write/review JSON operations; structured outputs, subprocess deadline, no caller-controlled executable/config.
Write failing tests for prompt/schema selection, credential-free child environment, subprocess errors/timeouts, request authentication/body limits and concurrency. Expected: tests fail before implementation. Implement agent and schemas; rerun tests. Expected: pass. Commit task.
Verification: npm test -- tests/n8n-agent.test.ts

### Task 2: Durable coordinator and workflows
Interfaces: agent task contract from Task 1; worker claim/publish contract; persistent run history and private signing; inactive n8n workflows.
Write failing tests for paused queue/no model calls, concurrent tick refusal, history restart, independent review/evidence refusal, signed candidate validation, and workflow wiring. Expected: fail. Implement coordinator/pipeline/workflow JSON. Expected: tests pass. Commit task.
Verification: npm test -- tests/n8n-agent.test.ts tests/n8n-coordinator.test.ts

### Task 3: Install and verify isolated services
Interfaces: bundled agent/coordinator, private Compose secret files, localhost n8n editor, actual CLI import/execute.
Implement reproducible deployment preparation, pinned images, private credentials and persistent volumes. Verify Compose configuration, start services, import both workflows, execute smoke through actual n8n, verify real structured Codex output and restart persistence; inspect owner setup privately. Expected: healthy services, successful smoke, no publishing, no existing container changes. Record exact evidence and failures honestly. Commit deployment/config/docs.
Verification: npm test -- tests/n8n-agent.test.ts tests/n8n-coordinator.test.ts

## Review Focus
Review credential isolation across processes/containers, untrusted RSS/prompt injection, lease deadlines, ambiguous publication retries, queue concurrency, n8n owner/bootstrap exposure, execution/log retention, restart behavior and operational claims versus actual acceptance evidence. Model verification is fallible: do not equate a signed model judgment with guaranteed factual accuracy. No arbitrary source URL fetches or blanket rights approval.
