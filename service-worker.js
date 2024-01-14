/* eslint-disable require-jsdoc */
/* see https://github.com/oliverjam/minimal-pwa */

const CACHE_NAME = "nircek-ajax-logger-2024-01-14";
const urlsToCache = ["/ajax-logger/", "/ajax-logger/main.js"];

self.addEventListener("install", async (event) => {
  console.log("installing!");
  self.skipWaiting();
  event.waitUntil(cacheAssets());
});
async function cacheAssets() {
  const cache = await self.caches.open(CACHE_NAME);
  return cache.addAll(urlsToCache);
}

self.addEventListener("activate", async (event) => {
  console.log("activating!");
  event.waitUntil(deleteOldCaches());
});
async function deleteOldCaches() {
  const keys = await caches.keys();
  const deletePromises = keys
    .filter((key) => key !== CACHE_NAME)
    .map((key) => self.caches.delete(key));
  return Promise.all(deletePromises);
}

self.addEventListener("fetch", (event) => {
  console.log("fetching!");
  event.respondWith(getResponse(event.request));
});
async function getResponse(request) {
  const cache = await self.caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  return cachedResponse || fetch(request);
}
