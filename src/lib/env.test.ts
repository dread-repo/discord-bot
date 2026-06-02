import { afterEach, describe, expect, it } from 'vitest';

import { loadBotEnv, loadDeployEnv } from './env.js';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('loadBotEnv', () => {
  it('fails when DISCORD_TOKEN is missing', () => {
    process.env['DATABASE_URL'] = 'postgresql://user:pass@localhost:5432/db';
    process.env['REDIS_URL'] = 'redis://127.0.0.1:6379';
    process.env['DISCORD_CLIENT_ID'] = '123';
    delete process.env['DISCORD_TOKEN'];

    expect(() => loadBotEnv()).toThrow(/DISCORD_TOKEN/);
  });
});

describe('loadDeployEnv', () => {
  it('succeeds with only Discord variables', () => {
    process.env['DISCORD_TOKEN'] = 'token';
    process.env['DISCORD_CLIENT_ID'] = '123';
    delete process.env['DATABASE_URL'];
    delete process.env['REDIS_URL'];

    expect(loadDeployEnv().DISCORD_CLIENT_ID).toBe('123');
  });
});
