import test from 'node:test';
import assert from 'node:assert/strict';
import { postFeedback } from '../../dist/src/index.js';

function createMemoryRepository() {
  const records = [];
  return {
    records,
    save(record) {
      records.push(record);
    }
  };
}

test('valid feedback is saved', () => {
  const repository = createMemoryRepository();

  const response = postFeedback(
    {
      generationId: 'gen_123',
      rating: 'up',
      reason: 'This felt natural and specific.'
    },
    repository
  );

  assert.equal(response.status, 200);
  assert.equal(repository.records.length, 1);
});

test('invalid rating is rejected', () => {
  const response = postFeedback({
    generationId: 'gen_123',
    rating: 'maybe'
  });

  assert.equal(response.status, 400);
  if (response.status === 400) {
    assert.equal(response.body.error, 'invalid_feedback');
  }
});

test('reason over max length is rejected', () => {
  const response = postFeedback({
    generationId: 'gen_123',
    rating: 'down',
    reason: 'x'.repeat(281)
  });

  assert.equal(response.status, 400);
});
