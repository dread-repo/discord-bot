import type { BotEnv, WorkerEnv } from '../env.js';

export interface LlmRequest {
  system: string;
  user: string;
}

export interface LlmResponse {
  text: string;
}

export class LlmGateway {
  private readonly apiKey: string | undefined;
  private readonly dailyBudget: number | undefined;

  constructor(env: Pick<BotEnv | WorkerEnv, 'LLM_API_KEY' | 'LLM_DAILY_TOKEN_BUDGET'>) {
    this.apiKey = env.LLM_API_KEY;
    this.dailyBudget = env.LLM_DAILY_TOKEN_BUDGET;
  }

  budgetOk(): Promise<boolean> {
    if (this.dailyBudget === undefined) {
      return Promise.resolve(true);
    }
    // v1 stub: no token accounting until LLM traffic lands
    return Promise.resolve(true);
  }

  complete(_input: LlmRequest): Promise<LlmResponse> {
    if (this.apiKey === undefined || this.apiKey.length === 0) {
      return Promise.resolve({ text: '' });
    }
    return Promise.reject(
      new Error('LlmGateway.complete is not implemented until LLM provider adapter lands'),
    );
  }
}
