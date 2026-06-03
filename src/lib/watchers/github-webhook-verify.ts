import { createHmac, timingSafeEqual } from 'node:crypto';

import { logInfo } from '../log.js';

export function verifyGithubWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  secret: string | undefined,
): boolean {
  if (secret === undefined || secret.length === 0) {
    logInfo('[github] GITHUB_WEBHOOK_SECRET unset — accepting webhook without verification');
    return true;
  }
  if (signatureHeader === undefined || signatureHeader.length === 0) {
    return false;
  }
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  if (expected.length !== signatureHeader.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}
