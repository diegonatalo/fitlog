/* FitLog service worker: makes the app installable and usable offline. */
const CACHE = "fitlog-v2";
const SHELL = ["/", "/manifest.webmanifest", "/favicon.svg", "/icon-192.png"];

/** Caches the shell and the hashed JS/CSS files that the home page references. */
async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);
  try {
    const html = await (await cache.match("/")).text();
    const assets = new Set(html.match(/\/_next\/static\/[^"'\\\s)]+/g) ?? []);
    await Promise.all(
      [...assets].map((url) => cache.add(url).catch(() => undefined)),
    );
  } catch {
    /* precaching assets is best effort: they are also cached when first used */
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages: network first so deploys show up. Every visited page is kept, so it
  // opens offline; a page never visited falls back to the home shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  // Assets and Next data requests: serve from cache, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
