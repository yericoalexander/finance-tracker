import { eq } from 'drizzle-orm'
import webpush from 'web-push'

import { db } from '@/lib/db/client'
import { pushSubscriptions, type PushSubscription } from '@/lib/db/schema'
import { env } from '@/lib/env'

export interface PushNotificationPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Inisialisasi konfigurasi VAPID untuk Web Push protocol
 */
function ensureVapidConfig(): boolean {
  if (!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    return false
  }

  try {
    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY,
    )
    return true
  } catch {
    return false
  }
}

/**
 * Kirim payload ke satu endpoint langganan dengan pembersihan otomatis jika endpoint sudah kadaluarsa (404/410)
 */
async function sendToSingleSubscription(
  sub: PushSubscription,
  payloadString: string,
): Promise<boolean> {
  const pushConfig = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  }

  try {
    await webpush.sendNotification(pushConfig, payloadString)
    return true
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode
    // Hapus endpoint yang sudah dicabut izinnya atau dihapus oleh Apple/Google APNs
    if (statusCode === 404 || statusCode === 410) {
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.id, sub.id))
        .catch(() => null)
    }
    return false
  }
}

/**
 * Kirim notifikasi Web Push ke seluruh perangkat terdaftar milik pengguna (muncul di lockscreen HP tanpa harus buka app)
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload,
): Promise<{ sent: number; failed: number }> {
  if (!ensureVapidConfig()) {
    return { sent: 0, failed: 0 }
  }

  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  })

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 }
  }

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/dashboard',
    tag: payload.tag || 'budget-alert',
  })

  const results = await Promise.all(
    subscriptions.map((sub) => sendToSingleSubscription(sub, payloadString)),
  )

  const sent = results.filter(Boolean).length
  return { sent, failed: results.length - sent }
}
