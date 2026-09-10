const CACHE_NAME = 'slim-boodschappen-v1';

// Bewust minimaal: alleen de shell cachen zodat de PWA-installatiecriteria
// gehaald worden en een herbezoek iets sneller aanvoelt. Boodschappenlijst-
// en prijsdata komen altijd vers van de API (nooit uit de cache), want
// verouderde prijzen/voorraad zijn erger dan een keer geen internet.
const PRECACHE_URLS = ['/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nooit API-verzoeken cachen — altijd verse data.
  if (url.pathname.startsWith('/api') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached ?? fetch(event.request)),
  );
});
