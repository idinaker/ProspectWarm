import { createLlmProvider, type LlmProvider } from '../../../lib/llm/provider.js';
import { parseProviderResponse } from '../../../lib/llm/parseProviderResponse.js';
import { enforceQuota } from '../../../lib/quota/quotaEnforcement.js';
import { validateGenerateCommentsRequest } from '../../../lib/validation/generateComments.js';

export interface GenerateCommentsSuccess {
  status: 200;
  body: {
    comments: {
      type: 'supportive_additive' | 'insightful_question' | 'respectful_contrarian';
      text: string;
    }[];
    provider: 'fake' | 'openai';
  };
}

export interface GenerateCommentsFailure {
  status: 400 | 402 | 502;
  body: {
    error: 'invalid_input' | 'provider_error' | 'quota_exceeded';
    message: string;
  };
}

export type GenerateCommentsResponse = GenerateCommentsSuccess | GenerateCommentsFailure;

interface RouteDependencies {
  provider?: LlmProvider;
  providerName?: 'fake' | 'openai';
  usageLookup?: {
    isPaid: boolean;
    usageCountToday: number;
  };
}

function readEnv(name: string): string | undefined {
  const processRef = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return processRef.process?.env?.[name];
}

export async function postGenerateComments(
  body: unknown,
  dependencies: RouteDependencies = {}
): Promise<GenerateCommentsResponse> {
  const validationResult = validateGenerateCommentsRequest(body);

  if ('code' in validationResult) {
    return {
      status: 400,
      body: {
        error: validationResult.code,
        message: validationResult.message
      }
    };
  }

  const quotaDecision = enforceQuota(
    dependencies.usageLookup ?? {
      isPaid: false,
      usageCountToday: 0
    }
  );

  if (!quotaDecision.allowed) {
    return {
      status: 402,
      body: {
        error: 'quota_exceeded',
        message: `Free daily limit reached (${quotaDecision.limit}). Upgrade to continue.`
      }
    };
  }

  const providerName = dependencies.providerName ?? (readEnv('LLM_PROVIDER') === 'openai' ? 'openai' : 'fake');
  const provider =
    dependencies.provider ??
    createLlmProvider({
      provider: providerName,
      openAiApiKey: readEnv('OPENAI_API_KEY')
    });

  try {
    const rawResponse = await provider.generateComments({ postText: validationResult.postText });
    const parsed = parseProviderResponse(rawResponse);

    if (!parsed.ok) {
      return {
        status: 502,
        body: {
          error: 'provider_error',
          message: `Provider output validation failed: ${parsed.error}`
        }
      };
    }

    return {
      status: 200,
      body: {
        comments: parsed.comments,
        provider: providerName
      }
    };
  } catch (error) {
    return {
      status: 502,
      body: {
        error: 'provider_error',
        message: error instanceof Error ? error.message : 'Unknown provider error.'
      }
    };
  }
}
