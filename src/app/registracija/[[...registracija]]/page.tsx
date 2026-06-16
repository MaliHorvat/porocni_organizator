"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Button from "@/components/Button";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function RegistracijaForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/ustvari";

  return (
    <SignUp
      routing="path"
      path="/registracija"
      signInUrl="/prijava"
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl={redirectUrl}
    />
  );
}

export default function RegistracijaPage() {
  if (!clerkEnabled) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <h1 className="font-serif text-2xl text-charcoal mb-3">Registracija ni nastavljena</h1>
          <p className="text-warm-gray text-sm mb-6">
            V .env.local dodajte Clerk ključe (glej .env.example).
          </p>
          <Link href="/ustvari">
            <Button>Nadaljuj brez prijave (demo)</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <Suspense fallback={<p className="text-warm-gray">Nalagam...</p>}>
        <RegistracijaForm />
      </Suspense>
    </main>
  );
}
