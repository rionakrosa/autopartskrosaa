// Script to update existing products with stock information
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateProductStock() {
  try {
    console.log('📦 Starting stock update for existing products...\n');

    // Read products.json to get the list
    const productsPath = path.join(process.cwd(), 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    console.log(`Found ${productsData.length} products in JSON file\n`);

    // Update each product with random stock (for demo purposes)
    // In production, you'd have real stock data
    let updated = 0;
    
    for (const product of productsData) {
      const stockAmount = Math.floor(Math.random() * 50) + 10; // Random stock 10-60
      
      // Determine category from product name/description
      let category = 'Të ndryshme';
      const name = product.name.toLowerCase();
      const desc = product.description?.toLowerCase() || '';
      
      if (name.includes('fren') || name.includes('disk')) {
        category = 'Frenave';
      } else if (name.includes('motor') || name.includes('vaj')) {
        category = 'Motor';
      } else if (name.includes('bateri') || name.includes('elektrik')) {
        category = 'Elektrike';
      } else if (name.includes('gome') || name.includes('tire')) {
        category = 'Goma';
      } else if (name.includes('filtr')) {
        category = 'Filtra';
      } else if (name.includes('drit') || name.includes('lamp')) {
        category = 'Ndriçim';
      }

      try {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: stockAmount,
            category: category,
            sku: `SKU-${String(product.id).padStart(5, '0')}`,
            isActive: true,
            updatedAt: new Date()
          }
        });
        
        updated++;
        if (updated % 50 === 0) {
          console.log(`✓ Updated ${updated} products...`);
        }
      } catch (error) {
        console.log(`⚠️  Product ID ${product.id} not found in DB, skipping...`);
      }
    }

    console.log(`\n✅ Successfully updated ${updated} products with stock information!`);
    console.log('\nStock ranges assigned:');
    console.log('  - Each product: 10-60 units');
    console.log('  - Categories auto-assigned based on product names');
    console.log('  - SKU generated: SKU-00001, SKU-00002, etc.');
    
  } catch (error) {
    console.error('❌ Error updating stock:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductStock();
