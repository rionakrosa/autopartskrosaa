"use client"

import { useEffect, useState } from 'react'

type Product = {
  id: number
  name: string
  price: string
  image: string
  description: string
  details?: string[]
  bestSeller?: boolean
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [csvMode, setCsvMode] = useState<'append'|'replace'>('append')
  const [autoSaveOnImport, setAutoSaveOnImport] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('admin_token')
    if (t) setToken(t)
    const headers: any = {}
    if (t) headers['Authorization'] = `Bearer ${t}`
    fetch('/api/products', { headers })
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .finally(() => { setLoading(false); setAuthChecked(true) })
  }, [])

  function nextId() {
    return products.reduce((max, p) => Math.max(max, p.id), 0) + 1
  }

  function addProduct() {
    const id = nextId()
    const newProduct: Product = {
      id,
      name: `New product ${id}`,
      price: '€0',
      image: '/placeholder.png',
      description: '',
      details: [],
      bestSeller: false
    }
    setProducts((prev) => [newProduct, ...prev])
  }

  function deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  function updateField(id: number, field: keyof Product, value: any) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  async function handleImageUpload(id: number, file: File) {
    try {
      setUploadingId(id)
      const form = new FormData()
      form.append('file', file)
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/upload', { method: 'POST', body: form, headers })
      if (!res.ok) throw new Error('upload failed')
      const data = await res.json()
      if (data?.path) {
        updateField(id, 'image', data.path)
        // optionally auto-save after upload? keep it manual for safety
      } else {
        alert('Upload succeeded but no path returned')
      }
    } catch (err) {
      console.error(err)
      alert('Image upload failed')
    } finally {
      setUploadingId(null)
    }
  }

  function updateDetail(id: number, index: number, value: string) {
    setProducts((prev) => prev.map((p) => {
      if (p.id !== id) return p
      const details = Array.isArray(p.details) ? [...p.details] : []
      details[index] = value
      return { ...p, details }
    }))
  }

  function addDetail(id: number) {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, details: [...(p.details||[]), ''] } : p))
  }

  function removeDetail(id: number, index: number) {
    setProducts((prev) => prev.map((p) => {
      if (p.id !== id) return p
      const details = [...(p.details||[])]
      details.splice(index, 1)
      return { ...p, details }
    }))
  }

  async function save() {
    // safer per-product upsert: call API for each product instead of replacing entire collection
    setSaving(true)
    try {
  const headers: any = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const tasks = products.map((p) => fetch('/api/products/upsert', { method: 'POST', headers, body: JSON.stringify(p) }))
      const results = await Promise.all(tasks)
      const failed = results.find(r => !r.ok)
      if (failed) throw new Error('one or more upserts failed')
      alert('Saved')
    } catch (err) {
      console.error(err)
      alert('Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function doLogin(e?: React.FormEvent) {
    e?.preventDefault()
    try {
      setSaving(true)
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token)
        setToken(data.token)
        setUsername('')
        setPassword('')
        // re-fetch products with auth header
        const headers: any = { 'Authorization': `Bearer ${data.token}` }
        const r = await fetch('/api/products', { headers })
        const productsData = await r.json()
        setProducts(productsData)
        alert('Logged in')
      } else {
        console.error('Login response', res.status, data)
        alert(data?.error || `Login failed (status ${res.status})`)
      }
    } catch (err) {
      console.error(err)
      alert('Login failed — see console or server logs for details')
    } finally {
      setSaving(false)
    }
  }

  function logout() {
    localStorage.removeItem('admin_token')
    setToken(null)
  }

  function parseCSV(text: string) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length)
    if (lines.length === 0) return []
    const headers = lines[0].split(',').map(h => h.trim())
    const rows = lines.slice(1)
    return rows.map((row) => {
      const cols = row.split(',').map(c => c.trim())
      const obj: any = {}
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = cols[i] ?? ''
      }
      // normalize
      return {
        id: obj.id ? Number(obj.id) : undefined,
        name: obj.name || '',
        price: obj.price || '€0',
        image: obj.image || '/placeholder.png',
        description: obj.description || '',
        details: obj.details ? obj.details.split('|').map((s:any)=>s.trim()).filter(Boolean) : [],
        bestSeller: obj.bestSeller === 'true' || obj.bestSeller === '1' || obj.bestSeller === true
      }
    })
  }

  async function handleCsvFile(file: File) {
    const text = await file.text()
    const parsed = parseCSV(text)
    if (parsed.length === 0) {
      alert('No rows found in CSV')
      return
    }

    // assign ids for items without id and ensure unique ids
    const existingMax = products.reduce((m, p) => Math.max(m, p.id || 0), 0)
    let next = existingMax + 1
    const rows = parsed.map((p:any) => ({ ...p, id: p.id ? Number(p.id) : next++ }))

    if (csvMode === 'replace') {
      setProducts(rows)
    } else {
      // append (avoid id collisions)
      const merged = [...rows, ...products]
      setProducts(merged)
    }

    if (autoSaveOnImport) {
      setSaving(true)
      try {
        const headers: any = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/products', { method: 'POST', headers, body: JSON.stringify(csvMode === 'replace' ? rows : (([...rows, ...products]))) })
        if (!res.ok) throw new Error('save failed')
        alert('Imported and saved')
      } catch (err) {
        alert('Import saved failed - please press Save')
      } finally {
        setSaving(false)
      }
    } else {
      alert('Imported into memory. Click Save to persist to disk.')
    }
  }

  if (loading && !authChecked) return <div style={{ padding: 24 }}>Loading…</div>

  if (!token) {
   return (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#f5f7fa', 
    fontFamily: 'system-ui, -apple-system, sans-serif' 
  }}>
    <main style={{ 
      backgroundColor: '#ffffff', 
      padding: '40px', 
      borderRadius: '16px', 
      boxShadow: '0 8px 30px rgba(15, 78, 168, 0.12)', 
      width: '100%', 
      maxWidth: '400px' 
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#0f4ea8', margin: 0, fontSize: '28px' }}>Admin Login</h1>
        <p style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>Welcome back to Auto Parts Krosa</p>
      </div>

      <form onSubmit={doLogin} style={{ display: 'grid', gap: '20px' }}>
        
        {/* Username Field */}
        <div style={{ display: 'grid', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>Username</label>
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #d1d5db', 
              fontSize: '16px',
              outlineColor: '#0f4ea8' 
            }} 
          />
        </div>

        {/* Password Field */}
        <div style={{ display: 'grid', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #d1d5db', 
              fontSize: '16px',
              outlineColor: '#0f4ea8' 
            }} 
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button 
            type="submit" 
            style={{ 
              flex: 1, 
              background: '#0f4ea8', /* Brand Blue */
              color: '#fff', 
              padding: '12px', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}>
              {saving ? 'Signing in…' : 'Sign in'}
          </button>
          
          <button 
            type="button" 
            onClick={() => { setUsername(''); setPassword('') }} 
            style={{ 
              flex: 1, 
              background: '#ce2029', /* Brand Red */
              color: '#fff', 
              padding: '12px', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              cursor: 'pointer' 
            }}>
              Clear
          </button>
        </div>
        
      </form>
    </main>
  </div>
)
  }
  
 return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <main style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 32,
          backgroundColor: '#ffffff',
          padding: '20px 32px',
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#0f4ea8', fontWeight: 800 }}>
            Auto Parts Krosa <span style={{ color: '#64748b', fontWeight: 400, fontSize: '20px' }}>| Admin Panel</span>
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <a href="/admin/products" style={{ padding: '10px 18px', background: '#0f4ea8', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>📦 Menaxho Produktet</a>
            <a href="/admin/orders" style={{ padding: '10px 18px', background: '#2ea043', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>📋 Porositë</a>
            <a href="/admin/messages" style={{ padding: '10px 18px', background: '#c8232c', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>💬 Mesazhet</a>
            <button onClick={logout} style={{ padding: '9px 16px', background: '#f1f5f9', color: '#475569', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Logout</button>
          </div>
        </div>

        <p style={{ marginBottom: 24, color: '#64748b', fontSize: '15px' }}>Edit any product below and click Save to persist changes to the database.</p>

        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <button onClick={addProduct} style={{ background: '#0f4ea8', color: '#fff', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>+ Add Product</button>
          <button onClick={() => { setProducts(products.slice().sort((a,b)=>a.id-b.id)); alert('Sorted by id') }} style={{ background: '#eee', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer' }}>Sort by id</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 14 }}>CSV mode:</label>
            <select value={csvMode} onChange={(e) => setCsvMode(e.target.value as any)} style={{ padding: 6 }}>
              <option value="append">Append</option>
              <option value="replace">Replace</option>
            </select>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={autoSaveOnImport} onChange={(e)=>setAutoSaveOnImport(e.target.checked)} /> Save on import</label>
            <input type="file" accept=".csv,text/csv" onChange={(e)=>{ const f = e.target.files?.[0]; if (f) handleCsvFile(f) }} />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {products.map((p) => (
            <div key={p.id} style={{ padding: 16, borderRadius: 10, border: '1px solid #eee', backgroundColor: '#ffffff', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, alignItems: 'start' }}>
              <div style={{ minWidth: 180, position: 'relative' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', borderRadius: 8 }} />
                <button onClick={() => deleteProduct(p.id)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(p.id, f) }} />
                    <span style={{ background: '#0f4ea8', color: '#fff', padding: '6px 10px', borderRadius: 6 }}>Upload image</span>
                  </label>
                  {uploadingId === p.id ? <span style={{ alignSelf: 'center' }}>Uploading…</span> : null}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600 }}>Name</label>
                <input value={p.name} onChange={(e) => updateField(p.id, 'name', e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />

                <label style={{ display: 'block', fontWeight: 600 }}>Price</label>
                <input value={p.price} onChange={(e) => updateField(p.id, 'price', e.target.value)} style={{ width: '120px', padding: 8, marginBottom: 8 }} />

                <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginLeft: 12 }}>
                  <input type="checkbox" checked={!!p.bestSeller} onChange={(e) => updateField(p.id, 'bestSeller', e.target.checked)} />
                  <span style={{ fontSize: 14 }}>Best seller</span>
                </label>

                <label style={{ display: 'block', fontWeight: 600 }}>Image path</label>
                <input value={p.image} onChange={(e) => updateField(p.id, 'image', e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />

                <label style={{ display: 'block', fontWeight: 600 }}>Short description</label>
                <textarea value={p.description} onChange={(e) => updateField(p.id, 'description', e.target.value)} style={{ width: '100%', padding: 8, minHeight: 72, marginBottom: 8 }} />

                <div style={{ marginTop: 8 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Details</label>
                  {(p.details || []).map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <input value={d} onChange={(e) => updateDetail(p.id, idx, e.target.value)} style={{ flex: 1, padding: 8 }} />
                      <button onClick={() => removeDetail(p.id, idx)} style={{ background: '#eee', border: '1px solid #ddd', padding: '6px 8px', borderRadius: 6 }}>Remove</button>
                    </div>
                  ))}
                  <div>
                    <button onClick={() => addDetail(p.id)} style={{ marginTop: 6, background: '#0f4ea8', color: '#fff', padding: '8px 10px', borderRadius: 6, border: 'none' }}>+ Add detail</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <button onClick={save} disabled={saving} style={{ background: '#0f4ea8', color: '#fff', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </main>
    </div>
  );
}
