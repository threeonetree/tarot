/* global self, caches */

const CACHE_VERSION = "tarot-guide-v3";
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

const ranks = [
  "ace",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "page",
  "knight",
  "queen",
  "king",
];
const suits = ["cups", "swords", "wands", "pentacles"];
const CARD_URLS = [
  ...Array.from({ length: 22 }, (_, id) => `/cards/major/major-${String(id).padStart(2, "0")}.svg`),
  ...suits.flatMap((suit) => ranks.map((rank) => `/cards/minor/${suit}-${rank}.svg`)),
];

const PRECACHE_URLS = [
  "/",
  "/select",
  "/question/three-card",
  "/question/hexagram",
  "/question/two-paths",
  "/reading",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  ...CARD_URLS,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(ASSET_CACHE).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
          } catch {
            // A partial precache is still useful; runtime requests can fill gaps later.
          }
        }),
      ),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("tarot-guide-") && ![PAGE_CACHE, ASSET_CACHE].includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await caches.match("/"));
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === "/sw.js") return;
  if (
    url.searchParams.has("t") ||
    ["/@", "/app/", "/components/", "/lib/", "/node_modules/"].some((prefix) =>
      url.pathname.startsWith(prefix),
    )
  )
    return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});
