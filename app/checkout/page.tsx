"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../../Components/Header"), { ssr: false });

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const cartItems = cart?.items || [];
  const total = cart?.total || 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: cartItems.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            priceAtTime: item.product.price,
          })),
          total,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const data = await res.json();
      // Clear cart via API
      await fetch('/api/cart', { method: 'DELETE' });
      window.dispatchEvent(new Event("cart-updated"));
      // Redirect to confirmation
      window.location.href = `/order-confirmation?orderId=${data.orderId}&orderNumber=${data.orderNumber}`;
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  }

  const styles: { [k: string]: React.CSSProperties } = {
    main: { minHeight: "100vh", background: "#fff" },
    container: { maxWidth: 1000, margin: "0 auto", padding: "48px 24px" },
    grid: { display: "grid", gridTemplateColumns: "1fr 400px", gap: 32 },
    card: { background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 18px 40px rgba(2,6,23,0.12)" },
    title: { fontSize: 28, fontWeight: 800, marginBottom: 24, color: "#0f4ea8" },
    label: { display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14, color: "#333" },
    input: { width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16, boxSizing: "border-box" },
    textarea: { width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16, boxSizing: "border-box", minHeight: 100 },
    submitBtn: { background: "#0f4ea8", color: "#fff", padding: "16px 36px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 18, cursor: "pointer", width: "100%" },
    orderItem: { display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #eee" },
    productImg: { width: 60, height: 60, objectFit: "cover", borderRadius: 8 },
    productInfo: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
    productPrice: { fontSize: 14, color: "#666" },
    total: { fontSize: 24, fontWeight: 800, color: "#c8232c", textAlign: "right", marginTop: 16 },
    error: { background: "#fee2e2", color: "#b91c1c", padding: 12, borderRadius: 8, marginBottom: 16 },
  };

  if (cartItems.length === 0) {
    return (
      <main style={styles.main}>
        <Header />
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>Shporta është bosh</h1>
            <p style={{ marginBottom: 24 }}>Nuk keni produkte në shportë.</p>
            <Link href="/products">
              <button style={{ ...styles.submitBtn, background: "#eee", color: "#222" }}>
                Kthehu te produktet
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <Header />
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Form */}
          <div style={styles.card}>
            <h1 style={styles.title}>Informacioni juaj</h1>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <label style={styles.label}>
                Emri dhe Mbiemri *
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Email *
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Telefon *
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Adresa e dërgesës *
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={styles.textarea}
                />
              </label>

              <label style={styles.label}>
                Shënime (opsionale)
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={styles.textarea}
                />
              </label>

              <button type="submit" disabled={submitting} style={styles.submitBtn}>
                {submitting ? "Duke procesuar..." : "Konfirmo porosinë"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div style={styles.card}>
            <h2 style={styles.title}>Përmbledhje</h2>
            {cartItems.map((item: any) => (
              <div key={item.id} style={styles.orderItem}>
                {(() => {
                  const images = Array.isArray(item.product.images)
                    ? item.product.images
                    : (typeof item.product.images === 'string' ? JSON.parse(item.product.images || '[]') : []);
                  return (
                    <img src={images.length > 0 ? images[0] : '/placeholder.png'} alt={item.product.name} style={styles.productImg} />
                  );
                })()}
                <div style={styles.productInfo}>
                  <div style={styles.productName}>{item.product.name}</div>
                  <div style={styles.productPrice}>
                    {item.quantity} x €{item.product.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            <div style={styles.total}>Totali: €{total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
