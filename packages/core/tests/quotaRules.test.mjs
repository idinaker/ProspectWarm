import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDailyQuota } from '../dist/index.js';

test('free user under limit is allowed', () => {
  const result = evaluateDailyQuota({ isPaid: false, usageCountToday: 3 });
  assert.equal(result.allowed, true);
});

test('free user at limit is denied', () => {
  const result = evaluateDailyQuota({ isPaid: false, usageCountToday: 5 });
  assert.equal(result.allowed, false);
  if (!result.allowed) {
    assert.equal(result.reason, 'quota_exceeded');
    assert.equal(result.limit, 5);
  }
});

test('paid user bypasses free quota', () => {
  const result = evaluateDailyQuota({ isPaid: true, usageCountToday: 999 });
  assert.equal(result.allowed, true);
});
