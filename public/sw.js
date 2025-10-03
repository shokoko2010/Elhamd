const CACHE_NAME = 'elhamd-imports-v1';
const STATIC_CACHE_NAME = 'elhamd-imports-static-v1';
const DYNAMIC_CACHE_NAME = 'elhamd-imports-dynamic-v1';
const IMAGE_CACHE_NAME = 'elhamd-imports-images-v1';
const API_CACHE_NAME = 'elhamd-imports-api-v1';

// Cache URLs
const STATIC_URLS = [
  '/',
  '/vehicles',
  '/test-drive', 
  '/service',
  '/contact',
  '/about',
  '/offline'
];

const API_URLS = [
  '/api/vehicles',
  '/api/company-info',
  '/api/service-items', 
  '/api/sliders',
  '/api/about/stats',
  '/api/about/values',
  '/api/about/features',
  '/api/calendar/data',
  '/api/calendar/available-slots',
  '/api/admin/dashboard-data',
  '/api/placeholder'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first', 
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        // Use addAll with error handling for individual URLs
        return Promise.allSettled(
          STATIC_URLS.map(url => 
            fetch(url)
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
                console.warn(`Failed to cache ${url}: ${response.status}`);
                return Promise.resolve();
              })
              .catch(error => {
                console.warn(`Failed to cache ${url}:`, error);
                return Promise.resolve();
              })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== IMAGE_CACHE_NAME && 
              cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle different types of requests
  if (event.request.method === 'GET') {
    // Static pages - Cache First strategy
    if (STATIC_URLS.includes(url.pathname)) {
      event.respondWith(cacheFirstStrategy(event.request));
      return;
    }
    
    // API calls - Network First strategy
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkFirstStrategy(event.request, API_CACHE_NAME));
      return;
    }
    
    // Images - Cache First with expiration
    if (event.request.destination === 'image') {
      event.respondWith(cacheFirstStrategy(event.request, IMAGE_CACHE_NAME));
      return;
    }
    
    // Other static assets (CSS, JS) - Stale While Revalidate
    if (event.request.destination === 'script' || 
        event.request.destination === 'style' ||
        event.request.destination === 'font') {
      event.respondWith(staleWhileRevalidateStrategy(event.request, STATIC_CACHE_NAME));
      return;
    }
    
    // Dynamic content - Network First
    event.respondWith(networkFirstStrategy(event.request, DYNAMIC_CACHE_NAME));
  } else {
    // POST/PUT/DELETE requests - Network Only
    event.respondWith(networkOnlyStrategy(event.request));
  }
});

// Cache First Strategy
async function cacheFirstStrategy(request, cacheName = STATIC_CACHE_NAME) {
  // Skip caching for chrome-extension and other unsupported schemes
  if (request.url.startsWith('chrome-extension://') || 
      request.url.startsWith('moz-extension://') ||
      request.url.startsWith('safari-web-extension://') ||
      request.url.startsWith('edge://') ||
      request.url.startsWith('chrome://') ||
      request.url.startsWith('data:')) {
    return fetch(request);
  }
  
  // Skip caching for external domains in production to avoid CORS issues
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return fetch(request);
  }
  
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      try {
        const cache = await caches.open(cacheName);
        // Only cache if the URL is valid and from same origin
        if (!request.url.startsWith('chrome-extension://') && 
            !request.url.startsWith('moz-extension://') &&
            !request.url.startsWith('safari-web-extension://') &&
            !request.url.startsWith('edge://') &&
            !request.url.startsWith('chrome://') &&
            !request.url.startsWith('data:') &&
            url.origin === self.location.origin) {
          await cache.put(request, networkResponse.clone());
        }
      } catch (error) {
        console.warn('Failed to cache response:', error);
      }
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First Strategy failed:', error);
    // For external images, try to fetch without caching
    if (url.origin !== self.location.origin && request.destination === 'image') {
      try {
        return await fetch(request);
      } catch (fetchError) {
        console.error('Failed to fetch external image:', fetchError);
      }
    }
    return getOfflineResponse();
  }
}

// Network First Strategy  
async function networkFirstStrategy(request, cacheName = DYNAMIC_CACHE_NAME) {
  // Skip caching for chrome-extension and other unsupported schemes
  if (request.url.startsWith('chrome-extension://') || 
      request.url.startsWith('moz-extension://') ||
      request.url.startsWith('safari-web-extension://') ||
      request.url.startsWith('edge://') ||
      request.url.startsWith('chrome://') ||
      request.url.startsWith('data:')) {
    return fetch(request);
  }
  
  // Skip caching for external domains in production to avoid CORS issues
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return fetch(request);
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      try {
        const cache = await caches.open(cacheName);
        // Only cache if the URL is valid and from same origin
        if (!request.url.startsWith('chrome-extension://') && 
            !request.url.startsWith('moz-extension://') &&
            !request.url.startsWith('safari-web-extension://') &&
            !request.url.startsWith('edge://') &&
            !request.url.startsWith('chrome://') &&
            !request.url.startsWith('data:') &&
            url.origin === self.location.origin) {
          await cache.put(request, networkResponse.clone());
        }
      } catch (error) {
        console.warn('Failed to cache response:', error);
      }
    }
    return networkResponse;
  } catch (error) {
    console.log('Network First Strategy: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return getOfflineResponse();
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request, cacheName = STATIC_CACHE_NAME) {
  // Skip caching for chrome-extension and other unsupported schemes
  if (request.url.startsWith('chrome-extension://') || 
      request.url.startsWith('moz-extension://') ||
      request.url.startsWith('safari-web-extension://') ||
      request.url.startsWith('edge://') ||
      request.url.startsWith('chrome://') ||
      request.url.startsWith('data:')) {
    return fetch(request);
  }
  
  // Skip caching for external domains in production to avoid CORS issues
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return fetch(request);
  }
  
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      try {
        const cache = await caches.open(cacheName);
        // Only cache if the URL is valid and from same origin
        if (!request.url.startsWith('chrome-extension://') && 
            !request.url.startsWith('moz-extension://') &&
            !request.url.startsWith('safari-web-extension://') &&
            !request.url.startsWith('edge://') &&
            !request.url.startsWith('chrome://') &&
            !request.url.startsWith('data:') &&
            url.origin === self.location.origin) {
          await cache.put(request, networkResponse.clone());
        }
      } catch (error) {
        console.warn('Failed to cache response:', error);
      }
    }
    return networkResponse;
  }).catch(error => {
    console.warn('Fetch failed in stale-while-revalidate:', error);
    throw error;
  });
  
  return cachedResponse || fetchPromise;
}

// Network Only Strategy
async function networkOnlyStrategy(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Network Only Strategy failed:', error);
    throw error;
  }
}

// Get offline response
async function getOfflineResponse() {
  const offlineResponse = await caches.match('/offline');
  if (offlineResponse) {
    return offlineResponse;
  }
  
  // Create basic offline response
  return new Response(
    `<!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>غير متصل - Elhamd Imports</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: #f3f4f6;
          text-align: center;
          direction: rtl;
        }
        .container {
          max-width: 400px;
          padding: 2rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h1 {
          color: #1f2937;
          margin-bottom: 1rem;
        }
        p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover {
          background: #1d4ed8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>أنت غير متصل بالإنترنت</h1>
        <p>يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.</p>
        <button onclick="window.location.reload()">إعادة المحاولة</button>
      </div>
    </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    }
  );
}

// Background Sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Sync forms when back online
async function syncForms() {
  try {
    // Get stored form data from IndexedDB
    const formData = await getStoredFormData();
    
    // Submit each form
    for (const data of formData) {
      try {
        const response = await fetch(data.url, {
          method: data.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.body)
        });
        
        if (response.ok) {
          // Remove successfully submitted form from storage
          await removeStoredFormData(data.id);
          console.log('Form synced successfully:', data.id);
        }
      } catch (error) {
        console.error('Failed to sync form:', data.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getStoredFormData() {
  // This would typically use IndexedDB to store form data
  // For now, return empty array
  return [];
}

async function removeStoredFormData(id) {
  // Remove form data from IndexedDB
  console.log('Removing stored form data:', id);
}

// Push notification support
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Al-Hamd Cars',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'عرض التفاصيل',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close', 
        title: 'إغلاق',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Elhamd Imports', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from client
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        // Use Promise.allSettled to handle individual URL failures
        return Promise.allSettled(
          event.data.urls.map(url => 
            fetch(url)
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
                console.warn(`Failed to cache ${url}: ${response.status}`);
                return Promise.resolve();
              })
              .catch(error => {
                console.warn(`Failed to cache ${url}:`, error);
                return Promise.resolve();
              })
          )
        );
      })
    );
  }
});