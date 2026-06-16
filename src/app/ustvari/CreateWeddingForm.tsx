"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";

const menuOptions = [
  { value: "basic", label: "Osnovni", price: "1 €", desc: "RSVP + QR koda (test)" },
  { value: "premium", label: "Premium", price: "1 €", desc: "Vse + galerija fotografij (test)" },
];

export default function CreateWeddingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") === "premium" ? "premium" : "basic";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [form, setForm] = useState({
    partner1: "",
    partner2: "",
    weddingDate: "",
    weddingTime: "15:00",
    venue: "",
    venueAddress: "",
    description: "",
    dressCode: "",
    rsvpDeadline: "",
    plan: initialPlan as "basic" | "premium",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = form.partner1 && form.partner2 && form.weddingDate;
  const canProceedStep2 = form.venue && form.venueAddress && form.rsvpDeadline;

  useEffect(() => {
    if (searchParams.get("cancelled") === "1") {
      setCancelled(true);
      setStep(3);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.slug) {
        router.push(`/${data.slug}/upravljanje`);
        return;
      }

      alert(data.error || "Napaka pri ustvarjanju strani. Poskusite znova.");
    } catch {
      alert("Napaka pri ustvarjanju strani. Poskusite znova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-charcoal mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Nazaj
          </Link>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-sage-light/30 px-4 py-2 rounded-full text-sm text-sage-dark mb-4">
              <Sparkles className="w-4 h-4" />
              Korak {step} od 3
            </div>
            <h1 className="font-serif text-4xl text-charcoal">Ustvari poročno stran</h1>
          </div>

          <div className="flex gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-sage" : "bg-cream-dark"
                }`}
              />
            ))}
          </div>

          <div className="glass-card rounded-2xl p-8">
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-serif text-2xl text-charcoal mb-2">Kdo se poroči?</h2>
                <p className="text-warm-gray text-sm mb-6">Osnovni podatki o paru in datumu poroke.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Ime prvega partnerja"
                    placeholder="npr. Maja"
                    value={form.partner1}
                    onChange={(e) => update("partner1", e.target.value)}
                  />
                  <Input
                    label="Ime drugega partnerja"
                    placeholder="npr. Luka"
                    value={form.partner2}
                    onChange={(e) => update("partner2", e.target.value)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Datum poroke"
                    type="date"
                    value={form.weddingDate}
                    onChange={(e) => update("weddingDate", e.target.value)}
                  />
                  <Input
                    label="Ura ceremonije"
                    type="time"
                    value={form.weddingTime}
                    onChange={(e) => update("weddingTime", e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                    Naprej
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-serif text-2xl text-charcoal mb-2">Kje in kdaj?</h2>
                <p className="text-warm-gray text-sm mb-6">Podrobnosti o lokaciji in RSVP roku.</p>

                <Input
                  label="Ime lokacije"
                  placeholder="npr. Grad Otočec"
                  value={form.venue}
                  onChange={(e) => update("venue", e.target.value)}
                />
                <Input
                  label="Naslov lokacije"
                  placeholder="npr. Otočec 39, 8222 Otočec"
                  value={form.venueAddress}
                  onChange={(e) => update("venueAddress", e.target.value)}
                />
                <Textarea
                  label="Opis / sporočilo gostom"
                  placeholder="Kratko sporočilo za vaše goste..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
                <Input
                  label="Dress code (neobvezno)"
                  placeholder="npr. Elegantna priložnostna oblačila"
                  value={form.dressCode}
                  onChange={(e) => update("dressCode", e.target.value)}
                />
                <Input
                  label="Rok za potrditev (RSVP)"
                  type="date"
                  value={form.rsvpDeadline}
                  onChange={(e) => update("rsvpDeadline", e.target.value)}
                />

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4" />
                    Nazaj
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
                    Naprej
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-serif text-2xl text-charcoal mb-2">Izberi paket</h2>
                <p className="text-warm-gray text-sm mb-6">
                  Enkratno plačilo — brez skritih stroškov.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {menuOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("plan", opt.value)}
                      className={`relative rounded-xl p-6 text-left border-2 transition-all ${
                        form.plan === opt.value
                          ? "border-sage bg-sage-light/20"
                          : "border-cream-dark hover:border-sage-light"
                      }`}
                    >
                      {form.plan === opt.value && (
                        <Check className="absolute top-4 right-4 w-5 h-5 text-sage" />
                      )}
                      <p className="font-serif text-xl text-charcoal">{opt.label}</p>
                      <p className="text-2xl font-serif text-sage-dark mt-1">{opt.price}</p>
                      <p className="text-sm text-warm-gray mt-2">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                {cancelled && (
                  <div className="bg-rose-light/30 border border-rose-light rounded-xl p-4 text-sm text-rose-dark">
                    Plačilo je bilo preklicano. Lahko poskusite znova.
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4" />
                    Nazaj
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading
                      ? "Preusmerjam..."
                      : "Plačaj 1 € in ustvari"}
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
