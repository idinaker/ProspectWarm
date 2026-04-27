# AGENTS.md — Codex Operating Instructions for ProspectWarm

This file is the durable operating manual for Codex and other AI coding agents working in this repository.

Codex must follow these instructions before making changes.

---

## 1. Project Summary

ProspectWarm is a Chrome extension and web backend for B2B founders, consultants, and agency owners who use LinkedIn to warm up prospects through thoughtful comments.

The MVP lets a user:
1. Manually select or paste LinkedIn post text.
2. Open the extension side panel.
3. Save their role, offer, target audience, tone, and optional writing sample.
4. Generate exactly 3 thoughtful comment drafts.
5. Copy one comment.
6. Manually edit/post it themselves.
7. Submit feedback.
8. Upgrade when quota is reached.

The product is human-in-the-loop only.

---

## 2. Non-Negotiable Product Boundaries

Never implement:
- Auto-posting to LinkedIn.
- Auto-filling LinkedIn comment boxes.
- Auto-liking.
- Auto-DM.
- Auto-follow.
- Auto-connect.
- Background crawling.
- Scraping profiles.
- Reading last 5 posts automatically.
- Collecting LinkedIn cookies/session tokens.
- Bypassing LinkedIn controls.
- Mass engagement workflows.
- Hidden browser automation.

The v1 workflow must use:
- User-selected text, or
- Text manually pasted by the user.

If a task asks for prohibited behavior, refuse that part and propose a safe human-in-the-loop alternative.

---

## 3. Methodology

Use **Plan-Gated Vertical Slice Development with Test-First Implementation**.

For each task:
1. Read relevant docs:
   - `PRD.md`
   - `ARCHITECTURE.md`
   - `TEST_PLAN.md`
   - This `AGENTS.md`
2. Identify the smallest vertical slice.
3. Write or update acceptance criteria.
4. Write tests first.
5. Implement the smallest code needed to pass.
6. Run relevant tests.
7. Refactor only after tests pass.
8. Update docs if behavior changed.
9. Summarize changes and commands run.

Do not build broad speculative features.
Do not combine unrelated features.
Do not silently skip tests.

---

## 4. Model and Reasoning Routing

Use the cheapest sufficient model/reasoning level for each task. Do not default every task to the most expensive model or highest reasoning level.

### Codex task routing

| Task type | Recommended Codex setting | Notes |
|---|---|---|
| Formatting, renaming, copy edits, small config changes | Low reasoning / cheaper coding model if available | No architecture changes |
| Simple UI component or small bug with clear failing test | Low to medium reasoning | Keep scope tight |
| Normal feature implementation with tests | Medium reasoning using coding-specialized model | Default for most build tasks |
| Cross-package architecture change | High reasoning | Ask for plan first |
| E2E test framework setup | High reasoning | Browser extension testing is brittle |
| Auth/billing/security changes | High reasoning | Must include tests |
| Debugging failing CI or race conditions | High reasoning | Require root-cause summary |
| Large refactor across apps/packages | Extra high reasoning only when necessary | Must produce plan first |
| Product copy, docs, README updates | Low reasoning / cheaper general model | No need for expensive coding model |
| Prompt quality iteration | Medium reasoning first; high only if quality benchmark fails | Use fixtures and metrics |

### Important

- For coding tasks in Codex, prefer the coding-specialized model available in the environment.
- For non-coding docs/product copy, use a cheaper/faster model when available.
- Increase reasoning level only when complexity requires it.
- If the task is ambiguous, enter plan mode first.
- If the model choice is unavailable in the current environment, continue with the available default but keep the task small.

### Runtime LLM model routing inside the app

Do not hardcode one expensive LLM for every user generation.

Application runtime should support:
- `LLM_DEFAULT_MODEL` for normal generation.
- `LLM_QUALITY_MODEL` for retries/improvement.
- `LLM_PROVIDER` abstraction.
- Fake provider for tests.

Use deterministic heuristics before calling stronger models when possible.

---

## 5. Required Repo Structure

Expected structure:

```txt
apps/
  extension/
  web/
packages/
  core/
  test-fixtures/
docs/
PRD.md
ARCHITECTURE.md
TEST_PLAN.md
AGENTS.md
```

Do not scatter core logic across UI files.

### Where code belongs

| Concern | Location |
|---|---|
| Prompt builder | `packages/core/src/prompt/` |
| LLM response parsing | `packages/core/src/prompt/` |
| Quality heuristics | `packages/core/src/quality/` |
| Shared types | `packages/core/src/types/` |
| Quota rules | `packages/core/src/quota/` |
| Extension UI | `apps/extension/` |
| Backend API | `apps/web/app/api/` |
| Database helpers | `apps/web/lib/db/` |
| LLM provider adapters | `apps/web/lib/llm/` |
| Billing | `apps/web/lib/billing/` |
| Test fixtures | `packages/test-fixtures/` |

---

## 6. Commands

Use pnpm only.

Expected commands:

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm build
```

If the repo does not yet have these commands, create them during scaffolding.

Do not introduce npm/yarn lockfiles.

---

## 7. Coding Standards

Use:
- TypeScript strict mode.
- React functional components.
- Small modules.
- Named exports for shared utilities.
- Explicit return types for exported functions.
- Zod or equivalent for runtime validation.
- Server-side validation for every API route.
- Structured error types.
- Provider interfaces for external services.

Avoid:
- `any` unless justified.
- Large components.
- Hardcoded secrets.
- Hardcoded model IDs in business logic.
- Business logic inside React components.
- LLM calls from extension.
- Direct DB access from extension.
- Tests that require real external services by default.

---

## 8. Testing Rules

Codex must add or update tests for every behavior change.

Required:
- Unit tests for core logic.
- Component tests for UI behavior.
- Integration tests for API routes.
- E2E tests for changed user flows.
- Prompt quality fixtures for prompt changes.

Never call real LLM APIs in CI.
Use fake provider by default.

### Before completing a task, run the smallest relevant command first

Examples:
- Prompt change: `pnpm --filter @prospectwarm/core test:unit`
- API change: `pnpm --filter @prospectwarm/web test:integration`
- Extension UI change: `pnpm --filter @prospectwarm/extension test:unit`
- User flow change: `pnpm test:e2e`
- Cross-package change: `pnpm test && pnpm build`

If commands fail, do not claim success. Report the failure and root cause.

---

## 9. Definition of Done

A task is done only when:

```txt
- Acceptance criteria are satisfied.
- Relevant tests are added/updated.
- Relevant tests pass.
- Typecheck passes for touched package.
- Lint passes for touched package if configured.
- Build passes if build-affecting change.
- No secrets are introduced.
- No prohibited LinkedIn automation is introduced.
- Docs updated if behavior changed.
- Final summary includes files changed and commands run.
```

---

## 10. First Implementation Plan

When starting from an empty repo, implement in this order.

### Task 1 — Scaffold monorepo

Goal:
Create pnpm workspace with `apps/extension`, `apps/web`, `packages/core`, and `packages/test-fixtures`.

Acceptance criteria:
- `pnpm install` works.
- `pnpm typecheck` works.
- `pnpm test:unit` works with at least one placeholder test.
- `pnpm build` works or has clearly documented TODO if framework build is not yet scaffolded.

Model routing:
- Medium reasoning.
- Do not use highest reasoning.

### Task 2 — Core prompt package

Goal:
Create prompt builder, parser, shared types, and tests.

Acceptance criteria:
- `buildCommentPrompt` accepts post text and user context.
- `parseCommentResponse` returns exactly 3 comments or typed error.
- Unit tests cover valid, invalid, and malformed outputs.

Model routing:
- Medium reasoning.
- High reasoning only if parser edge cases get complex.

### Task 3 — Extension walking skeleton

Goal:
Build side panel and selected-text capture.

Acceptance criteria:
- User can select text on a mock page.
- Side panel displays selected text.
- Paste fallback exists.
- No LinkedIn DOM mutation.
- E2E test passes on mock page.

Model routing:
- High reasoning for initial extension/E2E setup.
- Medium for follow-up UI polish.

### Task 4 — Backend fake generation endpoint

Goal:
Create `POST /api/generate-comments` with fake provider.

Acceptance criteria:
- Valid request returns 3 fake comments.
- Invalid input fails.
- Tests pass.
- Extension can call endpoint locally.

Model routing:
- Medium reasoning.

### Task 5 — Real provider adapter

Goal:
Add OpenAI provider behind interface.

Acceptance criteria:
- Provider uses backend env var only.
- Provider is not used in CI by default.
- Fake provider remains default for tests.
- Parser validates provider output.

Model routing:
- Medium reasoning.
- High if introducing retries/fallbacks.

### Task 6 — Profile context

Goal:
Allow user to save context.

Acceptance criteria:
- Form exists.
- Storage works.
- Prompt includes profile context.
- Tests pass.

Model routing:
- Low/medium.

### Task 7 — Quota

Goal:
Implement free daily limit.

Acceptance criteria:
- Free user limited to 5 generations/day.
- Backend enforces limit.
- Tests cover free/paid/reset.

Model routing:
- Medium/high.

### Task 8 — Feedback

Goal:
Add feedback buttons and backend route.

Acceptance criteria:
- Feedback saved.
- Invalid feedback rejected.
- Tests pass.

Model routing:
- Medium.

### Task 9 — Billing

Goal:
Stripe checkout and webhook.

Acceptance criteria:
- Checkout session created.
- Webhook updates subscription.
- Invalid webhook rejected.
- Tests pass.

Model routing:
- High due to billing/security.

### Task 10 — Beta hardening

Goal:
Sentry, analytics, privacy, release checklist.

Acceptance criteria:
- Error logging added.
- Core analytics events added.
- Privacy notes updated.
- Chrome Web Store checklist exists.

Model routing:
- Medium.

---

## 11. Prompting Codex for Work

Use this pattern when assigning tasks:

```txt
Read AGENTS.md, PRD.md, ARCHITECTURE.md, and TEST_PLAN.md first.

Implement Task <N>: <task name>.

Constraints:
- Use test-first implementation.
- Keep scope limited to this task.
- Do not implement prohibited LinkedIn automation.
- Use fake providers for tests.
- Run the relevant test/typecheck commands.
- Return a summary of files changed, commands run, and any unresolved issues.
```

For complex tasks, use:

```txt
Enter plan mode first. Do not write code until you produce a short implementation plan and list of affected files.
```

---

## 12. Code Review Checklist

When reviewing a PR, check:

```txt
- Is the change within scope?
- Are tests included?
- Are tests meaningful?
- Does this introduce auto-posting or scraping?
- Does this expose secrets?
- Does this increase extension permissions?
- Does this call real LLM in CI?
- Is error handling user-safe?
- Are prompt outputs parsed/validated?
- Is quota enforced server-side?
- Are docs updated?
```

---

## 13. Security and Privacy Rules

Never log:
- API keys
- Supabase service role key
- Stripe secret
- Full auth tokens
- LinkedIn cookies
- User private messages
- Full browsing history

Minimize storage:
- Prefer post text hash/excerpt over full text.
- Store full selected text only if needed and documented.
- Do not store page HTML.
- Do not store LinkedIn cookies/tokens.

Extension permissions:
- Keep permissions minimal.
- Justify every new permission in PR summary.
- Avoid broad host permissions unless explicitly required and approved.

---

## 14. Dependency Rules

Before adding a dependency:
- Check if existing stack already solves it.
- Prefer small, maintained packages.
- Avoid unnecessary abstraction libraries.
- Explain why the dependency is needed in PR summary.

Do not add:
- Large UI kits without approval.
- Scraping libraries.
- Browser automation libraries for LinkedIn interaction.
- Unmaintained packages.

---

## 15. Documentation Rules

Update docs when:
- Product behavior changes.
- API contract changes.
- Env vars change.
- Test commands change.
- Extension permissions change.
- Billing behavior changes.
- Data storage behavior changes.

Docs must be concise and accurate.

---

## 16. Failure Handling

If blocked:
1. State what failed.
2. Include exact command/error.
3. Explain likely cause.
4. Suggest next step.
5. Do not claim completion.

If tests fail because scaffolding is incomplete, create the missing script/config if it is within task scope. Otherwise, document it clearly.

---

## 17. Autonomous Work Limits

Codex may autonomously:
- Scaffold the repo.
- Add tests.
- Implement scoped tasks.
- Refactor touched files after tests pass.
- Update docs.

Codex must not autonomously:
- Add prohibited LinkedIn automation.
- Add broad extension permissions.
- Add paid external services beyond specified stack.
- Change pricing.
- Change ICP.
- Store additional user data.
- Remove test coverage.
- Disable failing tests without fixing root cause.
- Commit secrets or placeholder real keys.

---

## 18. Final Response Format for Codex Tasks

Every task response should include:

```txt
Summary
- Bullet list of changes.

Files changed
- path/to/file

Tests/commands run
- command: result

Notes
- Any risks, TODOs, or follow-ups.
```

If no tests were run, explain why. Do not hide failures.
