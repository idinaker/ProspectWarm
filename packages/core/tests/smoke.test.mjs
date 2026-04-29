import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCommentPrompt, parseCommentResponse } from '../dist/index.js';

test('core package exports prompt builder and parser', () => {
  const prompt = buildCommentPrompt({ postText: 'A post body' });
  assert.match(prompt, /A post body/);

  const parsed = parseCommentResponse(
    JSON.stringify({
      comments: [
        { type: 'supportive_additive', text: 'One' },
        { type: 'insightful_question', text: 'Two?' },
        { type: 'respectful_contrarian', text: 'Three.' }
      ]
    })
  );

  assert.equal(parsed.ok, true);
});
