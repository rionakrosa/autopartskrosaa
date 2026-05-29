'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
const Header = dynamic(() => import('../../Components/Header'), { ssr: false });

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  category: string;
}

/* ----------------------------------------------------
   IMAGE SLIDER COMPONENT (FADE + SWIPE + DOTS)
---------------------------------------------------- */
function ImageSlider({ images, isOutOfStock, name }: any) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (!images?.length) return null;

  const next = () => {
    setFade(true);
    setTimeout(() => {
      setIndex((index + 1) % images.length);
      setFade(false);
    }, 150);
  };

  const prev = () => {
    setFade(true);
    setTimeout(() => {
      setIndex((index - 1 + images.length) % images.length);
      setFade(false);
    }, 150);
  };

  const onTouchStart = (e: any) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const onTouchEnd = (e: any) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 160,
        overflow: "hidden",
        borderRadius: 8,
        marginBottom: 10,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* IMAGE */}
      <img
        src={images[index]}
        alt={name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 8,
          opacity: fade ? 0 : 1,
          transition: "opacity 0.3s ease",
          filter: isOutOfStock ? "grayscale(100%)" : "none",
        }}
      />

      {/* LEFT BUTTON */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            prev();
          }}
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.7)",
            border: "none",
            width: 30,
            height: 30,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          ←
        </button>
      )}

      {/* RIGHT BUTTON */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            next();
          }}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.7)",
            border: "none",
            width: 30,
            height: 30,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          →
        </button>
      )}

      {/* DOTS */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
          }}
        >
          {images.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 9 : 7,
                height: i === index ? 9 : 7,
                background: i === index ? "#ffffff" : "rgba(255,255,255,0.6)",
                borderRadius: "50%",
                transition: "all 0.2s ease",
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------
   PRODUCTS PAGE
---------------------------------------------------- */

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [id: number]: number }>({});
  const [addedToCart, setAddedToCart] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    fetch('/api/products')
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

  const styles: { [k: string]: React.CSSProperties } = {
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
      gap: 20
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header />

      <section style={{ padding: '110px 0 40px 0', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 18 }}>Produktet</h1>

        {loading ? (
          <p style={{ textAlign: 'center', padding: 40 }}>Duke ngarkuar produktet...</p>
        ) : (
          <div style={styles.productsGrid as any}>
            {Array.isArray(products) ? products.map((p: any) => {
              const quantity = cart[p.id] || 1;
              const isOutOfStock = p.stock === 0;
              const hasLimitedStock = p.stock > 0 && p.stock <= 5;

              return (
                <div
                  key={p.id}
                  style={{
                    border: '1px solid #e6e6e6',
                    borderRadius: 12,
                    padding: 12,
                    position: 'relative',
                    background: '#fff',
                    transition: 'box-shadow .15s ease, transform .15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    transform: 'translateY(0)'
                  }}
                >
                  {/* BADGES */}
                  {isOutOfStock && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: '#ef4444',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      zIndex: 1
                    }}>
                      SHITËN
                    </div>
                  )}

                  {hasLimitedStock && !isOutOfStock && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: '#f59e0b',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      zIndex: 1
                    }}>
                      {p.stock} mbetur
                    </div>
                  )}

                  <Link href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>

                    {/* >>> REPLACED OLD IMAGE BLOCK WITH SLIDER <<< */}
                    {(() => {
                      let images = [];
                      try {
                        if (Array.isArray(p.images)) {
                          images = p.images;
                        } else if (typeof p.images === 'string') {
                          images = JSON.parse(p.images || '[]');
                        }
                      } catch {
                        images = [];
                      }
                      // Normalize: prepend '/' if missing
                      images = images.map((img) => img.startsWith('/') ? img : '/' + img);
                      return (
                        <ImageSlider
                          images={images}
                          isOutOfStock={isOutOfStock}
                          name={p.name}
                        />
                      );
                    })()}

                    <h3 style={{ margin: '8px 0' }}>{p.name}</h3>
                    <p style={{ color: '#666', margin: 0 }}>{p.price}</p>
                  </Link>

                  {/* QUANTITY + ADD TO CART */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 8, justifyContent: 'center' }}>
                    <button
                      disabled={isOutOfStock}
                      style={{ border: 'none', background: isOutOfStock ? '#e5e5e5' : '#f5f5f5', fontSize: 20, width: 32, height: 32, borderRadius: 6 }}
                      onClick={() => setCart(c => ({ ...c, [p.id]: Math.max(1, (c[p.id] || 1) - 1) }))}
                    >-</button>

                    <input
                      type="number"
                      min={1}
                      max={isOutOfStock ? 0 : p.stock}
                      value={quantity}
                      disabled={isOutOfStock}
                      onChange={(e: any) => {
                        const raw = parseInt(e.target.value, 10);
                        const maxQty = p.stock || 1;
                        const next = Number.isNaN(raw) ? 1 : Math.max(1, Math.min(maxQty, raw));
                        setCart(c => ({ ...c, [p.id]: next }));
                      }}
                      style={{ width: 64, textAlign: 'center', fontSize: 16, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }}
                    />

                    <button
                      disabled={isOutOfStock || quantity >= p.stock}
                      style={{ border: 'none', background: (isOutOfStock || quantity >= p.stock) ? '#e5e5e5' : '#f5f5f5', fontSize: 20, width: 32, height: 32, borderRadius: 6 }}
                      onClick={() => setCart(c => ({ ...c, [p.id]: (c[p.id] || 1) + 1 }))}
                    >+</button>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    style={{
                      background: isOutOfStock ? '#9ca3af' : (addedToCart[p.id] ? '#16a34a' : '#0f4ea8'),
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      width: '100%',
                      transition: 'background 0.3s ease',
                      fontWeight: 600
                    }}
                    onClick={async () => {
                      if (isOutOfStock) return;

                      try {
                        const response = await fetch('/api/cart', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ productId: p.id, quantity }),
                        });

                        if (!response.ok) {
                          const error = await response.json();
                          alert(error.error || 'Failed to add to cart');
                          return;
                        }

                        window.dispatchEvent(new Event('cart-updated'));

                        setAddedToCart(prev => ({ ...prev, [p.id]: true }));
                        setTimeout(() => {
                          setAddedToCart(prev => ({ ...prev, [p.id]: false }));
                        }, 2000);
                      } catch (err) {
                        console.error('Error adding to cart:', err);
                        alert('Failed to add to cart');
                      }
                    }}
                  >
                    {isOutOfStock ? 'Shitën' : (addedToCart[p.id] ? '✓ Shtuar në shportë' : 'Shto në shportë')}
                  </button>
                </div>
              );
            }) : null}
          </div>
        )}
      </section>

      <footer style={{ background: '#c8232c', color: '#fff', textAlign: 'center', padding: 20, marginTop: 36 }}>
        <p style={{ margin: 0 }}>© 2025 Auto Parts Krosa. All rights reserved.</p>
      </footer>
    </main>
  );
}
