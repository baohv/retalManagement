// Shared in-memory rate limiter.
// In production, replace with Redis-backed store.

interface Entry { count: number; resetAt: number }

const stores = new Map<string, Map<string, Entry>>()

export function checkRateLimit(namespace: string, key: string, maxAttempts = 5, windowMs = 60000): boolean {
  const store = stores.get(namespace) || new Map()
  stores.set(namespace, store)

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxAttempts) return false
  entry.count++
  return true
}

export function resetRateLimit(namespace: string, key: string) {
  const store = stores.get(namespace)
  if (store) store.delete(key)
}
