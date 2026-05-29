import dynamic from 'next/dynamic'
import { prisma } from '../../../lib/prisma'
import Link from 'next/link'

const Header = dynamic(() => import('../../../Components/Header'), { ssr: false })

export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const car = await prisma.car.findUnique({ where: { id: Number(params.id) } })
  if (!car) {
    return (
      <main style={{ minHeight: '100vh', background: '#fff' }}>
        <Header />
        <div style={{ maxWidth: 600, margin: '120px auto', textAlign: 'center', color: '#c8232c', fontWeight: 700, fontSize: 22 }}>
          Vetura nuk u gjet.
        </div>
      </main>
    )
  }
  const styles: { [k: string]: React.CSSProperties } = {
    container: { maxWidth: 900, margin: '0 auto', padding: '0 24px' },
  hero: { background: 'linear-gradient(180deg,#c8232c 0%, #0f4ea8 100%)', color: '#fff', padding: '110px 0 32px' },
    heroInner: { display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' },
    imgWrap: { flex: '0 0 380px', display: 'flex', justifyContent: 'center' },
    img: { width: 340, height: 220, objectFit: 'cover', borderRadius: 12, boxShadow: '0 18px 44px rgba(2,6,23,0.12)' },
    info: { flex: '1 1 320px', maxWidth: 500 },
    title: { fontSize: 32, fontWeight: 800, margin: '0 0 10px' },
    meta: { color: '#e0e7ef', fontSize: 15, marginBottom: 10 },
    price: { color: '#fff', fontWeight: 800, fontSize: 26, margin: '10px 0 18px' },
    desc: { color: '#f3f4f6', fontSize: 15, marginBottom: 18 },
    btn: { background: '#fff', color: '#c8232c', padding: '12px 24px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 16 },
    back: { color: '#fff', textDecoration: 'underline', fontSize: 15, marginBottom: 18, display: 'inline-block' }
  }
  return (
    <main style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <section style={styles.hero}>
        <div style={styles.container as any}>
          <Link href="/vetura" style={styles.back}>&larr; Kthehu te veturat</Link>
          <div style={styles.heroInner as any}>
            <div style={styles.imgWrap as any}>
              {(() => {
                let images = [];
                try {
                  images = Array.isArray(car.images) ? car.images : JSON.parse(car.images || '[]');
                } catch {
                  images = [];
                }
                return images.map((imgUrl: string, idx: number) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`${car.make} ${car.model} ${idx+1}`}
                    style={{ ...styles.img, maxHeight: 240, maxWidth: 320, width: '100%', objectFit: 'cover', borderRadius: 16, background: '#f8f8f8', boxShadow: '0 2px 8px rgba(44,62,80,0.08)', marginBottom: 8 }}
                  />
                ));
              })()}
            </div>
            <div style={styles.info as any}>
              <h1 style={styles.title}>{car.make} {car.model}</h1>
              <div style={styles.meta}>{car.year} • {car.mileage.toLocaleString()} km</div>
              <div style={styles.price}>{car.price} €</div>
              {car.description && <div style={styles.desc}>{car.description}</div>}
              <Link href="/kontakti"><button style={styles.btn}>Kontakto për këtë veturë</button></Link>
            </div>
          </div>
        </div>
      </section>
      <footer style={{ background: '#0a2d5f', color: 'rgba(255,255,255,0.8)', textAlign: 'center', padding: 20, marginTop: 40 }}>
        <p style={{ margin: 0, fontSize: 13 }}>© 2025 Auto Parts Krosa — Vetura për Shitje</p>
      </footer>
    </main>
  )
}
