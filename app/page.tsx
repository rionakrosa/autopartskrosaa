import Link from 'next/link'
import ProductsGridClient from '../Components/ProductsGridClient';
import dynamic from 'next/dynamic'
const Header = dynamic(() => import('../Components/Header'), { ssr: false })
import fs from 'fs/promises'
import path from 'path'
import { prisma } from '../lib/prisma'

async function readProductsJson() {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'products.json'), 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('Could not read products.json', e)
    return []
  }
}

export default async function Home() {
  // Prefer DB via Prisma (admin upserts use DB when available). Fall back to JSON file.
  let products: any[] = []
  try {
    const rows = await prisma.product.findMany({ orderBy: { id: 'asc' } })
    products = rows.map((p:any) => ({ ...p, details: typeof p.details === 'string' ? JSON.parse(p.details) : (p.details || []) }))
  } catch (err) {
    products = await readProductsJson()
  }
  // Filter only best sellers
  products = products.filter((p:any) => p.bestSeller);
  const styles: { [k: string]: React.CSSProperties } = {
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
    header: { background: '#c8232c', color: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.08)' },
    headerInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' },
    logo: { display: 'flex', alignItems: 'center', gap: 12 },
    navList: { display: 'flex', gap: 28, listStyle: 'none', margin: 0, padding: 0 },
    hero: { background: 'linear-gradient(180deg,#0f4ea8 0%,#0b3f88 100%)', color: '#fff', padding: '64px 0' },
    heroInner: { display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
    heroLeft: { flex: '1 1 380px', maxWidth: 600 },
    heroTitle: { fontSize: 44, lineHeight: 1.02, fontWeight: 800, margin: '0 0 16px' },
    heroText: { fontSize: 16, marginBottom: 18, color: 'rgba(255,255,255,0.92)' },
    btnPrimary: { background: '#b71f24', color: '#fff', padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600 },
    btnSecondary: { background: 'transparent', color: '#fff', padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer' },
    heroImageWrap: { flex: '1 1 320px', display: 'flex', justifyContent: 'flex-end' },
    heroImage: { width: 520, borderRadius: 12, boxShadow: '0 24px 48px rgba(2,6,23,0.18)' },
    productsCardWrap: { marginTop: -48 },
    productsCard: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 18px 40px rgba(2,6,23,0.12)' },
    productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, justifyItems: 'center', alignItems: 'stretch', margin: '0 auto', maxWidth: 1200, padding: 24 },
    productCard: {
      borderRadius: 18,
      border: '1.5px solid #e6e6e6',
      padding: 24,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: 320,
      minHeight: 340,
      background: '#fff',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      transition: 'box-shadow .15s ease, transform .15s ease',
      overflow: 'hidden',
    },
    productImage: {
      width: 240,
      height: 240,   
      objectFit: 'contain',
      borderRadius: 12,
      margin: '0 auto 16px auto',
      background: '#f8f8f8',
      display: 'block',
    },
    productContent: { 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Header */}
      <Header />

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.container as any}>
          <div style={styles.heroInner as any}>
            <div style={styles.heroLeft}>
              <h2 style={styles.heroTitle}>Pjesët që e bëjnë makinën tuaj kampion Auto Parts Krosa</h2>
              <p style={styles.heroText}>Ne ofrojmë pjesë cilësore për çdo lloj automjeti, pjesë te perdorura gjithashtu.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/products"><button style={styles.btnPrimary}>Produktet</button></Link>
                <Link href="/contact"><button style={styles.btnSecondary}>Kontakti</button></Link>
                <Link href="/admin"><button style={{ ...styles.btnPrimary, background: '#c8232c' }}>🔐 Admin Login</button></Link>
              </div>
            </div>

            <div style={styles.heroImageWrap as any}>
              <img src="/veture.png" alt="car parts" style={styles.heroImage} />
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section style={styles.productsCardWrap}>
        <div style={styles.container as any}>
          <div style={styles.productsCard as any}>
              <h3 style={{ textAlign: 'center', fontSize: 28, margin: '0 0 18px', fontWeight: 700, color: '#111' }}>Best Selling</h3>
            <div style={styles.productsGrid as any}>
              <ProductsGridClient products={products} styles={styles} />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{ background: 'linear-gradient(135deg, #0f4ea8 0%, #0b3f88 100%)', padding: '48px 0', marginTop: 48 }}>
        <div style={styles.container as any}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Abonohu tani dhe merr zbritje në blerjen tënde të ardhshme!
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>
              Po, pranoj të marr newsletter nga Auto Parts Krosa me oferta të personalizuara, zbritje speciale, anketa, etj.
            </p>
            <div style={{ display: 'flex', gap: 12, maxWidth: 500, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input 
                type="email" 
                placeholder="Adresa e-mail" 
                style={{ 
                  flex: 1,
                  minWidth: 250,
                  padding: '12px 16px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderRadius: 8, 
                  fontSize: 14,
                  outline: 'none',
                  background: 'rgba(255,255,255,0.95)'
                }}
              />
              <button style={{ 
                background: '#c8232c', 
                color: '#fff', 
                padding: '12px 32px', 
                borderRadius: 8, 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 4px 12px rgba(200,35,44,0.3)'
              }}>
                Abonohu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Payment & Shipping Info */}
      <section style={{ background: '#0b3f88', padding: '32px 0' }}>
        <div style={styles.container as any}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16, opacity: 0.9 }}>
              METODAT E PAGESËS DHE TRANSPORTIT
            </h4>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', opacity: 0.8 }}>
              <div style={{ color: '#fff', fontSize: 12, padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 6 }}>💳 Mastercard</div>
              <div style={{ color: '#fff', fontSize: 12, padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 6 }}>💳 PayPal</div>
              <div style={{ color: '#fff', fontSize: 12, padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 6 }}>💳 Visa</div>
              <div style={{ color: '#fff', fontSize: 12, padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 6 }}>💳 CB</div>
              <div style={{ color: '#fff', fontSize: 12, padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 6 }}>� Posta e Kosovës</div>
              <div style={{ color: '#fff', fontSize: 12, padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 6 }}>� PTK Post</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 24, marginTop: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32, color: '#fff' }}>
              <div>
                <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, opacity: 0.95 }}>Orari i punës</h5>
                <p style={{ fontSize: 13, margin: 0, opacity: 0.85, lineHeight: 1.6 }}>
                  E Hënë - E Premte: 8:00 - 20:00<br />
                  E Shtunë: 8:00 - 17:00<br />
                  E Diel: mbyllur
                </p>
              </div>
              <div>
                <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, opacity: 0.95 }}>Kontakti</h5>
                <p style={{ fontSize: 13, margin: 0, opacity: 0.85, lineHeight: 1.6 }}>
                  📞 +383 XX XXX XXX<br />
                  📧 info@autopartskrosa.com<br />
                  📍 Prishtinë, Kosovë
                </p>
              </div>
              <div>
                <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, opacity: 0.95 }}>Na ndiqni</h5>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>f</div>
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>▶</div>
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>📷</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: '#0a2d5f', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: 20 }}>
        <p style={{ margin: 0, fontSize: 13 }}>© 2025 www.autopartskrosa.com - boutique en ligne AUTO PARTS KROSA</p>
      </footer>
    </main>
  )
}


