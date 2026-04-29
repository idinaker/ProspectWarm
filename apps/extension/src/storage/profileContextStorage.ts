import type { UserProfileContext } from '../profile/types.js';

export interface ProfileStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const PROFILE_CONTEXT_STORAGE_KEY = 'prospectwarm.profile_context.v1';

function normalizeValue(value: string): string {
  return value.trim();
}

export function normalizeProfileContext(input: UserProfileContext): UserProfileContext {
  const normalized: UserProfileContext = {
    role: normalizeValue(input.role),
    offer: normalizeValue(input.offer),
    targetAudience: normalizeValue(input.targetAudience),
    tone: normalizeValue(input.tone)
  };

  if (typeof input.writingSample === 'string' && input.writingSample.trim().length > 0) {
    normalized.writingSample = input.writingSample.trim();
  }

  return normalized;
}

export function saveProfileContext(adapter: ProfileStorageAdapter, input: UserProfileContext): UserProfileContext {
  const normalized = normalizeProfileContext(input);
  adapter.setItem(PROFILE_CONTEXT_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function loadProfileContext(adapter: ProfileStorageAdapter): UserProfileContext | null {
  const raw = adapter.getItem(PROFILE_CONTEXT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  const candidate = parsed as Partial<UserProfileContext>;
  if (
    typeof candidate.role !== 'string' ||
    typeof candidate.offer !== 'string' ||
    typeof candidate.targetAudience !== 'string' ||
    typeof candidate.tone !== 'string'
  ) {
    return null;
  }

  return normalizeProfileContext({
    role: candidate.role,
    offer: candidate.offer,
    targetAudience: candidate.targetAudience,
    tone: candidate.tone,
    writingSample: typeof candidate.writingSample === 'string' ? candidate.writingSample : undefined
  });
}
