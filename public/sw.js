// Service Worker for Lenny's Adventure Guide
// Version 4.0 — Full offline caching with regional tile support

const CACHE_NAME = 'lennys-guide-v4';
const TILE_CACHE = 'lennys-tiles-v1';
const API_CACHE = 'lennys-api-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/data/sites.json',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap'
];

// Max tiles to cache per region (prevents storage bloat)
const MAX_CACHED_TILES = 2000;

// Install: cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches (but preserve tiles)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== TILE_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch handler with strategies per resource type
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls: network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => {
          if (cached) return cached;
          return new Response(JSON.stringify({ error: 'Offline', alerts: [] }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }))
    );
    return;
  }

  // Map tiles: cache-first with network fallback + progressive caching
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) {
              // Check tile cache size before adding
              cache.keys().then(keys => {
                if (keys.length < MAX_CACHED_TILES) {
                  cache.put(event.request, response.clone());
                }
              });
            }
            return response;
          }).catch(() => {
            // Return a blank tile if offline and not cached
            return new Response('', { status: 204 });
          });
        })
      )
    );
    return;
  }

  // CDN resources (fonts, Leaflet): cache-first
  if (url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else (app shell): cache-first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Listen for messages from the app (e.g., "cache tiles for region X")
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_TILES') {
    const { tiles } = event.data;
    if (tiles && tiles.length > 0) {
      caches.open(TILE_CACHE).then(cache => {
        // Fetch tiles in batches to avoid overwhelming the network
        const batch = tiles.slice(0, 200); // Max 200 tiles per request
        let i = 0;
        function fetchNext() {
          if (i >= batch.length) return;
          const url = batch[i++];
          fetch(url).then(resp => {
            if (resp.ok) cache.put(url, resp);
            // Small delay between fetches
            setTimeout(fetchNext, 50);
          }).catch(() => setTimeout(fetchNext, 50));
        }
        // Start 4 parallel fetch streams
        for (let s = 0; s < 4; s++) fetchNext();
      });
    }
  }
});
