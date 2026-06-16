import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream/70 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose fill-rose/30" />
            <span className="font-serif text-lg text-cream">Naša Poroka</span>
          </div>
          <p className="text-sm text-center">
            Digitalni poročni organizator — RSVP, meniji in galerija na enem mestu.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/ustvari" className="hover:text-cream transition-colors">
              Ustvari stran
            </Link>
            <Link href="/maja-in-luka" className="hover:text-cream transition-colors">
              Demo
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-cream/10 text-center text-xs text-cream/40">
          © {new Date().getFullYear()} Naša Poroka. Vse pravice pridržane.
        </div>
      </div>
    </footer>
  );
}
