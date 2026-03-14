const CACHE_NAME = 'fluxboard-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]).then(() => self.skipWaiting())
    }),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(
    fetch(event.request)
      .then((res) => res)
      .catch(() =>
        caches.match(event.request).then(
          (cached) =>
            cached ?? caches.match(OFFLINE_URL).then(
              (offline) => offline ?? new Response('Offline', { status: 503 })
            )
        )
      )
  )
})
