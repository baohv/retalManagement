import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) redirect('/login')

  // Decode role from session token
  try {
    const decoded = Buffer.from(session, 'base64url').toString()
    const payload = decoded.split('.')[0]
    const parts = payload.split(':')
    const role = parts[2] || 'staff'

    if (role === 'tenant') redirect('/my-room')
  } catch {}

  redirect('/dashboard')
}
