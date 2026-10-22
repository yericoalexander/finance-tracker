/**
 * Konversi base64url string ke Uint8Array untuk applicationServerKey PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Daftarkan Service Worker dan sinkronkan langganan Web Push ke server
 */
export async function registerAndSubscribePush(
  vapidPublicKey?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Window tidak tersedia' }
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, error: 'Web Push tidak didukung pada browser ini' }
  }

  if (Notification.permission !== 'granted') {
    return { ok: false, error: 'Izin notifikasi belum diberikan' }
  }

  let key = vapidPublicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!key) {
    try {
      const res = await fetch('/api/push/subscribe')
      if (res.ok) {
        const data = (await res.json()) as { publicKey?: string | null }
        key = data.publicKey ?? undefined
      }
    } catch {
      // Gagal mengambil public key
    }
  }

  if (!key) {
    return { ok: false, error: 'Kunci publik VAPID belum dikonfigurasi' }
  }

  try {
    let registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js')
    }
    const readyReg = await navigator.serviceWorker.ready
    let subscription = await readyReg.pushManager.getSubscription()

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(key)
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      })
    }

    const subJson = subscription.toJSON()
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return { ok: false, error: 'Data langganan push tidak lengkap' }
    }

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
        userAgent: navigator.userAgent,
      }),
    })

    if (!res.ok) {
      return { ok: false, error: 'Gagal mendaftarkan langganan push ke server' }
    }

    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Kesalahan langganan push'
    return { ok: false, error: msg }
  }
}
