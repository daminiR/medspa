// Custom Service Worker for Glow MedSpa Patient Portal
// This service worker provides offline support, caching, and push notifications

const CACHE_NAME = 'glow-medspa-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/appointments',
  '/booking',
  '/messages',
  '/profile',
  '/rewards',
  '/referrals',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache for offline viewing
const API_CACHE_NAME = 'glow-medspa-api-v1';
const CACHEABLE_API_ROUTES = [
  '/api/appointments',
  '/api/messages',
  '/api/profile',
  '/api/rewards'
];

// Background sync queue name
const SYNC_QUEUE_NAME = 'glow-medspa-sync-queue';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Use addAll with error handling for each asset
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`[SW] Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('glow-medspa-') && 
                     cacheName !== CACHE_NAME && 
                     cacheName !== API_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching (but handle POST for background sync)
  if (request.method !== 'GET') {
    // Handle POST requests for background sync
    if (request.method === 'POST' && shouldQueueForSync(url.pathname)) {
      event.respondWith(handleBackgroundSync(request));
      return;
    }
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline JSON response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'You are currently offline. Please try again when connected.' 
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, trying cache for:', request.url);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await cache.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback offline response
    return new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection and try again.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Handle static asset requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached version immediately, update in background
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse);
      }
    }).catch(() => {
      // Ignore network errors for background update
    });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static request failed:', request.url);
    
    // Return a transparent pixel for failed image requests
    if (request.destination === 'image') {
      return new Response(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        { headers: { 'Content-Type': 'image/gif' } }
      );
    }
    
    throw error;
  }
}

// Check if a POST request should be queued for background sync
function shouldQueueForSync(pathname) {
  const syncableRoutes = [
    '/api/appointments/book',
    '/api/appointments/cancel',
    '/api/messages/send',
    '/api/profile/update',
    '/api/waitlist/join'
  ];
  
  return syncableRoutes.some(route => pathname.startsWith(route));
}

// Handle background sync for form submissions
async function handleBackgroundSync(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // Queue the request for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    };
    
    // Store in IndexedDB for later sync
    await storeForSync(requestData);
    
    // Register for background sync if supported
    if ('sync' in self.registration) {
      await self.registration.sync.register(SYNC_QUEUE_NAME);
    }
    
    return new Response(
      JSON.stringify({ 
        queued: true, 
        message: 'Your request has been queued and will be sent when you are back online.' 
      }),
      { 
        status: 202, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Store request for later sync using IndexedDB
async function storeForSync(requestData) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('glow-medspa-sync', 1);
    
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'timestamp' });
      }
    };
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('sync-queue', 'readwrite');
      const store = transaction.objectStore('sync-queue');
      store.add(requestData);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

// Background sync event handler
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_QUEUE_NAME) {
    event.waitUntil(processSyncQueue());
  }
});

// Process queued requests
async function processSyncQueue() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('glow-medspa-sync', 1);
    
    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;
      const transaction = db.transaction('sync-queue', 'readwrite');
      const store = transaction.objectStore('sync-queue');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const requests = getAllRequest.result;
        
        for (const requestData of requests) {
          try {
            await fetch(requestData.url, {
              method: requestData.method,
              headers: requestData.headers,
              body: requestData.body
            });
            
            // Remove from queue on success
            store.delete(requestData.timestamp);
            
            // Notify client of successful sync
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_COMPLETED',
                url: requestData.url
              });
            });
          } catch (error) {
            console.error('[SW] Failed to sync request:', error);
          }
        }
        
        resolve();
      };
      
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

// Push notification handler (stub for future implementation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    return;
  }
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/dashboard',
        ...data
      },
      actions: data.actions || [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      tag: data.tag || 'glow-medspa-notification',
      renotify: data.renotify || false
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Glow MedSpa',
        options
      )
    );
  } catch (error) {
    console.error('[SW] Error handling push notification:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const url = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        
        // Open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Message handler for communication with the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[SW] Service worker loaded');
