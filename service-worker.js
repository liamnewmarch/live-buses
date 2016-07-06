'use strict';

/**
 * Version
 */
var version = 'v1::';


/**
 * Install
 */
self.addEventListener('install', function(event) {
  // Pre-populate cache
  event.waitUntil(caches.open(version + 'fundamentals').then(function(cache) {
    return cache.addAll([
      '',
      'css/app.css',
      'js/app.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.min.js'
    ]);
  }));
});


/**
 * Fetch
 */
self.addEventListener('fetch', function(event) {
  // Try network
  event.respondWith(fetch(event.request).then(function(response) {
    var clone = response.clone()
    caches.open(version + 'pages').then(function(cache) {
      cache.put(event.request, clone);
    })
    return response;
  }).catch(function() {
    // Try cache
    return caches.match(event.request).then(function(cache) {
      return cache ? cache : Promise.reject('Cache miss');
    }).catch(function() {
      // Return error
      return new Response('<h1>Service Unavailable</h1>', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/html'
        })
      });
    });
  }));
});


/**
 * Activate
 */
self.addEventListener('activate', function(event) {
  // Flush old caches
  event.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function (key) {
      return !key.startsWith(version);
    }).map(function (key) {
      return caches.delete(key);
    }));
  }));
});
