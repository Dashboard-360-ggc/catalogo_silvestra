const CACHE_NAME = 'catalogo-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll(['/catalogo_silvestra/', '/catalogo_silvestra/index.html', '/catalogo_silvestra/styles.css', '/catalogo_silvestra/app.js'])
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
