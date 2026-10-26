const CACHE_NAME = 'papertrail-v14';
const APP_SHELL = ['./', './index.html', './styles.css', './app.js', './organization.js', './checklist.js', './colors.js', './editor-tools.js', './drawing.js', './settings.js', './backup.js', './pwa-experience.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await Promise.all(APP_SHELL.map(async asset => {
      try {
        const response = await fetch(asset, { cache: 'no-cache' });
        if (response.ok) await cache.put(asset, response);
      } catch (error) {
        console.warn('Could not precache', asset, error);
      }
    }));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => { if (event.request.method !== 'GET') return; event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match('./index.html')))); });
self.addEventListener('message',event=>{ if(event.data?.type==='SKIP_WAITING') self.skipWaiting(); });
