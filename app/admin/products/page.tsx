"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  description: string;
  isActive: boolean;
  bestSeller: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState({
    category: "all",
    search: "",
    inStock: false,
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      alert("Ju lutem bëni login si admin.");
      window.location.href = "/admin";
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch products from API
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [filter, isAuthenticated]);

  function fetchProducts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.search) params.append("search", filter.search);
    if (filter.category !== "all") params.append("category", filter.category);
    if (filter.inStock) params.append("inStock", "true");

    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("API returned non-array data:", data);
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setProducts([]);
        setLoading(false);
      });
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);
    setEditForm(product);
  }

  function handleSave(id: number) {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      alert("Jo i autorizuar");
      return;
    }

    fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      })
      .then(() => {
        setEditingId(null);
        setEditForm({});
        fetchProducts();
      })
      .catch((err) => {
        alert("Gabim në përditësim: " + err.message);
      });
  }

  function handleDelete(id: number) {
    if (!confirm("A jeni të sigurt që dëshironi ta fshini këtë produkt?")) return;

    const token = localStorage.getItem("admin_token");
    if (!token) {
      alert("Jo i autorizuar");
      return;
    }

    fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        return res.json();
      })
      .then(() => {
        fetchProducts();
      })
      .catch((err) => {
        alert("Gabim në fshirje: " + err.message);
      });
  }

  // Upload image to server
  async function handleImageUpload(file: File): Promise<string | null> {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      alert("Jo i autorizuar. Ju lutem bëni login si admin.");
      window.location.href = "/admin";
      return null;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          alert("Session ka skaduar. Ju lutem bëni login përsëri.");
          window.location.href = "/admin";
          return null;
        }
        throw new Error(errorData.error || "Upload failed");
      }
      
      const data = await response.json();
      return data.path;
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gabim në upload: " + (err as Error).message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  // Create new product
  function handleCreateProduct(newProduct: Omit<Product, "id">) {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      alert("Jo i autorizuar");
      return;
    }

    fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newProduct),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Create failed");
        return res.json();
      })
      .then(() => {
        setShowAddModal(false);
        setEditForm({});
        fetchProducts();
        alert("Produkti u krijua me sukses!");
      })
      .catch((err) => {
        alert("Gabim në krijim: " + err.message);
      });
  }

  const categories = ["Të ndryshme", "Frenave", "Motor", "Elektrike", "Goma", "Filtra", "Ndriçim"];

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      maxWidth: 1400,
      margin: "0 auto",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    filters: {
      display: "flex",
      gap: 12,
      marginBottom: 20,
      flexWrap: "wrap",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      borderRadius: 8,
      overflow: "hidden",
    },
    th: {
      background: "#c8232c",
      color: "#fff",
      padding: "12px 16px",
      textAlign: "left",
      fontWeight: 600,
      fontSize: 14,
    },
    td: {
      padding: "12px 16px",
      borderBottom: "1px solid #eee",
      fontSize: 14,
    },
    input: {
      padding: "6px 12px",
      border: "1px solid #ddd",
      borderRadius: 4,
      fontSize: 14,
      width: "100%",
    },
    button: {
      padding: "6px 12px",
      borderRadius: 4,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
    },
    buttonPrimary: {
      background: "#0f4ea8",
      color: "#fff",
    },
    buttonSuccess: {
      background: "#2ea043",
      color: "#fff",
    },
    buttonDanger: {
      background: "#cf222e",
      color: "#fff",
    },
    badge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 600,
    },
    badgeSuccess: {
      background: "#dafbe1",
      color: "#1a7f37",
    },
    badgeWarning: {
      background: "#fff8c5",
      color: "#9a6700",
    },
    badgeDanger: {
      background: "#ffebe9",
      color: "#cf222e",
    },
  };

  // Don't render until auth is checked
  if (!isAuthenticated) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p>Duke verifikuar autentifikimin...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          Menaxhimi i Produkteve
        </h1>
        <Link
          href="/admin"
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            textDecoration: "none",
          }}
        >
          ← Kthehu te Admin
        </Link>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            ...styles.button,
            ...styles.buttonSuccess,
            marginRight: "auto",
          }}
        >
          + Shto Produkt të Ri
        </button>
        <input
          type="text"
          placeholder="Kërko produktin..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          style={{ ...styles.input, flex: "1 1 300px" }}
        />
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          style={{ ...styles.input, flex: "0 0 200px" }}
        >
          <option value="all">Të gjitha kategoritë</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={filter.inStock}
            onChange={(e) =>
              setFilter({ ...filter, inStock: e.target.checked })
            }
          />
          Vetëm në stok
        </label>
        <button
          onClick={fetchProducts}
          style={{ ...styles.button, ...styles.buttonPrimary }}
        >
          Rifresko
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <p style={{ textAlign: "center", padding: 40 }}>Duke ngarkuar...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Fotoja</th>
                <th style={styles.th}>Emri</th>
                <th style={styles.th}>Çmimi (€)</th>
                <th style={styles.th}>Stok</th>
                <th style={styles.th}>Kategoria</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Best Seller</th>
                <th style={styles.th}>Veprime</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isEditing = editingId === product.id;
                return (
                  <tr key={product.id}>
                    <td style={styles.td}>{product.id}</td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <div>
                          <img
                            src={editForm.image || product.image}
                            alt="Product"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                              marginBottom: 8,
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const path = await handleImageUpload(file);
                                if (path) {
                                  setEditForm({ ...editForm, image: path });
                                }
                              }
                            }}
                            style={{ fontSize: 11 }}
                            disabled={uploadingImage}
                          />
                        </div>
                      ) : (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      )}
                    </td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          style={styles.input}
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.price || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              price: parseFloat(e.target.value),
                            })
                          }
                          style={styles.input}
                        />
                      ) : (
                        product.price.toFixed(2)
                      )}
                    </td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.stock ?? ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              stock: parseInt(e.target.value),
                            })
                          }
                          style={styles.input}
                        />
                      ) : (
                        <span
                          style={{
                            ...styles.badge,
                            ...(product.stock > 10
                              ? styles.badgeSuccess
                              : product.stock > 0
                              ? styles.badgeWarning
                              : styles.badgeDanger),
                          }}
                        >
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <select
                          value={editForm.category || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value })
                          }
                          style={styles.input}
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      ) : (
                        product.category || "-"
                      )}
                    </td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={editForm.isActive ?? true}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                isActive: e.target.checked,
                              })
                            }
                          />
                          Aktiv
                        </label>
                      ) : (
                        <span
                          style={{
                            ...styles.badge,
                            ...(product.isActive
                              ? styles.badgeSuccess
                              : styles.badgeDanger),
                          }}
                        >
                          {product.isActive ? "Aktiv" : "Joaktiv"}
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editForm.bestSeller ?? false}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              bestSeller: e.target.checked,
                            })
                          }
                        />
                      ) : (
                        product.bestSeller ? "✓" : "-"
                      )}
                    </td>
                    <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(product.id)}
                            style={{
                              ...styles.button,
                              ...styles.buttonSuccess,
                              marginRight: 8,
                            }}
                          >
                            Ruaj
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditForm({});
                            }}
                            style={styles.button}
                          >
                            Anulo
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(product)}
                            style={{
                              ...styles.button,
                              ...styles.buttonPrimary,
                              marginRight: 8,
                            }}
                          >
                            Ndrysho
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={{
                              ...styles.button,
                              ...styles.buttonDanger,
                            }}
                          >
                            Fshi
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 20, color: "#666", fontSize: 14 }}>
        Totali: {products.length} produkte
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              maxWidth: 600,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>
              Shto Produkt të Ri
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Emri *
                </label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  style={{ ...styles.input }}
                  placeholder="Disku frenues..."
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Përshkrimi *
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  style={{ ...styles.input, minHeight: 80, resize: "vertical" }}
                  placeholder="Marka e vetures Citroen, pjese e re..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Çmimi (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: parseFloat(e.target.value),
                      })
                    }
                    style={{ ...styles.input }}
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Stok *
                  </label>
                  <input
                    type="number"
                    value={editForm.stock ?? ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        stock: parseInt(e.target.value),
                      })
                    }
                    style={{ ...styles.input }}
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Kategoria *
                </label>
                <select
                  value={editForm.category || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  style={{ ...styles.input }}
                >
                  <option value="">Zgjedh kategorinë...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Fotoja *
                </label>
                {editForm.image && (
                  <div style={{ marginBottom: 12 }}>
                    <img
                      src={editForm.image}
                      alt="Preview"
                      style={{
                        width: 200,
                        height: 150,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const path = await handleImageUpload(file);
                      if (path) {
                        setEditForm({ ...editForm, image: path });
                      }
                    }
                  }}
                  style={{ display: "block" }}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                    Duke ngarkuar foton...
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={editForm.bestSeller ?? false}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bestSeller: e.target.checked })
                    }
                  />
                  Best Seller
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? true}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isActive: e.target.checked })
                    }
                  />
                  Aktiv
                </label>
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditForm({});
                }}
                style={{ ...styles.button }}
              >
                Anulo
              </button>
              <button
                onClick={() => {
                  if (
                    !editForm.name ||
                    !editForm.price ||
                    !editForm.image ||
                    !editForm.category ||
                    editForm.stock === undefined
                  ) {
                    alert("Ju lutem plotësoni të gjitha fushat e nevojshme!");
                    return;
                  }
                  handleCreateProduct(editForm as Omit<Product, "id">);
                }}
                style={{ ...styles.button, ...styles.buttonSuccess }}
                disabled={uploadingImage}
              >
                Krijo Produktin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
