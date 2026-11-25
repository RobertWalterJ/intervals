/* Intervals service worker.
   Bump VERSION whenever the app shell changes (index.html, icons, this file), and keep APP_VERSION in index.html in step.
   A new VERSION makes a new shell cache; the old one is deleted on activate. */
const VERSION = "1.2.0";
const PRECACHE = ["./", "index.html", "icon.svg", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];
const FONTS = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap";
const SHELL = "intervals-shell-" + VERSION, RUNTIME = "intervals-runtime";

self.addEventListener("install", (e) => {
  // Fonts are best effort: a failed stylesheet fetch must not block the install.
  // The new worker waits until the page asks it to take over (see the "skipWaiting" message).
  e.waitUntil(Promise.all([
    caches.open(SHELL).then((c) => c.addAll(PRECACHE)),
    caches.open(RUNTIME).then((c) => c.add(new Request(FONTS, { mode: "no-cors" })).catch(() => {}))
  ]));
});
self.addEventListener("activate", (e) => {
  // Only this app's own shell caches are touched. Other apps share this origin.
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith("intervals-shell-") && k !== SHELL).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

const put = (cache, req, res) => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; };

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // Only requests inside this app's folder are ours.
    if (!url.pathname.startsWith(new URL("./", location.href).pathname)) return;
    // The manifest is never served from cache, so install identity changes reach the phone.
    if (url.pathname.endsWith("/manifest.webmanifest")) return e.respondWith(fetch(req, { cache: "no-cache" }));
    // App shell: cache first, so the app opens with no signal. Navigations fall back to the cached index.html.
    e.respondWith(caches.open(SHELL).then((c) => c.match(req, { ignoreSearch: true }).then((hit) =>
      hit || fetch(req).catch(() => req.mode === "navigate" ? c.match("index.html") : Response.error()))));
  } else if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    // Fonts: serve the cached copy, refresh it in the background.
    e.respondWith(caches.open(RUNTIME).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((r) => put(c, req, r)).catch(() => hit);
      return hit || net;
    })));
  }
});

/* Tapping a lock-screen alert returns to the running workout. */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const scope = new URL("./", location.href).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const mine = list.find((c) => c.url.startsWith(scope));
    return mine ? mine.focus() : self.clients.openWindow("./");
  }));
});
