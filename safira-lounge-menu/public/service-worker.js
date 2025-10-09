/* eslint-disable no-restricted-globals */
/**
 * Service Worker for Safira Lounge Menu
 * Implements aggressive caching strategy for instant loads and offline support
 */

const CACHE_VERSION = 'v1.1.0';
const CACHE_NAMES = {
  static: `safira-static-${CACHE_VERSION}`,
  videos: `safira-videos-${CACHE_VERSION}`,
  api: `safira-api-${CACHE_VERSION}`,
  images: `safira-images-${CACHE_VERSION}`
};

// Critical resources to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/safira_logo_120w.webp',
  '/images/safira_logo_220w.webp',
  '/images/safira_logo_280w.webp'
];

// Network-first resources (API calls)
const NETWORK_FIRST = [
  '/api/',
  '/safira-api-fixed.php'
];

// Cache-first resources (static assets) - ONLY same-origin
const CACHE_FIRST = [
  '/static/',
  '/images/'
];

// Videos need special handling with size limits
const VIDEO_PATTERNS = [
  '/videos/',
  '.mp4',
  '.mov'
];

// External resources to skip (CSP restrictions)
const SKIP_URLS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'google',
  'gstatic'
];

// Cache size limits
const VIDEO_CACHE_LIMIT = 50 * 1024 * 1024; // 50 MB
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Install event - cache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('[SW] Critical assets cached');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Failed to cache critical assets:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  const currentCaches = Object.values(CACHE_NAMES);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('safira-') && !currentCaches.includes(name))
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external resources (CSP restrictions, fonts, analytics)
  if (SKIP_URLS.some(pattern => url.href.includes(pattern))) {
    return; // Let browser handle normally
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Video files - Cache First with size limit and deduplication
  if (VIDEO_PATTERNS.some(pattern => url.href.includes(pattern))) {
    event.respondWith(cacheFirstVideo(request));
    return;
  }

  // Network-first strategy for API calls with TTL
  if (NETWORK_FIRST.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // Cache-first strategy for static assets
  if (CACHE_FIRST.some(pattern => url.href.includes(pattern))) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.images));
    return;
  }

  // Stale-while-revalidate for HTML
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: network with cache fallback
  event.respondWith(networkWithCacheFallback(request));
});

/**
 * Network-first strategy for API calls with TTL
 */
async function networkFirstAPI(request) {
  const cache = await caches.open(CACHE_NAMES.api);

  try {
    const networkResponse = await fetch(request);

    // Cache successful responses with timestamp
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      const cachedResponse = new Response(clonedResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: new Headers(networkResponse.headers)
      });
      cachedResponse.headers.set('sw-cached-at', Date.now().toString());
      cache.put(request, cachedResponse);
      console.log('[SW] API response cached:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cached API:', request.url);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      const age = Date.now() - parseInt(cachedAt || '0');

      if (age < API_CACHE_TTL) {
        console.log('[SW] Returning fresh cached API data:', request.url);
        return cachedResponse;
      } else {
        console.log('[SW] Cached API data expired:', request.url);
      }
    }

    // Return offline fallback
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No cached data available' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache-first for videos with size limit and deduplication
 */
async function cacheFirstVideo(request) {
  const cache = await caches.open(CACHE_NAMES.videos);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[SW] Video cache hit:', request.url);
    return cachedResponse;
  }

  console.log('[SW] Video cache miss, fetching:', request.url);

  try {
    const networkResponse = await fetch(request);

    // Only cache successful, complete responses (not 206 partial)
    if (networkResponse.ok && networkResponse.status !== 206) {
      const contentLength = networkResponse.headers.get('content-length');

      // Check video size before caching
      if (contentLength && parseInt(contentLength) < VIDEO_CACHE_LIMIT) {
        // Enforce cache limit before adding new video
        await enforceVideoCacheLimit();
        cache.put(request, networkResponse.clone());
        console.log('[SW] Video cached:', request.url);
      } else {
        console.log('[SW] Video too large to cache:', request.url);
      }
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Video fetch failed:', request.url, error);
    return new Response('Video not available', { status: 404 });
  }
}

/**
 * Enforce video cache size limit
 */
async function enforceVideoCacheLimit() {
  const cache = await caches.open(CACHE_NAMES.videos);
  const keys = await cache.keys();

  let totalSize = 0;
  const entries = [];

  // Calculate total size
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const contentLength = response.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength) : 0;
      entries.push({
        request,
        size,
        cachedAt: response.headers.get('sw-cached-at') || '0'
      });
      totalSize += size;
    }
  }

  // If over limit, delete oldest entries
  if (totalSize > VIDEO_CACHE_LIMIT) {
    console.log('[SW] Video cache over limit, cleaning up...');
    entries.sort((a, b) => parseInt(a.cachedAt) - parseInt(b.cachedAt));

    for (const entry of entries) {
      if (totalSize <= VIDEO_CACHE_LIMIT * 0.8) break; // Target 80% of limit

      await cache.delete(entry.request);
      totalSize -= entry.size;
      console.log('[SW] Deleted old video:', entry.request.url);
    }
  }
}

/**
 * Cache-first strategy: Try cache, fallback to network
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[SW] Cache hit:', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Only cache successful, complete responses (not 206 partial)
    if (networkResponse.ok && networkResponse.status !== 206) {
      cache.put(request, networkResponse.clone());
      console.log('[SW] Cached:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache and network both failed:', request.url);
    return new Response('Resource not available', { status: 404 });
  }
}

/**
 * Stale-while-revalidate: Return cache immediately, update in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAMES.static);
  const cachedResponse = await cache.match(request);

  // Fetch in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        console.log('[SW] Background update cached:', request.url);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Background fetch failed:', request.url);
      return null;
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('[SW] Stale-while-revalidate hit:', request.url);
    return cachedResponse;
  }

  return fetchPromise;
}

/**
 * Network with cache fallback
 */
async function networkWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.static);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Network response cached:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying any cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Resource not available', { status: 404 });
  }
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all(
        Object.values(CACHE_NAMES).map(name => caches.delete(name))
      ).then(() => {
        console.log('[SW] All caches cleared');
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }

  if (event.data && event.data.type === 'CACHE_STATS') {
    event.waitUntil(
      getCacheStats().then(stats => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage(stats);
        }
      })
    );
  }
});

/**
 * Get cache statistics
 */
async function getCacheStats() {
  const stats = {};

  for (const [name, cacheName] of Object.entries(CACHE_NAMES)) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      let totalSize = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            totalSize += parseInt(contentLength);
          }
        }
      }

      stats[name] = {
        entries: keys.length,
        size: totalSize,
        sizeFormatted: formatBytes(totalSize)
      };
    } catch (error) {
      console.error('[SW] Error getting stats for:', cacheName, error);
      stats[name] = { entries: 0, size: 0, sizeFormatted: '0 B' };
    }
  }

  return stats;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
