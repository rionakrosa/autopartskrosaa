import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateBulkProductImages() {
  // The 6 images we have
  const images = [
    '/products/part1.png', // Brake Pads
    '/products/part2.png', // Oxygen Sensor
    '/products/part3.png', // Brake Disc
    '/products/part4.png', // Spark Plug
    '/products/part5.png', // Air Filter
    '/products/part6.png', // Oil Filter
  ]

  try {
    console.log('🔄 Updating product images in bulk...\n')
    
    // Update products 2 and 3
    await prisma.product.update({
      where: { id: 2 },
      data: { images: images[0] } // part1.png
    })
    console.log(`✓ Product 2 updated → ${images[0]}`)

    await prisma.product.update({
      where: { id: 3 },
      data: { images: images[1] } // part2.png
    })
    console.log(`✓ Product 3 updated → ${images[1]}`)

    // Update products 11-504 in a rotating pattern
    let updated = 0
    for (let id = 11; id <= 504; id++) {
      try {
        // Rotate through the 6 images
        const imageIndex = (id - 11) % 6
        const product = await prisma.product.findUnique({ where: { id } })
        
        if (product) {
          await prisma.product.update({
            where: { id },
            data: { images: images[imageIndex] }
          })
          updated++
          
          // Show progress every 50 products
          if (updated % 50 === 0) {
            console.log(`📦 Updated ${updated} products so far...`)
          }
        }
      } catch (err) {
        // Product doesn't exist, skip
        continue
      }
    }

    console.log(`\n✅ Successfully updated ${updated + 2} products!`)
    console.log('📝 Refresh your browser to see the changes.')
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateBulkProductImages()
