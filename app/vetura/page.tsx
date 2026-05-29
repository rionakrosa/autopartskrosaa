
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { prisma } from '../../lib/prisma'
import FilteredVeturaClient from '../../Components/FilteredVeturaClient'
import { useState } from 'react'

const Header = dynamic(() => import('../../Components/Header'), { ssr: false })


export default async function VeturaPage() {
  const styles: { [k: string]: React.CSSProperties } = {
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
    hero: { background: 'linear-gradient(180deg,#c8232c 0%, #0f4ea8 100%)', color: '#fff', padding: '110px 0 48px 0' },
    heroInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' },
    heroLeft: { flex: '1 1 420px', maxWidth: 720 },
    heroTitle: { fontSize: 34, margin: '0 0 12px', fontWeight: 800 },
    heroText: { fontSize: 15, marginBottom: 16, color: 'rgba(255,255,255,0.95)' },
    btnPrimary: { background: '#fff', color: '#c8232c', padding: '10px 18px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginTop: 18 },
    card: { background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 10px 30px rgba(2,6,23,0.08)', display: 'flex', flexDirection: 'column', height: '100%' },
    img: { width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 },
    meta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    price: { color: '#0f4ea8', fontWeight: 800, fontSize: 18 }
  }

  // Fetch cars from DB
  const cars = await prisma.car.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <section style={styles.hero}>
        <div style={styles.container as any}>
          <div style={styles.heroInner as any}>
            <div style={styles.heroLeft as any}>
              <h1 style={styles.heroTitle}>Vetura për Shitje</h1>
              <p style={styles.heroText}>Zgjedhni nga automjetet tona të vlerësuara. Të gjitha veturat kontrollohen para shitjes dhe ofrohet mundësia e provës.</p>
               <div style={{ display: 'flex', gap: 12 }}>
                 <Link href="/kontakti"><button style={styles.btnPrimary}>Kontakto Për Veturë</button></Link>
               </div>
            </div>
            <div style={{ flex: '0 0 360px', display: 'flex', justifyContent: 'flex-end' }}>
              {/* You can add a hero image here if needed */}
            </div>
          </div>
        </div>
      </section>
      <section id="list" style={{ padding: '40px 0' }}>
        <FilteredVeturaClient cars={cars} styles={styles} />
      </section>
      <footer style={{ background: '#0a2d5f', color: 'rgba(255,255,255,0.8)', textAlign: 'center', padding: 20 }}>
        <p style={{ margin: 0, fontSize: 13 }}>© 2025 Auto Parts Krosa — Vetura për Shitje</p>
      </footer>
    </main>
  )
}
