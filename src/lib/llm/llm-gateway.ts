import { loadEnv } from '../env.js';
import { logger } from '../log.js';

export interface LlmCompletionRequest {
  system: string;
  user: string;
  maxTokens?: number;
}

export type LlmCompletionResult =
  | { ok: true; text: string; tokensUsed: number }
  | { ok: false; reason: 'budget_exceeded' | 'no_provider' | 'error'; message: string };

export interface LlmAdapter {
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResult>;
}

/** No-op adapter for tests and when LLM_API_KEY is unset. */
export class NoOpLlmAdapter implements LlmAdapter {
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
    return Promise.resolve({
      ok: true,
      text: request.user.slice(0, 500),
      tokensUsed: 0,
    });
  }
}

export class LlmGateway {
  private tokensUsedToday = 0;
  private readonly adapter: LlmAdapter;

  constructor(adapter?: LlmAdapter) {
    const env = loadEnv();
    this.adapter = adapter ?? (env.LLM_API_KEY ? new NoOpLlmAdapter() : new NoOpLlmAdapter());
    if (!env.LLM_API_KEY) {
      logger.info('LLM gateway using no-op adapter (LLM_API_KEY unset)');
    }
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
    const budget = loadEnv().LLM_DAILY_TOKEN_BUDGET;
    if (this.tokensUsedToday >= budget) {
      return { ok: false, reason: 'budget_exceeded', message: 'Daily LLM token budget exceeded.' };
    }
    const result = await this.adapter.complete(request);
    if (result.ok) {
      this.tokensUsedToday += result.tokensUsed;
    }
    return result;
  }
}
