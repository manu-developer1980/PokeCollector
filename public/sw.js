// Service worker de limpieza. Versiones antiguas de la app registraban un SW
// que dejó bundles obsoletos cacheados en los navegadores de los usuarios;
// este lo sustituye, borra todas las cachés, se autodesregistra y recarga
// las pestañas abiertas para que carguen siempre el bundle actual.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
