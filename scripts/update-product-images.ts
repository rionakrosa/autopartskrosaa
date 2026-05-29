import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateProductImages() {
  // Map product IDs to new image paths
  const updates = [
    { id: 5, image: '/products/part1.png', name: 'Brake Pads' },
    { id: 6, image: '/products/part2.png', name: 'Oxygen Sensor' },
    { id: 7, image: '/products/part3.png', name: 'Brake Disc' },
    { id: 8, image: '/products/part4.png', name: 'Spark Plug' },
    { id: 9, image: '/products/part5.png', name: 'Air Filter' },
    { id: 10, image: '/products/part6.png', name: 'Oil Filter' },
  ]

  try {
    console.log('🔄 Updating product images...\n')
    
    for (const update of updates) {
      const product = await prisma.product.findUnique({
        where: { id: update.id }
      })

      if (product) {
        await prisma.product.update({
          where: { id: update.id },
          data: { image: update.image }
        })
        console.log(`✓ Product ${update.id}: ${product.name} → ${update.image}`)
      } else {
        console.log(`⚠ Product ${update.id} not found, skipping...`)
      }
    }

    console.log('\n✅ All product images updated successfully!')
    console.log('📝 Refresh your browser to see the changes.')
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductImages()
