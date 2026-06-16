import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="text-center">
        <h1 className="font-serif text-6xl text-charcoal mb-4">404</h1>
        <p className="text-warm-gray text-lg mb-8">Ta poročna stran ne obstaja.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-full hover:bg-sage-dark transition-colors"
        >
          Nazaj na domačo stran
        </Link>
      </div>
    </div>
  );
}
