interface Snapshot {
  score: number;
  checkedAt: string;
  expiresAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __bizguideAnalysisStore: Map<string, Snapshot> | undefined;
}

const memoryStore = globalThis.__bizguideAnalysisStore ?? new Map<string, Snapshot>();
globalThis.__bizguideAnalysisStore = memoryStore;

const TTL_MS = 1000 * 60 * 60 * 24; // 24 часа.

function toCacheKey(sessionId: string, url: string): string {
  return `${sessionId}:${url}`;
}

function isExpired(snapshot: Snapshot): boolean {
  return Date.now() > snapshot.expiresAt;
}

function pruneExpired(): void {
  for (const [key, value] of memoryStore.entries()) {
    if (isExpired(value)) {
      memoryStore.delete(key);
    }
  }
}

// In-memory кэш по сессионному cookie без БД.
export function getPreviousSnapshot(sessionId: string, url: string): Snapshot | null {
  pruneExpired();
  const key = toCacheKey(sessionId, url);
  const snapshot = memoryStore.get(key);
  if (!snapshot) {
    return null;
  }
  if (isExpired(snapshot)) {
    memoryStore.delete(key);
    return null;
  }
  return snapshot;
}

export function saveSnapshot(sessionId: string, url: string, score: number, checkedAt: string): void {
  const key = toCacheKey(sessionId, url);
  memoryStore.set(key, {
    score,
    checkedAt,
    expiresAt: Date.now() + TTL_MS,
  });
}
