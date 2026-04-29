import type { UserProfileContext } from './types.js';

export interface PromptInputUserContext {
  role?: string;
  offer?: string;
  targetAudience?: string;
  tone?: string;
  writingSample?: string;
}

export interface PromptInput {
  postText: string;
  userContext?: PromptInputUserContext;
}

export function buildPromptInput(postText: string, profile: UserProfileContext): PromptInput {
  return {
    postText,
    userContext: {
      role: profile.role,
      offer: profile.offer,
      targetAudience: profile.targetAudience,
      tone: profile.tone,
      writingSample: profile.writingSample
    }
  };
}
