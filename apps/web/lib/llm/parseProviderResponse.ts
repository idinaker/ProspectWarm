export type ProviderCommentType = 'supportive_additive' | 'insightful_question' | 'respectful_contrarian';

export interface ProviderComment {
  type: ProviderCommentType;
  text: string;
}

export interface ParseProviderResponseSuccess {
  ok: true;
  comments: ProviderComment[];
}

export interface ParseProviderResponseError {
  ok: false;
  error: 'invalid_json' | 'invalid_shape' | 'invalid_count' | 'invalid_comment';
}

export type ParseProviderResponseResult = ParseProviderResponseSuccess | ParseProviderResponseError;

const VALID_TYPES: ProviderCommentType[] = [
  'supportive_additive',
  'insightful_question',
  'respectful_contrarian'
];

function isProviderComment(value: unknown): value is ProviderComment {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const comment = value as { type?: unknown; text?: unknown };
  return (
    typeof comment.type === 'string' &&
    VALID_TYPES.includes(comment.type as ProviderCommentType) &&
    typeof comment.text === 'string' &&
    comment.text.trim().length > 0
  );
}

export function parseProviderResponse(raw: string): ParseProviderResponseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'invalid_json' };
  }

  if (typeof parsed !== 'object' || parsed === null || !('comments' in parsed)) {
    return { ok: false, error: 'invalid_shape' };
  }

  const comments = (parsed as { comments?: unknown }).comments;
  if (!Array.isArray(comments)) {
    return { ok: false, error: 'invalid_shape' };
  }

  if (comments.length !== 3) {
    return { ok: false, error: 'invalid_count' };
  }

  if (!comments.every(isProviderComment)) {
    return { ok: false, error: 'invalid_comment' };
  }

  return {
    ok: true,
    comments
  };
}
