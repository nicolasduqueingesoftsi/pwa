const CACHE_NAME = "pwa-node-cache-v4";
const urlsToCache = [
    "/",
    "/checklist",
    "/assets/css/styles.css",
    "/assets/js/app.js",
    "/assets/js/checklist.js",
    "/assets/js/service-worker.js",
    "/assets/js/manifest.json",
    "/assets/images/logo_apolo.png",
    "/assets/images/checkList.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
