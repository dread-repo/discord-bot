import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { verifyGithubWebhookSignature } from './github-webhook-verify.js';

function sign(body: Buffer, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

describe('github-webhook-verify', () => {
  const body = Buffer.from('{"ok":true}');

  it('accepts when secret unset', () => {
    expect(verifyGithubWebhookSignature(body, undefined, undefined)).toBe(true);
  });

  it('rejects missing signature when secret set', () => {
    expect(verifyGithubWebhookSignature(body, undefined, 'secret')).toBe(false);
  });

  it('accepts valid HMAC', () => {
    const secret = 'test-secret';
    expect(verifyGithubWebhookSignature(body, sign(body, secret), secret)).toBe(true);
  });

  it('rejects invalid HMAC', () => {
    expect(verifyGithubWebhookSignature(body, 'sha256=deadbeef', 'secret')).toBe(false);
  });
});
