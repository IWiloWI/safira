/**
 * Video Cache Manager
 * Prevents duplicate video loads and implements efficient caching
 */

interface VideoCache {
  url: string;
  blob: Blob;
  objectUrl: string;
  timestamp: number;
}

class VideoCacheManager {
  private cache: Map<string, VideoCache> = new Map();
  private loading: Map<string, Promise<string>> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Get video URL with caching
   * Prevents duplicate loads by returning same blob URL
   */
  async getVideo(url: string): Promise<string> {
    // Check if already cached and not expired
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('VideoCache: Using cached video:', url);
      return cached.objectUrl;
    }

    // Check if already loading
    if (this.loading.has(url)) {
      console.log('VideoCache: Video already loading, waiting:', url);
      return this.loading.get(url)!;
    }

    // Start loading
    const loadPromise = this.loadVideo(url);
    this.loading.set(url, loadPromise);

    try {
      const objectUrl = await loadPromise;
      return objectUrl;
    } finally {
      this.loading.delete(url);
    }
  }

  /**
   * Load video and cache as blob
   */
  private async loadVideo(url: string): Promise<string> {
    console.log('VideoCache: Loading video:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load video: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Cache the video
      this.cache.set(url, {
        url,
        blob,
        objectUrl,
        timestamp: Date.now()
      });

      console.log('VideoCache: Video cached successfully:', url);
      return objectUrl;
    } catch (error) {
      console.error('VideoCache: Error loading video:', url, error);
      // Return original URL as fallback
      return url;
    }
  }

  /**
   * Preload videos for faster playback
   */
  async preloadVideos(urls: string[]): Promise<void> {
    console.log('VideoCache: Preloading videos:', urls.length);

    const promises = urls.map(url =>
      this.getVideo(url).catch(error => {
        console.error('VideoCache: Preload failed for:', url, error);
      })
    );

    await Promise.all(promises);
    console.log('VideoCache: Preload complete');
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;

    this.cache.forEach((cached, url) => {
      if (now - cached.timestamp >= this.CACHE_DURATION) {
        URL.revokeObjectURL(cached.objectUrl);
        this.cache.delete(url);
        cleared++;
      }
    });

    if (cleared > 0) {
      console.log('VideoCache: Cleared', cleared, 'expired entries');
    }
  }

  /**
   * Clear all cached videos
   */
  clearAll(): void {
    this.cache.forEach(cached => {
      URL.revokeObjectURL(cached.objectUrl);
    });
    this.cache.clear();
    this.loading.clear();
    console.log('VideoCache: All cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loading.size,
      totalSize: Array.from(this.cache.values()).reduce(
        (sum, cached) => sum + cached.blob.size,
        0
      )
    };
  }
}

// Singleton instance
export const videoCache = new VideoCacheManager();

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    videoCache.clearExpired();
  }, 5 * 60 * 1000);
}
