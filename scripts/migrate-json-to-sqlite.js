const fs = require('fs/promises')
const path = require('path')

async function main(){
  const file = path.join(__dirname, '..', 'data', 'products.json')
  const raw = await fs.readFile(file, 'utf8')
  const products = JSON.parse(raw)

  // lazy require prisma client so user has installed deps first
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  console.log('Clearing existing Product table...')
  await prisma.product.deleteMany()

  for (const p of products) {
    await prisma.product.create({ data: {
      id: p.id,
      name: p.name || '',
      price: p.price || '',
      image: p.image || '/placeholder.png',
      description: p.description || '',
      details: JSON.stringify(p.details || []),
      bestSeller: !!p.bestSeller
    }})
  }

  console.log('Imported', products.length, 'products into SQLite via Prisma')
  await prisma.$disconnect()
}

main().catch((e)=>{ console.error(e); process.exit(1) })
