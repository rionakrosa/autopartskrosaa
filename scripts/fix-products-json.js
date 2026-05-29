const fs = require('fs/promises');
const path = require('path');

async function main() {
  const file = path.join(__dirname, '..', 'data', 'products.json');
  const raw = await fs.readFile(file, 'utf8');
  const products = JSON.parse(raw);

  // Fix each product
  const fixed = products.map(p => {
    // Ensure stock is a positive number
    let stock = typeof p.stock === 'number' && p.stock > 0 ? p.stock : 10;
    // Ensure images is an array
    let images = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
    // If product has multiple images in details, add them
    if (Array.isArray(p.details)) {
      const extraImages = p.details.filter(d => typeof d === 'string' && d.match(/\.jpg|\.png|\.jpeg|\/products\//));
      images = images.concat(extraImages);
    }
    // Remove duplicates
    images = [...new Set(images)];
    return {
      ...p,
      stock,
      images,
    };
  });

  await fs.writeFile(file, JSON.stringify(fixed, null, 2), 'utf8');
  console.log('products.json has been fixed.');
}

main().catch(e => { console.error(e); process.exit(1); });
