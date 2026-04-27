# TEST_PLAN.md — ProspectWarm Testing Strategy

## 1. Testing Philosophy

The product lives or dies on trust, comment quality, and reliability. Testing must cover not only code correctness but also AI output quality and platform-safety boundaries.

Use a **test-first vertical slice methodology**:
1. Acceptance criteria.
2. Unit tests.
3. Implementation.
4. Integration tests.
5. E2E tests.
6. Prompt quality tests.
7. Manual beta review.

Codex must not implement product features without tests unless explicitly marked as a throwaway spike.

---

## 2. Test Pyramid

```txt
          Manual beta review
        Prompt quality tests
       E2E user-flow tests
     Integration/API tests
  Unit tests / deterministic rules
```

The lower layers must run often and cheaply. The upper layers validate product quality.

---

## 3. Required Test Tools

Use:
- **Vitest** for unit tests.
- **React Testing Library** for component tests.
- **Playwright** for E2E tests.
- **MSW or equivalent mocking** for network calls.
- **Fake LLM provider** for CI and deterministic tests.

Do not call real LLM APIs in normal CI.

---

## 4. Test Categories

## 4.1 Unit Tests

Unit tests are required for:
- Prompt builder
- LLM response parser
- Comment quality heuristics
- Generic phrase detection
- Quota rules
- API request validation
- Extension storage helpers
- Copy behavior helper
- Error mapping

### Example unit test files

```txt
packages/core/tests/buildCommentPrompt.test.ts
packages/core/tests/parseCommentResponse.test.ts
packages/core/tests/evaluateCommentHeuristics.test.ts
packages/core/tests/quotaRules.test.ts
apps/web/tests/unit/generateCommentsValidation.test.ts
apps/extension/tests/unit/selection.test.ts
apps/extension/tests/unit/storage.test.ts
```

### Prompt builder unit tests

Required cases:
- Includes selected post text.
- Includes user role/offer/target audience when provided.
- Handles missing optional writing sample.
- Enforces exactly 3 comments.
- Enforces JSON output.
- Explicitly prohibits invented personal experience.
- Explicitly prohibits auto-posting instructions.
- Keeps prompt below configured max length.
- Truncates overly long post text safely.

Example names:

```txt
buildCommentPrompt.includes_selected_post_text
buildCommentPrompt.includes_user_positioning
buildCommentPrompt_handles_missing_writing_sample
buildCommentPrompt_requires_three_comment_types
buildCommentPrompt_requires_strict_json
buildCommentPrompt_prohibits_fake_personal_experience
buildCommentPrompt_prohibits_auto_posting
buildCommentPrompt_truncates_long_input
```

### Response parser unit tests

Required cases:
- Parses valid JSON with exactly 3 comments.
- Rejects markdown-wrapped JSON unless fallback parser cleans it safely.
- Rejects fewer than 3 comments.
- Rejects more than 3 comments unless safely trims with warning.
- Rejects missing text.
- Rejects invalid comment types.
- Rejects empty strings.
- Handles provider returning extra commentary.

Example names:

```txt
parseCommentResponse_accepts_valid_three_comment_json
parseCommentResponse_strips_markdown_fence
parseCommentResponse_rejects_missing_comments
parseCommentResponse_rejects_invalid_type
parseCommentResponse_rejects_empty_comment_text
```

### Quality heuristic tests

Required cases:
- Detects generic phrases:
  - "Great post"
  - "Thanks for sharing"
  - "Couldn't agree more"
  - "Love this"
  - "This is so true"
- Detects excessive emoji.
- Detects comment that is too short.
- Detects comment that is too long.
- Detects first-person claims if not supported by user context.
- Detects sales pitch language.
- Confirms comment references post concepts.

Example names:

```txt
evaluateCommentHeuristics_flags_generic_praise
evaluateCommentHeuristics_flags_excessive_emoji
evaluateCommentHeuristics_flags_too_short
evaluateCommentHeuristics_flags_sales_pitch
evaluateCommentHeuristics_passes_specific_value_add_comment
```

---

## 4.2 Component Tests

Use React Testing Library for extension UI and web UI.

Required components:
- Side panel container
- Selected text box
- User profile form
- Generate button
- Comment option card
- Copy button
- Feedback buttons
- Quota banner
- Error message

Required cases:
- Empty state appears when no selected text exists.
- Paste fallback works.
- Generate button disabled when input invalid.
- Loading state appears during generation.
- Three comment cards render on success.
- Error state renders on failed API call.
- Copy success state renders.
- Feedback buttons submit events.
- Quota banner appears when limit reached.

---

## 4.3 Integration Tests

Integration tests run against API routes with mocked dependencies.

### `POST /api/generate-comments`

Test:
- Unauthenticated user blocked or handled according to current auth mode.
- Valid request returns 3 comments.
- Empty post text returns `invalid_input`.
- Overlong post text is truncated or rejected consistently.
- Free user under quota succeeds.
- Free user over quota returns `quota_exceeded`.
- Paid user bypasses free daily limit.
- LLM provider failure returns user-safe error.
- Usage event is stored on success.
- Generation record is stored on success.
- No raw stack trace returned.

### `POST /api/feedback`

Test:
- Valid feedback saves.
- Invalid generation ID fails.
- Invalid rating fails.
- User cannot submit feedback for another user's generation.
- Reason is optional.
- Reason length is capped.

### Stripe webhook

Test:
- Valid checkout event updates subscription.
- Invalid signature rejected.
- Cancelled subscription downgrades user.
- Past-due subscription handled.

---

## 4.4 E2E Tests

Use Playwright. Do not run against real LinkedIn in CI.

Create local mock pages:

```txt
apps/extension/tests/fixtures/mock-linkedin-post.html
apps/extension/tests/fixtures/mock-long-post.html
apps/extension/tests/fixtures/mock-no-selection.html
```

### Primary E2E test

Scenario: selected post to copied comment

Steps:
1. Open mock LinkedIn-like page.
2. Select post text.
3. Open extension side panel.
4. Confirm selected text appears.
5. Fill user context if first run.
6. Click Generate.
7. Mock backend returns 3 comments.
8. Confirm 3 comments render.
9. Click Copy on second comment.
10. Confirm copied state appears.
11. Confirm no DOM mutation occurred on page.

Acceptance:
- Test passes in CI.
- No real LinkedIn dependency.
- No real LLM dependency.

### E2E test names

```txt
e2e_generates_comments_from_selected_text
e2e_allows_manual_paste_when_no_text_selected
e2e_blocks_generation_when_quota_exceeded
e2e_shows_provider_failure_error
e2e_copies_comment_without_mutating_page
e2e_saves_user_profile_context
```

---

## 5. Prompt Quality Test Suite

This is mandatory. The product is the output quality.

### Fixtures

Store realistic sample posts in:

```txt
packages/test-fixtures/linkedin-posts/
```

Minimum fixture categories:
- Founder lesson
- Agency growth
- Sales/outbound
- Hiring/recruiting
- Product management
- Technical/building
- Personal story
- Contrarian business opinion
- Customer success
- AI/tooling

Each fixture should include:

```json
{
  "id": "founder-lesson-001",
  "category": "founder_lesson",
  "postText": "string",
  "expectedConcepts": ["specific idea 1", "specific idea 2"],
  "badGenericExamples": ["Great post", "Thanks for sharing"],
  "notes": "What a good comment should respond to"
}
```

### Automated quality checks

Each generated comment must be checked for:
- Non-empty.
- Within length range.
- No banned generic phrases.
- No unsupported first-person claims.
- No direct pitch.
- No aggressive or manipulative language.
- References at least one expected concept or semantically close concept.
- Three options are meaningfully distinct.

### Quality scoring

Create heuristic score:

```ts
type QualityScore = {
  total: number; // 0-100
  specificity: number;
  naturalness: number;
  valueAdd: number;
  risk: number;
  reasons: string[];
};
```

Minimum gate:
- No generated comment below 60.
- Average fixture score >= 75.
- No more than 20% flagged as possibly generic.

This gate is a heuristic, not a replacement for human review.

### Human review

Before beta:
- Review 50 generated comments.
- Mark each:
  - Postable as-is
  - Postable with light edit
  - Needs heavy edit
  - Unusable
- Beta threshold:
  - At least 60% postable as-is or with light edit.
  - Less than 20% unusable.
  - Less than 25% sound AI-generated.

---

## 6. Model/Cost Testing

Track:
- Input tokens.
- Output tokens.
- Provider latency.
- Cost estimate.
- Error rate.
- User rating.

Create a benchmark script:

```bash
pnpm benchmark:prompts
```

Benchmark should:
- Run fixtures through fake provider by default.
- Optionally run real provider when `RUN_REAL_LLM_BENCHMARK=true`.
- Write summary to `benchmark-results/`.
- Never run real provider in CI unless explicitly enabled.

---

## 7. Security Tests

Required:
- Ensure API key is not present in extension bundle.
- Ensure service role key is not exposed to client.
- Ensure unauthenticated requests are blocked or rate-limited.
- Ensure quota cannot be bypassed client-side.
- Ensure Stripe webhook requires valid signature.
- Ensure feedback cannot be submitted cross-user.
- Ensure post text length is capped.
- Ensure logs do not include full sensitive payloads by default.

Suggested test names:

```txt
security_extensionBundle_doesNotContainOpenAIKey
security_generateComments_enforcesServerSideQuota
security_stripeWebhook_rejectsInvalidSignature
security_feedback_rejectsCrossUserAccess
security_api_rejectsOverlongPostText
```

---

## 8. Privacy Tests

Required:
- User can clear saved profile context.
- App does not store full LinkedIn HTML.
- App does not collect browsing history.
- App does not request cookies permission.
- App does not request broad host permissions unless explicitly approved.

---

## 9. Regression Tests for Prohibited Behaviors

These tests protect the product boundary.

The codebase must not introduce:
- Auto-posting.
- Auto-clicking LinkedIn buttons.
- Comment box mutation.
- Background crawling.
- Profile scraping.
- Connection request automation.
- Like automation.

Create static checks or tests where possible.

Example:
```txt
prohibited_noAutoPostFunctionExists
prohibited_noLinkedInCommentBoxMutation
prohibited_noCookiePermissionInManifest
prohibited_noBackgroundCrawlingScheduler
```

This can be partially enforced with:
- manifest checks
- dependency/code grep tests
- E2E DOM mutation checks
- PR review checklist

---

## 10. CI Requirements

Every pull request must run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm build
```

CI must use:
```txt
LLM_PROVIDER=fake
```

CI must not require:
- Real OpenAI/Anthropic key
- Real Stripe secret
- Real Supabase project
- Real LinkedIn account

---

## 11. Manual QA Checklist

Before beta release:

### Extension

- [ ] Install unpacked extension.
- [ ] Open LinkedIn or mock page.
- [ ] Select text.
- [ ] Side panel opens.
- [ ] Selected text appears.
- [ ] Paste fallback works.
- [ ] Generate returns 3 comments.
- [ ] Copy works.
- [ ] Feedback works.
- [ ] Quota banner works.
- [ ] No page mutation occurs.
- [ ] No auto-posting exists.

### Backend

- [ ] API validates input.
- [ ] Quota enforced.
- [ ] Usage event stored.
- [ ] Feedback stored.
- [ ] Provider timeout handled.
- [ ] Errors are user-safe.

### Billing

- [ ] Checkout starts.
- [ ] Webhook updates subscription.
- [ ] Paid user gets upgraded.
- [ ] Cancelled user gets downgraded.
- [ ] Customer portal works if implemented.

### Privacy/Security

- [ ] No API keys in extension bundle.
- [ ] No full browsing history collected.
- [ ] Extension permissions are minimal.
- [ ] Privacy policy draft exists.
- [ ] Data deletion path documented.

---

## 12. Definition of Done for Codex Tasks

Codex must satisfy the following before marking a task complete:

```txt
- Acceptance criteria addressed.
- Unit tests written or updated.
- Integration tests written or updated if API changed.
- E2E tests written or updated if user flow changed.
- All relevant tests pass.
- Typecheck passes.
- Lint passes.
- Build passes.
- No secrets introduced.
- No prohibited LinkedIn automation introduced.
- Documentation updated if behavior changed.
- Short summary of changes provided.
- Short list of commands run provided.
```

If a task cannot satisfy the above, Codex must explicitly say what failed and why.

---

## 13. When to Use Real LLM Tests

Real LLM tests are allowed only for:
- Local prompt benchmarking.
- Manual QA.
- Release candidate prompt quality evaluation.

They must not run by default.

Command pattern:

```bash
RUN_REAL_LLM_BENCHMARK=true pnpm benchmark:prompts
```

The benchmark must print estimated cost before running and ask for explicit confirmation if interactive execution is available.

---

## 14. Testing Roadmap by Sprint

### Sprint 1 — Walking skeleton

Tests:
- Selected text capture unit test.
- Side panel render test.
- E2E selected text appears in side panel.

### Sprint 2 — AI generation

Tests:
- Prompt builder.
- Parser.
- API integration with fake provider.
- E2E generation flow.

### Sprint 3 — User profile

Tests:
- Profile save/update/clear.
- Prompt includes user positioning.
- E2E profile persists.

### Sprint 4 — Quota/auth

Tests:
- Free quota.
- Paid bypass.
- Usage events.
- Auth error states.

### Sprint 5 — Billing

Tests:
- Checkout session.
- Webhook subscription update.
- Plan status reflected in quota.

### Sprint 6 — Beta polish

Tests:
- Feedback loop.
- Error reporting.
- Onboarding.
- Release checklist.

---

## 15. Release Gate

Do not release to beta unless:

```txt
pnpm typecheck passes
pnpm lint passes
pnpm test:unit passes
pnpm test:integration passes
pnpm test:e2e passes
pnpm build passes
Manual QA checklist passes
Prompt quality review meets threshold
No prohibited behavior exists
```
