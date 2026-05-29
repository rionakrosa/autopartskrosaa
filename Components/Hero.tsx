export default function Hero() {
  return (
    <div className="bg-red-600 text-white text-center py-20 px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Gjithmonë cilësi. Gjithmonë tek AutoPartsKrosa.
      </h1>
      <p className="mb-6 text-lg md:text-2xl">
        Find the perfect car parts for your vehicle today!
      </p>
      <input
        type="text"
        placeholder="Search parts..."
        className="p-3 rounded w-full md:w-1/3"
      />
    </div>
  );
}
