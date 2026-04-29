export interface GenerateCommentsRequest {
  postText: string;
}

export interface ValidationError {
  code: 'invalid_input';
  message: string;
}

export function validateGenerateCommentsRequest(payload: unknown): GenerateCommentsRequest | ValidationError {
  if (typeof payload !== 'object' || payload === null) {
    return { code: 'invalid_input', message: 'Request body must be an object.' };
  }

  const candidate = payload as { postText?: unknown };
  if (typeof candidate.postText !== 'string') {
    return { code: 'invalid_input', message: 'postText must be a string.' };
  }

  const trimmed = candidate.postText.trim();
  if (trimmed.length === 0) {
    return { code: 'invalid_input', message: 'postText cannot be empty.' };
  }

  return { postText: trimmed };
}
