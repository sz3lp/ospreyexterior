const CACHE_NAME = 'osprey-pwa-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/site/index.html',
  '/assets/style.css',
  '/assets/script.js'
];

const SITEMAP_URLS = [
  'https://ospreyexterior.com/',
  'https://ospreyexterior.com/about/',
  'https://ospreyexterior.com/blog/',
  'https://ospreyexterior.com/blog/rainwise-rebate-checklist/',
  'https://ospreyexterior.com/blog/stormwater-maintenance-calendar/',
  'https://ospreyexterior.com/blog/rain-garden-planting-guide/',
  'https://ospreyexterior.com/services/',
  'https://ospreyexterior.com/privacy/',
  'https://ospreyexterior.com/service-areas/',
  'https://ospreyexterior.com/service-areas/seattle/',
  'https://ospreyexterior.com/service-areas/redmond/',
  'https://ospreyexterior.com/service-areas/bellevue/',
  'https://ospreyexterior.com/service-areas/kirkland/',
  'https://ospreyexterior.com/service-areas/shoreline/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const { pathname } = new URL(event.request.url);
  if (pathname === '/sitemap.xml') {
    const lastmod = new Date().toISOString().split('T')[0];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${SITEMAP_URLS.map((loc) => `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`).join('')}</urlset>`;
    event.respondWith(
      Promise.resolve(
        new Response(body, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' }
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
