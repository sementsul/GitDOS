/* GitDOS — сервис-воркер (PWA).
   Стратегия NETWORK-FIRST: пока есть сеть, всегда отдаём свежую версию (никакого «залипшего» кэша),
   а кэш используется только как офлайн-резерв. Кэшируем лишь свой origin (api.github.com / raw — не трогаем). */
const CACHE = 'gitdos-cache-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let sameOrigin = false;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch (_) {}
  if (!sameOrigin) return; // GitHub API / raw / аналитику кэшировать не нужно

  e.respondWith((async () => {
    try {
      const res = await fetch(req);                 // сначала сеть — всегда свежее
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    } catch (_) {                                    // нет сети — отдаём из кэша
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const idx = await caches.match('./index.html') || await caches.match('./');
        if (idx) return idx;
      }
      throw _;
    }
  })());
});
