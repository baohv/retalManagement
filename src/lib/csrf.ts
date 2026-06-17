// Simple CSRF protection via Origin/Referer validation.
// Add to any mutating API route that doesn't have its own CSRF.

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  // Allow same-origin requests
  if (origin) return origin.includes(host || 'localhost')
  if (referer) return referer.includes(host || 'localhost')
  return false // No origin header = suspicious (browser always sends it for cross-site)
}
