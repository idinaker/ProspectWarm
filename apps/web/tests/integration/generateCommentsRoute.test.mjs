import test from 'node:test';
import assert from 'node:assert/strict';
import { postGenerateComments } from '../../dist/src/index.js';

test('default provider is fake and returns exactly 3 comments', async () => {
  const response = await postGenerateComments({
    postText: 'Manually selected post text from a prospect update.'
  });

  assert.equal(response.status, 200);
  if (response.status === 200) {
    assert.equal(response.body.provider, 'fake');
    assert.equal(response.body.comments.length, 3);
  }
});

test('invalid request returns invalid_input error', async () => {
  const response = await postGenerateComments({ postText: '   ' });

  assert.equal(response.status, 400);
  if (response.status === 400) {
    assert.equal(response.body.error, 'invalid_input');
  }
});

test('free user over quota returns quota_exceeded', async () => {
  const response = await postGenerateComments(
    { postText: 'A valid post text.' },
    { usageLookup: { isPaid: false, usageCountToday: 5 } }
  );

  assert.equal(response.status, 402);
  if (response.status === 402) {
    assert.equal(response.body.error, 'quota_exceeded');
  }
});

test('paid user bypasses free quota', async () => {
  const response = await postGenerateComments(
    { postText: 'A valid post text.' },
    { usageLookup: { isPaid: true, usageCountToday: 100 } }
  );

  assert.equal(response.status, 200);
});

test('provider output is parser-validated and malformed output fails safely', async () => {
  const malformedProvider = {
    generateComments: async () => '{"comments":[{"type":"supportive_additive","text":"only one"}]}'
  };

  const response = await postGenerateComments(
    { postText: 'A valid post text.' },
    { provider: malformedProvider, providerName: 'fake' }
  );

  assert.equal(response.status, 502);
  if (response.status === 502) {
    assert.equal(response.body.error, 'provider_error');
  }
});
