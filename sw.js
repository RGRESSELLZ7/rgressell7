/* RG Resell PWA - cache de iconos, navegacion siempre desde la red si hay internet */
const RG_CACHE = 'rg-resell-v1';
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(RG_CACHE).then(function(c) {
    return c.addAll(['/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/manifest.webmanifest']);
  }).catch(function() {}));
});
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== RG_CACHE; }).map(function(k) { return caches.delete(k); }));
  }).then(function() { return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(function(r) {
      var copy = r.clone();
      caches.open(RG_CACHE).then(function(c) { c.put(e.request, copy); });
      return r;
    }).catch(function() {
      return caches.match(e.request).then(function(r) { return r || caches.match('/'); });
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(r) { return r || fetch(e.request); }));
});
