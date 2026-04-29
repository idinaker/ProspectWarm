import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadProfileContext,
  saveProfileContext,
  buildPromptInput
} from '../dist/index.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    }
  };
}

test('save and load profile context roundtrips normalized values', () => {
  const storage = createMemoryStorage();
  saveProfileContext(storage, {
    role: ' Founder ',
    offer: ' Advisory ',
    targetAudience: ' B2B SaaS ',
    tone: ' Practical ',
    writingSample: '  Keep it concrete. '
  });

  const loaded = loadProfileContext(storage);
  assert.deepEqual(loaded, {
    role: 'Founder',
    offer: 'Advisory',
    targetAudience: 'B2B SaaS',
    tone: 'Practical',
    writingSample: 'Keep it concrete.'
  });
});

test('loadProfileContext returns null for malformed data', () => {
  const storage = createMemoryStorage();
  storage.setItem('prospectwarm.profile_context.v1', '{not-json');
  assert.equal(loadProfileContext(storage), null);
});

test('buildPromptInput maps profile context into core userContext shape', () => {
  const input = buildPromptInput('Selected post', {
    role: 'Consultant',
    offer: 'Messaging',
    targetAudience: 'Agencies',
    tone: 'Direct',
    writingSample: 'I like crisp comments.'
  });

  assert.equal(input.userContext.role, 'Consultant');
  assert.equal(input.userContext.offer, 'Messaging');
  assert.equal(input.userContext.targetAudience, 'Agencies');
  assert.equal(input.userContext.tone, 'Direct');
});
