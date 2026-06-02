import { z } from 'zod';

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_APPLICATION_ID: z.string().min(1),
  DISCORD_DEV_GUILD_ID: z.string().min(1).optional(),
  REDIS_URL: z.url().default('redis://127.0.0.1:6379'),
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().min(1).optional(),
  WEBHOOK_PORT: z.coerce.number().int().positive().default(3000),
  LLM_API_KEY: z.string().min(1).optional(),
  LLM_MODEL: z.string().default('gpt-4o-mini'),
  LLM_DAILY_TOKEN_BUDGET: z.coerce.number().int().positive().default(100_000),
  DREAD_REPLY_PROBABILITY: z.coerce.number().min(0).max(1).default(0.01),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}
