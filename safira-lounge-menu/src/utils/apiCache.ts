/**
 * API Response Cache Manager
 * Implements intelligent caching with TTL and deduplication
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh
}

class ApiCacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  // Default TTL configurations for different endpoints
  private readonly DEFAULT_CONFIGS: Record<string, CacheConfig> = {
    products: { ttl: 5 * 60 * 1000, staleWhileRevalidate: true }, // 5 minutes
    tobacco_catalog: { ttl: 10 * 60 * 1000 }, // 10 minutes
    get_active_languages: { ttl: 30 * 60 * 1000 }, // 30 minutes
    categories: { ttl: 10 * 60 * 1000, staleWhileRevalidate: true }, // 10 minutes
    videos: { ttl: 15 * 60 * 1000 }, // 15 minutes
  };

  /**
   * Get cached data or fetch fresh
   */
  async get<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    config?: CacheConfig
  ): Promise<T> {
    const cacheConfig = config || this.getConfigForKey(key);
    const cached = this.cache.get(key);
    const now = Date.now();

    // Check if cached and not expired
    if (cached && now < cached.expiresAt) {
      console.log('ApiCache: Cache hit for:', key);
      return cached.data as T;
    }

    // Stale-while-revalidate: return stale data and fetch in background
    if (cached && cacheConfig.staleWhileRevalidate && now < cached.expiresAt + cacheConfig.ttl) {
      console.log('ApiCache: Returning stale data for:', key);
      // Fetch fresh data in background
      this.fetchAndCache(key, fetcher, cacheConfig).catch(console.error);
      return cached.data as T;
    }

    // Deduplicate concurrent requests
    if (this.pendingRequests.has(key)) {
      console.log('ApiCache: Request already pending for:', key);
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Fetch fresh data
    return this.fetchAndCache(key, fetcher, cacheConfig);
  }

  /**
   * Fetch data and cache it
   */
  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    console.log('ApiCache: Fetching fresh data for:', key);

    const fetchPromise = fetcher().then(data => {
      const now = Date.now();
      this.cache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + config.ttl
      });
      console.log('ApiCache: Cached data for:', key, 'TTL:', config.ttl);
      return data;
    }).catch(error => {
      console.error('ApiCache: Fetch failed for:', key, error);
      throw error;
    }).finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, fetchPromise);
    return fetchPromise;
  }

  /**
   * Get config for key based on endpoint name
   */
  private getConfigForKey(key: string): CacheConfig {
    for (const [endpoint, config] of Object.entries(this.DEFAULT_CONFIGS)) {
      if (key.includes(endpoint)) {
        return config;
      }
    }
    // Default config
    return { ttl: 5 * 60 * 1000 };
  }

  /**
   * Invalidate cache for specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    console.log('ApiCache: Invalidated cache for:', key);
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    });

    console.log('ApiCache: Invalidated', count, 'entries matching:', pattern);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log('ApiCache: All cache cleared');
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;

    this.cache.forEach((entry, key) => {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    });

    if (cleared > 0) {
      console.log('ApiCache: Cleared', cleared, 'expired entries');
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach(entry => {
      if (now < entry.expiresAt) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      pending: this.pendingRequests.size
    };
  }

  /**
   * Prefetch data for later use
   */
  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: CacheConfig
  ): Promise<void> {
    try {
      await this.get(key, fetcher, config);
      console.log('ApiCache: Prefetched data for:', key);
    } catch (error) {
      console.error('ApiCache: Prefetch failed for:', key, error);
    }
  }
}

// Singleton instance
export const apiCache = new ApiCacheManager();

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.clearExpired();
  }, 5 * 60 * 1000);

  // Clear cache on visibility change (tab becomes active)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      apiCache.clearExpired();
    }
  });
}
