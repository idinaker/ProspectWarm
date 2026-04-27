import { describe, expect, it } from 'vitest';

import { pingCore } from '../src/index.js';

describe('pingCore', () => {
  it('returns the core scaffold marker', () => {
    expect(pingCore()).toBe('prospectwarm-core');
  });
});
