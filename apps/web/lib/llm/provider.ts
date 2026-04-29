export interface GenerateCommentsProviderInput {
  postText: string;
}

export interface LlmProvider {
  generateComments(input: GenerateCommentsProviderInput): Promise<string>;
}

export interface ProviderConfig {
  provider: 'fake' | 'openai';
  openAiApiKey?: string;
}

class FakeLlmProvider implements LlmProvider {
  public async generateComments(input: GenerateCommentsProviderInput): Promise<string> {
    const excerpt = input.postText.length > 80 ? `${input.postText.slice(0, 77)}...` : input.postText;

    return JSON.stringify({
      comments: [
        {
          type: 'supportive_additive',
          text: `Great point in your post about "${excerpt}". One practical addition is to include a concrete before/after example.`
        },
        {
          type: 'insightful_question',
          text: `Interesting take on "${excerpt}". What signal tells you this is working earlier in the process?`
        },
        {
          type: 'respectful_contrarian',
          text: `Helpful perspective on "${excerpt}". One caveat is that this can vary by buyer maturity and deal complexity.`
        }
      ]
    });
  }
}

class OpenAiLlmProvider implements LlmProvider {
  private readonly openAiApiKey?: string;

  public constructor(openAiApiKey?: string) {
    this.openAiApiKey = openAiApiKey;
  }

  public async generateComments(_input: GenerateCommentsProviderInput): Promise<string> {
    if (!this.openAiApiKey) {
      throw new Error('OPENAI_API_KEY is required when LLM_PROVIDER=openai.');
    }

    throw new Error('OpenAI provider adapter is configured but network invocation is not implemented in this scaffold slice.');
  }
}

export function createLlmProvider(config: ProviderConfig): LlmProvider {
  if (config.provider === 'openai') {
    return new OpenAiLlmProvider(config.openAiApiKey);
  }

  return new FakeLlmProvider();
}
