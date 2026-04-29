import type {
  CommentType,
  GeneratedComment,
  ParseCommentResponseResult
} from '../types/comments.js';

const VALID_TYPES: CommentType[] = [
  'supportive_additive',
  'insightful_question',
  'respectful_contrarian'
];

function stripMarkdownFence(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('```')) return trimmed;

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidType(value: unknown): value is CommentType {
  return typeof value === 'string' && VALID_TYPES.includes(value as CommentType);
}

function validateComment(comment: unknown): comment is GeneratedComment {
  if (typeof comment !== 'object' || comment === null) return false;
  const candidate = comment as { type?: unknown; text?: unknown };
  return isValidType(candidate.type) && isNonEmptyString(candidate.text);
}

export function parseCommentResponse(rawResponse: string): ParseCommentResponseResult {
  const normalized = stripMarkdownFence(rawResponse);

  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    return {
      ok: false,
      error: 'invalid_json',
      message: 'Response is not valid JSON.'
    };
  }

  if (typeof parsed !== 'object' || parsed === null || !('comments' in parsed)) {
    return {
      ok: false,
      error: 'invalid_shape',
      message: 'Response must include a comments array.'
    };
  }

  const comments = (parsed as { comments?: unknown }).comments;
  if (!Array.isArray(comments)) {
    return {
      ok: false,
      error: 'invalid_shape',
      message: 'comments must be an array.'
    };
  }

  if (comments.length !== 3) {
    return {
      ok: false,
      error: 'invalid_count',
      message: 'Exactly 3 comments are required.'
    };
  }

  if (!comments.every(validateComment)) {
    return {
      ok: false,
      error: 'invalid_comment',
      message: 'Each comment must include a valid type and non-empty text.'
    };
  }

  return {
    ok: true,
    comments
  };
}
