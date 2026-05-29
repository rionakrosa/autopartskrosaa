'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic'
const Header = dynamic(() => import('../../Components/Header'), { ssr: false })

export default function AboutPage() {
  return (
    <>
      <Header />
      {/* Hero Section - Blue gradient background like main page */}
      <section style={{
        background: 'linear-gradient(180deg, #0f4ea8 0%, #0b3f88 100%)',
        color: '#fff',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 16,
            lineHeight: 1.1
          }}>
            Rreth nesh
          </h1>
          <p style={{
            fontSize: 18,
            maxWidth: 700,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.6
          }}>
            Auto Parts Krosa është krijuar me një qëllim të thjeshtë: kur makines tuaj i mungon një pjesë dhe nuk dini ku ta gjeni, ne jemi këtu për t'ju ndihmuar. Nëse makina juaj ka nevojë për diçka, ne gjithmonë kemi përgjigjen.
          </p>
        </div>
      </section>

      {/* Main Content - White card with shadow like main page */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 48,
          boxShadow: '0 18px 40px rgba(2,6,23,0.12)',
          marginTop: -48,
          position: 'relative'
        }}>
          {/* Story Section */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#0f4ea8',
              marginBottom: 16
            }}>
              Historia jonë
            </h2>
            <p style={{
              fontSize: 16,
              color: '#333',
              lineHeight: 1.7,
              marginBottom: 16
            }}>
              Me mbi 20 vjet përvojë në servisimin dhe diagnostikimin e veturave në Auto Servisin “Krosa” në Ferizaj, kemi kuptuar në thellësi se çfarë i duhet vërtet makinës suaj. Përvoja jonë shumëvjeçare në fushën e automobilistikës na ka mësuar të ofrojmë gjithmonë cilësi, saktësi dhe besueshmëri.

Nga kjo përvojë lindi Auto Parts Krosa me synimin për të sjellë në Kosovë pjesë origjinale dhe të sigurta për çdo lloj veture. Rrahman Krosa, CEO i kompanisë, me përvojën e tij të gjatë si mekanik profesionist, udhëheq me përkushtim për të garantuar që çdo klient të marrë vetëm më të mirën.
            </p>
            <p style={{
              fontSize: 16,
              color: '#555',
              lineHeight: 1.7
            }}>
              Misioni ynë është i thjeshtë: të ofrojmë pjesë të cilësisë së lartë me çmime të arsyeshme, duke e bërë mirëmbajtjen e veturës suaj më të lehtë dhe më të sigurt.
            </p>
          </section>

          {/* Team Section */}
          <section>
            <h2 style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#0f4ea8',
              marginBottom: 32
            }}>
              Ekipi ynë
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 32
            }}>
              {/* Founder */}
              <article style={{
                textAlign: 'center',
                padding: 24,
                borderRadius: 12,
                border: '2px solid #e6e6e6',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: 140,
                  height: 140,
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #0f4ea8 0%, #c8232c 100%)',
                  border: '4px solid #fff',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                }}>
                  <img 
                    src="/Riona.PNG" 
                    alt="Founder" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#c8232c',
                  marginBottom: 8
                }}>
                  Riona Krosa
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#0f4ea8',
                  fontWeight: 600,
                  marginBottom: 8
                }}>
                  Founder
                </p>
                <p style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 1.5,
                  marginBottom: 8
                }}>
                  Themeluesi që vendosi idenë në lëvizje dhe menaxhon zgjedhjen e produkteve.
                </p>
                <a 
                  href="mailto:rionakrosa@autopartskrosa.com"
                  style={{
                    fontSize: 13,
                    color: '#0f4ea8',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  rionakrosa@autopartskrosa.com
                </a>
              </article>

              {/* CEO */}
              <article style={{
                textAlign: 'center',
                padding: 24,
                borderRadius: 12,
                border: '2px solid #e6e6e6',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: 140,
                  height: 140,
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #c8232c 0%, #0f4ea8 100%)',
                  border: '4px solid #fff',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                }}>
                  <img 
                    src="/Agoni.PNG" 
                    alt="CEO" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#c8232c',
                  marginBottom: 8
                }}>
                  Agon Maksutaj
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#0f4ea8',
                  fontWeight: 600,
                  marginBottom: 8
                }}>
                  Co-Founder
                </p>
                <p style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 1.5
                }}>
                  Udhëheq operacionet dhe siguron cilësi në gjithçka që shesim.
                </p>
                <a 
                  href="mailto:ardikrosa@autopartskrosa.com"
                  style={{
                    fontSize: 13,
                    color: '#0f4ea8',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  agonmaksutaj@autopartskrosa.com
                </a>
              </article>

              {/* Co-CEO */}
              <article style={{
                textAlign: 'center',
                padding: 24,
                borderRadius: 12,
                border: '2px solid #e6e6e6',
                transition: 'all 0.3s ease'
              }}>
                {/*
                <div style={{
                  width: 140,
                  height: 140,
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #0f4ea8 0%, #c8232c 100%)',
                  border: '4px solid #fff',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                }}>
                  <img 
                    src="/team/co-founder.jpg" 
                    alt="Co-Founder" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#c8232c',
                  marginBottom: 8
                }}>
                  Ardi Krosa
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#0f4ea8',
                  fontWeight: 600,
                  marginBottom: 8
                }}>
                  CEO 
                </p>
                <p style={{
                  fontSize: 14,
                  color: '#666',
                  lineHeight: 1.5,
                  marginBottom: 8
                }}>
                  Ndihmon në rritjen e partneriteteve dhe mbështet suksesin e klientit.
                </p>
                <a 
                  href="mailto:ardikrosa@autopartskrosa.com"
                  style={{
                    fontSize: 13,
                    color: '#0f4ea8',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  ardikrosa@autopartskrosa.com
                </a>
                */}
              </article>
            </div>
          </section>
        </div>
      </div>

      {/* Spacing at bottom */}
      <div style={{ height: 80 }}></div>
    </>
  );
}
