"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic'
const Header = dynamic(() => import('../../Components/Header'), { ssr: false })

export default function KontaktPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('message', message);
      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setStatus('sent');
        setName(''); setEmail(''); setMessage(''); setFile(null);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  }

  const styles: { [k: string]: React.CSSProperties } = {
    hero: { background: 'linear-gradient(180deg,#0f4ea8 0%,#0b3f88 100%)', color: '#fff', padding: '120px 24px' },
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
    heroTitle: { fontSize: 44, fontWeight: 800, margin: '0 0 12px' },
    heroText: { fontSize: 16, color: 'rgba(255,255,255,0.92)', maxWidth: 720 },
    cardWrap: { marginTop: -48 },
    card: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 18px 40px rgba(2,6,23,0.12)' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 } as React.CSSProperties,
    gridMobile: { display: 'block' },
    sectionTitle: { fontSize: 24, fontWeight: 700, color: '#0f4ea8', marginBottom: 12 },
    infoItem: { marginBottom: 12, color: '#333' },
    label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#0f4ea8' },
    input: { width: '100%', border: '1px solid #e6e6e6', borderRadius: 10, padding: '12px 14px', fontSize: 14 },
    textarea: { width: '100%', border: '1px solid #e6e6e6', borderRadius: 10, padding: '12px 14px', fontSize: 14, minHeight: 140, resize: 'vertical' as const },
    fileInput: { display: 'block', width: '100%', border: '1px solid #e6e6e6', borderRadius: 10, padding: '12px 14px', fontSize: 14, cursor: 'pointer' },
    fileLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', marginTop: 4 },
    submit: { background: '#c8232c', color: '#fff', padding: '12px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 },
    statusOk: { color: '#166534', fontWeight: 600 },
    statusErr: { color: '#b91c1c', fontWeight: 600 },
  }

  return (
    <>
      <Header />

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.heroTitle}>Kontakti</h1>
          <p style={styles.heroText}>Keni pyetje apo keni nevojë për ndihmë? Na shkruani dhe ne do t’ju përgjigjemi sa më shpejt.</p>
        </div>
      </section>

      {/* Card */}
      <div style={styles.container}>
        <div style={{ ...styles.cardWrap }}>
          <div style={styles.card}>
            <div style={styles.grid as React.CSSProperties}>
              {/* Info column */}
              <div>
                <h2 style={styles.sectionTitle}>Të dhënat e kontaktit</h2>
                <div style={styles.infoItem}><strong>Telefon:</strong> +383 44 000 000</div>
                <div style={styles.infoItem}><strong>Email:</strong> info@autopartskrosa.com</div>
                <div style={styles.infoItem}><strong>Adresa:</strong> Ferizaj, Kosovë</div>
                <div style={{ marginTop: 16, fontSize: 13, color: '#555' }}>Orari: Hënë - Shtunë, 09:00 - 18:00</div>
              </div>

              {/* Form column */}
              <div>
                <h2 style={styles.sectionTitle}>Na shkruani</h2>
                <form onSubmit={handleSubmit}>
                  <label style={styles.label}>Emri</label>
                  <input style={styles.input} value={name} onChange={(e)=>setName(e.target.value)} placeholder="Emri juaj" />

                  <div style={{ height: 12 }} />
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="ju@example.com" />

                  <div style={{ height: 12 }} />
                  <label style={styles.label}>Mesazhi</label>
                  <textarea style={styles.textarea} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Shkruani mesazhin tuaj" />

                  <div style={{ height: 12 }} />
                  <label style={styles.label}>Bashkangjit foto ose PDF (opsionale)</label>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    style={styles.fileInput}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && (
                    <div style={styles.fileLabel}>
                      📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  )}

                  <div style={{ height: 16 }} />
                  <button type="submit" style={styles.submit} disabled={status==='sending'}>
                    {status === 'sending' ? 'Duke dërguar…' : 'Dërgo mesazhin'}
                  </button>
                  <div style={{ height: 8 }} />
                  {status === 'sent' && <div style={styles.statusOk}>Faleminderit — mesazhi juaj u dërgua.</div>}
                  {status === 'error' && <div style={styles.statusErr}>Diçka shkoi keq. Ju lutem provoni përsëri.</div>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </>
  );
}
