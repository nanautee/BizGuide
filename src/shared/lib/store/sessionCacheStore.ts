interface SessionCacheRecord<T> {
  value: T;
  expiresAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __bizguideSessionCacheStore: Map<string, SessionCacheRecord<unknown>> | undefined;
}

const cacheStore = globalThis.__bizguideSessionCacheStore ?? new Map<string, SessionCacheRecord<unknown>>();
globalThis.__bizguideSessionCacheStore = cacheStore;

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 минут.

function toKey(sessionId: string, namespace: string, inputKey: string): string {
  return `${sessionId}:${namespace}:${inputKey}`;
}

function pruneExpired(): void {
  const now = Date.now();
  for (const [key, record] of cacheStore.entries()) {
    if (record.expiresAt <= now) {
      cacheStore.delete(key);
    }
  }
}

export function getSessionCache<T>(
  sessionId: string,
  namespace: string,
  inputKey: string
): T | null {
  pruneExpired();
  const key = toKey(sessionId, namespace, inputKey);
  const record = cacheStore.get(key);
  if (!record) {
    return null;
  }
  return record.value as T;
}

export function setSessionCache<T>(
  sessionId: string,
  namespace: string,
  inputKey: string,
  value: T
): void {
  const key = toKey(sessionId, namespace, inputKey);
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
