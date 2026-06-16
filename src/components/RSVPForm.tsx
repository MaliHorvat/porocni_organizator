"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { Check, Heart } from "lucide-react";
import type { RSVPInput } from "@/types";

interface RSVPFormProps {
  weddingSlug: string;
  partner1: string;
  partner2: string;
  rsvpDeadline: string;
}

export default function RSVPForm({ weddingSlug, partner1, partner2, rsvpDeadline }: RSVPFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [form, setForm] = useState<RSVPInput>({
    name: "",
    email: "",
    attending: true,
    guestCount: 1,
    menuChoice: "mesni",
    allergies: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attending: attending ?? false }),
      });
      if (res.ok) setSubmitted(true);
      else alert("Napaka pri pošiljanju. Poskusite znova.");
    } catch {
      alert("Napaka pri pošiljanju. Poskusite znova.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-sage-light/50 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-sage-dark" />
        </div>
        <h3 className="font-serif text-3xl text-charcoal mb-3">Hvala za odgovor!</h3>
        <p className="text-warm-gray">
          {attending
            ? `Veselimo se, da bomo skupaj s ${partner1} in ${partner2} proslavili ta poseben dan.`
            : "Žal nam je, da ne morete priti. Hvala, da ste nas obvestili."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-sm text-warm-gray">
          Prosimo, potrdite svojo udeležbo do{" "}
          <strong className="text-charcoal">
            {new Date(rsvpDeadline).toLocaleDateString("sl-SI", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
        </p>
      </div>

      <Input
        label="Vaše ime in priimek"
        placeholder="npr. Ana Novak"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Input
        label="E-pošta"
        type="email"
        placeholder="ana@email.com"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <div>
        <label className="block text-sm font-medium text-charcoal mb-3">
          Ali boste prisotni?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setAttending(true);
              setForm({ ...form, attending: true });
            }}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              attending === true
                ? "border-sage bg-sage-light/20"
                : "border-cream-dark hover:border-sage-light"
            }`}
          >
            <Heart className={`w-5 h-5 mx-auto mb-1 ${attending === true ? "text-sage fill-sage/20" : "text-warm-gray"}`} />
            <span className="text-sm font-medium">Da, pridem!</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAttending(false);
              setForm({ ...form, attending: false, guestCount: 0 });
            }}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              attending === false
                ? "border-rose bg-rose-light/20"
                : "border-cream-dark hover:border-rose-light"
            }`}
          >
            <span className="text-sm font-medium">Žal ne morem</span>
          </button>
        </div>
      </div>

      {attending && (
        <>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-3">
              Število oseb (vključno z vami)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, guestCount: n })}
                  className={`w-12 h-12 rounded-xl border-2 font-medium transition-all ${
                    form.guestCount === n
                      ? "border-sage bg-sage text-white"
                      : "border-cream-dark hover:border-sage-light"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-3">
              Izbira menija
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "mesni" as const, label: "Mesni meni" },
                { value: "vegi" as const, label: "Vegetarijanski" },
                { value: "veganski" as const, label: "Veganski" },
                { value: "otroski" as const, label: "Otroški meni" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, menuChoice: opt.value })}
                  className={`p-3 rounded-xl border-2 text-sm transition-all ${
                    form.menuChoice === opt.value
                      ? "border-sage bg-sage-light/20"
                      : "border-cream-dark hover:border-sage-light"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Alergije in posebne prehranske zahteve"
            placeholder="npr. brez glutena, oreščki..."
            rows={2}
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          />
        </>
      )}

      <Textarea
        label="Sporočilo mladoporočencema (neobvezno)"
        placeholder="Vaše čestitke ali sporočilo..."
        rows={3}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loading || attending === null || !form.name || !form.email}
      >
        {loading ? "Pošiljam..." : "Potrdi odgovor"}
      </Button>
    </form>
  );
}
