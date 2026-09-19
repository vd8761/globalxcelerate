import { createClient } from '@supabase/supabase-js';

const lockMap = new Map<string, { acquiredAt: number; expiresAt: number }>();

/**
 * Acquire a distributed lock using Supabase table or in-memory fallback.
 */
export async function acquireLock(key: string, ttlMs: number): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // In-memory fallback for dev/test
    const existing = lockMap.get(key);
    if (existing && existing.expiresAt > Date.now()) {
      return false;
    }
    lockMap.set(key, { acquiredAt: Date.now(), expiresAt: Date.now() + ttlMs });
    return true;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  // Try to insert lock, or update if expired
  const { error } = await supabase
    .from('distributed_locks')
    .upsert(
      {
        lock_key: key,
        acquired_at: now,
        expires_at: expiresAt,
        owner: `worker-${process.pid || 'default'}`,
      },
      { onConflict: 'lock_key' }
    )
    .lt('expires_at', now);

  if (error) {
    // Try fresh insert if upsert didn't work
    const { error: insertError } = await supabase
      .from('distributed_locks')
      .insert({
        id: crypto.randomUUID(),
        lock_key: key,
        acquired_at: now,
        expires_at: expiresAt,
        owner: `worker-${process.pid || 'default'}`,
      });

    return !insertError;
  }

  return true;
}

/**
 * Release a distributed lock.
 */
export async function releaseLock(key: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    lockMap.delete(key);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  await supabase.from('distributed_locks').delete().eq('lock_key', key);
}
