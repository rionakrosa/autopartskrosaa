import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const SECRET = process.env.ADMIN_JWT_SECRET || 'dev-secret'
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'password'

export function signAdminToken() {
  return jwt.sign({ user: ADMIN_USER }, SECRET, { expiresIn: '8h' })
}

export function verifyTokenFromHeader(req: Request) {
  try {
    const auth = (req as any).headers?.get?.('authorization') || ''
    if (!auth) throw new Error('No auth')
    const parts = auth.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') throw new Error('Invalid auth header')
    const token = parts[1]
    const decoded = jwt.verify(token, SECRET)
    return decoded
  } catch (err) {
    throw new Error('Unauthorized')
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
