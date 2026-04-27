# PRD.md — LinkedIn Comment Intelligence

## 1. Product Name

Working name: **ProspectWarm**
Alternative names:
- Comment Intelligence
- WarmComment
- SignalReply
- Prospect Comment Copilot

Use `ProspectWarm` internally until final branding is decided.

---

## 2. Product Thesis

B2B founders, consultants, agency owners, and independent operators know that thoughtful LinkedIn commenting can create visibility, trust, and warm conversations. The problem is that writing relevant, non-generic comments every day is slow, mentally draining, and risky because generic AI comments can make the user look lazy or spammy.

**ProspectWarm helps users turn selected LinkedIn post text into 3 thoughtful, context-aware comment options in under 30 seconds, while keeping the user fully human-in-the-loop.**

The product must never auto-post, mass-scrape, or automate LinkedIn engagement.

---

## 3. Primary User

### Initial ICP

**Solo B2B founders, consultants, fractional operators, and small agency owners who sell services through LinkedIn.**

### Why this ICP first

They:
- Directly connect LinkedIn engagement to revenue.
- Can buy a $12–$29/month tool without procurement.
- Need to warm up prospects before sending DMs.
- Have stronger pain than casual LinkedIn users.
- Are likely to test lightweight tools quickly.
- Care deeply about sounding credible under their own name.

### Secondary ICPs, not v1 focus

Do not optimize v1 for these groups:
- Recruiters
- Enterprise SDR teams
- Job seekers
- Content creators
- Personal branding coaches
- Social media agencies managing many accounts
- People looking for full LinkedIn automation

These may be considered later after the initial wedge is validated.

---

## 4. Core Problem

### Problem statement

B2B operators need to comment on target prospects' LinkedIn posts to build familiarity before outreach, but writing comments that are specific, thoughtful, and non-generic takes too much time and often gets skipped.

### Painful moment

The user sees a useful prospect or influencer post and thinks:

> "I should comment on this, but I do not know what to say that sounds thoughtful, relevant, and not like AI."

### Current alternatives

| Alternative | Weakness |
|---|---|
| Manual commenting | Slow, inconsistent, mentally draining |
| Raw ChatGPT copy-paste | Requires context switching; often generic |
| Existing LinkedIn engagement tools | Often broad, expensive, or spam-adjacent |
| VA/social media assistant | Expensive, quality varies, lacks personal voice |
| Doing nothing | No relationship warm-up; cold outreach remains cold |

---

## 5. Product Positioning

### Do not position as

> AI LinkedIn comment generator.

This sounds generic, cheap, spammy, and easy to copy.

### Position as

> A human-in-the-loop LinkedIn engagement assistant that helps B2B founders and consultants warm up prospects with thoughtful comments in their own voice.

### MVP promise

> From blank comment box to credible, personalized comment in 30 seconds.

### Revenue promise

> Warm up prospects before outreach without spending 30–60 minutes a day writing comments.

---

## 6. MVP Scope

### v1 must do

1. User installs Chrome extension.
2. User visits a LinkedIn post or any page containing post-like text.
3. User manually highlights/selects post text.
4. User opens extension side panel.
5. Extension reads selected text only.
6. User can enter and save:
   - Their name or role
   - What they sell
   - Target audience
   - Tone preference
   - Optional writing sample
7. User clicks **Generate Comments**.
8. Backend calls an LLM through a provider abstraction.
9. User receives exactly 3 comment options:
   - Supportive/additive
   - Insightful/question-based
   - Respectfully contrarian or perspective-expanding
10. User can copy a comment.
11. User manually edits and posts on LinkedIn.
12. App tracks usage count.
13. Free plan is limited to 5 generations/day.
14. Paid plan unlocks higher usage.
15. User can submit thumbs-up/thumbs-down feedback per generated comment.

### v1 must not do

- No auto-posting.
- No auto-commenting.
- No background crawling.
- No prospect monitoring.
- No reading last 5 posts automatically.
- No scraping profiles.
- No connection requests.
- No DMs.
- No hidden LinkedIn automation.
- No injecting comments directly into LinkedIn comment boxes.
- No collecting cookies/session tokens.
- No storing LinkedIn page HTML.
- No pretending comments came from personal experience if user did not provide it.

---

## 7. Success Metrics

### Activation metrics

- Extension installed.
- User completes profile setup.
- User generates first set of comments.
- User copies at least one comment.

### Engagement metrics

- Generations per active user per week.
- Comments copied per generation.
- Repeat usage on 3 separate days in a week.
- Percentage of generated options rated useful.

### Quality metrics

- % comments rated "postable with light/no edits".
- % comments marked "sounds generic".
- % comments marked "sounds like AI".
- Average edit distance between generated and copied comment if tracked.
- User feedback reasons for downvotes.

### Business metrics

- Free-to-paid conversion.
- Monthly active paid users.
- Gross churn.
- MRR.
- API cost per active user.
- Margin after API + infrastructure + Stripe.

### MVP validation thresholds

A private beta can proceed to public MVP only if:
- 10 beta users complete onboarding.
- At least 6 use it on more than one day.
- At least 5 copy at least one comment.
- At least 60% of rated comments are marked useful/postable.
- At least 2 users are willing to pay or have paid.

---

## 8. Pricing Hypothesis

### Free

- 5 generations/day.
- Basic tone selection.
- Manual selected-text workflow.
- Feedback allowed.

### Starter — $12/month or $99/year

- Higher or unlimited generations subject to fair use.
- Saved user positioning.
- Comment history.
- Copy history.
- Better prompt presets.

### Pro — $24–$29/month later

Do not build this in v1.

Potential Pro features:
- Prospect lists.
- Warm-up tracker.
- Comment history by person.
- Voice matching from writing samples.
- Weekly engagement plan.
- CRM export.
- Advanced quality scoring.

---

## 9. Core User Stories

### Story 1 — Capture selected post text

As a LinkedIn user, I want to select post text and open the extension so that I can generate comments from context I explicitly chose.

Acceptance criteria:
- User can select text on a page.
- Extension side panel displays selected text.
- If no text is selected, extension asks user to paste text manually.
- Extension must not crawl page content beyond explicit selection unless user pastes it.
- Unit and E2E tests cover selected-text and no-selection states.

### Story 2 — Save user positioning

As a B2B founder or consultant, I want to save my positioning once so that comments reflect who I am and who I serve.

Acceptance criteria:
- User can save role, offer, target audience, tone, and optional writing sample.
- Data persists across sessions.
- User can edit or clear this information.
- No sensitive data is required.
- Unit tests cover save, update, clear, and validation.

### Story 3 — Generate 3 comments

As a user, I want 3 different comment options so that I can choose the one that best fits my intent.

Acceptance criteria:
- Backend returns exactly 3 options.
- Options are distinct in angle.
- Options are concise.
- Options reference the selected post content.
- Options avoid generic phrases such as "Great post", "Thanks for sharing", "Couldn't agree more", unless specifically justified by context.
- Options do not fabricate personal experiences or unsupported claims.
- Tests cover successful generation, malformed LLM output, empty input, and provider failure.

### Story 4 — Copy manually

As a user, I want to copy a comment so that I can manually edit and post it.

Acceptance criteria:
- Copy button copies exact comment text.
- UI confirms copy success.
- No comment is posted automatically.
- No LinkedIn comment box is modified by the extension.
- E2E test verifies copy behavior.

### Story 5 — Usage limits

As a product owner, I want free usage limited so that API costs are controlled and there is a reason to upgrade.

Acceptance criteria:
- Free users can generate up to 5 times per calendar day.
- Paid users receive higher/unlimited usage based on plan.
- Quota resets daily.
- Backend enforces quota, not only client-side.
- Tests cover free limit, reset, paid bypass, unauthenticated state.

### Story 6 — Feedback loop

As a product owner, I want users to rate comments so that prompt quality improves over time.

Acceptance criteria:
- User can rate each option thumbs up/down.
- User can optionally provide reason.
- Feedback event stores generated comment ID, rating, reason, and timestamp.
- No full LinkedIn HTML is stored.
- Tests cover feedback write success/failure.

---

## 10. Functional Requirements

### Extension

- Chrome extension using Manifest V3.
- React + TypeScript UI.
- Side panel as primary UI.
- Selected-text capture.
- Manual paste fallback.
- Local storage for non-sensitive preferences.
- Auth/session token storage must be secure and minimal.
- No secrets in extension bundle.

### Backend

- API endpoint: `POST /api/generate-comments`
- API endpoint: `POST /api/feedback`
- API endpoint: `GET /api/me/usage`
- API endpoint: `POST /api/billing/checkout`
- API endpoint: `POST /api/webhooks/stripe`
- LLM provider abstraction.
- Quota enforcement.
- Usage logging.
- Subscription status sync.

### Database

Minimum tables:
- `users`
- `user_profiles`
- `usage_events`
- `comment_generations`
- `comment_feedback`
- `subscriptions`

### AI

The AI system must:
- Generate only comment drafts.
- Avoid auto-posting instructions.
- Avoid manipulative engagement.
- Avoid pretending to know the target personally.
- Avoid fake personal experience.
- Return structured JSON.
- Support fallback parsing if output is malformed.

---

## 11. Non-Functional Requirements

### Security

- Never expose LLM API keys in extension.
- Validate and rate-limit backend requests.
- Use server-side quota enforcement.
- Store only necessary data.
- Do not store LinkedIn cookies, tokens, or private profile data.
- Sanitize user inputs.
- Log errors without sensitive content where possible.

### Privacy

- Collect only:
  - User email
  - Saved positioning
  - Selected/pasted post text for generation
  - Generated outputs
  - Usage events
  - Feedback ratings
- Add settings to delete saved profile/context.
- Document what is stored in privacy policy.
- Do not collect background browsing history.

### Compliance posture

The product must be designed as a human-in-the-loop writing assistant:
- User selects or pastes text.
- User initiates generation.
- User reviews, edits, copies, and manually posts.
- No automated LinkedIn activity.

### Performance

- Side panel should load in < 1 second after extension is warm.
- Comment generation target: < 8 seconds p95.
- UI must show loading state and allow retry.
- API timeouts should be handled gracefully.

---

## 12. Prompt Requirements

The prompt builder must produce structured prompts with:

Inputs:
- Selected post text
- User role
- User offer
- User target audience
- Tone preference
- Optional writing sample
- Selected output style

Output:
- Strict JSON with `comments: [{type, text, rationale}]`
- Exactly 3 comments
- No markdown wrapper
- No extra text outside JSON

Comment types:
1. `supportive_additive`
2. `insightful_question`
3. `respectful_contrarian`

Quality rules:
- Reference at least one concrete idea from the post.
- Avoid generic praise.
- Avoid buzzword stuffing.
- Avoid fake personal experience.
- Avoid sounding like an advertisement.
- No pitch unless the user explicitly asks for pitch-style comment, which is not part of v1.
- Keep each comment generally between 180 and 600 characters.
- Use plain, natural language.

---

## 13. Delivery Methodology

Use **Plan-Gated Vertical Slice Development with Test-First Implementation**.

Each feature must follow this order:

1. Write or update acceptance criteria.
2. Write tests first.
3. Implement the smallest code to pass.
4. Run unit tests.
5. Run integration tests if API is involved.
6. Run E2E test if user flow changed.
7. Refactor.
8. Update docs.
9. Produce a short change summary.

Codex should not implement multiple unrelated features in one task.

---

## 14. Launch Plan

### Private beta

- 10–20 users.
- Manual install or private Chrome extension distribution.
- Track quality and repeated use.
- Interview users after 3 sessions.

### Public beta

- Chrome Web Store listing.
- Landing page.
- Free tier.
- Product Hunt launch only after retention signals.

### Distribution experiments

- LinkedIn posts showing before/after comment quality.
- Programmatic SEO pages:
  - "LinkedIn comment examples for consultants"
  - "How to comment on prospect posts"
  - "LinkedIn warm-up before cold DM"
- Chrome Web Store keyword optimization.
- Founder-led LinkedIn content.

---

## 15. Risk Register

| Risk | Severity | Mitigation |
|---|---:|---|
| LinkedIn blocks extension behavior | High | Selected-text only; no auto-posting; no crawling |
| Comments sound generic | High | Prompt quality test suite; feedback loop; human review |
| Users do not use daily | High | Focus on prospect warm-up workflow later |
| Free alternatives good enough | Medium | Differentiate on voice, quality, workflow |
| API costs rise | Medium | Quotas, caching, model routing, shorter prompts |
| Chrome Web Store review delay | Medium | Submit early; avoid risky permissions |
| Payment friction | Low | Start with Stripe Checkout |
| Data privacy concerns | Medium | Minimal data collection; clear privacy policy |

---

## 16. Definition of MVP Done

The MVP is done when:

- User can install extension locally.
- User can select/paste post text.
- User can save profile context.
- User can generate 3 comments.
- User can copy a comment.
- Backend enforces quotas.
- Feedback can be submitted.
- Unit tests pass.
- Integration tests pass.
- E2E selected-text-to-copy flow passes.
- No auto-posting exists.
- No LinkedIn background scraping exists.
- No secrets are present in frontend/extension.
- README or setup docs allow a new developer/agent to run locally.
