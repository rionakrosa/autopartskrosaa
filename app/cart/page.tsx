"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../../Components/Header"), { ssr: false });

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // draft values so users can clear the field before committing
  const [draftQty, setDraftQty] = useState<Record<string, string>>({});

  // Fetch cart from API
  async function fetchCart() {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  // Listen for cart updates from other pages
  useEffect(() => {
    const onCartUpdate = () => fetchCart();
    window.addEventListener('cart-updated', onCartUpdate);
    return () => window.removeEventListener('cart-updated', onCartUpdate);
  }, []);

  async function removeFromCart(itemId: number) {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCart();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  }

  async function updateQty(itemId: number, qty: number) {
    if (qty < 1) return;
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      });
      if (res.ok) {
        await fetchCart();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update quantity');
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  }

  const cartItems = cart?.items || [];
  const total = cart?.total || 0;

  const styles: { [k: string]: React.CSSProperties } = {
    main: { minHeight: "100vh", background: "#fff" },
    container: { maxWidth: 900, margin: "0 auto", padding: "0 24px" },
    card: { background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 18px 40px rgba(2,6,23,0.12)", marginTop: 48 },
    title: { fontSize: 36, fontWeight: 800, marginBottom: 24, color: "#0f4ea8" },
    table: { width: "100%", borderCollapse: "collapse", marginBottom: 32 },
    th: { textAlign: "left", padding: 12, background: "#f5f8ff", color: "#0f4ea8", fontWeight: 700, fontSize: 16 },
    td: { padding: 12, fontSize: 16 },
    qtyBtn: { border: "none", background: "#eee", borderRadius: 6, width: 32, height: 32, fontSize: 20, cursor: "pointer", fontWeight: 700 },
    removeBtn: { background: "#c8232c", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 },
    checkoutBtn: { background: "#0f4ea8", color: "#fff", padding: "16px 36px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 20, cursor: "pointer", marginTop: 16 },
    backBtn: { background: "#eee", color: "#222", border: "none", borderRadius: 8, padding: "12px 26px", fontWeight: 600, cursor: "pointer", marginTop: 24 },
    empty: { color: "#666", fontSize: 20, textAlign: "center", margin: "48px 0" },
    productImg: { width: 70, height: 70, objectFit: "cover", borderRadius: 10, marginRight: 14 },
    total: { textAlign: "right", fontSize: 22, fontWeight: 700, color: "#c8232c", marginBottom: 32 }
  };

  return (
    <main style={styles.main}>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Shporta</h1>
          {loading ? (
            <div style={styles.empty}>Duke ngarkuar...</div>
          ) : cartItems.length === 0 ? (
            <div style={styles.empty}>Shporta është bosh.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Produkt</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Sasia</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Çmimi</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {(() => {
                            const images = Array.isArray(item.product.images)
                              ? item.product.images
                              : (typeof item.product.images === 'string' ? JSON.parse(item.product.images || '[]') : []);
                            return (
                              <img src={images.length > 0 ? images[0] : '/placeholder.png'} alt={item.product.name} style={styles.productImg} />
                            );
                          })()}
                          <span>{item.product.name}</span>
                        </div>
                      </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <button onClick={() => {
                        const next = Math.max(1, Number(item.quantity) - 1)
                        setDraftQty(prev => ({ ...prev, [String(item.id)]: String(next) }))
                        updateQty(item.id, next)
                      }} style={styles.qtyBtn}>-</button>
                      <input
                        type="number"
                        min={1}
                        value={draftQty[String(item.id)] ?? String(item.quantity)}
                        onChange={(e:any) => {
                          const val = e.target.value as string
                          // allow empty while typing
                          if (val === '') {
                            setDraftQty(prev => ({ ...prev, [String(item.id)]: '' }))
                            return
                          }
                          // only digits
                          if (/^\d+$/.test(val)) {
                            setDraftQty(prev => ({ ...prev, [String(item.id)]: val }))
                          }
                        }}
                        onBlur={(e:any) => {
                          const raw = parseInt((draftQty[String(item.id)] ?? e.target.value) || '0', 10)
                          const next = Number.isNaN(raw) || raw < 1 ? 1 : raw
                          setDraftQty(prev => ({ ...prev, [String(item.id)]: String(next) }))
                          updateQty(item.id, next)
                        }}
                        onKeyDown={(e:any) => {
                          if (e.key === 'Enter') {
                            const raw = parseInt((draftQty[String(item.id)] ?? e.currentTarget.value) || '0', 10)
                            const next = Number.isNaN(raw) || raw < 1 ? 1 : raw
                            setDraftQty(prev => ({ ...prev, [String(item.id)]: String(next) }))
                            updateQty(item.id, next)
                            e.currentTarget.blur()
                          }
                        }}
                        style={{ width: 72, textAlign: 'center', fontSize: 16, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, margin: '0 8px' }}
                      />
                      <button onClick={() => {
                        const next = Math.max(1, Number(item.quantity) + 1)
                        setDraftQty(prev => ({ ...prev, [String(item.id)]: String(next) }))
                        updateQty(item.id, next)
                      }} style={styles.qtyBtn}>+</button>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 600 }}>
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}>Hiq</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {cartItems.length > 0 && (
            <div style={styles.total}>Totali: €{total.toFixed(2)}</div>
          )}
          {cartItems.length > 0 && (
            <Link href="/checkout" style={{ textDecoration: 'none' }}>
              <button style={styles.checkoutBtn}>
                Vazhdo me porosinë
              </button>
            </Link>
          )}
          <div>
            <Link href="/products"><button style={styles.backBtn}>Kthehu te produktet</button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
