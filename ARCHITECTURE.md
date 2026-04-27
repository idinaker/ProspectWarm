# ARCHITECTURE.md — ProspectWarm Technical Architecture

## 1. Architectural Goal

Build a small, reliable, testable Chrome extension and backend that lets a user manually select or paste LinkedIn post text, generate 3 thoughtful comment drafts, copy one, and manually post it.

The architecture must prioritize:
- Human-in-the-loop operation.
- Minimal LinkedIn platform risk.
- Strong testability.
- Low operating cost.
- Clean separation between extension, backend, prompt logic, billing, and storage.
- Ability for Codex to work autonomously in small vertical slices.

---

## 2. Recommended Stack

### Monorepo

Use a pnpm workspace monorepo.

```txt
prospectwarm/
  apps/
    extension/
    web/
  packages/
    core/
    test-fixtures/
  docs/
  AGENTS.md
  PRD.md
  ARCHITECTURE.md
  TEST_PLAN.md
  package.json
  pnpm-workspace.yaml
```

### Extension

Use:
- **WXT** or **Plasmo**
- React
- TypeScript
- Chrome Manifest V3
- Chrome Side Panel API
- Vitest for unit tests
- Playwright for E2E

Preferred default: **WXT + React + TypeScript**.

Reason:
- Vite-native developer experience.
- Good fit for TypeScript.
- Easier to reason about standard extension files.
- Good for content scripts, background service worker, side panel, and browser APIs.

If the repo already uses Plasmo, continue with Plasmo. Do not rewrite working scaffolding only to switch frameworks.

### Backend/Web

Use:
- Next.js App Router
- TypeScript
- Supabase for auth + Postgres
- Stripe for billing
- PostHog for product analytics
- Sentry for errors
- OpenAI or Anthropic through a provider abstraction

Preferred hosting:
- Vercel for web/backend
- Supabase managed Postgres/Auth
- Stripe hosted checkout

### Package manager

Use:
- `pnpm`

Do not mix npm, yarn, and pnpm.

---

## 3. High-Level Components

```txt
[User on LinkedIn]
      |
      | manually selects text
      v
[Chrome Extension Content Script]
      |
      | selected text event / message
      v
[Extension Side Panel UI]
      |
      | POST /api/generate-comments
      v
[Next.js Backend API]
      |
      | validate auth, quota, input
      v
[Prompt Builder in packages/core]
      |
      | structured prompt
      v
[LLM Provider Adapter]
      |
      | structured JSON result
      v
[Backend Response]
      |
      v
[Extension Side Panel: 3 comments + copy buttons]
      |
      | manual copy
      v
[User edits/posts manually on LinkedIn]
```

---

## 4. Core Design Decisions

### Decision 1 — Selected text first

The extension must use selected text or manually pasted text in v1.

Do not automatically scrape:
- Last 5 posts
- Profile content
- Comments
- Connections
- DMs
- Search result lists

Why:
- Lower platform risk.
- Lower privacy risk.
- Easier to test.
- Simpler Chrome Web Store review story.
- Better user trust.

### Decision 2 — Side panel over popup

Use side panel for the main experience.

Why:
- Persistent UI while the user reviews a post.
- More space for context, comments, and feedback.
- Better than popup for multi-step flows.

### Decision 3 — Backend owns AI and quota

The extension must never call the LLM provider directly.

Why:
- API keys must not be shipped in extension bundle.
- Quotas must be enforced server-side.
- Abuse/rate limiting belongs on backend.
- Prompt improvements can be deployed without rebuilding extension.

### Decision 4 — Prompt logic lives in `packages/core`

Prompt building, response parsing, and quality checks must not be buried inside UI components or API handlers.

Why:
- Unit-testable.
- Reusable across backend, tests, and future tools.
- Codex can modify prompt behavior without touching UI.

### Decision 5 — Human-in-the-loop only

The extension must not:
- Auto-post.
- Auto-fill LinkedIn comment boxes.
- Auto-like.
- Auto-DM.
- Auto-follow.
- Auto-connect.
- Run scheduled engagement.

---

## 5. Repository Structure

```txt
prospectwarm/
  apps/
    extension/
      entrypoints/
        background.ts
        content.ts
        sidepanel/
          App.tsx
          index.html
          main.tsx
      src/
        components/
        hooks/
        services/
        storage/
        types/
      tests/
        unit/
        e2e/
      wxt.config.ts
      package.json

    web/
      app/
        api/
          generate-comments/
            route.ts
          feedback/
            route.ts
          me/
            usage/
              route.ts
          billing/
            checkout/
              route.ts
          webhooks/
            stripe/
              route.ts
        page.tsx
      lib/
        auth/
        billing/
        db/
        llm/
        rate-limit/
      tests/
        integration/
      package.json

  packages/
    core/
      src/
        prompt/
          buildCommentPrompt.ts
          parseCommentResponse.ts
          promptTypes.ts
        quality/
          evaluateCommentHeuristics.ts
          genericPhraseRules.ts
        quota/
          quotaRules.ts
        types/
          index.ts
      tests/
      package.json

    test-fixtures/
      linkedin-posts/
        founder-lessons.json
        sales-outbound.json
        hiring-post.json
        technical-post.json
        personal-story.json
      package.json

  docs/
    SECURITY.md
    PRIVACY_NOTES.md
    RELEASE_CHECKLIST.md

  AGENTS.md
  PRD.md
  ARCHITECTURE.md
  TEST_PLAN.md
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
```

---

## 6. Data Model

Use Supabase Postgres.

### `users`

Supabase Auth may create auth users separately. Application metadata table:

```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `user_profiles`

```sql
create table public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text,
  role text,
  offer text,
  target_audience text,
  tone_preference text not null default 'professional_warm',
  writing_sample text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `comment_generations`

```sql
create table public.comment_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  post_text_hash text not null,
  post_text_excerpt text,
  input_token_estimate int,
  output_token_estimate int,
  provider text not null,
  model text not null,
  comments jsonb not null,
  created_at timestamptz not null default now()
);
```

Store only an excerpt or hash if possible. Do not store full LinkedIn HTML. For beta debugging, full selected text may be temporarily stored behind a clear user consent flag, but default should be minimal storage.

### `usage_events`

```sql
create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null,
  created_at timestamptz not null default now()
);
```

Event types:
- `generate_comment`
- `copy_comment`
- `feedback_submit`
- `quota_blocked`

### `comment_feedback`

```sql
create table public.comment_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  generation_id uuid references public.comment_generations(id) on delete cascade,
  comment_index int not null,
  rating text not null check (rating in ('up', 'down')),
  reason text,
  created_at timestamptz not null default now()
);
```

### `subscriptions`

```sql
create table public.subscriptions (
  user_id uuid primary key references public.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  status text not null default 'free',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 7. API Contracts

### `POST /api/generate-comments`

Request:

```json
{
  "postText": "string",
  "userContext": {
    "displayName": "string",
    "role": "string",
    "offer": "string",
    "targetAudience": "string",
    "tonePreference": "professional_warm",
    "writingSample": "string | null"
  },
  "generationMode": "standard"
}
```

Response:

```json
{
  "generationId": "uuid",
  "comments": [
    {
      "type": "supportive_additive",
      "text": "string",
      "rationale": "string"
    },
    {
      "type": "insightful_question",
      "text": "string",
      "rationale": "string"
    },
    {
      "type": "respectful_contrarian",
      "text": "string",
      "rationale": "string"
    }
  ],
  "quota": {
    "plan": "free",
    "usedToday": 1,
    "dailyLimit": 5
  }
}
```

Errors:

```json
{
  "error": {
    "code": "quota_exceeded",
    "message": "You have used your 5 free generations today."
  }
}
```

Error codes:
- `unauthorized`
- `quota_exceeded`
- `invalid_input`
- `llm_provider_error`
- `rate_limited`
- `internal_error`

### `POST /api/feedback`

Request:

```json
{
  "generationId": "uuid",
  "commentIndex": 0,
  "rating": "up",
  "reason": "Specific and natural"
}
```

Response:

```json
{
  "ok": true
}
```

### `GET /api/me/usage`

Response:

```json
{
  "plan": "free",
  "usedToday": 3,
  "dailyLimit": 5,
  "canGenerate": true
}
```

---

## 8. LLM Provider Abstraction

Create interface:

```ts
export interface CommentGenerationProvider {
  generateComments(input: GenerateCommentsInput): Promise<GenerateCommentsResult>;
}
```

Provider implementation:
- `OpenAICommentProvider`
- Optional later: `AnthropicCommentProvider`
- Test provider: `FakeCommentProvider`

The backend route should depend on the interface, not a concrete SDK.

### Model routing for the application runtime

Do not use one expensive model for every request.

Use model routing:

| Runtime task | Recommended model class | Reason |
|---|---|---|
| Normal comment generation | Fast, low-cost model | Most generations are simple |
| Rewrite after user downvote | Better reasoning/writing model | Needs quality improvement |
| Prompt evaluation in offline test suite | Stronger model or human review | Quality benchmark, not every request |
| Safety/risk classification | Cheap classifier or deterministic heuristic first | Avoid unnecessary expensive calls |

Configuration variables:

```txt
LLM_PROVIDER=openai
LLM_DEFAULT_MODEL=<fast-low-cost-model>
LLM_QUALITY_MODEL=<stronger-model>
LLM_MAX_INPUT_CHARS=6000
LLM_TIMEOUT_MS=15000
```

Do not hardcode model IDs throughout the codebase. Keep them in environment/config.

---

## 9. Prompt Builder Contract

`buildCommentPrompt(input)` must return:
- `system`
- `developer`
- `user`
- `responseSchema`

The prompt must instruct:
- Generate exactly 3 comments.
- Return strict JSON.
- Do not include markdown.
- Do not invent personal experience.
- Do not pitch the user's service.
- Do not use generic praise.
- Keep comments concise.
- Comment as the user, not as an AI assistant.
- Use the selected post text as primary source.

Example output type:

```ts
export type GeneratedComment = {
  type: 'supportive_additive' | 'insightful_question' | 'respectful_contrarian';
  text: string;
  rationale: string;
};
```

---

## 10. Extension Messaging

### Content script

Responsibilities:
- Read current selected text only.
- Send selected text to background/side panel.
- Avoid DOM scraping.
- Avoid mutation of LinkedIn page.
- Avoid injecting UI into LinkedIn page in v1.

### Background service worker

Responsibilities:
- Listen for extension icon click.
- Open side panel.
- Manage message passing if required.
- Do not store secrets.
- Do not perform background crawling.

### Side panel

Responsibilities:
- Display selected/pasted post text.
- Display user context form.
- Call backend.
- Display loading/error/success states.
- Display 3 comments.
- Copy comment.
- Send feedback.

---

## 11. Authentication

MVP options:

### Option A — No auth for earliest local prototype

Use anonymous local usage only.

Pros:
- Fastest development.
- Good for local testing.

Cons:
- Cannot enforce real quotas or billing.

### Option B — Supabase Auth

Use Supabase Auth for beta.

Pros:
- Works with Stripe.
- Allows quota enforcement.
- Good enough for MVP.

Recommendation:
- Build walking skeleton with Option A.
- Add Supabase Auth before private beta.

---

## 12. Billing

Use Stripe Checkout.

Flow:
1. User clicks Upgrade.
2. Backend creates Stripe Checkout session.
3. User pays.
4. Stripe webhook updates `subscriptions`.
5. Backend quota checks subscription status.
6. Extension displays paid plan state.

Do not build custom billing UI in v1.

---

## 13. Analytics

Use PostHog or a minimal internal event table.

Track:
- `extension_opened`
- `profile_saved`
- `generate_clicked`
- `generation_success`
- `generation_failed`
- `comment_copied`
- `feedback_up`
- `feedback_down`
- `quota_blocked`
- `upgrade_clicked`
- `checkout_completed`

Do not track:
- Full browsing history.
- LinkedIn URLs by default.
- Private profile details.
- LinkedIn cookies/session data.

---

## 14. Error Handling

Every API response must have a typed success/error shape.

User-facing errors:
- No text selected: "Select text from a post or paste it here."
- Quota exceeded: "You used your 5 free generations today."
- AI failure: "Could not generate comments right now. Try again."
- Auth expired: "Please sign in again."
- Network issue: "Connection issue. Try again."

Never expose raw stack traces to the extension UI.

---

## 15. Security Requirements

- No secrets in extension.
- Validate `postText` length.
- Rate limit by user ID and IP.
- Enforce quota server-side.
- Verify Stripe webhook signatures.
- Use RLS policies in Supabase.
- Use least-privilege extension permissions.
- Avoid broad host permissions where possible.
- Do not request permissions that are not required.

Suggested extension permissions:
- `activeTab`
- `sidePanel`
- `storage`

Avoid:
- Broad `<all_urls>` unless absolutely required.
- `tabs` unless a clear need exists.
- `cookies`
- `webRequest`

---

## 16. Local Development Environment

Expected commands:

```bash
pnpm install
pnpm dev
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm build
```

Suggested root `package.json` scripts:

```json
{
  "scripts": {
    "dev": "pnpm --parallel --filter @prospectwarm/extension --filter @prospectwarm/web dev",
    "test": "pnpm test:unit && pnpm test:integration && pnpm test:e2e",
    "test:unit": "pnpm -r test:unit",
    "test:integration": "pnpm -r test:integration",
    "test:e2e": "pnpm --filter @prospectwarm/extension test:e2e",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "build": "pnpm -r build"
  }
}
```

---

## 17. Environment Variables

Backend/web:

```txt
NEXT_PUBLIC_APP_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
POSTHOG_KEY=
SENTRY_DSN=
LLM_PROVIDER=openai
OPENAI_API_KEY=
LLM_DEFAULT_MODEL=
LLM_QUALITY_MODEL=
LLM_TIMEOUT_MS=15000
LLM_MAX_INPUT_CHARS=6000
```

Extension:

```txt
WXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Rules:
- Extension can only receive public variables prefixed by the framework's public prefix.
- Do not expose service role keys or LLM keys to extension.

---

## 18. CI/CD

Use GitHub Actions.

CI required checks:
- Install
- Typecheck
- Lint
- Unit tests
- Integration tests with mocks
- E2E tests against local mock page
- Build extension
- Build web

Do not require real LLM calls in CI.

Use fake provider for CI:
```txt
LLM_PROVIDER=fake
```

---

## 19. Deployment

### Web/backend

Deploy to Vercel.

### Database

Supabase project.

### Extension

For beta:
- Load unpacked extension locally.
- Then private Chrome Web Store listing or limited distribution.

Chrome Web Store checklist:
- Privacy policy exists.
- Permission justification is narrow.
- Extension does not auto-post.
- No remote executable code.
- No hidden behavior.
- Clear description of data usage.

---

## 20. Future Architecture

Only after v1 validation:

### Prospect lists

User manually saves prospect name/profile URL. No background crawling.

### Warm-up tracker

Track:
- Person
- Last comment copied
- Last engagement date
- Notes
- Status

### Voice matching

User pastes writing samples manually or imports from their own text by consent.

### Team version

Only after solo user retention is proven.

---

## 21. Architecture Definition of Done

A technical change is done only when:
- Types compile.
- Unit tests pass.
- Integration tests pass if API changed.
- E2E tests pass if user flow changed.
- No secrets are exposed.
- No auto-posting or background scraping introduced.
- Error state is handled.
- Loading state is handled.
- Docs updated if behavior changed.
