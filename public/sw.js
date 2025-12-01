const CACHE_NAME = 'abarrotes-alex-online-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/logo.png',
    '/vite.svg',
    '/manifest.json'
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
    const request = event.request;
    const url = new URL(request.url);

    // Filter for assets we want to cache with Stale-While-Revalidate
    // Images, Scripts, Styles, Fonts
    if (
        request.destination === 'image' ||
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font' ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.webp')
    ) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    // Return cached response if available, otherwise wait for network
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // For everything else (API calls, HTML navigation), use Network First
    // This ensures we always get fresh data but have a fallback if offline (optional)
    // For now, we keep the original "Network Only" behavior for safety on data,
    // but we can try to return index.html for navigation to support SPA offline load
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match('/index.html');
            })
        );
        return;
    }

    event.respondWith(
        fetch(request)
    );
});
