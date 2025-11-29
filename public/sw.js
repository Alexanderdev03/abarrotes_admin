const CACHE_NAME = 'abarrotes-alex-online-v1';
// We only cache the logo/manifest for the install experience, but NOT the app content
const urlsToCache = [
    '/logo.png',
    '/vite.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Network Only Strategy
    // We do NOT return from cache. We always go to the network.
    // If network fails, the browser will show the standard offline error.
    event.respondWith(
        fetch(event.request).catch(() => {
            // Optional: We could return a custom "Offline" page here if we wanted,
            // but for now we just let it fail as requested.
            // Returning undefined lets the browser handle the failure.
        })
    );
});
