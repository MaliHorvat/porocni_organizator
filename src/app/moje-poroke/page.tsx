"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Heart } from "lucide-react";
import Button from "@/components/Button";
import { formatShortDate } from "@/lib/utils";

interface WeddingSummary {
  slug: string;
  partner1: string;
  partner2: string;
  weddingDate: string;
  plan: string;
}

export default function MojePorokePage() {
  const router = useRouter();
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading"
  );

  useEffect(() => {
    fetch("/api/moje-poroke")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.replace("/prijava");
          return;
        }

        const list: WeddingSummary[] = data.weddings || [];

        if (list.length === 1) {
          router.replace(`/${list[0].slug}/upravljanje`);
          return;
        }

        if (list.length > 1) {
          setWeddings(list);
          setStatus("ready");
          return;
        }

        setStatus("empty");
      })
      .catch(() => setStatus("error"));
  }, [router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center">
          <Loader2 className="w-8 h-8 text-sage animate-spin mx-auto mb-4" />
          <p className="text-warm-gray">Nalagam vašo poročno stran...</p>
        </div>
      </main>
    );
  }

  if (status === "empty" || status === "error") {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center">
          <Heart className="w-8 h-8 text-rose mx-auto mb-4 fill-rose/20" />
          <h1 className="font-serif text-2xl text-charcoal mb-3">
            Ni najdene poroke
          </h1>
          <p className="text-warm-gray text-sm mb-6">
            {status === "error"
              ? "Napaka pri nalaganju. Poskusite znova."
              : "Še nimate ustvarjene poročne strani ali ni povezana z vašim računom."}
          </p>
          <Link href="/">
            <Button variant="outline">Nazaj na domačo stran</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="max-w-lg mx-auto">
        <h1 className="font-serif text-3xl text-charcoal text-center mb-8">
          Moje poroke
        </h1>
        <div className="space-y-4">
          {weddings.map((w) => (
            <Link
              key={w.slug}
              href={`/${w.slug}/upravljanje`}
              className="glass-card rounded-2xl p-6 block hover:shadow-md transition-shadow"
            >
              <p className="font-serif text-xl text-charcoal">
                {w.partner1} & {w.partner2}
              </p>
              <p className="text-sm text-warm-gray mt-1">
                {formatShortDate(w.weddingDate)} · {w.plan}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
