import { NextResponse } from 'next/server'
import { signAdminToken } from '../../../../lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body || {}
    const ADMIN_USER = process.env.ADMIN_USER || 'admin'
    const ADMIN_PASS = process.env.ADMIN_PASS || 'password'
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = signAdminToken()
      return NextResponse.json({ token })
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
