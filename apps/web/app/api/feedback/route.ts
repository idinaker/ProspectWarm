import { validateFeedbackRequest } from '../../../lib/validation/feedback.js';

export interface FeedbackRecord {
  generationId: string;
  rating: 'up' | 'down';
  reason?: string;
}

export interface FeedbackRepository {
  save(record: FeedbackRecord): void;
}

class InMemoryFeedbackRepository implements FeedbackRepository {
  private readonly records: FeedbackRecord[] = [];

  public save(record: FeedbackRecord): void {
    this.records.push(record);
  }
}

export interface PostFeedbackSuccess {
  status: 200;
  body: {
    ok: true;
  };
}

export interface PostFeedbackFailure {
  status: 400;
  body: {
    error: 'invalid_feedback';
    message: string;
  };
}

export type PostFeedbackResponse = PostFeedbackSuccess | PostFeedbackFailure;

export function postFeedback(
  body: unknown,
  repository: FeedbackRepository = new InMemoryFeedbackRepository()
): PostFeedbackResponse {
  const validationResult = validateFeedbackRequest(body);
  if ('code' in validationResult) {
    return {
      status: 400,
      body: {
        error: validationResult.code,
        message: validationResult.message
      }
    };
  }

  repository.save(validationResult);

  return {
    status: 200,
    body: {
      ok: true
    }
  };
}
