// Service Worker untuk Web Push Notifications & PWA
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Menerima push event dari server ketika layar HP terkunci / aplikasi sedang tertutup
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = {}
  try {
    payload = event.data.json()
  } catch {
    payload = {
      title: 'Finance Tracker',
      body: event.data.text(),
    }
  }

  const title = payload.title || 'Finance Tracker'
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/apple-touch-icon-v2.png',
    data: {
      url: payload.url || '/dashboard',
    },
    tag: payload.tag || 'budget-alert',
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Membuka atau memfokuskan halaman dashboard saat pengguna mengetuk notifikasi di HP
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    }),
  )
})
