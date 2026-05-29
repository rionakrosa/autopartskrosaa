"use client";
import ProductCardWithSlider from './ProductCardWithSlider';

export default function ProductsGridClient({ products, styles }) {
  return (
    <div style={styles.productsGrid}>
      {products.map((p) => (
        <div key={p.id} style={styles.productCard}>
          <ProductCardWithSlider product={p} styles={styles} />
        </div>
      ))}
    </div>
  );
}
