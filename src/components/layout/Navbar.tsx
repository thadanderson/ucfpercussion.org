import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-ucf-black text-ucf-white px-6 py-4">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-ucf-gold text-lg">
          UCF Percussion Studio
        </Link>
        <ul className="flex gap-6 text-sm">
          <li><Link href="/about">About</Link></li>
          <li><Link href="/ensembles">Ensembles</Link></li>
          <li><Link href="/auditions">Auditions</Link></li>
          <li><Link href="/events">Events</Link></li>
          <li><Link href="/news">News</Link></li>
          <li><Link href="/library">Library</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><Link href="/login" className="text-ucf-gold">Login</Link></li>
        </ul>
      </nav>
    </header>
  );
}
