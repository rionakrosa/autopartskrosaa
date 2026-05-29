"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../../Components/Header"), { ssr: false });

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API on mount
  const rafRef = useRef<number | null>(null);
  const pendingMouse = useRef<{x:number;y:number}|null>(null);
  useEffect(() => {
    fetch('/api/products?inStock=true')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, []);

  // Update query if URL changes (for navigation from header dropdown)
  useEffect(() => {
    if (searchParams) {
      const q = searchParams.get("q") || "";
      setQuery(q);
    }
  }, [searchParams]);

  function handleSearch(searchText: string) {
    setQuery(searchText);
    if (!searchText.trim()) {
      setResults([]);
      return;
    }
    const filtered = products.filter((p: any) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.details?.some((d: string) => d.toLowerCase().includes(searchText.toLowerCase()))
    );
    setResults(filtered);
  }

  const styles: { [k: string]: React.CSSProperties } = {
    main: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #c8232c 0%, #a01c24 100%)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: query ? "flex-start" : "center",
      transition: "align-items 0.4s ease",
    },
    logoSticker: {
      position: "absolute",
      opacity: 0.08,
      pointerEvents: "none",
      filter: "brightness(1.5)",
    },
    container: {
      maxWidth: 900,
      margin: "0 auto",
      padding: "48px 24px",
      position: "relative",
      zIndex: 1,
      width: "100%",
    },
    searchBox: {
      background: "#fff",
      borderRadius: 16,
      padding: 32,
      boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
      marginBottom: query ? 32 : 0,
      transition: "all 0.4s ease",
      transform: query ? "translateY(0)" : "translateY(-20px)",
    },
    title: {
      fontSize: 36,
      fontWeight: 800,
      color: "#c8232c",
      marginBottom: 24,
      textAlign: "center",
    },
    input: {
      width: "100%",
      padding: "16px 20px",
      fontSize: 18,
      border: "2px solid #e6e6e6",
      borderRadius: 12,
      outline: "none",
      transition: "border-color 0.2s",
      boxSizing: "border-box",
    },
    resultsBox: {
      background: "#fff",
      borderRadius: 16,
      padding: 32,
      boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
      animation: "slideUp 0.4s ease",
    },
    productCard: {
      display: "flex",
      gap: 16,
      padding: 16,
      borderBottom: "1px solid #eee",
      alignItems: "center",
    },
    productImage: {
      width: 100,
      height: 100,
      objectFit: "cover",
      borderRadius: 12,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 20,
      fontWeight: 700,
      color: "#111",
      marginBottom: 8,
    },
    productPrice: {
      fontSize: 18,
      fontWeight: 600,
      color: "#0f4ea8",
      marginBottom: 4,
    },
    stockBadge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 700,
    },
    inStock: {
      background: "#dcfce7",
      color: "#166534",
    },
    outOfStock: {
      background: "#fee2e2",
      color: "#b91c1c",
    },
    viewBtn: {
      background: "#0f4ea8",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "10px 20px",
      fontWeight: 600,
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-block",
    },
    emptyState: {
      textAlign: "center",
      padding: 48,
      color: "#666",
      fontSize: 18,
    },
  };

  // Random positioning for logo stickers
  const logos = [
    "/citroen-logo.png",
    "/renault-logo.png",
    "/porsche-logo.png",
    "/bmw-logo.png",
    "/mercedes-logo.png",
    "/opel-logo.png",
    "/skoda-logo.png",
    "/volkswagen-logo.png",
    "/volvo-logo.png"
  ];
  const logoPositions = [
    { top: "5%", left: "8%", width: 80, transform: "rotate(-15deg)", logo: 0 },
    { top: "15%", right: "10%", width: 70, transform: "rotate(20deg)", logo: 1 },
    { top: "35%", left: "5%", width: 90, transform: "rotate(-8deg)", logo: 2 },
    { top: "55%", right: "7%", width: 75, transform: "rotate(12deg)", logo: 3 },
    { top: "75%", left: "12%", width: 85, transform: "rotate(-20deg)", logo: 4 },
    { bottom: "8%", right: "15%", width: 80, transform: "rotate(18deg)", logo: 5 },
    { top: "25%", left: "85%", width: 70, transform: "rotate(-12deg)", logo: 6 },
    { top: "60%", left: "80%", width: 75, transform: "rotate(25deg)", logo: 7 },
    { top: "45%", left: "50%", width: 65, transform: "rotate(-5deg)", logo: 8 },
    { top: "10%", left: "45%", width: 72, transform: "rotate(15deg)", logo: 0 },
    { top: "65%", left: "25%", width: 78, transform: "rotate(-18deg)", logo: 3 },
    { bottom: "15%", left: "70%", width: 68, transform: "rotate(22deg)", logo: 5 },
    { top: "50%", right: "25%", width: 82, transform: "rotate(-10deg)", logo: 7 },
    { top: "85%", right: "30%", width: 74, transform: "rotate(8deg)", logo: 2 },
  ];

  // Parallax mouse move effect (skip if user prefers reduced motion)
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    function applyParallax() {
      if (!pendingMouse.current) { rafRef.current = null; return; }
      const { x, y } = pendingMouse.current;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const offsetX = dx * 14;
      const offsetY = dy * 14;
      const stickers = document.querySelectorAll<HTMLImageElement>('img.logo-sticker');
      stickers.forEach((el, index) => {
        const base = el.getAttribute('data-base-transform') || '';
        const depth = (index % 5) * 2;
        el.style.transform = `${base} translate(${(offsetX * (0.3 + depth/40)).toFixed(2)}px, ${(offsetY * (0.3 + depth/40)).toFixed(2)}px)`;
      });
      rafRef.current = null;
    }

    function onMouseMove(e: MouseEvent) {
      pendingMouse.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(applyParallax);
      }
    }
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <main style={styles.main}>
      <Header />
      
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Background logo hover effects */
        .logo-sticker {
          transition: transform 0.3s ease, opacity 0.3s ease;
          will-change: transform;
          animation: glowPulse 6s ease-in-out infinite;
        }
        /* When hovering anywhere on the page, give a subtle lift to all */
        main:hover .logo-sticker {
          transform: scale(1.06) translateZ(0);
          opacity: 0.12;
        }
        /* Add a tiny variation on individual hover when they are not covered by content */
        .logo-sticker:hover {
          transform: scale(1.09) rotate(2deg) translateZ(0);
          opacity: 0.16;
          filter: brightness(1.7) drop-shadow(0 0 8px rgba(255,255,255,0.35));
        }
        @keyframes glowPulse {
          0% { filter: brightness(1.35) drop-shadow(0 0 0 rgba(255,255,255,0)); }
          50% { filter: brightness(1.55) drop-shadow(0 0 10px rgba(255,255,255,0.25)); }
          100% { filter: brightness(1.35) drop-shadow(0 0 0 rgba(255,255,255,0)); }
        }
        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .logo-sticker, main:hover .logo-sticker, .logo-sticker:hover {
            transition: none !important;
            transform: none !important;
            opacity: 0.08 !important;
            animation: none !important;
            filter: none !important;
          }
        }
      `}</style>

      {/* Car brand logo stickers scattered on background */}
      {logoPositions.map((pos, i) => (
        <img
          key={i}
          src={logos[pos.logo]}
          alt="logo"
          className="logo-sticker"
          data-base-transform={pos.transform}
          style={{ ...styles.logoSticker, top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom, width: pos.width, transform: pos.transform }}
        />
      ))}

      <div style={styles.container}>
        <div style={styles.searchBox}>
          <h1 style={styles.title}>Kërko Produkte</h1>
          <input
            type="text"
            placeholder="Shkruaj emrin e produktit..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            style={styles.input}
            autoFocus
          />
        </div>
        {query && (
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#c8232c', margin: '24px 0 0 0' }}>{query}</h2>
        )}

        {query && (
          <div style={styles.resultsBox}>
            {results.length === 0 ? (
              <div style={styles.emptyState}>
                Nuk u gjet asnjë produkt për "{query}"
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: "#111" }}>
                  {results.length} rezultate
                </h2>
                {results.map((product: any) => {
                  // Randomly assign stock status for demo (in real app, this would come from database)
                  const inStock = Math.random() > 0.3;
                  const images = Array.isArray(product.images)
                    ? product.images
                    : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : []);
                  return (
                    <div key={product.id} style={styles.productCard}>
                      <img
                        src={images.length > 0 ? images[0] : '/placeholder.png'}
                        alt={product.name}
                        style={styles.productImage}
                      />
                      <div style={styles.productInfo}>
                        <div style={styles.productName}>{product.name}</div>
                        <div style={styles.productPrice}>€{product.price?.toFixed(2)}</div>
                        <span
                          style={{
                            ...styles.stockBadge,
                            ...(inStock ? styles.inStock : styles.outOfStock),
                          }}
                        >
                          {inStock ? "✓ Në stok" : "✗ Jashtë stokut"}
                        </span>
                      </div>
                      <Link href={`/products/${product.id}`}>
                        <button style={styles.viewBtn}>Shiko</button>
                      </Link>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
