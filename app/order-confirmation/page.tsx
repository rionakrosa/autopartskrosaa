"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../../Components/Header"), { ssr: false });

export default function OrderConfirmationPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderNumber(params.get("orderNumber") || "");
    setOrderId(params.get("orderId") || "");
  }, []);

  const styles: { [k: string]: React.CSSProperties } = {
    main: { minHeight: "100vh", background: "#fff" },
    container: { maxWidth: 700, margin: "0 auto", padding: "48px 24px", textAlign: "center" },
    card: { background: "#fff", borderRadius: 16, padding: 48, boxShadow: "0 18px 40px rgba(2,6,23,0.12)" },
    icon: { fontSize: 64, marginBottom: 24 },
    title: { fontSize: 32, fontWeight: 800, marginBottom: 16, color: "#16a34a" },
    subtitle: { fontSize: 18, color: "#666", marginBottom: 32, lineHeight: 1.6 },
    orderNumber: { fontSize: 24, fontWeight: 700, color: "#0f4ea8", marginBottom: 32 },
    btn: { background: "#0f4ea8", color: "#fff", padding: "14px 32px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 18, cursor: "pointer", textDecoration: "none", display: "inline-block", marginRight: 12 },
    btnSecondary: { background: "#eee", color: "#222", padding: "14px 32px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 18, cursor: "pointer", textDecoration: "none", display: "inline-block" },
  };

  return (
    <main style={styles.main}>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>✓</div>
          <h1 style={styles.title}>Porosia u krye me sukses!</h1>
          <p style={styles.subtitle}>
            Faleminderit për porosinë tuaj. Do të merrni një konfirmim në email së shpejti me faturën në format PDF.
          </p>
          <div style={styles.orderNumber}>
            Numri i porosisë: {orderNumber}
          </div>
          <div style={{ marginTop: 32 }}>
            <Link href="/products" style={styles.btn}>
              Vazhdo blerjet
            </Link>
            <Link href="/" style={styles.btnSecondary}>
              Kthehu në ballina
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
