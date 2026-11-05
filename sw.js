// Éclat d'Afrique — Service Worker
// Change la version quand tu modifies index.html ou les images :
const CACHE = 'eclat-v1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
  './matelas.jpg',
  './canape.jpg',
  './pantalon.jpg',
  './chemise.jpg',
  './costume.jpg',
  './forfait-10.jpg',
  './famille.jpg'
];

// Installation : on met tout en cache, un fichier manquant ne casse rien
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(CORE.map(f => c.add(f).catch(err => console.warn('[SW] skip', f))))
      )
      .then(() => self.skipWaiting())
  );
});

// Activation : on supprime les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch : cache d'abord pour les fichiers locaux, réseau sinon
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Fichiers locaux → cache-first
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('./index.html')))
    );
    return;
  }

  // Ressources externes (Google Fonts) → réseau puis cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
