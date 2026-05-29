import fs from 'fs/promises';
import path from 'path';
import dynamic from 'next/dynamic';
const Header = dynamic(() => import('../../../Components/Header'), { ssr: false });

async function getMessages() {
  try {
    const file = path.join(process.cwd(), 'data', 'messages.json');
    const raw = await fs.readFile(file, 'utf8');
    const messages = JSON.parse(raw || '[]');
    return messages.reverse(); // Newest first
  } catch (e) {
    return [];
  }
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  const styles: { [k: string]: React.CSSProperties } = {
    hero: { background: 'linear-gradient(180deg,#0f4ea8 0%,#0b3f88 100%)', color: '#fff', padding: '120px 24px' },
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
    heroTitle: { fontSize: 44, fontWeight: 800, margin: '0 0 12px' },
    heroText: { fontSize: 16, color: 'rgba(255,255,255,0.92)' },
    cardWrap: { marginTop: -48 },
    card: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 18px 40px rgba(2,6,23,0.12)', marginBottom: 16 },
    messageCard: { 
      background: '#fff', 
      borderRadius: 12, 
      padding: 20, 
      boxShadow: '0 4px 12px rgba(2,6,23,0.08)', 
      marginBottom: 16,
      border: '1px solid #e6e6e6'
    },
    badge: { 
      display: 'inline-block', 
      background: '#c8232c', 
      color: '#fff', 
      padding: '4px 12px', 
      borderRadius: 6, 
      fontSize: 12, 
      fontWeight: 600,
      marginBottom: 8
    },
    label: { fontSize: 13, fontWeight: 600, color: '#0f4ea8', marginBottom: 4 },
    value: { fontSize: 14, color: '#333', marginBottom: 12 },
    messageText: { 
      fontSize: 14, 
      color: '#333', 
      background: '#f8f9fa', 
      padding: 12, 
      borderRadius: 8,
      border: '1px solid #e6e6e6',
      whiteSpace: 'pre-wrap' as const
    },
    attachment: {
      display: 'inline-block',
      background: '#0f4ea8',
      color: '#fff',
      padding: '6px 12px',
      borderRadius: 6,
      fontSize: 13,
      textDecoration: 'none',
      marginTop: 8
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: 40,
      color: '#666'
    }
  };

  return (
    <>
      <Header />

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.heroTitle}>Admin - Mesazhet</h1>
          <p style={styles.heroText}>Menaxho të gjitha mesazhet nga kontakti</p>
        </div>
      </section>

      {/* Messages */}
      <div style={styles.container}>
        <div style={styles.cardWrap}>
          {messages.length === 0 ? (
            <div style={styles.card}>
              <div style={styles.emptyState}>
                <h3>Asnjë mesazh</h3>
                <p>Nuk ka mesazhe të reja ende.</p>
              </div>
            </div>
          ) : (
            messages.map((msg: any, idx: number) => (
              <div key={idx} style={styles.messageCard}>
                <div style={styles.badge}>Mesazh #{messages.length - idx}</div>
                
                <div style={{ marginBottom: 12 }}>
                  <div style={styles.label}>Emri</div>
                  <div style={styles.value}>{msg.name}</div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={styles.label}>Email</div>
                  <div style={styles.value}>
                    <a href={`mailto:${msg.email}`} style={{ color: '#0f4ea8' }}>
                      {msg.email}
                    </a>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={styles.label}>Data</div>
                  <div style={styles.value}>
                    {new Date(msg.createdAt).toLocaleString('sq-AL')}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={styles.label}>Mesazhi</div>
                  <div style={styles.messageText}>{msg.message}</div>
                </div>

                {msg.attachment && (
                  <div>
                    <div style={styles.label}>Bashkangjitje</div>
                    <a 
                      href={`/data/${msg.attachment}`} 
                      target="_blank" 
                      style={styles.attachment}
                    >
                      📎 Shiko bashkangjitjen
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ height: 80 }} />
    </>
  );
}