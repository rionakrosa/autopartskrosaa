const fs = require('fs/promises')
const path = require('path')

async function main(){
  const file = path.join(__dirname, '..', 'data', 'products.json')
  const raw = await fs.readFile(file, 'utf8')
  const products = JSON.parse(raw)

  // lazy require prisma client so user has installed deps first
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  console.log('Clearing related tables (OrderItem, CartItem) and Product table...')
  await prisma.orderItem.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()

  for (const p of products) {
    await prisma.product.create({ data: {
      name: p.name || '',
      price: p.price || 0,
      images: JSON.stringify(Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])),
      description: p.description || '',
      details: JSON.stringify(p.details || []),
      bestSeller: !!p.bestSeller,
      stock: typeof p.stock === 'number' ? p.stock : 0,
      category: p.category || '',
      sku: p.sku || undefined,
      isActive: true
    }})
  }

  console.log('Imported', products.length, 'products into SQLite via Prisma')
  await prisma.$disconnect()
}

main().catch((e)=>{ console.error(e); process.exit(1) })
