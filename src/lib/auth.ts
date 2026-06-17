import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'qlpt-secret-key-change-in-production-2026'

// ─── Session: signed HMAC cookies (persist across restarts) ───

function signToken(payload: string): string {
  const { createHmac } = require('crypto')
  const hmac = createHmac('sha256', SESSION_SECRET)
  hmac.update(payload)
  return hmac.digest('hex')
}

function encodeSession(userId: number, name: string, role?: string): string {
  const payload = `${userId}:${name}:${role || 'staff'}:${Date.now()}`
  const sig = signToken(payload)
  return Buffer.from(`${payload}.${sig}`).toString('base64url')
}

export function decodeSession(token: string): { userId: number; name: string; role: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const lastDot = decoded.lastIndexOf('.')
    if (lastDot === -1) return null
    const payload = decoded.slice(0, lastDot)
    const sig = decoded.slice(lastDot + 1)
    if (signToken(payload) !== sig) return null
    const parts = payload.split(':')
    return { userId: parseInt(parts[0]), name: parts[1], role: parts[2] || 'staff' }
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number, name: string, role?: string): Promise<string> {
  return encodeSession(userId, name, role)
}
export function getSessionRole(token: string | undefined): string | null {
  if (!token) return null
  const decoded = decodeSession(token)
  return decoded?.role || null
}

export function getSession(token: string | undefined): { userId: number; name: string; role: string } | null {
  if (!token) return null
  return decodeSession(token)
}

export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return getSession(token)
}

export function destroySession(_token: string): void {
  // Stateless — nothing to destroy. Cookie will be deleted by caller.
}

export { SESSION_COOKIE }

export function getRoleFromCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null
  try {
    const decoded = Buffer.from(cookieValue, 'base64url').toString()
    const payload = decoded.split('.')[0]
    const parts = payload.split(':')
    return parts[2] || 'staff'
  } catch { return null }
}
