"use client"

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

export default function Header() {
  // header is visible by default. Hide when scrolling down, show when scrolling up.
  const [shown, setShown] = useState(true)
  const [direction, setDirection] = useState<'up'|'down'|'none'>('none')
  const [cartCount, setCartCount] = useState<number>(0)
  const [showProductsMenu, setShowProductsMenu] = useState(false)
  const closeMenuTimeout = useRef<NodeJS.Timeout | null>(null)

  // Fetch cart count from API
  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.cart?.itemCount || 0);
      }
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY || window.pageYOffset : 0
    let ticking = false
    const threshold = 12 // pixels of delta to consider

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || window.pageYOffset

          // detect direction
          const delta = y - lastY
          if (Math.abs(delta) > threshold) {
            if (delta > 0 && y > 30) {
              // scrolling down -> hide header
              setShown(false)
            } else if (delta < 0) {
              // scrolling up -> show header
              setShown(true)
            }
          }

          // toggle class on main so the pages can show a subtle gradient background when scrolled
          // change gradient based on scroll direction: apk-scroll-down vs apk-scroll-up
          const main = document.querySelector('main')
          if (main) {
            if (y > 20) {
              if (delta > 0) {
                main.classList.add('apk-scroll-down')
                main.classList.remove('apk-scroll-up')
                setDirection('down')
              } else if (delta < 0) {
                main.classList.add('apk-scroll-up')
                main.classList.remove('apk-scroll-down')
                setDirection('up')
              }
            } else {
              main.classList.remove('apk-scroll-up')
              main.classList.remove('apk-scroll-down')
              setDirection('none')
            }
          }

          lastY = y
          ticking = false
        })
        ticking = true
      }
    }

    // run once on mount to apply state if the page is already scrolled
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // set initial cart count and listen for updates
  useEffect(() => {
    fetchCartCount();
    const onCustom = () => fetchCartCount();
    window.addEventListener('cart-updated', onCustom as any);
    return () => {
      window.removeEventListener('cart-updated', onCustom as any);
    };
  }, []);

  return (
    <>
      <style>{`
        .apk-header {
          position: fixed;
          top: 0;
          z-index: 60;
          transition: transform 300ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease, backdrop-filter 300ms ease;
          transform: translateY(0);
          opacity: 1;
          background: rgba(200,32,44,0.98);
          color: #fff;
          width: 100%;
        }
        .apk-header--hidden { transform: translateY(-120%); opacity: 0 }
  .apk-header .apk-inner { max-width: 1200px; margin: 0 auto; padding: 16px 24px; display:flex; align-items:center; justify-content:space-between; min-height: 70px; }
        .apk-header .apk-logo img { height: 60px }
  .apk-header .apk-nav { display:flex; gap:28px; list-style:none; margin:0; padding:0; align-items: center; }
        .apk-header .apk-nav a { color: #fff; text-decoration: none }

  /* main background transition when scrolled. We switch gradients based on direction */
  main { transition: background 420ms ease; }
        /* Fancy layered background: two blurred gradient layers + radial sheen for very smooth transitions */
        main { position: relative; z-index: 0; transition: background 520ms ease; }

        /* base layer (up) - subtle sky-like vertical gradient */
        main::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background-image: linear-gradient(180deg, #f8fcff 0%, #eef9ff 25%, #e6f4ff 50%, #def0ff 75%, #ffffff 100%);
          opacity: 0;
          filter: blur(16px) saturate(110%);
          transform: translateZ(0);
          transition: opacity 520ms ease, transform 520ms ease;
          will-change: opacity, transform;
        }

        /* secondary layer (down) - slightly stronger blue tone */
        main::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -3;
          pointer-events: none;
          background-image: linear-gradient(180deg, #eaf6ff 0%, #d6f0ff 30%, #cfe9ff 55%, #e9f7ff 80%, #ffffff 100%);
          opacity: 0;
          filter: blur(28px) saturate(105%);
          transform: translateZ(0);
          transition: opacity 520ms ease, transform 520ms ease;
          will-change: opacity, transform;
        }

        /* a faint radial sheen to hide any banding and add depth */
        .apk-gradient-sheen {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: -4;
          background-image: radial-gradient(1200px 600px at 10% 10%, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 30%, transparent 60%);
          mix-blend-mode: screen;
          filter: blur(24px) opacity(0.9);
          transition: opacity 720ms ease;
        }

        /* switch which layer is visible depending on scroll direction */
        main.apk-scroll-up::before { opacity: 1; transform: translateY(0) }
        main.apk-scroll-up::after { opacity: 0 }
        main.apk-scroll-down::after { opacity: 1; transform: translateY(0) }
        main.apk-scroll-down::before { opacity: 0 }

  /* sheen opacity is controlled via the element's own classes (updated by JS) */
  .apk-gradient-sheen { opacity: 0.7 }
  .apk-gradient-sheen.up { opacity: 0.95 }
  .apk-gradient-sheen.down { opacity: 0.9 }

        @media (max-width: 720px) {
          .apk-header .apk-inner { padding: 12px 14px }
          .apk-header .apk-nav { gap: 12px; font-size: 14px }
        }
      `}</style>

      <header className={`apk-header ${!shown ? 'apk-header--hidden' : ''}`}>
        <div className="apk-inner">
          <div className="apk-logo">
            <Link href="/"><img src="/logo.png" alt="logo" /></Link>
          </div>

          <nav>
            <ul className="apk-nav">
              <li><Link href="/">Ballina</Link></li>
              <li><Link href="/contact">Rreth nesh</Link></li>
              <li style={{ position: 'relative' }}>
                <div
                  style={{ position: 'relative', display: 'inline-block' }}
                  onMouseEnter={() => {
                    if (closeMenuTimeout.current) clearTimeout(closeMenuTimeout.current)
                    setShowProductsMenu(true)
                  }}
                  onMouseLeave={() => {
                    closeMenuTimeout.current = setTimeout(() => setShowProductsMenu(false), 120)
                  }}
                >
                  <Link href="/products">Produktet</Link>
                  {showProductsMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '100%',
                        transform: 'translateX(-50%)',
                        background: '#c8232c',
                        color: '#fff',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                        borderRadius: 16,
                        padding: '36px 48px',
                        minWidth: 700,
                        display: 'flex',
                        gap: 48,
                        zIndex: 100,
                        marginTop: 16,
                      }}
                      onMouseEnter={() => {
                        if (closeMenuTimeout.current) clearTimeout(closeMenuTimeout.current)
                        setShowProductsMenu(true)
                      }}
                      onMouseLeave={() => {
                        closeMenuTimeout.current = setTimeout(() => setShowProductsMenu(false), 120)
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 12px 0', fontWeight: 700 }}>Pjesë mekanike</h4>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 16 }}>
                          <li><Link href={'/search?q=Remenica'}>Remenica të ndryshme</Link></li>
                          <li><Link href={'/search?q=Kushineta'}>Kushineta të alternatorit</Link></li>
                          <li><Link href={'/search?q=Flutura'}>Flutura të motorit</Link></li>
                          <li><Link href={'/search?q=Mbajtës'}>Mbajtës të motorit</Link></li>
                          <li><Link href={'/search?q=Semering'}>Semering të ndryshëm</Link></li>
                          <li><Link href={'/search?q=Hidraulik'}>Hidraulik të valvulave</Link></li>
                          <li><Link href={'/search?q=Karter'}>Karter i vajit</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 12px 0', fontWeight: 700 }}>Pjesë trapi</h4>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 16 }}>
                          <li><Link href={'/search?q=Nyje'}>Nyje të ndryshme</Link></li>
                          <li><Link href={'/search?q=Mollëza'}>Mollëza</Link></li>
                          <li><Link href={'/search?q=Amortizerë'}>Amortizerë</Link></li>
                          <li><Link href={'/search?q=Spona'}>Spona të ndryshme</Link></li>
                          <li><Link href={'/search?q=Qara'}>Qara të pirunit</Link></li>
                          <li><Link href={'/search?q=Jastak'}>Jastak i amortizerit</Link></li>
                          <li><Link href={'/search?q=Stabilizues'}>Stabilizues</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 12px 0', fontWeight: 700 }}>Të tjera</h4>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 16 }}>
                          <li><Link href={'/search?q=Filtra'}>Filtra të ndryshëm</Link></li>
                          <li><Link href={'/search?q=Pllaka'}>Pllaka frenimi</Link></li>
                          <li><Link href={'/search?q=Diska'}>Disk frenimi</Link></li>
                          <li><Link href={'/search?q=Elektrike'}>Pjesë elektrike</Link></li>
                          <li><Link href={'/search?q=Karoseri'}>Karoseri</Link></li>
                          <li><Link href={'/search?q=Gomëza'}>Gomëza të ndryshme</Link></li>
                          <li><Link href={'/search?q=Ripa'}>Ripa dhëmbëzorë</Link></li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </li>

              <li><Link href="/vetura">Vetura</Link></li>
              <li><Link href="/kontakti">Kontakti</Link></li>
              <li style={{ display: 'flex', alignItems: 'center', marginLeft: 12, height: 44 }}>
                <button
                  onClick={() => {
                    const main = document.querySelector('main');
                    if (main) {
                      main.style.transition = 'transform 0.5s cubic-bezier(.7,.2,.2,1)';
                      main.style.transform = 'translateX(-100vw)';
                      setTimeout(() => {
                        window.location.href = '/search';
                      }, 400);
                    } else {
                      window.location.href = '/search';
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '2px solid #c8232c',
                    borderRadius: 8,
                    background: '#fff',
                    height: 44,
                    padding: '0 18px',
                    cursor: 'pointer',
                    fontSize: 15,
                    color: '#222',
                    fontWeight: 500,
                    boxShadow: '0 2px 12px rgba(200,35,44,0.08)',
                  }}
                  aria-label="Kërko Produkte"
                >
                  Kërko produkte
                  <svg style={{ marginLeft: 8 }} width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="7.5" stroke="#c8232c" strokeWidth="2" />
                    <path d="M17 17L14.5 14.5" stroke="#c8232c" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
              <li>
                <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                  <img
                    src="/cart-icon.png"
                    alt="Shporta"
                    style={{ width: 28, height: 28, cursor: 'pointer', filter: 'brightness(0) invert(1)' }}
                  />
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: -6, right: -10, background: '#34d399', color: '#052e16', borderRadius: 999, padding: '2px 6px', fontSize: 12, fontWeight: 800, minWidth: 18, textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>{cartCount}</span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      {/* radial sheen element to smooth banding and add depth. Its state is controlled by JS via class 'up' or 'down' */}
      <div className={`apk-gradient-sheen ${direction === 'up' ? 'up' : direction === 'down' ? 'down' : ''}`} />
    </>
  )
}
