/*
 * FitLog service worker: makes the app installable and keeps static files and
 * public pages in cache. Pages under /app carry the person's data (the HTML and
 * the RSC payloads), so they are never cached: they always come from the network.
 */
const CACHE = "fitlog-v5";
const SHELL = ["/", "/manifest.webmanifest", "/favicon.svg", "/icon-192.png"];

/** Caches the shell and the hashed JS/CSS files that the landing references. */
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

// Also drops the older caches, which held /app pages.
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

const isPrivate = (url) =>
  url.pathname === "/app" ||
  url.pathname.startsWith("/app/") ||
  url.pathname.startsWith("/api/") ||
  url.searchParams.has("_rsc");

const isStatic = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  /\.(?:png|svg|ico|webp|webmanifest|woff2?)$/.test(url.pathname);

const keep = (request, response) => {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isPrivate(url)) return;

  // Public pages: network first so deploys show up, cache as the offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => keep(request, response))
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  // Hashed assets never change: serve from cache, fetch once.
  if (isStatic(url)) {
    event.respondWith(
      caches
        .match(request)
        .then((cached) => cached || fetch(request).then((r) => keep(request, r))),
    );
  }
});
