// Shared in-memory token store for password reset.
// In production, replace with Redis or DB-backed store.
const tokens = new Map<string, { email: string; expiresAt: number }>()

export function setToken(token: string, email: string) {
  tokens.set(token, { email, expiresAt: Date.now() + 3600000 }) // 1 hour
}

export function getToken(token: string): { email: string; expiresAt: number } | undefined {
  return tokens.get(token)
}

export function deleteToken(token: string) {
  tokens.delete(token)
}

export function cleanup() {
  const now = Date.now()
  for (const [key, val] of tokens) {
    if (now > val.expiresAt) tokens.delete(key)
  }
}
