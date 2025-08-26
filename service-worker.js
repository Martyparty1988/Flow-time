// FlowTime Pro - Service Worker
// Version 1.0.0

const CACHE_NAME = 'flowtime-pro-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker installed successfully');
                return self.skipWaiting();
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - Cache first, then network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        
        event.waitUntil(
            // Perform background tasks here
            doBackgroundSync()
        );
    }
});

// Push notifications
self.addEventListener('push', event => {
    console.log('Push message received');
    
    const options = {
        body: event.data ? event.data.text() : 'FlowTime Pro notification',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
         {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore',
                title: 'Otevřít aplikaci',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Zavřít',
                icon: '/images/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('FlowTime Pro', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked');
    
    event.notification.close();

    if (event.action === 'explore') {
        // Open app
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close notification
    } else {
        // Default action - open app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function for background sync
async function doBackgroundSync() {
    try {
        console.log('Performing background sync...');
        
        // Here you could sync data with server
        // For now, just log the action
        console.log('Background sync completed');
        
        return Promise.resolve();
    } catch (error) {
        console.error('Background sync failed:', error);
        return Promise.reject(error);
    }
}

// Handle message from main thread
self.addEventListener('message', event => {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
