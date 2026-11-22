const CACHE_NAME = 'handa-awareness-v2';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[ServiceWorker] Caching core assets');

      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (error) {
          console.warn('[ServiceWorker] Failed to cache:', asset, error);
        }
      }
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );

      await self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseCopy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseCopy);
          });
        }

        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }

        return new Response('Offline - content unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      })
  );
});
