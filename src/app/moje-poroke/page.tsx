"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Button from "@/components/Button";

export default function MojePorokePage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/moje-poroke")
      .then((r) => r.json())
      .then((data) => {
        if (data.weddings?.length === 1) {
          router.replace(`/${data.weddings[0].slug}/upravljanje`);
          return;
        }
        if (data.weddings?.length > 1) {
          return;
        }
        if (data.error) {
          router.replace("/prijava");
        }
      });
  }, [router]);

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center">
        <Loader2 className="w-8 h-8 text-sage animate-spin mx-auto mb-4" />
        <p className="text-warm-gray mb-6">Nalagam vašo poročno stran...</p>
        <Link href="/ustvari">
          <Button variant="outline">Ustvari novo stran</Button>
        </Link>
      </div>
    </main>
  );
}
