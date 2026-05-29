import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { prisma } from '../../../../lib/prisma'
import { verifyTokenFromHeader, unauthorized } from '../../../../lib/auth'

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json')

async function readJsonFile() {
  const raw = await fs.readFile(DATA_FILE, 'utf8')
  return JSON.parse(raw)
}

async function writeJsonFile(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

export async function POST(request: Request) {
  // require auth
  try {
    verifyTokenFromHeader(request)
  } catch (e) {
    return unauthorized()
  }

  try {
    const product = await request.json()
    if (!product || typeof product !== 'object') return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

    // try Prisma upsert
    try {
      const upserted = await prisma.product.upsert({
        where: { id: Number(product.id) },
        update: {
          name: product.name,
          price: product.price,
          images: product.images ?? product.image,
          description: product.description,
          details: JSON.stringify(product.details || []),
          bestSeller: !!product.bestSeller
        },
        create: {
          id: product.id ? Number(product.id) : undefined,
          name: product.name || '',
          price: product.price || '',
          images: (product.images ?? product.image) || '/placeholder.png',
          description: product.description || '',
          details: JSON.stringify(product.details || []),
          bestSeller: !!product.bestSeller
        }
      })
      const normalized = { ...upserted, details: typeof upserted.details === 'string' ? JSON.parse(upserted.details) : (upserted.details || []) }
      return NextResponse.json(normalized)
    } catch (err) {
      console.warn('Prisma upsert failed, falling back to JSON merge', err)
      // fallback: read JSON, replace or append
      const data = await readJsonFile()
      const idx = (data || []).findIndex((p:any) => Number(p.id) === Number(product.id))
      if (idx === -1) {
        // assign id if missing
        const max = (data || []).reduce((m:any, x:any) => Math.max(m, Number(x.id) || 0), 0)
        product.id = product.id || (max + 1)
        data.unshift(product)
      } else {
        data[idx] = { ...data[idx], ...product }
      }
      await writeJsonFile(data)
      return NextResponse.json(product)
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Upsert failed' }, { status: 500 })
  }
}
