"use client";

import { useState } from "react";

export default function ClearOrdersButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClear() {
    if (!window.confirm("A jeni të sigurt që doni të fshini të gjitha porositë? Kjo veprim nuk mund të zhbëhet.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Nuk mund të fshihen porositë.");
      }

      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Nuk mund të fshihen porositë.");
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
        {loading ? "Duke fshirë..." : "Fshi të gjitha porositë"}
      </button>
    </div>
  );
}
