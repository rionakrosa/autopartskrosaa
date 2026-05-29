"use client";

import { useState } from "react";

export default function ClearMessagesButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClear() {
    // 1. Updated confirmation text to mention contact messages (mesazhet e kontaktit)
    if (!window.confirm("A jeni të sigurt që doni të fshini të gjitha mesazhet e kontaktit? Kjo veprim nuk mund të zhbëhet.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 2. IMPORTANT: Update this URL if your messages API endpoint is named differently (e.g., "/api/contact")
      const res = await fetch("/api/contact", { method: "DELETE" });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // 3. Updated error text
        throw new Error(data?.error || "Nuk mund të fshihen mesazhet.");
      }

      window.location.reload();
    } catch (err: any) {
      // 4. Updated fallback error text
      setError(err.message || "Nuk mund të fshihen mesazhet.");
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 16, alignItems: "center" }}>
      {error ? <div style={{ color: "#b91c1c", fontSize: 14 }}>{error}</div> : null}
      <button
        type="button"
        onClick={handleClear}
        disabled={loading}
        style={{
          background: loading ? "#9ca3af" : "#c8232c",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 18px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        {/* 5. Updated button texts */}
        {loading ? "Duke fshirë..." : "Fshi të gjitha mesazhet"}
      </button>
    </div>
  );
}