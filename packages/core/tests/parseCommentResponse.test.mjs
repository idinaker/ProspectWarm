import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCommentResponse } from '../dist/index.js';

test('parseCommentResponse accepts valid JSON with exactly 3 comments', () => {
  const result = parseCommentResponse(JSON.stringify({
    comments: [
      { type: 'supportive_additive', text: 'Strong point about hiring focus.' },
      { type: 'insightful_question', text: 'How did you validate this with early customers?' },
      { type: 'respectful_contrarian', text: 'One caveat: this may vary by deal cycle length.' }
    ]
  }));

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.comments.length, 3);
  }
});

test('parseCommentResponse strips markdown fences', () => {
  const raw = [
    '```json',
    '{"comments":[{"type":"supportive_additive","text":"A"},{"type":"insightful_question","text":"B"},{"type":"respectful_contrarian","text":"C"}]}',
    '```'
  ].join('\n');

  const result = parseCommentResponse(raw);
  assert.equal(result.ok, true);
});

test('parseCommentResponse rejects invalid counts', () => {
  const result = parseCommentResponse(JSON.stringify({
    comments: [{ type: 'supportive_additive', text: 'Only one comment' }]
  }));

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, 'invalid_count');
  }
});

test('parseCommentResponse rejects invalid comment shape', () => {
  const result = parseCommentResponse(JSON.stringify({
    comments: [
      { type: 'supportive_additive', text: 'A' },
      { type: 'insightful_question', text: '' },
      { type: 'respectful_contrarian', text: 'C' }
    ]
  }));

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, 'invalid_comment');
  }
});
