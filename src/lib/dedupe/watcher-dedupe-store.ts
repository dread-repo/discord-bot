import { Prisma } from '@prisma/client';

import { prisma } from '../db/prisma.js';

export class WatcherDedupeStore {
  /** Returns true if this key should be announced (not seen before). */
  async tryClaim(dedupeKey: string): Promise<boolean> {
    try {
      await prisma.watcherDedupe.create({ data: { dedupeKey } });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return false;
      }
      throw error;
    }
  }
}
