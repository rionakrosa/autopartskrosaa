'use client'
import { prisma } from '../../../lib/prisma'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// Mock data for demonstration - in production, this would come from your database
const getProductExtras = (productId: number, sku?: string) => ({
  brand: 'BOSCH',
  manufacturer: 'Bosch Automotive',
  partNumber: sku || `402B1389P-${productId}`,
  compatibleCars: ['Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Porsche'],
  warranty: '24 muaj garanci',
  origin: 'Made in Germany',
  weight: '0.5 kg',
  reviews: [
    { id: 1, author: 'Arben K.', rating: 5, date: '2024-11-01', comment: 'Cilësi e shkëlqyer! Funksionon perfekt në Mercedes-Benz C-Class.' },
    { id: 2, author: 'Besnik M.', rating: 4, date: '2024-10-28', comment: 'Shumë i kënaqur me produktin. Dërgesa ishte e shpejtë.' },
    { id: 3, author: 'Driton S.', rating: 5, date: '2024-10-15', comment: 'Rekomandoj! Çmim i mirë dhe cilësi origjinale.' }
  ],
  averageRating: 4.7,
  totalReviews: 29
})

export default function ProductPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details')
  const [similarProducts, setSimilarProducts] = useState<any[]>([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  // Carousel image index state
  const [imgIdx, setImgIdx] = useState(0);
  
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          const data = await res.json()
          setProduct({
            ...data,
            details: typeof data.details === 'string' ? JSON.parse(data.details) : (data.details || [])
          })
        }
      } catch (err) {
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  // Load similar products once main product is fetched
  useEffect(() => {
    async function loadSimilar() {
      if (!product) return
      setLoadingSimilar(true)
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const all = await res.json()
          // Filter by same category if possible, otherwise fall back to bestSeller or any
          let filtered = all.filter((p: any) => p.id !== product.id)
          if (product.category) {
            const sameCategory = filtered.filter((p: any) => p.category === product.category)
            if (sameCategory.length >= 3) {
              filtered = sameCategory
            }
          }
          // Prioritize best sellers if available
          const bestSellers = filtered.filter((p: any) => p.bestSeller)
          if (bestSellers.length >= 3) {
            filtered = bestSellers.concat(filtered.filter((p: any) => !p.bestSeller))
          }
          setSimilarProducts(filtered.slice(0, 6))
        }
      } catch (e) {
        console.error('Error loading similar products', e)
      } finally {
        setLoadingSimilar(false)
      }
    }
    loadSimilar()
  }, [product])

  if (loading) {
    return (
      <main style={{ padding: 40, textAlign: 'center' }}>
        <p>Duke ngarkuar...</p>
      </main>
    )
  }

  if (!product) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Product not found</h1>
        <p>The product you requested doesn't exist.</p>
        <p><Link href="/">Back to home</Link></p>
      </main>
    )
  }

  const extras = getProductExtras(id, product.sku)
  const gradientStart = '#0f4ea8'
  const gradientEnd = '#0b3f88'
  const accentRed = '#c8232c'
  const isOutOfStock = product.stock === 0
  const hasLimitedStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = async () => {
    if (isOutOfStock) return
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      })
      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to add to cart')
        return
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'))
      }
      setAddedSuccess(true)
      setTimeout(() => setAddedSuccess(false), 1500)
    } catch (err) {
      console.error('Error adding to cart:', err)
      alert('Failed to add to cart')
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < rating ? '#fbbf24' : '#d1d5db', fontSize: 18 }}>★</span>
    ))
  }

  return (
    <main style={{ background: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <button style={{ 
              background: 'transparent', 
              border: `2px solid ${accentRed}`, 
              color: accentRed,
              padding: '8px 16px', 
              borderRadius: 8, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}>
              ← Kthehu te produktet
            </button>
          </Link>
          
          <Link href="/cart" style={{ textDecoration: 'none' }}>
            <button style={{ 
              background: gradientStart, 
              border: 'none', 
              color: 'white',
              padding: '8px 16px', 
              borderRadius: 8, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              boxShadow: '0 2px 8px rgba(15,78,168,0.2)'
            }}>
              <span style={{ fontSize: 18 }}>🛒</span>
              Shiko shportën
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
          {/* Left Column - Image */}
          <div>
            <div style={{ position: 'relative', background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              {/* Stock Badge */}
              {isOutOfStock ? (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: '#ef4444',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  zIndex: 1
                }}>
                  SHITËN
                </div>
              ) : hasLimitedStock ? (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: '#f59e0b',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  zIndex: 1
                }}>
                  {product.stock} mbetur
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: '#10b981',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  zIndex: 1
                }}>
                  Në stock
                </div>
              )}

              {/* Image Carousel */}
              {(() => {
                let images = [];
                try {
                  images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
                } catch {
                  images = [];
                }
                const showPrev = () => setImgIdx(i => (i === 0 ? images.length - 1 : i - 1));
                const showNext = () => setImgIdx(i => (i === images.length - 1 ? 0 : i + 1));
                return (
                  <div style={{ position: 'relative', width: '100%', minHeight: 160 }}>
                    {images.length > 0 && (
                      <img
                        src={images[imgIdx]}
                        alt={`${product.name} ${imgIdx + 1}`}
                        style={{ width: '100%', height: 400, objectFit: 'contain', borderRadius: 8, opacity: isOutOfStock ? 0.5 : 1, filter: isOutOfStock ? 'grayscale(100%)' : 'none' }}
                      />
                    )}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={showPrev}
                          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 22, cursor: 'pointer' }}
                        >&#8592;</button>
                        <button
                          onClick={showNext}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 22, cursor: 'pointer' }}
                        >&#8594;</button>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Reviews Summary */}
            <div style={{ background: 'white', borderRadius: 12, padding: 24, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {renderStars(Math.round(extras.averageRating))}
                </div>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{extras.averageRating}</span>
                <span style={{ color: '#6b7280', fontSize: 14 }}>({extras.totalReviews} vlerësime)</span>
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                Bazuar në {extras.totalReviews} recensione të klientëve
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              {/* Title + Brand Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.25 }}>
                  {product.name}
                </h1>
                <div style={{
                  background: 'white',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0f4ea8',
                  border: '2px solid #0f4ea8',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                }}>
                  {extras.brand}
                </div>
              </div>

              {/* Reference Number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14, color: '#6b7280' }}>
                <span style={{ fontWeight: 600 }}>Ref.:</span>
                <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>
                  {extras.partNumber}
                </span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: accentRed }}>
                    {product.price} €
                  </span>
                  {product.bestSeller && (
                    <span style={{ 
                      background: '#10b981', 
                      color: 'white', 
                      padding: '4px 10px', 
                      borderRadius: 6, 
                      fontSize: 12, 
                      fontWeight: 700 
                    }}>
                      BEST SELLER
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  Çmimi (TVSH 18% e përfshirë) • Pa tarifat e transportit
                </div>
              </div>

              {/* Key Specifications Table */}
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: 8, 
                overflow: 'hidden',
                marginBottom: 24 
              }}>
                <table style={{ width: '100%', fontSize: 14 }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', background: '#f9fafb', fontWeight: 600, color: '#374151', width: '45%' }}>
                        Prodhuesi:
                      </td>
                      <td style={{ padding: '12px 16px', color: '#111827' }}>
                        {extras.manufacturer}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', background: '#f9fafb', fontWeight: 600, color: '#374151' }}>
                        Brendi:
                      </td>
                      <td style={{ padding: '12px 16px', color: '#111827' }}>
                        {extras.brand}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', background: '#f9fafb', fontWeight: 600, color: '#374151' }}>
                        Kategoria:
                      </td>
                      <td style={{ padding: '12px 16px', color: '#111827' }}>
                        {product.category || 'Pjesë këmbimi'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', background: '#f9fafb', fontWeight: 600, color: '#374151' }}>
                        Garancia:
                      </td>
                      <td style={{ padding: '12px 16px', color: '#111827' }}>
                        {extras.warranty}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px', background: '#f9fafb', fontWeight: 600, color: '#374151' }}>
                        Origjina:
                      </td>
                      <td style={{ padding: '12px 16px', color: '#111827' }}>
                        {extras.origin}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Compatible Cars */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
                  Përshtatshme për:
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {extras.compatibleCars.map((car, i) => (
                    <span key={i} style={{
                      background: '#eff6ff',
                      color: '#1e40af',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      border: '1px solid #bfdbfe'
                    }}>
                      {car}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Sasia:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    disabled={isOutOfStock || quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{
                      width: 40,
                      height: 40,
                      border: '2px solid #e5e7eb',
                      background: 'white',
                      borderRadius: 8,
                      fontSize: 20,
                      fontWeight: 700,
                      cursor: (isOutOfStock || quantity <= 1) ? 'not-allowed' : 'pointer',
                      color: (isOutOfStock || quantity <= 1) ? '#d1d5db' : '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={isOutOfStock ? 0 : product.stock}
                    value={quantity}
                    disabled={isOutOfStock}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setQuantity(Math.max(1, Math.min(product.stock, val)))
                    }}
                    style={{
                      width: 80,
                      height: 40,
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: 600,
                      background: isOutOfStock ? '#f3f4f6' : 'white',
                      cursor: isOutOfStock ? 'not-allowed' : 'text'
                    }}
                  />
                  <button
                    disabled={isOutOfStock || quantity >= product.stock}
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    style={{
                      width: 40,
                      height: 40,
                      border: '2px solid #e5e7eb',
                      background: 'white',
                      borderRadius: 8,
                      fontSize: 20,
                      fontWeight: 700,
                      cursor: (isOutOfStock || quantity >= product.stock) ? 'not-allowed' : 'pointer',
                      color: (isOutOfStock || quantity >= product.stock) ? '#d1d5db' : '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                  {!isOutOfStock && (
                    <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>
                      Max: {product.stock}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    background: isOutOfStock ? '#9ca3af' : addedSuccess ? '#22c55e' : accentRed,
                    color: 'white',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    boxShadow: isOutOfStock ? 'none' : addedSuccess ? '0 4px 12px rgba(34,197,94,0.3)' : '0 4px 12px rgba(200,35,44,0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <span style={{ fontSize: 20 }}>🛒</span>
                  {isOutOfStock ? 'Shitën' : addedSuccess ? 'U shtua!' : 'Shto në shportë'}
                </button>
              </div>

              {/* Additional Info */}
              <div style={{ 
                background: '#eff6ff', 
                border: '1px solid #bfdbfe', 
                borderRadius: 8, 
                padding: 16,
                fontSize: 13,
                color: '#1e40af'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>✓</span>
                  <span style={{ fontWeight: 600 }}>Dërgim falas për porosia mbi 50€</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>✓</span>
                  <span style={{ fontWeight: 600 }}>Garanci 24 muaj</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>✓</span>
                  <span style={{ fontWeight: 600 }}>Cilësi origjinale</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Tab Headers */}
          <div style={{ borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              {['details', 'specs', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '12px 16px',
                    fontSize: 15,
                    fontWeight: 600,
                    color: activeTab === tab ? accentRed : '#6b7280',
                    borderBottom: `3px solid ${activeTab === tab ? accentRed : 'transparent'}`,
                    marginBottom: -2,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab === 'details' ? 'Përshkrimi' : tab === 'specs' ? 'Specifikimet' : 'Vlerësimet'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
                Përshkrimi i produktit
              </h3>
              <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: 16 }}>
                {product.description}
              </p>
              {product.details && product.details.length > 0 && (
                <ul style={{ color: '#374151', lineHeight: 1.8, paddingLeft: 20 }}>
                  {product.details.map((detail: string, i: number) => (
                    <li key={i} style={{ marginBottom: 8 }}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
                Specifikimet teknike
              </h3>
              <table style={{ width: '100%', fontSize: 14 }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#374151', width: '30%' }}>Numri i pjesës</td>
                    <td style={{ padding: '12px 0', color: '#111827' }}>{extras.partNumber}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#374151' }}>Brendi</td>
                    <td style={{ padding: '12px 0', color: '#111827' }}>{extras.brand}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#374151' }}>Prodhuesi</td>
                    <td style={{ padding: '12px 0', color: '#111827' }}>{extras.manufacturer}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#374151' }}>Pesha</td>
                    <td style={{ padding: '12px 0', color: '#111827' }}>{extras.weight}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#374151' }}>Garancia</td>
                    <td style={{ padding: '12px 0', color: '#111827' }}>{extras.warranty}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#374151' }}>Vendi i origjinës</td>
                    <td style={{ padding: '12px 0', color: '#111827' }}>{extras.origin}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#374151' }}>SKU</td>
                    <td style={{ padding: '12px 0', color: '#111827' }}>{product.sku || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
                Vlerësimet e klientëve
              </h3>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: '#111827' }}>{extras.averageRating}</div>
                  <div>
                    <div style={{ display: 'flex', marginBottom: 4 }}>
                      {renderStars(Math.round(extras.averageRating))}
                    </div>
                    <div style={{ fontSize: 14, color: '#6b7280' }}>
                      Bazuar në {extras.totalReviews} vlerësime
                    </div>
                  </div>
                </div>
              </div>

              {/* Review List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {extras.reviews.map((review) => (
                  <div key={review.id} style={{ 
                    borderBottom: '1px solid #e5e7eb', 
                    paddingBottom: 16 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>{review.author}</div>
                        <div style={{ display: 'flex', marginBottom: 4 }}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>
                        {new Date(review.date).toLocaleDateString('sq-AL')}
                      </div>
                    </div>
                    <p style={{ color: '#374151', lineHeight: 1.6, margin: 0 }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Similar Products / Recommendations */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '32px 0 16px' }}>
          Produkte të ngjashme
        </h2>
        {loadingSimilar && (
          <div style={{ fontSize: 14, color: '#6b7280' }}>Duke ngarkuar rekomandimet...</div>
        )}
        {!loadingSimilar && similarProducts.length === 0 && (
          <div style={{ fontSize: 14, color: '#6b7280' }}>Nuk ka rekomandime të disponueshme aktualisht.</div>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 20
        }}>
          {similarProducts.map(sp => {
            const out = sp.stock === 0;
            const limited = sp.stock > 0 && sp.stock <= 5;
            // Normalize images array (same logic as products grid)
            let images = [];
            try {
              if (Array.isArray(sp.images)) {
                images = sp.images;
              } else if (typeof sp.images === 'string') {
                images = JSON.parse(sp.images || '[]');
              }
            } catch {
              images = [];
            }
            // Prepend '/' if missing
            images = images.map((img) => img.startsWith('/') ? img : '/' + img);
            const imgSrc = images && images[0] ? images[0] : '/products/no-image.png';
            return (
              <Link key={sp.id} href={`/products/${sp.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  position: 'relative',
                  transition: 'box-shadow .15s, transform .15s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                >
                  {out && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      SHITËN
                    </div>
                  )}
                  {!out && limited && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: '#f59e0b',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {sp.stock} mbetur
                    </div>
                  )}
                  <img src={imgSrc} alt={sp.name} style={{
                    width: '100%',
                    height: 140,
                    objectFit: 'contain',
                    filter: out ? 'grayscale(100%)' : 'none',
                    opacity: out ? 0.6 : 1
                  }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f4ea8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {sp.category || 'Pjesë këmbimi'}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
                    {sp.name.length > 70 ? sp.name.slice(0, 70) + '…' : sp.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#c8232c' }}>{sp.price} €</span>
                    {sp.bestSeller && (
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '2px 6px',
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 4
                      }}>BEST</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  )
}

