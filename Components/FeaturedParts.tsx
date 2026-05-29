export default function FeaturedParts() {
  // Replace with real product data from DB, which should have 'images' as a JSON array string
  // Example: [{ id: 1, name: 'Brake Pads', price: '$50', images: '["/products/part1.png"]' }, ...]
  // If you fetch from DB, parse images as JSON:
  // parts = productsFromDB.map(product => ({ ...product, images: Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]') }))
  const parts = [
    { id: 1, name: 'Brake Pads', price: '$50', images: '["/products/part1.png"]' },
    { id: 2, name: 'Car Battery', price: '$120', images: '["/products/part2.png"]' },
    { id: 3, name: 'Oil Filter', price: '$20', images: '["/products/part3.png"]' },
    { id: 4, name: 'Spark Plugs', price: '$35', images: '["/products/part4.png"]' },
  ];

  return (
    <div className="p-8 bg-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Featured Parts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {parts.map((part) => (
          <div key={part.id} className="border rounded p-4 text-center">
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              {(() => {
                let images = [];
                try {
                  images = Array.isArray(part.images) ? part.images : JSON.parse(part.images || '[]');
                } catch {
                  images = [];
                }
                return images.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`${part.name} ${idx+1}`}
                    className="object-cover rounded" style={{ maxHeight: 120, maxWidth: 120 }}
                  />
                ));
              })()}
            </div>
            <h3 className="font-bold mb-2">{part.name}</h3>
            <p className="mb-4">{part.price}</p>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
