"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Heart } from "lucide-react";
import Button from "@/components/Button";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("Manjka ID plačila.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const verify = async () => {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const data = await res.json();

        if (res.ok && data.slug) {
          router.replace(`/${data.slug}/upravljanje?new=1`);
          return;
        }

        if (res.status === 402 && attempts < maxAttempts) {
          attempts++;
          setTimeout(verify, 2000);
          return;
        }

        setError(data.error || "Plačilo ni bilo potrjeno.");
      } catch {
        setError("Napaka pri preverjanju plačila.");
      }
    };

    verify();
  }, [sessionId, router]);

  if (error) {
    return (
      <div className="text-center">
        <p className="text-rose-dark mb-6">{error}</p>
        <Link href="/ustvari">
          <Button variant="outline">Poskusi znova</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Loader2 className="w-10 h-10 text-sage animate-spin mx-auto mb-6" />
      <h1 className="font-serif text-3xl text-charcoal mb-3">
        Plačilo uspešno!
      </h1>
      <p className="text-warm-gray">Ustvarjam vašo poročno stran...</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="glass-card rounded-2xl p-10 max-w-md w-full">
        <Heart className="w-8 h-8 text-rose mx-auto mb-6 fill-rose/20" />
        <Suspense
          fallback={
            <div className="text-center">
              <Check className="w-10 h-10 text-sage mx-auto mb-4" />
              <p className="text-warm-gray">Nalagam...</p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  );
}
