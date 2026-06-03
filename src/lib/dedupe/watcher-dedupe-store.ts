import type { PrismaClient } from '@prisma/client';

import { getPrisma } from '../db/prisma.js';

export class WatcherDedupeStore {
  constructor(private readonly db: PrismaClient = getPrisma()) {}

  async hasDedupeKey(dedupeKey: string): Promise<boolean> {
    const row = await this.db.watcherDedupe.findUnique({ where: { dedupeKey } });
    return row !== null;
  }

  /** Returns true when the key was inserted; false when it already existed. */
  async tryInsert(dedupeKey: string): Promise<boolean> {
    try {
      await this.db.watcherDedupe.create({ data: { dedupeKey } });
      return true;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        err.code === 'P2002'
      ) {
        return false;
      }
      throw err;
    }
  }
}
