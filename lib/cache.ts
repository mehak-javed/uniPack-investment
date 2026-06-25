/** Tiny in-memory TTL cache for server-side use.
 *  Designed around free-tier rate limits (e.g. Finnhub ~60 req/min): quotes are
 *  cached for a few seconds, search for longer. In production behind serverless,
 *  swap this for a shared store (e.g. Upstash Redis) — same call signature. */

type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.value as T;
  }
  const value = await fn();
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}
