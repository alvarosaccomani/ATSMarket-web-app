const CACHE_VERSION = 'v2';
const STATIC_CACHE = `ats-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ats-dynamic-${CACHE_VERSION}`;

// Recursos mínimos para arrancar offline (Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalación: Guardar Shell básico
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching App Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Limpieza de cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Intercepción de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Estrategia: Network-First para el HTML principal (siempre ver lo último si hay red)
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Estrategia: Stale-While-Revalidate para el resto (Assets, JS, CSS, Imágenes)
  // Sirve rápido desde caché y actualiza en background.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Solo guardamos en caché dinámico si la respuesta es válida
        if (networkResponse && networkResponse.status === 200) {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});