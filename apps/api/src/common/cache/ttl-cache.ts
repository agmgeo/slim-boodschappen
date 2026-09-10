export interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

/**
 * Simpele in-memory cache met TTL (time-to-live) per sleutel. Bewust géén
 * Redis of andere externe dependency: voor de huidige schaal van deze app is
 * dat onnodige complexiteit en extra hostingkosten. De interface is klein
 * genoeg om later, als de app over meerdere serverinstanties draait, 1-op-1
 * te vervangen door een Redis-implementatie zonder de aanroepers te wijzigen.
 *
 * Eén gedeelde instantie wordt door meerdere services voor uiteenlopende
 * data gebruikt, dus de generic zit per methode-aanroep (niet vastgezet op
 * klasse-niveau) — elke aanroeper geeft zelf het verwachte type mee.
 */
export class TtlCache {
  private store = new Map<string, CacheEntry>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: this.now() + ttlMs });
  }

  /** Haalt uit cache, of berekent (en cachet) de waarde als die er nog niet is / verlopen is. */
  async getOrCompute<T>(key: string, ttlMs: number, compute: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await compute();
    this.set(key, value, ttlMs);
    return value;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
