export type FeedbackRating = 'up' | 'down';

export interface FeedbackRequest {
  generationId: string;
  rating: FeedbackRating;
  reason?: string;
}

export interface FeedbackValidationError {
  code: 'invalid_feedback';
  message: string;
}

const MAX_REASON_LENGTH = 280;

export function validateFeedbackRequest(payload: unknown): FeedbackRequest | FeedbackValidationError {
  if (typeof payload !== 'object' || payload === null) {
    return { code: 'invalid_feedback', message: 'Request body must be an object.' };
  }

  const candidate = payload as { generationId?: unknown; rating?: unknown; reason?: unknown };
  if (typeof candidate.generationId !== 'string' || candidate.generationId.trim().length === 0) {
    return { code: 'invalid_feedback', message: 'generationId is required.' };
  }

  if (candidate.rating !== 'up' && candidate.rating !== 'down') {
    return { code: 'invalid_feedback', message: 'rating must be up or down.' };
  }

  if (typeof candidate.reason !== 'undefined' && typeof candidate.reason !== 'string') {
    return { code: 'invalid_feedback', message: 'reason must be a string when provided.' };
  }

  const normalizedReason = typeof candidate.reason === 'string' ? candidate.reason.trim() : undefined;
  if (normalizedReason && normalizedReason.length > MAX_REASON_LENGTH) {
    return {
      code: 'invalid_feedback',
      message: `reason must be ${MAX_REASON_LENGTH} characters or fewer.`
    };
  }

  return {
    generationId: candidate.generationId.trim(),
    rating: candidate.rating,
    reason: normalizedReason && normalizedReason.length > 0 ? normalizedReason : undefined
  };
}
