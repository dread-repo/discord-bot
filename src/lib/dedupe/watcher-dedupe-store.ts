import { getSupabase } from '../config/supabase.js';

export class WatcherDedupeStore {
  /** Returns true if this key should be announced (not seen before). */
  async tryClaim(dedupeKey: string): Promise<boolean> {
    const { error } = await getSupabase().from('watcher_dedupe').insert({ dedupe_key: dedupeKey });
    if (!error) return true;
    if (error.code === '23505') return false;
    throw error;
  }
}
