const CACHE_NAME = 'ph-toll-calc-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/',
      '/manifest.json',
      '/icon-192x192.png'
    ]))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(e.request);
    })
  );
});
