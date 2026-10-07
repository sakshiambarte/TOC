const CACHE_NAME = "moore-mealy-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];


/* =========================
   INSTALL SERVICE WORKER
   ========================= */

self.addEventListener("install", (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(FILES_TO_CACHE);
            })
    );

    self.skipWaiting();
});


/* =========================
   ACTIVATE SERVICE WORKER
   ========================= */

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames
                    .filter((cacheName) => {
                        return cacheName !== CACHE_NAME;
                    })

                    .map((cacheName) => {
                        return caches.delete(cacheName);
                    })

            );

        })

    );

    self.clients.claim();
});


/* =========================
   FETCH
   ========================= */

self.addEventListener("fetch", (event) => {

    event.respondWith(

        caches.match(event.request)
            .then((cachedResponse) => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request);

            })

    );

});
