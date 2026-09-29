/**
 * EMP System-Wide Client-Side Caching Layer
 * 
 * Provides in-memory + localStorage caching for loaded and closed day data
 * across all modules (Dashboard, Editorial, Jornada Diaria, Story Bible, Manuscript, Audit, Lab Literario).
 * Prevents redundant network queries on screen changes and only updates when data changes.
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttlMs?: number;
  isClosed?: boolean;
  version: number;
}

const CACHE_PREFIX = 'emp_cache_v1_';
const CLOSED_DAYS_KEY = 'emp_closed_days_v1';
const CACHE_VERSION = 1;

// Default TTLs:
// Open active days: 5 minutes in memory
// Closed days: Indefinite (until explicit invalidation or mutation)
const DEFAULT_OPEN_TTL_MS = 5 * 60 * 1000;

class EMPCacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private closedDaysSet = new Set<string>();
  private listeners = new Set<() => void>();

  constructor() {
    this.initClosedDays();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private initClosedDays(): void {
    if (!this.isBrowser()) return;
    try {
      const stored = localStorage.getItem(CLOSED_DAYS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.closedDaysSet = new Set(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  private persistClosedDays(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(CLOSED_DAYS_KEY, JSON.stringify(Array.from(this.closedDaysSet)));
    } catch {
      // Ignore localStorage errors
    }
  }

  public isDayClosed(dayIdOrNumber: string | number): boolean {
    const dayKey = this.normalizeDayId(dayIdOrNumber);
    return this.closedDaysSet.has(dayKey);
  }

  public markDayClosed(dayIdOrNumber: string | number, isClosed = true): void {
    const dayKey = this.normalizeDayId(dayIdOrNumber);
    if (isClosed) {
      this.closedDaysSet.add(dayKey);
    } else {
      this.closedDaysSet.delete(dayKey);
    }
    this.persistClosedDays();
    this.notifyListeners();
  }

  public normalizeDayId(dayIdOrNumber: string | number): string {
    if (typeof dayIdOrNumber === 'number') {
      return `day-${String(dayIdOrNumber).padStart(3, '0')}`;
    }
    const num = Number(String(dayIdOrNumber).replace(/\D/g, '')) || 1;
    return `day-${String(num).padStart(3, '0')}`;
  }

  public get<T = any>(key: string): T | null {
    // 1. Check in-memory cache first (fastest)
    const memEntry = this.memoryCache.get(key);
    const now = Date.now();

    if (memEntry) {
      if (memEntry.isClosed) {
        return memEntry.data as T;
      }
      if (!memEntry.ttlMs || now - memEntry.timestamp < memEntry.ttlMs) {
        return memEntry.data as T;
      }
      // Expired in memory
      this.memoryCache.delete(key);
    }

    // 2. Check localStorage if in browser
    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (raw) {
          const entry: CacheEntry<T> = JSON.parse(raw);
          if (entry.version === CACHE_VERSION) {
            if (entry.isClosed || !entry.ttlMs || now - entry.timestamp < entry.ttlMs) {
              // Populate back to memory cache
              this.memoryCache.set(key, entry);
              return entry.data;
            }
          }
          // Expired in localStorage
          localStorage.removeItem(CACHE_PREFIX + key);
        }
      } catch {
        // Fallback
      }
    }

    return null;
  }

  public set<T = any>(
    key: string,
    data: T,
    options?: { ttlMs?: number; isClosed?: boolean; persist?: boolean }
  ): void {
    const isClosed = options?.isClosed ?? false;
    const ttlMs = options?.ttlMs ?? (isClosed ? undefined : DEFAULT_OPEN_TTL_MS);
    const shouldPersist = options?.persist ?? isClosed ?? false;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttlMs,
      isClosed,
      version: CACHE_VERSION,
    };

    this.memoryCache.set(key, entry);

    if (shouldPersist && this.isBrowser()) {
      try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
      } catch {
        // Quota exceeded or error
      }
    }

    this.notifyListeners();
  }

  public invalidate(keyOrPrefix: string): void {
    // Invalidate from memory
    for (const key of Array.from(this.memoryCache.keys())) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix) || key.includes(keyOrPrefix)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate from localStorage
    if (this.isBrowser()) {
      try {
        const targetPrefix = CACHE_PREFIX;
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(targetPrefix)) {
            const stripped = k.slice(targetPrefix.length);
            if (stripped === keyOrPrefix || stripped.startsWith(keyOrPrefix) || stripped.includes(keyOrPrefix)) {
              keysToRemove.push(k);
            }
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore
      }
    }

    this.notifyListeners();
  }

  public invalidateDay(dayIdOrNumber: string | number): void {
    const dayKey = this.normalizeDayId(dayIdOrNumber);
    const dayNum = Number(dayKey.replace(/\D/g, '')) || 1;

    this.invalidate(`contributions?projectDayId=${dayKey}`);
    this.invalidate(`contributions_${dayKey}`);
    this.invalidate(`selection?projectDayId=${dayKey}`);
    this.invalidate(`selection_${dayKey}`);
    this.invalidate(`day_${dayNum}`);
    this.invalidate(`editorial_${dayKey}`);
    this.invalidate('/api/manuscript');
    this.invalidate('/api/audit');
  }

  public invalidateAll(): void {
    this.memoryCache.clear();
    if (this.isBrowser()) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(CACHE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore
      }
    }
    this.notifyListeners();
  }

  public async fetchWithCache<T = any>(
    url: string,
    fetchOptions?: RequestInit,
    cacheOptions?: {
      cacheKey?: string;
      forceRefresh?: boolean;
      ttlMs?: number;
      persist?: boolean;
      isClosed?: boolean;
    }
  ): Promise<T> {
    const key = cacheOptions?.cacheKey || url;

    // Return cached if not forced refresh
    if (!cacheOptions?.forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== null && cached !== undefined) {
        return cached;
      }
    }

    // Perform network request
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`Error en petición: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check if URL relates to a closed day or closed post
    let isClosed = cacheOptions?.isClosed;
    if (isClosed === undefined) {
      const match = url.match(/projectDayId=(day-\d+)/);
      if (match && match[1]) {
        isClosed = this.isDayClosed(match[1]);
      }
    }

    this.set(key, data, {
      ttlMs: cacheOptions?.ttlMs,
      isClosed: isClosed ?? false,
      persist: cacheOptions?.persist ?? isClosed ?? false,
    });

    return data as T;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        // Ignore listener error
      }
    });
  }
}

export const empCache = new EMPCacheManager();
