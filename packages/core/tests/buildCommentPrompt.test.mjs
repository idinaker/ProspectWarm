import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCommentPrompt } from '../dist/index.js';

test('buildCommentPrompt includes post text and strict JSON requirement', () => {
  const prompt = buildCommentPrompt({
    postText: 'Founders should comment with specific insights, not generic praise.'
  });

  assert.match(prompt, /Generate exactly 3 comments/i);
  assert.match(prompt, /strict JSON format/i);
  assert.match(prompt, /Selected post text:/i);
});

test('buildCommentPrompt includes user context when present', () => {
  const prompt = buildCommentPrompt({
    postText: 'Post body',
    userContext: {
      role: 'B2B consultant',
      offer: 'LinkedIn growth advisory',
      targetAudience: 'Agency founders',
      tone: 'Practical',
      writingSample: 'I usually lead with an observation and one tactical takeaway.'
    }
  });

  assert.match(prompt, /Role: B2B consultant/);
  assert.match(prompt, /Offer: LinkedIn growth advisory/);
  assert.match(prompt, /Target audience: Agency founders/);
  assert.match(prompt, /Tone preference: Practical/);
  assert.match(prompt, /Writing sample:/);
});
