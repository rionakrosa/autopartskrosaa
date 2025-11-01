const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function rmIfExists(p) {
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p)
  } catch (e) {
    console.error('Failed to remove', p, e)
  }
}

async function main(){
  const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db')
  console.log('Removing local SQLite DB if it exists:', dbPath)
  rmIfExists(dbPath)

  console.log('Running DB setup (prisma generate, migrate, import JSON). This may ask for confirmation during migrate.')
  try {
    execSync('npm run db:setup', { stdio: 'inherit' })
    console.log('DB setup complete')
  } catch (e) {
    console.error('DB setup failed', e)
    process.exit(1)
  }
}

main()
