import { z } from 'zod';

const urlSchema = z.string().url();

const baseSchema = z.object({
  DATABASE_URL: urlSchema,
  REDIS_URL: urlSchema,
  DIRECT_URL: urlSchema.optional(),
  LLM_PROVIDER: z.string().optional(),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  LLM_DAILY_TOKEN_BUDGET: z.coerce.number().int().positive().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const botSchema = baseSchema.extend({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  /** When set, slash commands deploy to this guild only (instant in dev). */
  DISCORD_DEV_GUILD_ID: z.string().min(1).optional(),
});

const workerSchema = baseSchema.extend({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  THUNDERSTORE_POLL_INTERVAL_MS: z.coerce.number().int().positive().optional(),
});

const deploySchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_DEV_GUILD_ID: z.string().min(1).optional(),
});

export type BotEnv = z.infer<typeof botSchema>;
export type WorkerEnv = z.infer<typeof workerSchema>;
export type DeployEnv = z.infer<typeof deploySchema>;

function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

export function loadBotEnv(): BotEnv {
  const parsed = botSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid bot environment: ${formatZodError(parsed.error)}`);
  }
  return parsed.data;
}

/** Discord REST deploy only — does not require DATABASE_URL or REDIS_URL. */
export function loadDeployEnv(): DeployEnv {
  const parsed = deploySchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid deploy environment: ${formatZodError(parsed.error)}`);
  }
  return parsed.data;
}

export function loadWorkerEnv(): WorkerEnv {
  const parsed = workerSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid worker environment: ${formatZodError(parsed.error)}`);
  }
  return parsed.data;
}

/** @deprecated Use loadBotEnv or loadWorkerEnv */
export function loadEnv(): BotEnv {
  return loadBotEnv();
}
