 "use client";
import Link from 'next/link';
import React, { useState } from 'react';

export default function ProductCardWithSlider({ product, styles }: { product: any, styles: any }) {
  const images = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : []);
  const [current, setCurrent] = useState(0);
  const total = images.length;
  const goPrev = (e: React.MouseEvent) => { e.preventDefault(); setCurrent(c => c === 0 ? total - 1 : c - 1); };
  const goNext = (e: React.MouseEvent) => { e.preventDefault(); setCurrent(c => c === total - 1 ? 0 : c + 1); };
  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', width: '100%', height: 180, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {total > 1 && (
          <button onClick={goPrev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.18)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', zIndex: 2 }}>&lt;</button>
        )}
        <img src={images[current]} alt={product.name + ' ' + (current+1)} style={styles.productImage} />
        {total > 1 && (
          <button onClick={goNext} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.18)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', zIndex: 2 }}>&gt;</button>
        )}
        {total > 1 && (
          <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
            {images.map((_, idx) => (
              <span key={idx} style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: idx === current ? '#0f4ea8' : '#e6e6e6', margin: '0 3px' }}></span>
            ))}
          </div>
        )}
      </div>
      <div style={styles.productContent as any}>
        <div>
          <h4 style={{ margin: '12px 0 6px', fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{product.name}</h4>
          <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5, margin: '0 0 8px', minHeight: 40 }}>
            {product.description.length > 60 ? product.description.slice(0, 60) + '...' : product.description}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <strong style={{ color: '#0f4ea8', fontSize: 18 }}>{product.price} €</strong>
          <button style={{ background: '#0f4ea8', color: '#fff', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Shto</button>
        </div>
      </div>
    </Link>
  );
}
