const CACHE = 'moore-mealy-toc-v4';
const BASE = '/TOC/';
const ASSETS = [
  BASE, BASE + 'index.html', BASE + 'style.css', BASE + 'script.js', BASE + 'manifest.json',
  BASE + 'icons/icon-192.png', BASE + 'icons/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(BASE + 'index.html'))));
});
