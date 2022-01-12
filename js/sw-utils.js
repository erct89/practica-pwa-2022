function updateCache(cacheName, request, response) {
  if (response.ok) {
    return caches.open(cacheName).then(cache => {
      cache.put(request, response.clone());

      return response.clone();
    });
  } else {
    return response;
  }
}