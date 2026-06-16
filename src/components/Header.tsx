import Link from "next/link";
import { Heart } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-cream-dark/50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Heart className="w-5 h-5 text-rose fill-rose/20 group-hover:fill-rose/40 transition-colors" />
          <span className="font-serif text-xl font-semibold text-charcoal">
            Naša Poroka
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/#funkcije"
            className="text-sm text-warm-gray hover:text-charcoal transition-colors hidden sm:block"
          >
            Funkcije
          </Link>
          <Link
            href="/#cenik"
            className="text-sm text-warm-gray hover:text-charcoal transition-colors hidden sm:block"
          >
            Cenik
          </Link>
          <Link
            href="/ustvari"
            className="text-sm bg-sage text-white px-5 py-2 rounded-full hover:bg-sage-dark transition-colors"
          >
            Ustvari stran
          </Link>
        </nav>
      </div>
    </header>
  );
}
