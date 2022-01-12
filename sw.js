// imports
importScripts('js/sw-utils.js');

const CACHE_VERSION = 2;
const APP_CACHE_CONFIG = {
  CACHES: {
    STATIC: `static-v${CACHE_VERSION}`,
    IMMUTABLE: `immutable-v${CACHE_VERSION}`,
    DYNAMIC : `dynamic-v${CACHE_VERSION}`
  },
  REGISTERS: {
    STATIC: [
      // '/',
      'index.html',
      'css/style.css',
      'img/favicon.ico',
      'img/avatars/hulk.jpg',
      'img/avatars/ironman.jpg',
      'img/avatars/spiderman.jpg',
      'img/avatars/thor.jpg',
      'img/avatars/wolverine.jpg',
      'js/app.js',
      'js/sw-utils.js'
    ],
    IMMUTABLE: [
      'https://fonts.googleapis.com/css?family=Lato:400,300',
      'https://fonts.googleapis.com/css?family=Quicksand:300,400',
      'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
      'css/animate.css',
      'js/libs/jquery.js'
    ]
  }
};


// install: Create static and immutable cache.
self.addEventListener('install', event => {
  const cacheAddAll = registers => cache => cache.addAll(registers);

  // Creando cache statica e immutable;
  const staticCachePromise = caches.open(APP_CACHE_CONFIG.CACHES.STATIC).then(cacheAddAll(APP_CACHE_CONFIG.REGISTERS.STATIC));
  const immutableCachePromise = caches.open(APP_CACHE_CONFIG.CACHES.IMMUTABLE).then(cacheAddAll(APP_CACHE_CONFIG.REGISTERS.IMMUTABLE));
  const cachesPromise = [staticCachePromise, immutableCachePromise];

  // Esperar hasta que las caches static y immutable sean instaladas.
  event.waitUntil(cachesPromise);
});

// activate: Se ejecuta despues de la instalacion, util para borrar cache antigua.
self.addEventListener('activate', event => {
  // Proceso de limpiado de cache. Primero obtenemos las caches existentes y si no esta en el array se elimina.
  const cachesCleanPromise = caches.keys().then(keys => {
    keys.forEach(key => {
      // Esta condicion estoy pensando si es correcta.
      if (!Object.values(APP_CACHE_CONFIG.CACHES).includes(key)) {
        return caches.delete(key);
      }
    });
  });

  event.waitUntil(cachesCleanPromise)
});

// fetch: Se integra la estrategia de manejo del cache. En este caso se usa primero la cache y si falla se llama al network.
self.addEventListener('fetch', event => {
  const response = caches.match(event.request).then(response => {
    if (response) {
      return response;
    }

    return fetch(event.request).then(response => {
      return updateCache(APP_CACHE_CONFIG.CACHES.DYNAMIC, event.request, response);
    });
  });

  event.respondWith(response);
});