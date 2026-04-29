export type CommentType = 'supportive_additive' | 'insightful_question' | 'respectful_contrarian';

export interface GeneratedComment {
  type: CommentType;
  text: string;
}

export interface UserContext {
  role?: string;
  offer?: string;
  targetAudience?: string;
  tone?: string;
  writingSample?: string;
}

export interface BuildCommentPromptInput {
  postText: string;
  userContext?: UserContext;
}

export interface ParseCommentResponseSuccess {
  ok: true;
  comments: GeneratedComment[];
}

export interface ParseCommentResponseError {
  ok: false;
  error: 'invalid_json' | 'invalid_shape' | 'invalid_count' | 'invalid_comment';
  message: string;
}

export type ParseCommentResponseResult = ParseCommentResponseSuccess | ParseCommentResponseError;
