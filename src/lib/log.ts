import { loadEnv } from './env.js';

type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

const levels: Record<LogLevel, number> = {
  fatal: 0,
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  trace: 50,
};

function threshold(): number {
  try {
    return levels[loadEnv().LOG_LEVEL];
  } catch {
    return 20;
  }
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (levels[level] < threshold()) return;
  const line = meta ? `${message} ${JSON.stringify(meta)}` : message;
  const out = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
  out.write(`[${new Date().toISOString()}] ${level.toUpperCase()} ${line}\n`);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => { log('debug', msg, meta); },
  info: (msg: string, meta?: Record<string, unknown>) => { log('info', msg, meta); },
  warn: (msg: string, meta?: Record<string, unknown>) => { log('warn', msg, meta); },
  error: (msg: string, meta?: Record<string, unknown>) => { log('error', msg, meta); },
};
