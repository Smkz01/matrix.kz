/* Чекер остатков — service worker.
   Сеть в приоритете: продавец всегда должен видеть свежие остатки.
   Кэш нужен только чтобы чекер открылся, когда в салоне лёг интернет. */
const CACHE = "checker-shell";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;          // шрифты и прочее — мимо
  if (url.pathname.endsWith("version.txt")) return;    // проверка версии всегда из сети

  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./")))
  );
});
