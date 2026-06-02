import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { z } from 'zod';

/** Load `.env` when present; does not override variables already in `process.env`. */
function loadDotEnvFile(): void {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_APPLICATION_ID: z.string().min(1),
  DISCORD_DEV_GUILD_ID: z.string().min(1).optional(),
  REDIS_URL: z.url().default('redis://127.0.0.1:6379'),
  /** Supabase Postgres connection string (Project Settings → Database → URI). */
  DATABASE_URL: z.url(),
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
  loadDotEnvFile();
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}
