// sw.js — версия 2.0 (принудительное обновление кэша)
const CACHE_NAME = 'city-quest-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/cities.json',
    '/data/tobolsk.json',
    '/data/rotterdam.json',
    '/data/venice.json',
    '/icons/tobolsk.png',
    '/icons/rotterdam.png',
    '/icons/venice.png',
    '/privacy.html',
    '/sw.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // активируем сразу
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // захватываем клиенты сразу
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});
