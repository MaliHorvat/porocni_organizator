import Link from "next/link";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-6xl text-charcoal mb-4">404</h1>
        <p className="text-warm-gray text-lg mb-2">Ta poročna stran ne obstaja.</p>
        <p className="text-warm-gray text-sm mb-8">
          Preverite povezavo ali odprite svojo stran prek portala.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button>Domača stran</Button>
          </Link>
          <Link href="/maja-in-luka">
            <Button variant="outline">Oglej demo</Button>
          </Link>
          <Link href="/moje-poroke">
            <Button variant="outline">Moja poroka</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
