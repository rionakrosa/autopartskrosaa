import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-900 text-white p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">AutoPartsKrosa</div>
      <div className="space-x-6">
        <Link href="/">Home</Link>
        <Link href="/shop">Shop</Link>
        <Link href="/about">About</Link>
        <Link href="/kontakti">Kontakti</Link>
      </div>
    </nav>
  );
}
