"use client";
import Link from 'next/link';
import React, { useState } from 'react';

export default function FilteredVeturaClient({ cars, styles }: { cars: any[], styles: any }) {
  const [marka, setMarka] = useState('');
  const [vitMin, setVitMin] = useState(2000);
  const [vitMax, setVitMax] = useState(2025);
  const [buxhetMin, setBuxhetMin] = useState('');
  const [buxhetMax, setBuxhetMax] = useState('');
  const [filtered, setFiltered] = useState(cars);

  const handleFilter = () => {
    let result = cars;
    if (marka) result = result.filter(car => car.make === marka);
    result = result.filter(car => car.year >= vitMin && car.year <= vitMax);
    if (buxhetMin) result = result.filter(car => car.price >= parseInt(buxhetMin));
    if (buxhetMax) result = result.filter(car => car.price <= parseInt(buxhetMax));
    setFiltered(result);
  };

  return (
  <div style={{ display: 'flex', gap: 48 }}>
      <aside style={{
        minWidth: 260,
        maxWidth: 320,
        background: 'linear-gradient(135deg, #fff 60%, #c8232c 100%)',
        borderRadius: 18,
        boxShadow: '0 6px 24px rgba(44,62,80,0.10)',
        padding: '28px 22px',
  marginRight: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        border: '2px solid #0f4ea8',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#c8232c', marginBottom: 10 }}>Filtro Veturat</h3>
        <label style={{ fontWeight: 600, color: '#0f4ea8', marginBottom: 6 }}>Marka</label>
        <select value={marka} onChange={e => setMarka(e.target.value)} style={{ padding: '8px', borderRadius: 8, border: '1.5px solid #c8232c', marginBottom: 10, fontWeight: 600 }}>
          <option value="">Zgjidh markën</option>
          <option value="Citroen">Citroen</option>
          <option value="Peugeot">Peugeot</option>
          <option value="Renault">Renault</option>
        </select>
        <label style={{ fontWeight: 600, color: '#0f4ea8', marginBottom: 6 }}>Viti</label>
        <input type="number" placeholder="Prej vitit" min={2000} max={2025} value={vitMin} onChange={e => setVitMin(Number(e.target.value))} style={{ padding: '8px', borderRadius: 8, border: '1.5px solid #c8232c', marginBottom: 10, fontWeight: 600 }} />
        <input type="number" placeholder="Deri vitit" min={2000} max={2025} value={vitMax} onChange={e => setVitMax(Number(e.target.value))} style={{ padding: '8px', borderRadius: 8, border: '1.5px solid #c8232c', marginBottom: 10, fontWeight: 600 }} />
        <label style={{ fontWeight: 600, color: '#0f4ea8', marginBottom: 6 }}>Buxheti (€)</label>
        <input type="number" placeholder="Min €" value={buxhetMin} onChange={e => setBuxhetMin(e.target.value)} style={{ padding: '8px', borderRadius: 8, border: '1.5px solid #c8232c', marginBottom: 10, fontWeight: 600 }} />
        <input type="number" placeholder="Max €" value={buxhetMax} onChange={e => setBuxhetMax(e.target.value)} style={{ padding: '8px', borderRadius: 8, border: '1.5px solid #c8232c', marginBottom: 10, fontWeight: 600 }} />
        <button onClick={handleFilter} style={{ background: 'linear-gradient(90deg, #c8232c 60%, #0f4ea8 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, padding: '12px 0', marginTop: 10, boxShadow: '0 2px 8px rgba(44,62,80,0.10)', fontSize: 16 }}>Filtro</button>
      </aside>

      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>Veturat e Disponueshme</h2>
        <p style={{ margin: 0, color: '#444', marginBottom: 16 }}>Filtroj sipas markës, vitit ose buxhetit. Listim i shpejtë me foto, kilometrazh dhe çmim.</p>

        <div style={styles.grid as any}>
          {filtered.length === 0 ? (
            <div style={{ color: '#c8232c', fontWeight: 700, fontSize: 18, gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
              Nuk ka vetura të listuara aktualisht.
            </div>
          ) : filtered.map(car => {
            let images = [];
            try {
              images = Array.isArray(car.images) ? car.images : JSON.parse(car.images || '[]');
            } catch {
              images = [];
            }
            return (
              <div key={car.id} style={styles.card as any}>
                <div style={{ width: '100%', minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {images.map((imgUrl: string, idx: number) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`${car.make} ${car.model} ${idx+1}`}
                      style={{ ...styles.img, maxHeight: 240, maxWidth: 320, width: '100%', objectFit: 'cover', borderRadius: 16, background: '#f8f8f8', boxShadow: '0 2px 8px rgba(44,62,80,0.08)' }}
                    />
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{car.make} {car.model}</div>
                      <div style={{ color: '#666', fontSize: 13 }}>{car.year} • {car.mileage.toLocaleString()} km</div>
                    </div>
                    <div style={styles.price as any}>{car.price} €</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Link href={`/vetura/${car.id}`}><button style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #e6e6e6', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>Detajet</button></Link>
                    <Link href="/kontakti"><button style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: 'none', background: '#c8232c', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Kontakto për këtë veturë</button></Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
