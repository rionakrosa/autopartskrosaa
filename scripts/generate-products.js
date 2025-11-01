const fs = require('fs/promises');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const count = parseInt(args[0], 10) || 500;
  const file = path.join(__dirname, '..', 'data', 'products.json');

  let existing = [];
  try {
    const raw = await fs.readFile(file, 'utf8');
    existing = JSON.parse(raw);
    // backup
    await fs.writeFile(file + '.backup', JSON.stringify(existing, null, 2), 'utf8');
    console.log('Backup saved to', file + '.backup');
  } catch (e) {
    console.log('No existing products file, starting fresh');
  }

  const startId = existing.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
  const out = existing.slice();

  for (let i = 0; i < count; i++) {
    const id = startId + i;
    out.push({
      id,
      name: `Product ${id}`,
      price: `€${(10 + (id % 200)).toFixed(0)}`,
      image: '/placeholder.png',
      description: `Auto part sample description for product ${id}.`,
      details: ['High quality', 'Compatible with many models', '1 year warranty']
    });
  }

  await fs.writeFile(file, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${count} products (total ${out.length}) to ${file}`);
}

main().catch(err => { console.error(err); process.exit(1); });
