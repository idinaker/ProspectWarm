import type { BuildCommentPromptInput } from '../types/comments.js';

const MAX_POST_TEXT_CHARS = 6000;

function sanitizeText(raw: string): string {
  return raw.trim().slice(0, MAX_POST_TEXT_CHARS);
}

export function buildCommentPrompt(input: BuildCommentPromptInput): string {
  const postText = sanitizeText(input.postText);

  const contextLines: string[] = [];
  if (input.userContext?.role) contextLines.push(`Role: ${input.userContext.role}`);
  if (input.userContext?.offer) contextLines.push(`Offer: ${input.userContext.offer}`);
  if (input.userContext?.targetAudience) contextLines.push(`Target audience: ${input.userContext.targetAudience}`);
  if (input.userContext?.tone) contextLines.push(`Tone preference: ${input.userContext.tone}`);
  if (input.userContext?.writingSample) {
    contextLines.push(`Writing sample: ${sanitizeText(input.userContext.writingSample)}`);
  }

  const contextBlock = contextLines.length > 0 ? contextLines.join('\n') : 'No additional user context provided.';

  return [
    'You are generating LinkedIn comment drafts for a human-in-the-loop workflow.',
    'Generate exactly 3 comments in strict JSON format with no markdown fences and no prose.',
    'Never include automation instructions or claims of personal experience not provided by the user.',
    'Output JSON schema:',
    '{"comments":[{"type":"supportive_additive","text":"..."},{"type":"insightful_question","text":"..."},{"type":"respectful_contrarian","text":"..."}]}',
    '',
    'User context:',
    contextBlock,
    '',
    'Selected post text:',
    postText
  ].join('\n');
}
